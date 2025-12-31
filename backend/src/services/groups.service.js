/**
 * Groups Service - SoyUCAB
 * Business logic for interest groups management
 */

const db = require('../config/db');

/**
 * Get all public groups with member count
 */
async function getPublicGroups() {
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
    return result.rows;
}

/**
 * Get groups for a specific user
 */
async function getUserGroups(userEmail) {
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
    `, [userEmail]);
    return result.rows;
}

/**
 * Create a new group using stored procedure
 */
async function createGroup(nombre, descripcion, visibilidad, userEmail) {
    await db.query(
        `CALL SP_CREAR_GRUPO_CON_FUNDADOR($1, $2, $3, $4)`,
        [nombre, descripcion || '', visibilidad, userEmail]
    );
}

/**
 * Get group visibility
 */
async function getGroupVisibility(nombre) {
    const result = await db.query(
        'SELECT visibilidad FROM GRUPO_INTERES WHERE nombre_grupo = $1',
        [nombre]
    );
    return result.rows.length > 0 ? result.rows[0].visibilidad : null;
}

/**
 * Join a group
 */
async function joinGroup(userEmail, nombreGrupo) {
    await db.query(
        `INSERT INTO PERTENECE_A_GRUPO (correo_persona, nombre_grupo, fecha_union, rol_en_grupo)
         VALUES ($1, $2, NOW(), 'Miembro')
         ON CONFLICT DO NOTHING`,
        [userEmail, nombreGrupo]
    );
}

/**
 * Leave a group
 */
async function leaveGroup(userEmail, nombreGrupo) {
    await db.query(
        'DELETE FROM PERTENECE_A_GRUPO WHERE correo_persona = $1 AND nombre_grupo = $2',
        [userEmail, nombreGrupo]
    );
}

module.exports = {
    getPublicGroups,
    getUserGroups,
    createGroup,
    getGroupVisibility,
    joinGroup,
    leaveGroup
};
