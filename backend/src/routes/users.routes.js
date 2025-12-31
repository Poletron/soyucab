/**
 * Rutas de Usuarios/Búsqueda - SoyUCAB
 * Búsqueda de usuarios, perfiles públicos
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
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
        const searchTerm = `%${q.trim().toLowerCase()}%`;

        const sql = `
            SELECT 
                p.correo_principal,
                p.nombres,
                p.apellidos,
                p.biografia,
                p.ciudad_residencia,
                p.pais_residencia,
                m.fotografia_url,
                CASE 
                    WHEN sc.estado_solicitud = 'Aceptada' THEN 'conectado'
                    WHEN sc.estado_solicitud = 'Pendiente' AND sc.correo_solicitante = $2 THEN 'pendiente_enviada'
                    WHEN sc.estado_solicitud = 'Pendiente' AND sc.correo_solicitado = $2 THEN 'pendiente_recibida'
                    ELSE 'no_conectado'
                END as estado_conexion,
                (
                    SELECT COUNT(*) 
                    FROM SOLICITA_CONEXION sc2 
                    WHERE sc2.estado_solicitud = 'Aceptada'
                    AND (sc2.correo_solicitante = p.correo_principal OR sc2.correo_solicitado = p.correo_principal)
                ) as total_conexiones
            FROM PERSONA p
            INNER JOIN MIEMBRO m ON p.correo_principal = m.correo_principal
            LEFT JOIN SOLICITA_CONEXION sc ON (
                (sc.correo_solicitante = p.correo_principal AND sc.correo_solicitado = $2) OR
                (sc.correo_solicitado = p.correo_principal AND sc.correo_solicitante = $2)
            )
            WHERE p.correo_principal != $2
            AND (
                LOWER(p.nombres) LIKE $1 OR
                LOWER(p.apellidos) LIKE $1 OR
                LOWER(p.correo_principal) LIKE $1 OR
                LOWER(CONCAT(p.nombres, ' ', p.apellidos)) LIKE $1
            )
            ORDER BY 
                CASE WHEN LOWER(p.nombres) LIKE $1 THEN 0 ELSE 1 END,
                p.nombres
            LIMIT 20
        `;

        const result = await db.queryAsUser(sql, [searchTerm, userEmail], userEmail);

        res.json({
            success: true,
            query: q.trim(),
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error('[USERS] Error en búsqueda:', err.message);
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
        const sql = `
            SELECT 
                p.correo_principal,
                p.nombres,
                p.apellidos,
                p.biografia,
                p.ciudad_residencia,
                p.pais_residencia,
                p.fecha_nacimiento,
                m.fecha_registro,
                m.fotografia_url,
                c.visibilidad_perfil,
                (
                    SELECT COUNT(*) 
                    FROM SOLICITA_CONEXION sc 
                    WHERE sc.estado_solicitud = 'Aceptada'
                    AND (sc.correo_solicitante = p.correo_principal OR sc.correo_solicitado = p.correo_principal)
                ) as total_conexiones,
                (
                    SELECT COUNT(*) 
                    FROM CONTENIDO con 
                    WHERE con.correo_autor = p.correo_principal
                ) as total_publicaciones,
                (
                    SELECT ARRAY_AGG(nombre_grupo)
                    FROM PERTENECE_A_GRUPO pg
                    WHERE pg.correo_persona = p.correo_principal
                    LIMIT 5
                ) as grupos
            FROM PERSONA p
            INNER JOIN MIEMBRO m ON p.correo_principal = m.correo_principal
            LEFT JOIN CONFIGURACION c ON p.correo_principal = c.correo_miembro
            WHERE p.correo_principal = $1
        `;

        const result = await db.queryAsUser(sql, [email], userEmail);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        // Verificar estado de conexión
        const connectionCheck = await db.query(`
            SELECT estado_solicitud, correo_solicitante, correo_solicitado, clave_solicitud
            FROM SOLICITA_CONEXION 
            WHERE (correo_solicitante = $1 AND correo_solicitado = $2)
               OR (correo_solicitante = $2 AND correo_solicitado = $1)
            ORDER BY fecha_solicitud DESC
            LIMIT 1
        `, [userEmail, email]);

        let connectionStatus = 'no_conectado';
        let solicitudId = null;
        if (connectionCheck.rows.length > 0) {
            const conn = connectionCheck.rows[0];
            solicitudId = conn.clave_solicitud;
            if (conn.estado_solicitud === 'Aceptada') {
                connectionStatus = 'conectado';
            } else if (conn.estado_solicitud === 'Pendiente') {
                connectionStatus = conn.correo_solicitante === userEmail ? 'pendiente_enviada' : 'pendiente_recibida';
            }
        }

        const profile = result.rows[0];
        profile.estado_conexion = connectionStatus;
        profile.solicitud_id = solicitudId;
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
 * GET /api/users/suggestions/connect
 * Sugerencias de conexión (personas que quizás conozcas)
 */
router.get('/suggestions/connect', requireAuth, async (req, res) => {
    const userEmail = req.userEmail;

    try {
        const sql = `
            SELECT DISTINCT
                p.correo_principal,
                p.nombres,
                p.apellidos,
                p.biografia,
                m.fotografia_url,
                (
                    SELECT COUNT(*) 
                    FROM SOLICITA_CONEXION sc 
                    WHERE sc.estado_solicitud = 'Aceptada'
                    AND (sc.correo_solicitante = p.correo_principal OR sc.correo_solicitado = p.correo_principal)
                ) as total_conexiones
            FROM PERSONA p
            INNER JOIN MIEMBRO m ON p.correo_principal = m.correo_principal
            WHERE p.correo_principal != $1
            AND NOT EXISTS (
                SELECT 1 FROM SOLICITA_CONEXION sc
                WHERE ((sc.correo_solicitante = $1 AND sc.correo_solicitado = p.correo_principal)
                   OR (sc.correo_solicitante = p.correo_principal AND sc.correo_solicitado = $1))
            )
            ORDER BY RANDOM()
            LIMIT 10
        `;

        const result = await db.queryAsUser(sql, [userEmail], userEmail);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error('[USERS] Error obteniendo sugerencias:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
