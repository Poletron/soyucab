/**
 * Rutas de Mensajería - SoyUCAB
 * Chat privado y grupal
 * 
 * REFACTORED: Business logic moved to messages.service.js
 */

const express = require('express');
const router = express.Router();
const messagesService = require('../services/messages.service');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * GET /api/messages/conversations
 * Obtiene todas las conversaciones del usuario autenticado
 */
router.get('/conversations', requireAuth, async (req, res) => {
    try {
        const conversations = await messagesService.getConversations(req.userEmail);

        res.json({
            success: true,
            count: conversations.length,
            data: conversations
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
        // Verify participation
        const participates = await messagesService.userParticipatesIn(conversationId, userEmail);
        if (!participates) {
            return res.status(403).json({
                success: false,
                error: 'No tienes acceso a esta conversación'
            });
        }

        // Get messages
        const messages = await messagesService.getMessages(conversationId, userEmail);

        // Mark as read
        await messagesService.markMessagesAsRead(conversationId, userEmail);

        res.json({
            success: true,
            count: messages.length,
            data: messages
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
        // Verify participation
        const participates = await messagesService.userParticipatesIn(conversacion_id, userEmail);
        if (!participates) {
            return res.status(403).json({
                success: false,
                error: 'No participas en esta conversación'
            });
        }

        // Send message
        const message = await messagesService.sendMessage(conversacion_id, userEmail, texto);

        res.status(201).json({
            success: true,
            message: 'Mensaje enviado',
            data: message
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

    try {
        const result = await messagesService.startConversation(userEmail, correo_destino, mensaje_inicial);

        res.status(result.isNew ? 201 : 200).json({
            success: true,
            message: result.isNew ? 'Conversación creada' : 'Conversación existente encontrada',
            data: { clave_conversacion: result.conversationId, nueva: result.isNew }
        });
    } catch (err) {
        console.error('[MESSAGES] Error iniciando conversación:', err.message);
        res.status(500).json({ success: false, error: err.message });
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
        const info = await messagesService.getConversationInfo(id, userEmail);

        if (!info) {
            return res.status(404).json({
                success: false,
                error: 'Conversación no encontrada o sin acceso'
            });
        }

        res.json({
            success: true,
            data: info
        });
    } catch (err) {
        console.error('[MESSAGES] Error obteniendo info conversación:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
