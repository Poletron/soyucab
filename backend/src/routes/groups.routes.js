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

/**
 * PUT /api/groups/:nombre
 * Update group details (creator only)
 */
router.put('/:nombre', requireAuth, async (req, res) => {
    const { nombre } = req.params;
    const { descripcion, visibilidad } = req.body;

    try {
        await groupsService.updateGroup(nombre, { descripcion, visibilidad }, req.userEmail);
        res.json({ success: true, message: `Grupo "${nombre}" actualizado` });
    } catch (err) {
        console.error('[GROUPS UPDATE] Error:', err.message);
        if (err.message.includes('Solo el creador')) {
            return res.status(403).json({ success: false, error: err.message });
        }
        if (err.message.includes('no encontrado')) {
            return res.status(404).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * DELETE /api/groups/:nombre
 * Delete a group (creator only)
 */
router.delete('/:nombre', requireAuth, async (req, res) => {
    const { nombre } = req.params;

    try {
        await groupsService.deleteGroup(nombre, req.userEmail);
        res.json({ success: true, message: `Grupo "${nombre}" eliminado` });
    } catch (err) {
        console.error('[GROUPS DELETE] Error:', err.message);
        if (err.message.includes('Solo el creador')) {
            return res.status(403).json({ success: false, error: err.message });
        }
        if (err.message.includes('no encontrado')) {
            return res.status(404).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

// =============================================================================
// SOLICITUDES DE INGRESO A GRUPOS PRIVADOS
// =============================================================================

/**
 * POST /:nombre/request - Request to join a private group
 */
router.post('/:nombre/request', requireAuth, async (req, res) => {
    const { nombre } = req.params;

    try {
        const result = await groupsService.requestJoinGroup(req.userEmail, nombre);
        res.json({ success: true, data: result });
    } catch (err) {
        console.error('[GROUPS REQUEST JOIN] Error:', err.message);
        res.status(400).json({ success: false, error: err.message });
    }
});

/**
 * GET /:nombre/requests - Get pending join requests for a group (admin only)
 */
router.get('/:nombre/requests', requireAuth, async (req, res) => {
    const { nombre } = req.params;

    try {
        const requests = await groupsService.getPendingJoinRequests(nombre, req.userEmail);
        res.json({ success: true, data: requests });
    } catch (err) {
        console.error('[GROUPS GET REQUESTS] Error:', err.message);
        if (err.message.includes('permisos')) {
            return res.status(403).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /requests/:id/accept - Accept a join request
 */
router.post('/requests/:id/accept', requireAuth, async (req, res) => {
    const { id } = req.params;

    try {
        await groupsService.acceptJoinRequest(parseInt(id), req.userEmail);
        res.json({ success: true, message: 'Solicitud aceptada' });
    } catch (err) {
        console.error('[GROUPS ACCEPT REQUEST] Error:', err.message);
        if (err.message.includes('permisos')) {
            return res.status(403).json({ success: false, error: err.message });
        }
        res.status(400).json({ success: false, error: err.message });
    }
});

/**
 * POST /requests/:id/reject - Reject a join request
 */
router.post('/requests/:id/reject', requireAuth, async (req, res) => {
    const { id } = req.params;

    try {
        await groupsService.rejectJoinRequest(parseInt(id), req.userEmail);
        res.json({ success: true, message: 'Solicitud rechazada' });
    } catch (err) {
        console.error('[GROUPS REJECT REQUEST] Error:', err.message);
        if (err.message.includes('permisos')) {
            return res.status(403).json({ success: false, error: err.message });
        }
        res.status(400).json({ success: false, error: err.message });
    }
});

/**
 * GET /:nombre/my-request - Get user's join request status for a group
 */
router.get('/:nombre/my-request', requireAuth, async (req, res) => {
    const { nombre } = req.params;

    try {
        const status = await groupsService.getMyJoinRequestStatus(req.userEmail, nombre);
        res.json({ success: true, data: status });
    } catch (err) {
        console.error('[GROUPS MY REQUEST STATUS] Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
