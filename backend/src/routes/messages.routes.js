/**
 * Rutas de Mensajería - SoyUCAB
 * Chat privado y grupal
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * GET /api/messages/conversations
 * Obtiene todas las conversaciones del usuario autenticado
 */
router.get('/conversations', requireAuth, async (req, res) => {
    const userEmail = req.userEmail;

    try {
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

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error('[MESSAGES] Error listando conversaciones:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/messages/:conversationId
 * Obtiene los mensajes de una conversación específica
 */
router.get('/:conversationId', requireAuth, async (req, res) => {
    const { conversationId } = req.params;
    const userEmail = req.userEmail;

    try {
        // Verificar que el usuario participa en la conversación
        const participaCheck = await db.query(
            'SELECT 1 FROM PARTICIPA_EN WHERE fk_conversacion = $1 AND correo_participante = $2',
            [conversationId, userEmail]
        );

        if (participaCheck.rows.length === 0) {
            return res.status(403).json({
                success: false,
                error: 'No tienes acceso a esta conversación'
            });
        }

        // Obtener mensajes
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

        const result = await db.queryAsUser(sql, [conversationId], userEmail);

        // Marcar mensajes como leídos
        await db.query(
            `UPDATE MENSAJE 
             SET estado_mensaje = 'Leído' 
             WHERE fk_conversacion = $1 
             AND correo_autor_mensaje != $2 
             AND estado_mensaje = 'Enviado'`,
            [conversationId, userEmail]
        );

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error('[MESSAGES] Error obteniendo mensajes:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/messages/send
 * Envía un mensaje a una conversación existente
 */
router.post('/send', requireAuth, async (req, res) => {
    const { conversacion_id, texto } = req.body;
    const userEmail = req.userEmail;

    if (!conversacion_id || !texto || texto.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: 'conversacion_id y texto son requeridos'
        });
    }

    try {
        // Verificar participación
        const participaCheck = await db.query(
            'SELECT 1 FROM PARTICIPA_EN WHERE fk_conversacion = $1 AND correo_participante = $2',
            [conversacion_id, userEmail]
        );

        if (participaCheck.rows.length === 0) {
            return res.status(403).json({
                success: false,
                error: 'No participas en esta conversación'
            });
        }

        // Insertar mensaje
        const result = await db.queryAsUser(
            `INSERT INTO MENSAJE (fk_conversacion, fecha_hora_envio, correo_autor_mensaje, texto_mensaje, estado_mensaje)
             VALUES ($1, NOW(), $2, $3, 'Enviado')
             RETURNING clave_mensaje, fecha_hora_envio`,
            [conversacion_id, userEmail, texto.trim()],
            userEmail
        );

        res.status(201).json({
            success: true,
            message: 'Mensaje enviado',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('[MESSAGES] Error enviando mensaje:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/messages/conversation/start
 * Iniciar una nueva conversación privada con otro usuario
 */
router.post('/conversation/start', requireAuth, async (req, res) => {
    const { correo_destino, mensaje_inicial } = req.body;
    const userEmail = req.userEmail;

    if (!correo_destino) {
        return res.status(400).json({
            success: false,
            error: 'correo_destino es requerido'
        });
    }

    if (correo_destino === userEmail) {
        return res.status(400).json({
            success: false,
            error: 'No puedes iniciar una conversación contigo mismo'
        });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`SELECT set_config('app.user_email', $1, true)`, [userEmail]);

        // Verificar si ya existe una conversación privada entre estos dos usuarios
        const existingChat = await client.query(`
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
        `, [userEmail, correo_destino]);

        if (existingChat.rows.length > 0) {
            // Conversación ya existe, opcionalmente enviar mensaje
            const conversacionId = existingChat.rows[0].clave_conversacion;

            if (mensaje_inicial && mensaje_inicial.trim()) {
                await client.query(
                    `INSERT INTO MENSAJE (fk_conversacion, fecha_hora_envio, correo_autor_mensaje, texto_mensaje, estado_mensaje)
                     VALUES ($1, NOW(), $2, $3, 'Enviado')`,
                    [conversacionId, userEmail, mensaje_inicial.trim()]
                );
            }

            await client.query('COMMIT');
            return res.json({
                success: true,
                message: 'Conversación existente encontrada',
                data: { clave_conversacion: conversacionId, nueva: false }
            });
        }

        // Crear nueva conversación
        const newConv = await client.query(
            `INSERT INTO CONVERSACION (correo_creador, fecha_creacion_chat, tipo_conversacion)
             VALUES ($1, NOW(), 'Privada')
             RETURNING clave_conversacion`,
            [userEmail]
        );
        const conversacionId = newConv.rows[0].clave_conversacion;

        // Agregar participantes
        await client.query(
            `INSERT INTO PARTICIPA_EN (fk_conversacion, correo_participante, fecha_ingreso)
             VALUES ($1, $2, NOW()), ($1, $3, NOW())`,
            [conversacionId, userEmail, correo_destino]
        );

        // Enviar mensaje inicial si existe
        if (mensaje_inicial && mensaje_inicial.trim()) {
            await client.query(
                `INSERT INTO MENSAJE (fk_conversacion, fecha_hora_envio, correo_autor_mensaje, texto_mensaje, estado_mensaje)
                 VALUES ($1, NOW(), $2, $3, 'Enviado')`,
                [conversacionId, userEmail, mensaje_inicial.trim()]
            );
        }

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Conversación creada',
            data: { clave_conversacion: conversacionId, nueva: true }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[MESSAGES] Error iniciando conversación:', err.message);
        res.status(500).json({ success: false, error: err.message });
    } finally {
        client.release();
    }
});

/**
 * GET /api/messages/conversation/:id/info
 * Obtiene información de una conversación
 */
router.get('/conversation/:id/info', requireAuth, async (req, res) => {
    const { id } = req.params;
    const userEmail = req.userEmail;

    try {
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

        const result = await db.queryAsUser(sql, [id, userEmail], userEmail);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Conversación no encontrada o sin acceso'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (err) {
        console.error('[MESSAGES] Error obteniendo info conversación:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
