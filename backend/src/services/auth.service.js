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
    const miembroResult = await db.query(
        `SELECT m.correo_principal, m.fecha_registro, m.fotografia_url, p.nombres, p.apellidos
         FROM MIEMBRO m
         LEFT JOIN PERSONA p ON m.correo_principal = p.correo_principal
         WHERE m.correo_principal = $1`,
        [email]
    );

    if (miembroResult.rows.length === 0) {
        throw new Error('Usuario no encontrado');
    }

    const user = miembroResult.rows[0];

    // En demo, aceptar cualquier password (o comparar hash si existe columna)
    // Para producción: verificar password hasheado
    // Por ahora, aceptamos login si el usuario existe

    return {
        email: user.correo_principal,
        nombre: user.nombres || 'Usuario',
        apellido: user.apellidos || '',
        foto: user.fotografia_url || null,
        fechaRegistro: user.fecha_registro
    };
}

/**
 * Registro de nuevo usuario (Persona)
 * @param {Object} userData - Datos del nuevo usuario
 */
async function register(userData) {
    const { email, password, nombre, apellido, fechaNacimiento, ubicacion } = userData;

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

    // Insertar en MIEMBRO primero
    await db.query(
        `INSERT INTO MIEMBRO (correo_principal, contrasena_hash, fecha_registro)
         VALUES ($1, $2, NOW())`,
        [email, passwordHash]
    );

    // Insertar en PERSONA
    await db.query(
        `INSERT INTO PERSONA (correo_principal, nombres, apellidos, fecha_nacimiento, pais_residencia)
         VALUES ($1, $2, $3, $4, $5)`,
        [email, nombre, apellido, fechaNacimiento || null, ubicacion || null]
    );

    return {
        email,
        nombre,
        apellido,
        message: 'Usuario registrado exitosamente'
    };
}

/**
 * Obtener datos del usuario
 */
async function getUserProfile(email) {
    const result = await db.query(
        `SELECT 
            m.correo_principal as email,
            m.fecha_registro,
            m.fotografia_url as foto,
            p.nombres as nombre,
            p.apellidos as apellido,
            p.fecha_nacimiento,
            p.pais_residencia,
            p.ciudad_residencia,
            p.biografia
         FROM MIEMBRO m
         LEFT JOIN PERSONA p ON m.correo_principal = p.correo_principal
         WHERE m.correo_principal = $1`,
        [email]
    );

    if (result.rows.length === 0) {
        throw new Error('Usuario no encontrado');
    }

    return result.rows[0];
}

/**
 * Actualizar perfil del usuario
 */
async function updateProfile(email, profileData) {
    const { nombre, apellido, biografia, pais, ciudad } = profileData;

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

    return { success: true, message: 'Perfil actualizado' };
}

module.exports = {
    login,
    register,
    getUserProfile,
    updateProfile,
    hashPassword
};
