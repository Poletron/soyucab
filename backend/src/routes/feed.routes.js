/**
 * Rutas de Feed (Contenido) - SoyUCAB
 * Prueba de RLS y consulta de contenido
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * GET /api/feed
 * Obtiene el contenido visible para el usuario autenticado
 * NOTA: Aplica RLS automáticamente
 */
router.get('/', requireAuth, async (req, res) => {
    try {
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
                (SELECT COUNT(*) FROM REACCIONA_CONTENIDO rc WHERE rc.fk_contenido = c.clave_contenido) as likes_count,
                (SELECT COUNT(*) FROM COMENTARIO com WHERE com.fk_contenido = c.clave_contenido) as comments_count
            FROM CONTENIDO c
            LEFT JOIN EVENTO e ON e.fk_contenido = c.clave_contenido
            LEFT JOIN PUBLICACION p ON p.fk_contenido = c.clave_contenido
            LEFT JOIN PERSONA per ON c.correo_autor = per.correo_principal
            LEFT JOIN MIEMBRO m ON c.correo_autor = m.correo_principal
            ORDER BY c.fecha_hora_creacion DESC
            LIMIT 20
        `;

        const result = await db.queryAsUser(sql, [], req.userEmail);

        res.json({
            success: true,
            user: req.userEmail,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error('[FEED] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/feed/stats
 * Estadísticas rápidas del contenido
 */
router.get('/stats', async (req, res) => {
    try {
        const sql = `
            SELECT 
                (SELECT COUNT(*) FROM CONTENIDO WHERE visibilidad = 'Público') as total_publico,
                (SELECT COUNT(*) FROM EVENTO WHERE fecha_inicio > NOW()) as eventos_futuros,
                (SELECT COUNT(*) FROM MIEMBRO) as total_miembros
        `;

        const result = await db.query(sql);

        res.json({
            success: true,
            stats: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
