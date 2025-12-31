/**
 * Rutas de Grupos de Interés - SoyUCAB
 * Usa SP_CREAR_GRUPO_CON_FUNDADOR del procedimiento almacenado
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * GET /api/groups
 * Listar todos los grupos públicos
 */
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                g.nombre_grupo,
                g.descripcion_grupo,
                g.visibilidad,
                g.correo_creador,
                g.fecha_creacion,
                COUNT(p.correo_persona) as total_miembros
            FROM GRUPO_INTERES g
            LEFT JOIN PERTENECE_A_GRUPO p ON g.nombre_grupo = p.nombre_grupo
            WHERE g.visibilidad = 'Público'
            GROUP BY g.nombre_grupo, g.descripcion_grupo, g.visibilidad, g.correo_creador, g.fecha_creacion
            ORDER BY total_miembros DESC
        `);

        res.json({ success: true, data: result.rows });
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
        const result = await db.query(`
            SELECT 
                g.nombre_grupo,
                g.descripcion_grupo,
                g.visibilidad,
                p.rol_en_grupo,
                p.fecha_union
            FROM PERTENECE_A_GRUPO p
            JOIN GRUPO_INTERES g ON p.nombre_grupo = g.nombre_grupo
            WHERE p.correo_persona = $1
            ORDER BY p.fecha_union DESC
        `, [req.userEmail]);

        res.json({ success: true, data: result.rows });
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
    const userEmail = req.userEmail;

    if (!nombre || nombre.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'El nombre del grupo es requerido' });
    }

    try {
        // Usar el Stored Procedure definido en 02_Funciones_Procedimientos.sql
        await db.query(
            `CALL SP_CREAR_GRUPO_CON_FUNDADOR($1, $2, $3, $4)`,
            [nombre, descripcion || '', visibilidad, userEmail]
        );

        res.status(201).json({
            success: true,
            message: `Grupo "${nombre}" creado exitosamente. Eres el Administrador.`,
            data: { nombre_grupo: nombre }
        });
    } catch (err) {
        console.error('[GROUPS CREATE] Error:', err.message);
        // Manejar error de nombre duplicado
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
    const userEmail = req.userEmail;

    try {
        // Verificar que el grupo existe y es público
        const grupo = await db.query(
            'SELECT visibilidad FROM GRUPO_INTERES WHERE nombre_grupo = $1',
            [nombre]
        );

        if (grupo.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Grupo no encontrado' });
        }

        if (grupo.rows[0].visibilidad === 'Privado') {
            return res.status(403).json({ success: false, error: 'Este grupo es privado. Necesitas una invitación.' });
        }

        // Insertar miembro
        await db.query(
            `INSERT INTO PERTENECE_A_GRUPO (correo_persona, nombre_grupo, fecha_union, rol_en_grupo)
             VALUES ($1, $2, NOW(), 'Miembro')
             ON CONFLICT DO NOTHING`,
            [userEmail, nombre]
        );

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
    const { nombre } = req.params;
    const userEmail = req.userEmail;

    try {
        await db.query(
            'DELETE FROM PERTENECE_A_GRUPO WHERE correo_persona = $1 AND nombre_grupo = $2',
            [userEmail, nombre]
        );

        res.json({ success: true, message: `Has salido del grupo "${nombre}"` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
