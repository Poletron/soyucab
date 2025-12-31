/**
 * Messages Service - SoyUCAB
 * Business logic for chat and messaging features
 * Extracted from messages.routes.js for separation of concerns
 */

const db = require('../config/db');

/**
 * Get all conversations for a user
 * @param {string} userEmail - User's email
 * @returns {Promise<Array>} - Array of conversations
 */
async function getConversations(userEmail) {
    const sql = `
        SELECT 
            c.clave_conversacion,
            c.titulo_chat,
            c.tipo_conversacion,
            c.fecha_creacion_chat,
            c.correo_creador,
            (
                SELECT texto_mensaje 
                FROM MENSAJE m 
                WHERE m.fk_conversacion = c.clave_conversacion 
                ORDER BY m.fecha_hora_envio DESC 
                LIMIT 1
            ) as ultimo_mensaje,
            (
                SELECT fecha_hora_envio 
                FROM MENSAJE m 
                WHERE m.fk_conversacion = c.clave_conversacion 
                ORDER BY m.fecha_hora_envio DESC 
                LIMIT 1
            ) as fecha_ultimo_mensaje,
            (
                SELECT COUNT(*) 
                FROM MENSAJE m 
                WHERE m.fk_conversacion = c.clave_conversacion 
                AND m.estado_mensaje = 'Enviado'
                AND m.correo_autor_mensaje != $1
            ) as mensajes_sin_leer,
            (
                SELECT ARRAY_AGG(pe.correo_participante) 
                FROM PARTICIPA_EN pe 
                WHERE pe.fk_conversacion = c.clave_conversacion 
                AND pe.correo_participante != $1
            ) as otros_participantes
        FROM CONVERSACION c
        INNER JOIN PARTICIPA_EN p ON c.clave_conversacion = p.fk_conversacion
        WHERE p.correo_participante = $1
        ORDER BY fecha_ultimo_mensaje DESC NULLS LAST
    `;

    const result = await db.queryAsUser(sql, [userEmail], userEmail);
    return result.rows;
}

/**
 * Verify if user participates in a conversation
 * @param {number} conversationId - Conversation ID
 * @param {string} userEmail - User's email
 * @returns {Promise<boolean>}
 */
async function userParticipatesIn(conversationId, userEmail) {
    const result = await db.query(
        'SELECT 1 FROM PARTICIPA_EN WHERE fk_conversacion = $1 AND correo_participante = $2',
        [conversationId, userEmail]
    );
    return result.rows.length > 0;
}

/**
 * Get messages from a conversation
 * @param {number} conversationId - Conversation ID
 * @param {string} userEmail - User's email (for RLS)
 * @returns {Promise<Array>} - Array of messages
 */
async function getMessages(conversationId, userEmail) {
    const sql = `
        SELECT 
            m.clave_mensaje,
            m.fecha_hora_envio,
            m.correo_autor_mensaje,
            m.texto_mensaje,
            m.estado_mensaje,
            p.nombres,
            p.apellidos,
            mb.fotografia_url
        FROM MENSAJE m
        LEFT JOIN PERSONA p ON m.correo_autor_mensaje = p.correo_principal
        LEFT JOIN MIEMBRO mb ON m.correo_autor_mensaje = mb.correo_principal
        WHERE m.fk_conversacion = $1
        ORDER BY m.fecha_hora_envio ASC
    `;

    return (await db.queryAsUser(sql, [conversationId], userEmail)).rows;
}

/**
 * Mark messages as read in a conversation
 * @param {number} conversationId - Conversation ID
 * @param {string} userEmail - User's email (won't mark own messages)
 */
async function markMessagesAsRead(conversationId, userEmail) {
    await db.query(
        `UPDATE MENSAJE 
         SET estado_mensaje = 'Leído' 
         WHERE fk_conversacion = $1 
         AND correo_autor_mensaje != $2 
         AND estado_mensaje = 'Enviado'`,
        [conversationId, userEmail]
    );
}

/**
 * Send a message to a conversation
 * @param {number} conversationId - Conversation ID
 * @param {string} userEmail - Sender's email
 * @param {string} text - Message text
 * @returns {Promise<Object>} - Created message info
 */
async function sendMessage(conversationId, userEmail, text) {
    const result = await db.queryAsUser(
        `INSERT INTO MENSAJE (fk_conversacion, fecha_hora_envio, correo_autor_mensaje, texto_mensaje, estado_mensaje)
         VALUES ($1, NOW(), $2, $3, 'Enviado')
         RETURNING clave_mensaje, fecha_hora_envio`,
        [conversationId, userEmail, text.trim()],
        userEmail
    );
    return result.rows[0];
}

/**
 * Find existing private conversation between two users
 * @param {string} userEmail - First user
 * @param {string} otherEmail - Second user
 * @returns {Promise<number|null>} - Conversation ID or null
 */
async function findExistingPrivateConversation(userEmail, otherEmail) {
    const result = await db.query(`
        SELECT c.clave_conversacion
        FROM CONVERSACION c
        WHERE c.tipo_conversacion = 'Privada'
        AND EXISTS (
            SELECT 1 FROM PARTICIPA_EN p1 
            WHERE p1.fk_conversacion = c.clave_conversacion 
            AND p1.correo_participante = $1
        )
        AND EXISTS (
            SELECT 1 FROM PARTICIPA_EN p2 
            WHERE p2.fk_conversacion = c.clave_conversacion 
            AND p2.correo_participante = $2
        )
        LIMIT 1
    `, [userEmail, otherEmail]);

    return result.rows.length > 0 ? result.rows[0].clave_conversacion : null;
}

/**
 * Start a new private conversation with another user
 * @param {string} userEmail - Initiator's email
 * @param {string} targetEmail - Target user's email
 * @param {string|null} initialMessage - Optional initial message
 * @returns {Promise<Object>} - Result with conversation ID and whether it's new
 */
async function startConversation(userEmail, targetEmail, initialMessage = null) {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`SELECT set_config('app.user_email', $1, true)`, [userEmail]);

        // Check for existing conversation
        const existingId = await findExistingPrivateConversation(userEmail, targetEmail);

        if (existingId) {
            // Send message to existing conversation if provided
            if (initialMessage && initialMessage.trim()) {
                await client.query(
                    `INSERT INTO MENSAJE (fk_conversacion, fecha_hora_envio, correo_autor_mensaje, texto_mensaje, estado_mensaje)
                     VALUES ($1, NOW(), $2, $3, 'Enviado')`,
                    [existingId, userEmail, initialMessage.trim()]
                );
            }
            await client.query('COMMIT');
            return { conversationId: existingId, isNew: false };
        }

        // Create new conversation
        const newConv = await client.query(
            `INSERT INTO CONVERSACION (correo_creador, fecha_creacion_chat, tipo_conversacion)
             VALUES ($1, NOW(), 'Privada')
             RETURNING clave_conversacion`,
            [userEmail]
        );
        const conversationId = newConv.rows[0].clave_conversacion;

        // Add participants
        await client.query(
            `INSERT INTO PARTICIPA_EN (fk_conversacion, correo_participante, fecha_ingreso)
             VALUES ($1, $2, NOW()), ($1, $3, NOW())`,
            [conversationId, userEmail, targetEmail]
        );

        // Send initial message if provided
        if (initialMessage && initialMessage.trim()) {
            await client.query(
                `INSERT INTO MENSAJE (fk_conversacion, fecha_hora_envio, correo_autor_mensaje, texto_mensaje, estado_mensaje)
                 VALUES ($1, NOW(), $2, $3, 'Enviado')`,
                [conversationId, userEmail, initialMessage.trim()]
            );
        }

        await client.query('COMMIT');
        return { conversationId, isNew: true };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

/**
 * Get conversation info with participants
 * @param {number} conversationId - Conversation ID
 * @param {string} userEmail - Requesting user's email
 * @returns {Promise<Object|null>} - Conversation info or null
 */
async function getConversationInfo(conversationId, userEmail) {
    const sql = `
        SELECT 
            c.clave_conversacion,
            c.titulo_chat,
            c.tipo_conversacion,
            c.fecha_creacion_chat,
            c.correo_creador,
            (
                SELECT JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'correo', pe.correo_participante,
                        'nombres', p.nombres,
                        'apellidos', p.apellidos,
                        'foto', m.fotografia_url
                    )
                )
                FROM PARTICIPA_EN pe
                LEFT JOIN PERSONA p ON pe.correo_participante = p.correo_principal
                LEFT JOIN MIEMBRO m ON pe.correo_participante = m.correo_principal
                WHERE pe.fk_conversacion = c.clave_conversacion
            ) as participantes
        FROM CONVERSACION c
        INNER JOIN PARTICIPA_EN pme ON c.clave_conversacion = pme.fk_conversacion
        WHERE c.clave_conversacion = $1 AND pme.correo_participante = $2
    `;

    const result = await db.queryAsUser(sql, [conversationId, userEmail], userEmail);
    return result.rows.length > 0 ? result.rows[0] : null;
}

module.exports = {
    getConversations,
    userParticipatesIn,
    getMessages,
    markMessagesAsRead,
    sendMessage,
    findExistingPrivateConversation,
    startConversation,
    getConversationInfo
};
