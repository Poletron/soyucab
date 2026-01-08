/**
 * Rutas de Contenido (CRUD) - SoyUCAB
 * REFACTORED: Business logic moved to content.service.js
 */

const express = require('express');
const router = express.Router();
const contentService = require('../services/content.service');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * POST /api/content
 * Crear nueva publicación
 */
router.post('/', requireAuth, async (req, res) => {
    const { texto, visibilidad = 'Público', tipo = 'publicacion', evento, archivo_url } = req.body;

    if (!texto || texto.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'El texto es requerido' });
    }

    try {
        const result = await contentService.createContent(req.userEmail, texto, visibilidad, tipo, evento, archivo_url);
        res.status(201).json({
            success: true,
            message: tipo === 'evento' ? 'Evento creado' : 'Publicación creada',
            data: result
        });
    } catch (err) {
        console.error('[CONTENT CREATE] Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * DELETE /api/content/:id
 * Eliminar contenido propio
 */
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const author = await contentService.getContentAuthor(req.params.id);

        if (!author) {
            return res.status(404).json({ success: false, error: 'Contenido no encontrado' });
        }
        if (author !== req.userEmail) {
            return res.status(403).json({ success: false, error: 'No tienes permiso para eliminar este contenido' });
        }

        await contentService.deleteContent(req.params.id);
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
    const { reaccion = 'Me Gusta' } = req.body;

    try {
        await contentService.addReaction(req.userEmail, req.params.id, reaccion);
        res.json({ success: true, message: 'Reacción registrada' });
    } catch (err) {
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
    try {
        await contentService.removeReaction(req.userEmail, req.params.id);
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
    const { texto } = req.body;

    if (!texto || texto.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'El comentario no puede estar vacío' });
    }

    try {
        const result = await contentService.addComment(req.userEmail, req.params.id, texto);
        res.status(201).json({ success: true, message: 'Comentario creado', data: result });
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
    try {
        const comments = await contentService.getComments(req.params.id);
        res.json({ success: true, data: comments });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
