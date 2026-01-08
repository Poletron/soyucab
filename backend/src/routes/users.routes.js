/**
 * Rutas de Usuarios/Búsqueda - SoyUCAB
 * Búsqueda de usuarios, perfiles públicos
 * 
 * REFACTORED: Business logic moved to users.service.js
 */

const express = require('express');
const router = express.Router();
const usersService = require('../services/users.service');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * GET /api/users/search?q=query
 * Buscar usuarios por nombre, apellido o correo
 */
router.get('/search', requireAuth, async (req, res) => {
    const { q } = req.query;
    const userEmail = req.userEmail;

    if (!q || q.trim().length < 2) {
        return res.status(400).json({
            success: false,
            error: 'La búsqueda debe tener al menos 2 caracteres'
        });
    }

    try {
        const users = await usersService.searchUsers(q, userEmail);

        res.json({
            success: true,
            query: q.trim(),
            count: users.length,
            data: users
        });
    } catch (err) {
        console.error('[USERS] Error en búsqueda:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/users/suggestions/connect
 * Sugerencias de conexión (personas que quizás conozcas)
 */
router.get('/suggestions/connect', requireAuth, async (req, res) => {
    const userEmail = req.userEmail;

    try {
        const suggestions = await usersService.getConnectionSuggestions(userEmail);

        res.json({
            success: true,
            count: suggestions.length,
            data: suggestions
        });
    } catch (err) {
        console.error('[USERS] Error obteniendo sugerencias:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/users/:email
 * Obtener perfil público de un usuario
 */
router.get('/:email', requireAuth, async (req, res) => {
    const { email } = req.params;
    const userEmail = req.userEmail;

    try {
        const profile = await usersService.getUserProfile(email, userEmail);

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        // Get connection status
        const connectionInfo = await usersService.getConnectionStatus(userEmail, email);

        profile.estado_conexion = connectionInfo.status;
        profile.solicitud_id = connectionInfo.solicitudId;
        profile.es_mi_perfil = (email === userEmail);

        res.json({
            success: true,
            data: profile
        });
    } catch (err) {
        console.error('[USERS] Error obteniendo perfil:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});
/**
 * GET /api/users/:email/posts
 * Get posts by a specific user
 */
router.get('/:email/posts', requireAuth, async (req, res) => {
    const { email } = req.params;

    try {
        const posts = await usersService.getUserPosts(email, req.userEmail);
        res.json({
            success: true,
            count: posts.length,
            data: posts
        });
    } catch (err) {
        console.error('[USERS] Error getting user posts:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
