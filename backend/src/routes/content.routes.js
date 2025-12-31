/**
 * Rutas de Contenido (CRUD) - SoyUCAB
 * Crear, Leer, Eliminar publicaciones y eventos
 * Comentar y Reaccionar
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * POST /api/content
 * Crear nueva publicación
 */
router.post('/', requireAuth, async (req, res) => {
    const { texto, visibilidad = 'Público', tipo = 'publicacion', evento } = req.body;
    const userEmail = req.userEmail;

    if (!texto || texto.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'El texto es requerido' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        // Inyectar usuario para RLS
        await client.query(`SELECT set_config('app.user_email', $1, true)`, [userEmail]);

        // 1. Insertar en CONTENIDO
        const insertContenido = await client.query(
            `INSERT INTO CONTENIDO (correo_autor, fecha_hora_creacion, texto_contenido, visibilidad)
             VALUES ($1, NOW(), $2, $3)
             RETURNING clave_contenido, fecha_hora_creacion`,
            [userEmail, texto, visibilidad]
        );
        const { clave_contenido, fecha_hora_creacion } = insertContenido.rows[0];

        // 2. Insertar en tabla hija según tipo
        if (tipo === 'evento' && evento) {
            await client.query(
                `INSERT INTO EVENTO (fk_contenido, titulo, fecha_inicio, fecha_fin, ciudad_ubicacion, pais_ubicacion)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [clave_contenido, evento.titulo, evento.fecha_inicio, evento.fecha_fin, evento.ciudad || null, evento.pais || 'Venezuela']
            );
        } else {
            await client.query(
                `INSERT INTO PUBLICACION (fk_contenido) VALUES ($1)`,
                [clave_contenido]
            );
        }

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: tipo === 'evento' ? 'Evento creado' : 'Publicación creada',
            data: { clave_contenido, fecha_hora_creacion }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[CONTENT CREATE] Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    } finally {
        client.release();
    }
});

/**
 * DELETE /api/content/:id
 * Eliminar contenido propio
 */
router.delete('/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const userEmail = req.userEmail;

    try {
        // Verificar que el contenido pertenece al usuario
        const check = await db.query(
            'SELECT correo_autor FROM CONTENIDO WHERE clave_contenido = $1',
            [id]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Contenido no encontrado' });
        }

        if (check.rows[0].correo_autor !== userEmail) {
            return res.status(403).json({ success: false, error: 'No tienes permiso para eliminar este contenido' });
        }

        // Eliminar (CASCADE debería manejar las tablas hijas)
        await db.query('DELETE FROM CONTENIDO WHERE clave_contenido = $1', [id]);

        res.json({ success: true, message: 'Contenido eliminado' });
    } catch (err) {
        console.error('[CONTENT DELETE] Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/content/:id/react
 * Reaccionar a un contenido
 */
router.post('/:id/react', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { reaccion = 'Me Gusta' } = req.body;
    const userEmail = req.userEmail;

    try {
        await db.query(
            `INSERT INTO REACCIONA_CONTENIDO (correo_miembro, fk_contenido, nombre_reaccion, fecha_hora_reaccion)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT DO NOTHING`,
            [userEmail, id, reaccion]
        );

        res.json({ success: true, message: 'Reacción registrada' });
    } catch (err) {
        // Capturar error del trigger TRG_EVITAR_AUTO_REACCION
        if (err.message.includes('Auto-Like prohibido')) {
            return res.status(400).json({ success: false, error: 'No puedes reaccionar a tu propio contenido' });
        }
        console.error('[REACT] Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * DELETE /api/content/:id/react
 * Quitar reacción
 */
router.delete('/:id/react', requireAuth, async (req, res) => {
    const { id } = req.params;
    const userEmail = req.userEmail;

    try {
        await db.query(
            `DELETE FROM REACCIONA_CONTENIDO WHERE correo_miembro = $1 AND fk_contenido = $2`,
            [userEmail, id]
        );
        res.json({ success: true, message: 'Reacción eliminada' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/content/:id/comment
 * Comentar en un contenido
 */
router.post('/:id/comment', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { texto } = req.body;
    const userEmail = req.userEmail;

    if (!texto || texto.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'El comentario no puede estar vacío' });
    }

    try {
        const result = await db.query(
            `INSERT INTO COMENTARIO (fk_contenido, fecha_hora_comentario, correo_autor_comentario, texto_comentario)
             VALUES ($1, NOW(), $2, $3)
             RETURNING clave_comentario, fecha_hora_comentario`,
            [id, userEmail, texto]
        );

        res.status(201).json({
            success: true,
            message: 'Comentario creado',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('[COMMENT] Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/content/:id/comments
 * Obtener comentarios de un contenido
 */
router.get('/:id/comments', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
            `SELECT c.*, p.nombres, p.apellidos
             FROM COMENTARIO c
             LEFT JOIN PERSONA p ON c.correo_autor_comentario = p.correo_principal
             WHERE c.fk_contenido = $1
             ORDER BY c.fecha_hora_comentario ASC`,
            [id]
        );

        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
