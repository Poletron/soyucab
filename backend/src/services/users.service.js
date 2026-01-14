/**
 * Users Service - SoyUCAB
 * Business logic for user search, profiles, and suggestions
 * Extracted from users.routes.js for separation of concerns
 */

const db = require('../config/db');

/**
 * Search users by name, surname, or email
 * Includes both PERSONA and ENTIDAD_ORGANIZACIONAL
 * @param {string} query - Search query (min 2 chars)
 * @param {string} userEmail - Current user's email (for connection status)
 * @returns {Promise<Array>} - Array of matching users
 */
async function searchUsers(query, userEmail) {
    const searchTerm = `%${query.trim().toLowerCase()}%`;

    const sql = `
        -- Search PERSONA
        SELECT 
            p.correo_principal,
            p.nombres,
            p.apellidos,
            p.biografia,
            p.ciudad_residencia,
            p.pais_residencia,
            m.fotografia_url,
            'Persona' as tipo,
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

        UNION ALL

        -- Search ENTIDAD_ORGANIZACIONAL
        SELECT 
            eo.correo_principal,
            eo.nombre_oficial as nombres,
            '' as apellidos,
            eo.descripcion as biografia,
            eo.ciudad_ubicacion as ciudad_residencia,
            eo.pais_ubicacion as pais_residencia,
            m.fotografia_url,
            'Organizacion' as tipo,
            'no_conectado' as estado_conexion,
            0 as total_conexiones
        FROM ENTIDAD_ORGANIZACIONAL eo
        INNER JOIN MIEMBRO m ON eo.correo_principal = m.correo_principal
        WHERE eo.correo_principal != $2
        AND (
            LOWER(eo.nombre_oficial) LIKE $1 OR
            LOWER(eo.rif) LIKE $1 OR
            LOWER(eo.correo_principal) LIKE $1 OR
            LOWER(eo.descripcion) LIKE $1
        )

        ORDER BY nombres
        LIMIT 20
    `;

    const result = await db.queryAsUser(sql, [searchTerm, userEmail], userEmail);
    return result.rows;
}

/**
 * Get public profile of a user
 * Handles both PERSONA and ENTIDAD_ORGANIZACIONAL
 * @param {string} targetEmail - Email of the profile to view
 * @param {string} requesterEmail - Email of the user requesting
 * @returns {Promise<Object|null>} - User profile or null if not found
 */
async function getUserProfile(targetEmail, requesterEmail) {
    const sql = `
        -- Try PERSONA first
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
            'Persona' as tipo,
            NULL as rif,
            NULL as tipo_entidad,
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
                SELECT COUNT(*)
                FROM PERTENECE_A_GRUPO pg
                WHERE pg.correo_persona = p.correo_principal
            ) as total_grupos
        FROM PERSONA p
        INNER JOIN MIEMBRO m ON p.correo_principal = m.correo_principal
        LEFT JOIN CONFIGURACION c ON p.correo_principal = c.correo_miembro
        WHERE p.correo_principal = $1

        UNION ALL

        -- Try ENTIDAD_ORGANIZACIONAL
        SELECT 
            eo.correo_principal,
            eo.nombre_oficial as nombres,
            '' as apellidos,
            eo.descripcion as biografia,
            eo.ciudad_ubicacion as ciudad_residencia,
            eo.pais_ubicacion as pais_residencia,
            NULL as fecha_nacimiento,
            m.fecha_registro,
            m.fotografia_url,
            c.visibilidad_perfil,
            'Organizacion' as tipo,
            eo.rif,
            eo.tipo_entidad,
            0 as total_conexiones,
            (
                SELECT COUNT(*) 
                FROM CONTENIDO con 
                WHERE con.correo_autor = eo.correo_principal
            ) as total_publicaciones,
            0 as total_grupos
        FROM ENTIDAD_ORGANIZACIONAL eo
        INNER JOIN MIEMBRO m ON eo.correo_principal = m.correo_principal
        LEFT JOIN CONFIGURACION c ON eo.correo_principal = c.correo_miembro
        WHERE eo.correo_principal = $1

        LIMIT 1
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

/**
 * Get posts by a specific user
 * @param {string} targetEmail - Email of the user whose posts to fetch
 * @param {string} requesterEmail - Current user's email
 * @returns {Promise<Array>} - Array of posts
 */
async function getUserPosts(targetEmail, requesterEmail) {
    const sql = `
        SELECT 
            c.clave_contenido,
            c.correo_autor,
            c.texto_contenido,
            c.fecha_hora_creacion,
            c.visibilidad,
            c.archivo_url,
            p.nombres,
            p.apellidos,
            m.fotografia_url,
            (SELECT COUNT(*) FROM REACCIONA_CONTENIDO r WHERE r.fk_contenido = c.clave_contenido) as total_reacciones,
            (SELECT COUNT(*) FROM COMENTARIO cm WHERE cm.fk_contenido = c.clave_contenido) as total_comentarios,
            EXISTS(SELECT 1 FROM REACCIONA_CONTENIDO r WHERE r.fk_contenido = c.clave_contenido AND r.correo_miembro = $2) as user_has_reacted
        FROM CONTENIDO c
        LEFT JOIN PERSONA p ON c.correo_autor = p.correo_principal
        LEFT JOIN MIEMBRO m ON c.correo_autor = m.correo_principal
        WHERE c.correo_autor = $1
        AND c.nombre_grupo IS NULL  -- Solo posts del feed global, no de grupos
        AND (
            c.visibilidad = 'Público'
            OR c.correo_autor = $2
            OR (c.visibilidad = 'Solo Conexiones' AND EXISTS(
                SELECT 1 FROM SOLICITA_CONEXION sc
                WHERE sc.estado_solicitud = 'Aceptada'
                AND ((sc.correo_solicitante = $1 AND sc.correo_solicitado = $2)
                  OR (sc.correo_solicitante = $2 AND sc.correo_solicitado = $1))
            ))
        )
        ORDER BY c.fecha_hora_creacion DESC
        LIMIT 20
    `;

    const result = await db.queryAsUser(sql, [targetEmail, requesterEmail], requesterEmail);
    return result.rows;
}

/**
 * Update user privacy settings
 * @param {string} userEmail - Current user
 * @param {Object} settings - Privacy settings to update
 */
async function updatePrivacy(userEmail, settings) {
    const { profileVisibility, showEmail, showPhone, allowMessages, showOnlineStatus } = settings;

    // Map frontend values to DB values
    const visibilityMap = {
        'public': 'Público',
        'friends': 'Solo Conexiones',
        'private': 'Privado'
    };
    const dbVisibility = visibilityMap[profileVisibility] || profileVisibility;

    // Check if config exists, insert or update
    const existing = await db.query(
        'SELECT 1 FROM CONFIGURACION WHERE correo_miembro = $1',
        [userEmail]
    );

    if (existing.rows.length === 0) {
        await db.query(
            `INSERT INTO CONFIGURACION (correo_miembro, visibilidad_perfil)
             VALUES ($1, $2)`,
            [userEmail, dbVisibility || 'Público']
        );
    } else {
        await db.query(
            `UPDATE CONFIGURACION 
             SET visibilidad_perfil = COALESCE($2, visibilidad_perfil)
             WHERE correo_miembro = $1`,
            [userEmail, dbVisibility]
        );
    }

    return { success: true, message: 'Configuración de privacidad actualizada' };
}

module.exports = {
    searchUsers,
    getUserProfile,
    getConnectionStatus,
    getConnectionSuggestions,
    getUserPosts,
    updatePrivacy
};
