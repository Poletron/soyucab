/**
 * Rutas de Feed (Contenido) - SoyUCAB
 * REFACTORED: Business logic moved to feed.service.js
 */

const express = require('express');
const router = express.Router();
const feedService = require('../services/feed.service');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * GET /api/feed
 * Obtiene el contenido visible para el usuario autenticado
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const feed = await feedService.getFeed(req.userEmail);
        res.json({
            success: true,
            user: req.userEmail,
            count: feed.length,
            data: feed
        });
    } catch (error) {
        console.error('[FEED] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/feed/stats
 * Estadísticas rápidas del contenido
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await feedService.getFeedStats();
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
