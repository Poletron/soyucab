/**
 * Rutas de Autenticación - SoyUCAB
 * Login, Registro y Perfil de usuario
 */

const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'El correo es requerido'
            });
        }

        const user = await authService.login(email, password);

        res.json({
            success: true,
            message: 'Login exitoso',
            user
        });

    } catch (error) {
        console.error('[AUTH LOGIN] Error:', error.message);
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, nombre, apellido, fechaNacimiento, ubicacion } = req.body;

        // Validaciones
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'El correo es requerido'
            });
        }

        // Determinar tipo
        const type = req.body.type || 'persona';

        if (type === 'persona') {
            if (!req.body.nombre || !req.body.apellido) {
                return res.status(400).json({ success: false, error: 'Nombre y apellido son requeridos para personas' });
            }
            if (!email.endsWith('@ucab.edu.ve')) {
                return res.status(400).json({ success: false, error: 'Debe usar un correo institucional @ucab.edu.ve' });
            }
        } else if (type === 'organizacion') {
            if (!req.body.organizationName || !req.body.rif || !req.body.entityType) {
                return res.status(400).json({ success: false, error: 'Nombre, RIF y Tipo son requeridos para organizaciones' });
            }
        }

        const result = await authService.register({
            ...req.body,
            type
        });

        res.status(201).json({
            success: true,
            message: 'Registro exitoso',
            user: result
        });

    } catch (error) {
        console.error('[AUTH REGISTER] Error:', error.message);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/auth/profile
 * Obtener perfil del usuario autenticado
 */
router.get('/profile', requireAuth, async (req, res) => {
    try {
        const profile = await authService.getUserProfile(req.userEmail);

        res.json({
            success: true,
            profile
        });

    } catch (error) {
        console.error('[AUTH PROFILE] Error:', error.message);
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/auth/verify
 * Verificar si el token/sesión es válido
 */
router.get('/verify', requireAuth, (req, res) => {
    res.json({
        success: true,
        email: req.userEmail,
        message: 'Sesión válida'
    });
});

/**
 * PUT /api/auth/profile
 * Actualizar perfil del usuario
 */
router.put('/profile', requireAuth, async (req, res) => {
    try {
        const result = await authService.updateProfile(req.userEmail, req.body);
        res.json(result);
    } catch (error) {
        console.error('[AUTH UPDATE PROFILE] Error:', error.message);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/auth/stats
 * Obtener estadísticas del usuario (conexiones, grupos, publicaciones)
 */
router.get('/stats', requireAuth, async (req, res) => {
    try {
        const stats = await authService.getUserStats(req.userEmail);
        res.json({ success: true, stats });
    } catch (error) {
        console.error('[AUTH STATS] Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
