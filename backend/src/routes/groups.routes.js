/**
 * Rutas de Grupos de Interés - SoyUCAB
 * REFACTORED: Business logic moved to groups.service.js
 */

const express = require('express');
const router = express.Router();
const groupsService = require('../services/groups.service');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * GET /api/groups
 * Listar todos los grupos públicos
 */
router.get('/', async (req, res) => {
    try {
        const groups = await groupsService.getPublicGroups();
        res.json({ success: true, data: groups });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/groups/my
 * Grupos del usuario autenticado
 */
router.get('/my', requireAuth, async (req, res) => {
    try {
        const groups = await groupsService.getUserGroups(req.userEmail);
        res.json({ success: true, data: groups });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/groups
 * Crear grupo usando SP_CREAR_GRUPO_CON_FUNDADOR
 */
router.post('/', requireAuth, async (req, res) => {
    const { nombre, descripcion, visibilidad = 'Público' } = req.body;

    if (!nombre || nombre.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'El nombre del grupo es requerido' });
    }

    try {
        await groupsService.createGroup(nombre, descripcion, visibilidad, req.userEmail);
        res.status(201).json({
            success: true,
            message: `Grupo "${nombre}" creado exitosamente. Eres el Administrador.`,
            data: { nombre_grupo: nombre }
        });
    } catch (err) {
        console.error('[GROUPS CREATE] Error:', err.message);
        if (err.message.includes('duplicate key') || err.message.includes('already exists')) {
            return res.status(400).json({ success: false, error: 'Ya existe un grupo con ese nombre' });
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/groups/:nombre/join
 * Unirse a un grupo
 */
router.post('/:nombre/join', requireAuth, async (req, res) => {
    const { nombre } = req.params;

    try {
        const visibility = await groupsService.getGroupVisibility(nombre);

        if (!visibility) {
            return res.status(404).json({ success: false, error: 'Grupo no encontrado' });
        }
        if (visibility === 'Privado') {
            return res.status(403).json({ success: false, error: 'Este grupo es privado. Necesitas una invitación.' });
        }

        await groupsService.joinGroup(req.userEmail, nombre);
        res.json({ success: true, message: `Te has unido al grupo "${nombre}"` });
    } catch (err) {
        console.error('[GROUPS JOIN] Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * DELETE /api/groups/:nombre/leave
 * Salir de un grupo
 */
router.delete('/:nombre/leave', requireAuth, async (req, res) => {
    try {
        await groupsService.leaveGroup(req.userEmail, req.params.nombre);
        res.json({ success: true, message: `Has salido del grupo "${req.params.nombre}"` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/groups/:nombre/posts
 * Obtener publicaciones de un grupo específico
 */
const contentService = require('../services/content.service');

router.get('/:nombre/posts', requireAuth, async (req, res) => {
    const { nombre } = req.params;

    try {
        const posts = await contentService.getGroupPosts(nombre);
        res.json({
            success: true,
            count: posts.length,
            data: posts
        });
    } catch (err) {
        console.error('[GROUPS POSTS] Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
