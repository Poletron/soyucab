/**
 * Admin Routes - SoyUCAB
 * Endpoints for admin-only operations: role assignment, user listing.
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

/**
 * GET /api/admin/users
 * List all users with their roles.
 * Admin only.
 */
router.get('/users', requireAuth, requireRole('Admin'), async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                m.correo_principal,
                COALESCE(p.nombres, eo.nombre_oficial, 'N/A') as nombre,
                COALESCE(p.apellidos, '', '') as apellidos,
                m.fecha_registro,
                CASE
                    WHEN p.correo_principal IS NOT NULL THEN 'Persona'
                    WHEN eo.correo_principal IS NOT NULL THEN 'Organizacion'
                    ELSE 'Desconocido'
                END as tipo,
                ARRAY_AGG(mpr.nombre_rol) FILTER (WHERE mpr.nombre_rol IS NOT NULL) as roles
            FROM MIEMBRO m
            LEFT JOIN PERSONA p ON m.correo_principal = p.correo_principal
            LEFT JOIN ENTIDAD_ORGANIZACIONAL eo ON m.correo_principal = eo.correo_principal
            LEFT JOIN MIEMBRO_POSEE_ROL mpr ON m.correo_principal = mpr.correo_miembro
            GROUP BY m.correo_principal, p.nombres, p.apellidos, eo.nombre_oficial, p.correo_principal, eo.correo_principal, m.fecha_registro
            ORDER BY m.fecha_registro DESC
            LIMIT 100
        `);

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('[ADMIN] Error listing users:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/admin/roles
 * List all available roles.
 * Admin only.
 */
router.get('/roles', requireAuth, requireRole('Admin'), async (req, res) => {
    try {
        const result = await db.query('SELECT nombre_rol, descripcion FROM ROL ORDER BY nombre_rol');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('[ADMIN] Error listing roles:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/admin/assign-role
 * Assign a role to a user.
 * Body: { userEmail: string, role: string }
 * Admin only.
 */
router.post('/assign-role', requireAuth, requireRole('Admin'), async (req, res) => {
    try {
        const { userEmail, role } = req.body;

        if (!userEmail || !role) {
            return res.status(400).json({ success: false, error: 'userEmail y role son requeridos' });
        }

        // Check if role exists
        const roleCheck = await db.query('SELECT 1 FROM ROL WHERE nombre_rol = $1', [role]);
        if (roleCheck.rows.length === 0) {
            return res.status(400).json({ success: false, error: `Rol '${role}' no existe` });
        }

        // Check if user exists
        const userCheck = await db.query('SELECT 1 FROM MIEMBRO WHERE correo_principal = $1', [userEmail]);
        if (userCheck.rows.length === 0) {
            return res.status(400).json({ success: false, error: `Usuario '${userEmail}' no existe` });
        }

        // Check if already assigned
        const existCheck = await db.query(
            'SELECT 1 FROM MIEMBRO_POSEE_ROL WHERE correo_miembro = $1 AND nombre_rol = $2',
            [userEmail, role]
        );
        if (existCheck.rows.length > 0) {
            return res.json({ success: true, message: `Usuario ya tiene el rol '${role}'` });
        }

        // Assign role
        await db.query(
            'INSERT INTO MIEMBRO_POSEE_ROL (correo_miembro, nombre_rol, fecha_asignacion) VALUES ($1, $2, NOW())',
            [userEmail, role]
        );

        console.log(`[ADMIN] Role '${role}' assigned to '${userEmail}' by '${req.userEmail}'`);
        res.json({ success: true, message: `Rol '${role}' asignado a '${userEmail}'` });
    } catch (error) {
        console.error('[ADMIN] Error assigning role:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/admin/remove-role
 * Remove a role from a user.
 * Body: { userEmail: string, role: string }
 * Admin only.
 */
router.delete('/remove-role', requireAuth, requireRole('Admin'), async (req, res) => {
    try {
        const { userEmail, role } = req.body;

        if (!userEmail || !role) {
            return res.status(400).json({ success: false, error: 'userEmail y role son requeridos' });
        }

        const result = await db.query(
            'DELETE FROM MIEMBRO_POSEE_ROL WHERE correo_miembro = $1 AND nombre_rol = $2 RETURNING *',
            [userEmail, role]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Asignación de rol no encontrada' });
        }

        console.log(`[ADMIN] Role '${role}' removed from '${userEmail}' by '${req.userEmail}'`);
        res.json({ success: true, message: `Rol '${role}' removido de '${userEmail}'` });
    } catch (error) {
        console.error('[ADMIN] Error removing role:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
