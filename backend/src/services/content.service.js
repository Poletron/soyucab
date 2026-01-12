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
 * @param {string} userEmail - Email of comment author
 * @param {number} contentId - ID of content being commented on
 * @param {string} texto - Comment text
 * @param {number|null} parentId - Optional parent comment ID for nested replies
 */
async function addComment(userEmail, contentId, texto, parentId = null) {
    const result = await db.query(
        `INSERT INTO COMENTARIO (fk_contenido, fecha_hora_comentario, correo_autor_comentario, texto_comentario, fk_comentario_padre)
         VALUES ($1, NOW(), $2, $3, $4)
         RETURNING clave_comentario, fecha_hora_comentario, fk_comentario_padre`,
        [contentId, userEmail, texto, parentId]
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
 * Get comments for a content (including nested replies)
 */
async function getComments(contentId) {
    const result = await db.query(
        `SELECT c.clave_comentario, 
                c.fk_contenido,
                c.fecha_hora_comentario,
                c.correo_autor_comentario,
                c.texto_comentario,
                c.fk_comentario_padre,
                COALESCE(p.nombres, eo.nombre_oficial) as nombres,
                p.apellidos,
                m.fotografia_url
         FROM COMENTARIO c
         JOIN MIEMBRO m ON c.correo_autor_comentario = m.correo_principal
         LEFT JOIN PERSONA p ON c.correo_autor_comentario = p.correo_principal
         LEFT JOIN ENTIDAD_ORGANIZACIONAL eo ON c.correo_autor_comentario = eo.correo_principal
         WHERE c.fk_contenido = $1
         ORDER BY c.fk_comentario_padre NULLS FIRST, c.fecha_hora_comentario ASC`,
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

/**
 * Delete a comment (only author can delete)
 * Child replies are also deleted via FK cascade
 */
async function deleteComment(commentId, userEmail) {
    // Verify ownership
    const result = await db.query(
        'SELECT correo_autor_comentario FROM COMENTARIO WHERE clave_comentario = $1',
        [commentId]
    );

    if (result.rows.length === 0) {
        throw new Error('Comentario no encontrado');
    }

    if (result.rows[0].correo_autor_comentario !== userEmail) {
        throw new Error('No tienes permiso para eliminar este comentario');
    }

    // Delete comment (child replies will be deleted by FK cascade if configured, 
    // otherwise we delete children first)
    await db.query(
        'DELETE FROM COMENTARIO WHERE fk_comentario_padre = $1',
        [commentId]
    );
    await db.query(
        'DELETE FROM COMENTARIO WHERE clave_comentario = $1',
        [commentId]
    );

    return { success: true };
}

/**
 * Get all available reaction types
 */
async function getReactionTypes() {
    const result = await db.query('SELECT nombre_reaccion, descripcion, url_icono FROM TIPO_REACCION');
    return result.rows;
}

/**
 * Add reaction to comment
 */
async function addCommentReaction(userEmail, commentId, reaccion = 'Me Gusta') {
    await db.query(
        `INSERT INTO REACCIONA_COMENTARIO (correo_miembro, fk_comentario, nombre_reaccion, fecha_hora_reaccion)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT DO NOTHING`,
        [userEmail, commentId, reaccion]
    );
}

/**
 * Remove reaction from comment
 */
async function removeCommentReaction(userEmail, commentId) {
    await db.query(
        'DELETE FROM REACCIONA_COMENTARIO WHERE correo_miembro = $1 AND fk_comentario = $2',
        [userEmail, commentId]
    );
}

/**
 * Get reactions count for a comment
 */
async function getCommentReactions(commentId) {
    const result = await db.query(
        `SELECT nombre_reaccion, COUNT(*) as count 
         FROM REACCIONA_COMENTARIO 
         WHERE fk_comentario = $1 
         GROUP BY nombre_reaccion`,
        [commentId]
    );
    return result.rows;
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
    updateContent,
    deleteComment,
    getReactionTypes,
    addCommentReaction,
    removeCommentReaction,
    getCommentReactions
};
