/**
 * Rutas de Conexiones Sociales - SoyUCAB
 * Solicitar, Aceptar, Rechazar conexiones
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * GET /api/connections
 * Obtener conexiones aceptadas del usuario
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                CASE 
                    WHEN sc.correo_solicitante = $1 THEN sc.correo_solicitado
                    ELSE sc.correo_solicitante
                END as correo_conexion,
                p.nombres,
                p.apellidos,
                m.fotografia_url,
                sc.fecha_solicitud as fecha_conexion
            FROM SOLICITA_CONEXION sc
            JOIN PERSONA p ON (
                CASE 
                    WHEN sc.correo_solicitante = $1 THEN sc.correo_solicitado
                    ELSE sc.correo_solicitante
                END = p.correo_principal
            )
            JOIN MIEMBRO m ON p.correo_principal = m.correo_principal
            WHERE (sc.correo_solicitante = $1 OR sc.correo_solicitado = $1)
            AND sc.estado_solicitud = 'Aceptada'
        `, [req.userEmail]);

        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/connections/pending
 * Solicitudes pendientes recibidas
 */
router.get('/pending', requireAuth, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                sc.clave_solicitud,
                sc.correo_solicitante,
                p.nombres,
                p.apellidos,
                m.fotografia_url,
                sc.fecha_solicitud
            FROM SOLICITA_CONEXION sc
            JOIN PERSONA p ON sc.correo_solicitante = p.correo_principal
            JOIN MIEMBRO m ON p.correo_principal = m.correo_principal
            WHERE sc.correo_solicitado = $1
            AND sc.estado_solicitud = 'Pendiente'
            ORDER BY sc.fecha_solicitud DESC
        `, [req.userEmail]);

        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/connections/request
 * Enviar solicitud de conexión
 */
router.post('/request', requireAuth, async (req, res) => {
    const { correo_destino } = req.body;
    const userEmail = req.userEmail;

    if (!correo_destino) {
        return res.status(400).json({ success: false, error: 'Correo destino requerido' });
    }

    if (correo_destino === userEmail) {
        return res.status(400).json({ success: false, error: 'No puedes conectarte contigo mismo' });
    }

    try {
        // Verificar si ya existe una solicitud
        const existing = await db.query(`
            SELECT estado_solicitud FROM SOLICITA_CONEXION 
            WHERE (correo_solicitante = $1 AND correo_solicitado = $2)
               OR (correo_solicitante = $2 AND correo_solicitado = $1)
        `, [userEmail, correo_destino]);

        if (existing.rows.length > 0) {
            const estado = existing.rows[0].estado_solicitud;
            if (estado === 'Aceptada') {
                return res.status(400).json({ success: false, error: 'Ya son conexiones' });
            }
            return res.status(400).json({ success: false, error: `Ya existe una solicitud (${estado})` });
        }

        await db.query(`
            INSERT INTO SOLICITA_CONEXION (correo_solicitante, correo_solicitado, fecha_solicitud, estado_solicitud)
            VALUES ($1, $2, NOW(), 'Pendiente')
        `, [userEmail, correo_destino]);

        res.status(201).json({ success: true, message: 'Solicitud enviada' });
    } catch (err) {
        console.error('[CONNECTIONS REQUEST] Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * PUT /api/connections/accept/:id
 * Aceptar solicitud
 */
router.put('/accept/:id', requireAuth, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(`
            UPDATE SOLICITA_CONEXION 
            SET estado_solicitud = 'Aceptada'
            WHERE clave_solicitud = $1 AND correo_solicitado = $2 AND estado_solicitud = 'Pendiente'
            RETURNING *
        `, [id, req.userEmail]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Solicitud no encontrada o ya procesada' });
        }

        res.json({ success: true, message: 'Conexión aceptada' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * PUT /api/connections/reject/:id
 * Rechazar solicitud
 */
router.put('/reject/:id', requireAuth, async (req, res) => {
    const { id } = req.params;

    try {
        await db.query(`
            UPDATE SOLICITA_CONEXION 
            SET estado_solicitud = 'Rechazada'
            WHERE clave_solicitud = $1 AND correo_solicitado = $2
        `, [id, req.userEmail]);

        res.json({ success: true, message: 'Solicitud rechazada' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/connections/status/:correo
 * Verificar estado de conexión con otro usuario
 */
router.get('/status/:correo', requireAuth, async (req, res) => {
    const { correo } = req.params;

    try {
        const result = await db.query(`
            SELECT estado_solicitud, 
                   correo_solicitante,
                   clave_solicitud
            FROM SOLICITA_CONEXION 
            WHERE (correo_solicitante = $1 AND correo_solicitado = $2)
               OR (correo_solicitante = $2 AND correo_solicitado = $1)
        `, [req.userEmail, correo]);

        if (result.rows.length === 0) {
            return res.json({ success: true, status: 'none' });
        }

        const row = result.rows[0];
        const isPending = row.estado_solicitud === 'Pendiente';
        const isSender = row.correo_solicitante === req.userEmail;

        res.json({
            success: true,
            status: row.estado_solicitud.toLowerCase(),
            pendingType: isPending ? (isSender ? 'sent' : 'received') : null,
            solicitudId: row.clave_solicitud
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
