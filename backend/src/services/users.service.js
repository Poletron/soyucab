/**
 * Users Service - SoyUCAB
 * Business logic for user search, profiles, and suggestions
 * Extracted from users.routes.js for separation of concerns
 */

const db = require('../config/db');

/**
 * Search users by name, surname, or email
 * @param {string} query - Search query (min 2 chars)
 * @param {string} userEmail - Current user's email (for connection status)
 * @returns {Promise<Array>} - Array of matching users
 */
async function searchUsers(query, userEmail) {
    const searchTerm = `%${query.trim().toLowerCase()}%`;

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
    return result.rows;
}

/**
 * Get public profile of a user
 * @param {string} targetEmail - Email of the profile to view
 * @param {string} requesterEmail - Email of the user requesting
 * @returns {Promise<Object|null>} - User profile or null if not found
 */
async function getUserProfile(targetEmail, requesterEmail) {
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

    const result = await db.queryAsUser(sql, [targetEmail], requesterEmail);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
}

/**
 * Get connection status between two users
 * @param {string} userEmail - Current user
 * @param {string} otherEmail - Other user to check
 * @returns {Promise<Object>} - Connection status info
 */
async function getConnectionStatus(userEmail, otherEmail) {
    const result = await db.query(`
        SELECT estado_solicitud, correo_solicitante, correo_solicitado, clave_solicitud
        FROM SOLICITA_CONEXION 
        WHERE (correo_solicitante = $1 AND correo_solicitado = $2)
           OR (correo_solicitante = $2 AND correo_solicitado = $1)
        ORDER BY fecha_solicitud DESC
        LIMIT 1
    `, [userEmail, otherEmail]);

    if (result.rows.length === 0) {
        return { status: 'no_conectado', solicitudId: null };
    }

    const conn = result.rows[0];
    let connectionStatus = 'no_conectado';

    if (conn.estado_solicitud === 'Aceptada') {
        connectionStatus = 'conectado';
    } else if (conn.estado_solicitud === 'Pendiente') {
        connectionStatus = conn.correo_solicitante === userEmail ? 'pendiente_enviada' : 'pendiente_recibida';
    }

    return {
        status: connectionStatus,
        solicitudId: conn.clave_solicitud
    };
}

/**
 * Get connection suggestions for a user (people they may know)
 * @param {string} userEmail - Current user's email
 * @returns {Promise<Array>} - Array of suggested users
 */
async function getConnectionSuggestions(userEmail) {
    const sql = `
        SELECT
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
            )::INTEGER as total_conexiones
        FROM PERSONA p
        INNER JOIN MIEMBRO m ON p.correo_principal = m.correo_principal
        WHERE p.correo_principal != $1
        AND NOT EXISTS (
            SELECT 1 FROM SOLICITA_CONEXION sc
            WHERE ((sc.correo_solicitante = $1 AND sc.correo_solicitado = p.correo_principal)
               OR (sc.correo_solicitante = p.correo_principal AND sc.correo_solicitado = $1))
        )
        LIMIT 10
    `;

    const result = await db.queryAsUser(sql, [userEmail], userEmail);
    return result.rows;
}

module.exports = {
    searchUsers,
    getUserProfile,
    getConnectionStatus,
    getConnectionSuggestions
};
