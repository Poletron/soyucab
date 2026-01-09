const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth.middleware');

// POST /api/events - Crear nuevo evento
router.post('/', requireAuth, async (req, res) => {
    try {
        const { titulo, descripcion, fecha_inicio, hora_inicio, fecha_fin, hora_fin, ubicacion, visibilidad = 'Público' } = req.body;
        const correo_autor = req.user.email;

        if (!titulo || !fecha_inicio) {
            return res.status(400).json({ success: false, error: 'Título y fecha de inicio son requeridos' });
        }

        // Crear contenido tipo EVENTO
        const fechaInicio = fecha_inicio + (hora_inicio ? ` ${hora_inicio}:00` : ' 00:00:00');
        const fechaFin = fecha_fin ? (fecha_fin + (hora_fin ? ` ${hora_fin}:00` : ' 23:59:59')) : fechaInicio;

        const result = await db.queryAsUser(correo_autor, `
            INSERT INTO contenido (
                correo_autor, 
                texto_contenido, 
                visibilidad, 
                tipo_contenido
            )
            VALUES ($1, $2, $3, 'EVENTO')
            RETURNING clave_contenido
        `, [correo_autor, descripcion || titulo, visibilidad]);

        const claveContenido = result.rows[0].clave_contenido;

        // Insertar en tabla evento
        // NOTA: fk_contenido se inserta en clave_evento? NO. 
        // DDL: ck_evento SERIAL PK, fk_contenido INT UNIQUE.
        // Pero content.routes usa RETURNING clave_contenido.

        await db.queryAsUser(correo_autor, `
            INSERT INTO evento (
                fk_contenido,
                titulo,
                fecha_inicio,
                fecha_fin,
                ciudad_ubicacion
            )
            VALUES ($1, $2, $3, $4, $5)
        `, [claveContenido, titulo, fechaInicio, fechaFin, ubicacion || null]);

        res.json({
            success: true,
            data: {
                clave_evento: claveContenido, // Esto es el ID del contenido, pero el evento tendrá su propio ID serial.
                titulo: titulo,
                fecha_inicio: fechaInicio
            }
        });
    } catch (err) {
        console.error('Error creating event:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/events - Listar eventos
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                e.clave_evento,
                e.titulo,
                e.fecha_inicio,
                e.fecha_fin,
                e.ciudad_ubicacion as ubicacion,
                c.correo_autor,
                c.texto_contenido as descripcion,
                c.visibilidad,
                c.fecha_hora_creacion,
                p.nombres,
                p.apellidos
            FROM evento e
            JOIN contenido c ON e.fk_contenido = c.clave_contenido
            LEFT JOIN persona p ON c.correo_autor = p.correo_principal
            ORDER BY e.fecha_inicio DESC
            LIMIT 50
        `);

        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error getting events:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/events/:id - Obtener evento específico
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(`
            SELECT 
                e.clave_evento,
                e.titulo,
                e.fecha_inicio,
                e.fecha_fin,
                e.ciudad_ubicacion as ubicacion,
                c.correo_autor,
                c.texto_contenido as descripcion,
                c.visibilidad,
                c.fecha_hora_creacion,
                p.nombres,
                p.apellidos
            FROM evento e
            JOIN contenido c ON e.fk_contenido = c.clave_contenido
            LEFT JOIN persona p ON c.correo_autor = p.correo_principal
            WHERE e.clave_evento = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Evento no encontrado' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error getting event:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/events/:id/close
 * Cerrar un evento y crear reseña automática (llama al SP)
 * Solo el organizador del evento puede cerrarlo
 */
router.post('/:id/close', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userEmail = req.userEmail;

        // Verificar que el usuario sea el organizador del evento
        const eventCheck = await db.query(`
            SELECT c.correo_autor, e.titulo
            FROM evento e
            JOIN contenido c ON e.fk_contenido = c.clave_contenido
            WHERE e.clave_evento = $1 OR e.fk_contenido = $1
        `, [id]);

        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Evento no encontrado' });
        }

        if (eventCheck.rows[0].correo_autor !== userEmail) {
            return res.status(403).json({ success: false, error: 'Solo el organizador puede cerrar el evento' });
        }

        // Obtener el fk_contenido del evento
        const fkContenido = await db.query(`
            SELECT fk_contenido FROM evento WHERE clave_evento = $1 OR fk_contenido = $1
        `, [id]);

        const claveContenido = fkContenido.rows[0].fk_contenido;

        // Llamar al stored procedure
        await db.queryAsUser(`CALL SP_CERRAR_EVENTO_Y_CREAR_RESEÑA($1)`, [claveContenido], userEmail);

        res.json({
            success: true,
            message: `Evento "${eventCheck.rows[0].titulo}" cerrado. Se ha creado un borrador de reseña en tu perfil.`
        });
    } catch (err) {
        console.error('Error closing event:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
