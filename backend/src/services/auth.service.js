/**
 * Servicio de Autenticación - SoyUCAB
 * Valida usuarios contra la tabla PERSONA/MIEMBRO
 */

const db = require('../config/db');
const crypto = require('crypto');

/**
 * Hash simple de contraseña (en producción usar bcrypt)
 */
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Login de usuario
 * @param {string} email - Correo principal
 * @param {string} password - Contraseña
 * @returns {Object} - Datos del usuario si es válido
 */
async function login(email, password) {
    // Buscar en MIEMBRO (usando correo_principal según el DDL)
    // También buscamos en PERSONA y ENTIDAD_ORGANIZACIONAL para obtener nombres
    const miembroResult = await db.query(
        `SELECT m.correo_principal, m.fecha_registro, m.fotografia_url, 
                p.nombres, p.apellidos,
                eo.nombre_oficial
         FROM MIEMBRO m
         LEFT JOIN PERSONA p ON m.correo_principal = p.correo_principal
         LEFT JOIN ENTIDAD_ORGANIZACIONAL eo ON m.correo_principal = eo.correo_principal
         WHERE m.correo_principal = $1`,
        [email]
    );

    if (miembroResult.rows.length === 0) {
        throw new Error('Usuario no encontrado');
    }

    const user = miembroResult.rows[0];

    // Verificar Roles
    const rolesResult = await db.query(
        `SELECT nombre_rol FROM MIEMBRO_POSEE_ROL WHERE correo_miembro = $1`,
        [email]
    );
    const roles = rolesResult.rows.map(r => r.nombre_rol);

    // En demo, aceptar cualquier password (o comparar hash si existe columna)
    // Para producción: verificar password hasheado

    return {
        email: user.correo_principal,
        nombre: user.nombres || user.nombre_oficial || 'Usuario',
        apellido: user.apellidos || '',
        foto: user.fotografia_url || null,
        fechaRegistro: user.fecha_registro,
        roles: roles
    };
}

/**
 * Registro de nuevo usuario (Persona u Organización)
 * @param {Object} userData - Datos del nuevo usuario
 */
async function register(userData) {
    const {
        email, password, type,
        // Persona params
        nombre, apellido, fechaNacimiento, pais, ciudad,
        // Organizacion params
        organizationName, rif, entityType, description
    } = userData;

    // Verificar que no existe
    const existing = await db.query(
        'SELECT correo_principal FROM MIEMBRO WHERE correo_principal = $1',
        [email]
    );

    if (existing.rows.length > 0) {
        throw new Error('El correo ya está registrado');
    }

    // Hash del password
    const passwordHash = password ? hashPassword(password) : hashPassword('default123');

    // 1. Insertar en MIEMBRO
    await db.query(
        `INSERT INTO MIEMBRO (correo_principal, contrasena_hash, fecha_registro)
         VALUES ($1, $2, NOW())`,
        [email, passwordHash]
    );

    if (type === 'organizacion') {
        // 2a. Insertar en ENTIDAD_ORGANIZACIONAL
        await db.query(
            `INSERT INTO ENTIDAD_ORGANIZACIONAL (correo_principal, rif, nombre_oficial, tipo_entidad, descripcion, pais_ubicacion, ciudad_ubicacion)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [email, rif, organizationName, entityType, description || '', pais || null, ciudad || null]
        );

        // 3a. Asignar Rol 'Entidad'
        await db.query(
            `INSERT INTO MIEMBRO_POSEE_ROL (correo_miembro, nombre_rol, fecha_asignacion)
             VALUES ($1, 'Entidad', NOW())`,
            [email]
        );

    } else {
        // Por defecto 'persona'
        // 2b. Insertar en PERSONA
        await db.query(
            `INSERT INTO PERSONA (correo_principal, nombres, apellidos, fecha_nacimiento, pais_residencia, ciudad_residencia)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [email, nombre, apellido, fechaNacimiento || null, pais || null, ciudad || null]
        );

        // 3b. Asignar Rol 'Persona'
        await db.query(
            `INSERT INTO MIEMBRO_POSEE_ROL (correo_miembro, nombre_rol, fecha_asignacion)
             VALUES ($1, 'Persona', NOW())`,
            [email]
        );
    }

    return {
        email,
        nombre: type === 'organizacion' ? organizationName : nombre,
        message: 'Usuario registrado exitosamente como ' + (type === 'organizacion' ? 'Organización' : 'Persona')
    };
}

/**
 * Obtener datos del usuario
 */
async function getUserProfile(email) {
    // Intentar buscar como Persona
    const personaRes = await db.query(
        `SELECT 
            m.correo_principal as email,
            m.fecha_registro,
            m.fotografia_url as foto,
            p.nombres as nombre,
            p.apellidos as apellido,
            p.fecha_nacimiento,
            p.pais_residencia,
            p.ciudad_residencia,
            p.biografia,
            'Persona' as tipo,
            (SELECT COUNT(*) FROM SOLICITA_CONEXION sc 
             WHERE (sc.correo_solicitante = m.correo_principal OR sc.correo_solicitado = m.correo_principal) 
             AND sc.estado_solicitud = 'Aceptada') as total_conexiones,
            (SELECT COUNT(*) FROM CONTENIDO c WHERE c.correo_autor = m.correo_principal) as total_publicaciones
         FROM MIEMBRO m
         JOIN PERSONA p ON m.correo_principal = p.correo_principal
         WHERE m.correo_principal = $1`,
        [email]
    );

    if (personaRes.rows.length > 0) {
        return personaRes.rows[0];
    }

    // Intentar buscar como Organización
    const orgRes = await db.query(
        `SELECT 
            m.correo_principal as email,
            m.fecha_registro,
            m.fotografia_url as foto,
            eo.nombre_oficial as nombre,
            '' as apellido,
            eo.rif,
            eo.tipo_entidad,
            eo.descripcion as biografia,
            eo.pais_ubicacion as pais_residencia,
            eo.ciudad_ubicacion as ciudad_residencia,
            'Organizacion' as tipo,
            (SELECT COUNT(*) FROM SOLICITA_CONEXION sc 
             WHERE (sc.correo_solicitante = m.correo_principal OR sc.correo_solicitado = m.correo_principal) 
             AND sc.estado_solicitud = 'Aceptada') as total_conexiones,
            (SELECT COUNT(*) FROM CONTENIDO c WHERE c.correo_autor = m.correo_principal) as total_publicaciones
         FROM MIEMBRO m
         JOIN ENTIDAD_ORGANIZACIONAL eo ON m.correo_principal = eo.correo_principal
         WHERE m.correo_principal = $1`,
        [email]
    );

    if (orgRes.rows.length > 0) {
        return orgRes.rows[0];
    }

    throw new Error('Usuario no encontrado o perfil incompleto');
}

/**
 * Actualizar perfil del usuario
 */
async function updateProfile(email, profileData) {
    const { nombre, apellido, biografia, pais, ciudad } = profileData;

    // Verificar tipo
    const isOrg = await db.query('SELECT 1 FROM ENTIDAD_ORGANIZACIONAL WHERE correo_principal = $1', [email]);

    if (isOrg.rows.length > 0) {
        await db.query(
            `UPDATE ENTIDAD_ORGANIZACIONAL 
             SET nombre_oficial = COALESCE($2, nombre_oficial),
                 descripcion = COALESCE($3, descripcion),
                 pais_ubicacion = COALESCE($4, pais_ubicacion),
                 ciudad_ubicacion = COALESCE($5, ciudad_ubicacion)
             WHERE correo_principal = $1`,
            [email, nombre, biografia, pais, ciudad]
        );
    } else {
        await db.query(
            `UPDATE PERSONA 
             SET nombres = COALESCE($2, nombres),
                 apellidos = COALESCE($3, apellidos),
                 biografia = COALESCE($4, biografia),
                 pais_residencia = COALESCE($5, pais_residencia),
                 ciudad_residencia = COALESCE($6, ciudad_residencia)
             WHERE correo_principal = $1`,
            [email, nombre, apellido, biografia, pais, ciudad]
        );
    }

    return { success: true, message: 'Perfil actualizado' };
}

/**
 * Get user statistics (connections, groups, posts)
 */
async function getUserStats(userEmail) {
    const result = await db.query(`
        SELECT 
            (SELECT COUNT(*) 
             FROM SOLICITA_CONEXION 
             WHERE (correo_solicitante = $1 OR correo_solicitado = $1) 
             AND estado_solicitud = 'Aceptada') as total_conexiones,
            (SELECT COUNT(*) 
             FROM PERTENECE_A_GRUPO 
             WHERE correo_persona = $1) as total_grupos,
            (SELECT COUNT(*) 
             FROM CONTENIDO 
             WHERE correo_autor = $1) as total_publicaciones
    `, [userEmail]);

    return result.rows[0];
}

module.exports = {
    login,
    register,
    getUserProfile,
    getUserStats,
    updateProfile,
    hashPassword
};
