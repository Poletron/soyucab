/**
 * Rutas de Conexiones Sociales - SoyUCAB
 * REFACTORED: Business logic moved to connections.service.js
 */

const express = require('express');
const router = express.Router();
const connectionsService = require('../services/connections.service');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * GET /api/connections
 * Obtener conexiones aceptadas del usuario
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const connections = await connectionsService.getAcceptedConnections(req.userEmail);
        res.json({ success: true, data: connections });
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
        const pending = await connectionsService.getPendingRequests(req.userEmail);
        res.json({ success: true, data: pending });
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
        const existingStatus = await connectionsService.getExistingRequest(userEmail, correo_destino);

        if (existingStatus) {
            if (existingStatus === 'Aceptada') {
                return res.status(400).json({ success: false, error: 'Ya son conexiones' });
            }
            return res.status(400).json({ success: false, error: `Ya existe una solicitud (${existingStatus})` });
        }

        await connectionsService.sendConnectionRequest(userEmail, correo_destino);
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
    try {
        const accepted = await connectionsService.acceptRequest(req.params.id, req.userEmail);
        if (!accepted) {
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
    try {
        await connectionsService.rejectRequest(req.params.id, req.userEmail);
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
    try {
        const status = await connectionsService.getConnectionStatus(req.userEmail, req.params.correo);
        res.json({ success: true, ...status });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
