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
                c.correo_autor,
                c.fecha_hora_creacion,
                c.texto_contenido,
                c.visibilidad,
                CASE 
                    WHEN e.titulo IS NOT NULL THEN 'EVENTO'
                    WHEN p.correo_autor IS NOT NULL THEN 'PUBLICACION'
                    ELSE 'OTRO'
                END as tipo_contenido,
                e.titulo as evento_titulo,
                e.fecha_inicio as evento_fecha
            FROM CONTENIDO c
            LEFT JOIN EVENTO e ON c.correo_autor = e.correo_autor AND c.fecha_hora_creacion = e.fecha_hora_creacion
            LEFT JOIN PUBLICACION p ON c.correo_autor = p.correo_autor AND c.fecha_hora_creacion = p.fecha_hora_creacion
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
