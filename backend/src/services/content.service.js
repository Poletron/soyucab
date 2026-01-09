/**
 * Content Service - SoyUCAB
 * Business logic for content (posts/events), reactions, and comments
 */

const db = require('../config/db');
const notificationsService = require('./notifications.service');

/**
 * Create new content (post or event)
 */
async function createContent(userEmail, texto, visibilidad, tipo, evento = null, archivo_url = null, nombre_grupo = null) {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`SELECT set_config('app.user_email', $1, true)`, [userEmail]);

        // Insert content (with optional group association)
        const insertContenido = await client.query(
            `INSERT INTO CONTENIDO (correo_autor, fecha_hora_creacion, texto_contenido, visibilidad, archivo_url, nombre_grupo)
             VALUES ($1, NOW(), $2, $3, $4, $5)
             RETURNING clave_contenido, fecha_hora_creacion`,
            [userEmail, texto, visibilidad, archivo_url, nombre_grupo]
        );
        const { clave_contenido, fecha_hora_creacion } = insertContenido.rows[0];

        // Insert into child table based on type
        if (tipo === 'evento' && evento) {
            await client.query(
                `INSERT INTO EVENTO (fk_contenido, titulo, fecha_inicio, fecha_fin, ciudad_ubicacion, pais_ubicacion)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [clave_contenido, evento.titulo, evento.fecha_inicio, evento.fecha_fin, evento.ciudad || null, evento.pais || 'Venezuela']
            );
        } else {
            await client.query(`INSERT INTO PUBLICACION (fk_contenido) VALUES ($1)`, [clave_contenido]);
        }

        await client.query('COMMIT');
        return { clave_contenido, fecha_hora_creacion };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

/**
 * Check if user owns content
 */
async function getContentAuthor(contentId) {
    const result = await db.query('SELECT correo_autor FROM CONTENIDO WHERE clave_contenido = $1', [contentId]);
    return result.rows.length > 0 ? result.rows[0].correo_autor : null;
}

/**
 * Delete content
 */
async function deleteContent(contentId) {
    await db.query('DELETE FROM CONTENIDO WHERE clave_contenido = $1', [contentId]);
}

/**
 * Add reaction to content
 */
async function addReaction(userEmail, contentId, reaccion = 'Me Gusta') {
    await db.query(
        `INSERT INTO REACCIONA_CONTENIDO (correo_miembro, fk_contenido, nombre_reaccion, fecha_hora_reaccion)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT DO NOTHING`,
        [userEmail, contentId, reaccion]
    );

    // Notify author
    try {
        const authorEmail = await getContentAuthor(contentId);
        if (authorEmail && authorEmail !== userEmail) {
            await notificationsService.createNotification(
                authorEmail,
                'Reacción',
                `Alguien reaccionó a tu publicación: ${reaccion}`,
                `/post/${contentId}`
            );
        }
    } catch (err) {
        console.error('Error sending notification:', err);
    }
}

/**
 * Remove reaction from content
 */
async function removeReaction(userEmail, contentId) {
    await db.query(
        `DELETE FROM REACCIONA_CONTENIDO WHERE correo_miembro = $1 AND fk_contenido = $2`,
        [userEmail, contentId]
    );
}

/**
 * Add comment to content
 */
async function addComment(userEmail, contentId, texto) {
    const result = await db.query(
        `INSERT INTO COMENTARIO (fk_contenido, fecha_hora_comentario, correo_autor_comentario, texto_comentario)
         VALUES ($1, NOW(), $2, $3)
         RETURNING clave_comentario, fecha_hora_comentario`,
        [contentId, userEmail, texto]
    );

    // Notify author of the content
    try {
        const authorEmail = await getContentAuthor(contentId);
        if (authorEmail && authorEmail !== userEmail) {
            await notificationsService.createNotification(
                authorEmail,
                'Comentario',
                'Alguien comentó en tu publicación',
                `/post/${contentId}`
            );
        }
    } catch (err) {
        console.error('Error sending comment notification:', err);
    }

    return result.rows[0];
}

/**
 * Get comments for a content
 */
async function getComments(contentId) {
    const result = await db.query(
        `SELECT c.*, 
                COALESCE(p.nombres, eo.nombre_oficial) as nombres,
                p.apellidos,
                m.fotografia_url
         FROM COMENTARIO c
         JOIN MIEMBRO m ON c.correo_autor_comentario = m.correo_principal
         LEFT JOIN PERSONA p ON c.correo_autor_comentario = p.correo_principal
         LEFT JOIN ENTIDAD_ORGANIZACIONAL eo ON c.correo_autor_comentario = eo.correo_principal
         WHERE c.fk_contenido = $1
         ORDER BY c.fecha_hora_comentario ASC`,
        [contentId]
    );
    return result.rows;
}

/**
 * Get posts for a specific group
 */
async function getGroupPosts(nombreGrupo) {
    const result = await db.query(
        `SELECT c.*, 
                COALESCE(p.nombres, eo.nombre_oficial) as nombres,
                p.apellidos,
                m.fotografia_url,
                (SELECT COUNT(*) FROM REACCIONA_CONTENIDO r WHERE r.fk_contenido = c.clave_contenido) as total_reacciones,
                (SELECT COUNT(*) FROM COMENTARIO com WHERE com.fk_contenido = c.clave_contenido) as total_comentarios
         FROM CONTENIDO c
         JOIN MIEMBRO m ON c.correo_autor = m.correo_principal
         LEFT JOIN PERSONA p ON c.correo_autor = p.correo_principal
         LEFT JOIN ENTIDAD_ORGANIZACIONAL eo ON c.correo_autor = eo.correo_principal
         WHERE c.nombre_grupo = $1
         ORDER BY c.fecha_hora_creacion DESC
         LIMIT 50`,
        [nombreGrupo]
    );
    return result.rows;
}

/**
 * Update content text
 */
async function updateContent(contentId, userEmail, newText) {
    // Check ownership
    const author = await getContentAuthor(contentId);
    if (!author || author !== userEmail) {
        throw new Error('No tienes permiso para editar este contenido');
    }

    await db.query(
        'UPDATE CONTENIDO SET texto_contenido = $1 WHERE clave_contenido = $2',
        [newText, contentId]
    );

    return { success: true };
}

module.exports = {
    createContent,
    getContentAuthor,
    deleteContent,
    addReaction,
    removeReaction,
    addComment,
    getComments,
    getGroupPosts,
    updateContent
};
