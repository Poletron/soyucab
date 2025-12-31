/**
 * Feed Service - SoyUCAB
 * Business logic for content feed and statistics
 */

const db = require('../config/db');

async function getFeed(userEmail) {
    const sql = `
        SELECT 
            c.clave_contenido,
            c.correo_autor,
            c.fecha_hora_creacion,
            c.texto_contenido,
            c.visibilidad,
            c.archivo_url,
            CASE 
                WHEN e.clave_evento IS NOT NULL THEN 'EVENTO'
                WHEN p.clave_publicacion IS NOT NULL THEN 'PUBLICACION'
                ELSE 'OTRO'
            END as tipo_contenido,
            e.titulo as evento_titulo,
            e.fecha_inicio as evento_fecha,
            e.fecha_fin as evento_fecha_fin,
            e.ciudad_ubicacion as evento_ciudad,
            per.nombres,
            per.apellidos,
            m.fotografia_url as autor_foto,
            (SELECT COUNT(*)::INTEGER FROM REACCIONA_CONTENIDO rc WHERE rc.fk_contenido = c.clave_contenido) as likes_count,
            (SELECT COUNT(*)::INTEGER FROM COMENTARIO com WHERE com.fk_contenido = c.clave_contenido) as comments_count,
            EXISTS(SELECT 1 FROM REACCIONA_CONTENIDO rc WHERE rc.fk_contenido = c.clave_contenido AND rc.correo_miembro = $1) as user_has_reacted
        FROM CONTENIDO c
        LEFT JOIN EVENTO e ON e.fk_contenido = c.clave_contenido
        LEFT JOIN PUBLICACION p ON p.fk_contenido = c.clave_contenido
        LEFT JOIN PERSONA per ON c.correo_autor = per.correo_principal
        LEFT JOIN MIEMBRO m ON c.correo_autor = m.correo_principal
        ORDER BY c.fecha_hora_creacion DESC
        LIMIT 20
    `;

    const result = await db.queryAsUser(sql, [userEmail], userEmail);
    return result.rows;
}

/**
 * Get general feed statistics
 */
async function getFeedStats() {
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM CONTENIDO WHERE visibilidad = 'Público') as total_publico,
            (SELECT COUNT(*) FROM EVENTO WHERE fecha_inicio > NOW()) as eventos_futuros,
            (SELECT COUNT(*) FROM MIEMBRO) as total_miembros
    `;
    const result = await db.query(sql);
    return result.rows[0];
}

module.exports = {
    getFeed,
    getFeedStats
};
