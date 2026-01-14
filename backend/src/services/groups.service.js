/**
 * Groups Service - SoyUCAB
 * Business logic for interest groups management
 */

const db = require('../config/db');
const notificationsService = require('./notifications.service');

/**
 * Get all visible groups (Público and Privado) with member count
 * Note: Privado groups are visible but require approval to join
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
        WHERE g.visibilidad IN ('Público', 'Privado')
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
            g.correo_creador,
            p.rol_en_grupo,
            p.fecha_union,
            (
                SELECT COUNT(*) 
                FROM PERTENECE_A_GRUPO pg 
                WHERE pg.nombre_grupo = g.nombre_grupo
            ) as total_miembros
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
    const result = await db.query(
        `INSERT INTO PERTENECE_A_GRUPO (correo_persona, nombre_grupo, fecha_union, rol_en_grupo)
         VALUES ($1, $2, NOW(), 'Miembro')
         ON CONFLICT DO NOTHING
         RETURNING *`,
        [userEmail, nombreGrupo]
    );

    // Notify group creator if join was successful
    if (result.rowCount > 0) {
        try {
            const creatorResult = await db.query(
                'SELECT correo_creador FROM GRUPO_INTERES WHERE nombre_grupo = $1',
                [nombreGrupo]
            );
            if (creatorResult.rows.length > 0 && creatorResult.rows[0].correo_creador !== userEmail) {
                await notificationsService.createNotification(
                    creatorResult.rows[0].correo_creador,
                    'Grupo',
                    `Alguien se unió a tu grupo "${nombreGrupo}"`,
                    `/groups/${encodeURIComponent(nombreGrupo)}`
                );
            }
        } catch (err) {
            console.error('Error sending group join notification:', err);
        }
    }
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

/**
 * Update group details (creator only)
 */
async function updateGroup(nombreGrupo, updates, userEmail) {
    // Verify creator
    const creatorCheck = await db.query(
        'SELECT correo_creador FROM GRUPO_INTERES WHERE nombre_grupo = $1',
        [nombreGrupo]
    );

    if (creatorCheck.rows.length === 0) {
        throw new Error('Grupo no encontrado');
    }
    if (creatorCheck.rows[0].correo_creador !== userEmail) {
        throw new Error('Solo el creador puede editar el grupo');
    }

    const { descripcion, visibilidad } = updates;
    await db.query(
        `UPDATE GRUPO_INTERES 
         SET descripcion_grupo = COALESCE($2, descripcion_grupo),
             visibilidad = COALESCE($3, visibilidad)
         WHERE nombre_grupo = $1`,
        [nombreGrupo, descripcion, visibilidad]
    );
}

/**
 * Delete a group (creator only)
 */
async function deleteGroup(nombreGrupo, userEmail) {
    // Verify creator
    const creatorCheck = await db.query(
        'SELECT correo_creador FROM GRUPO_INTERES WHERE nombre_grupo = $1',
        [nombreGrupo]
    );

    if (creatorCheck.rows.length === 0) {
        throw new Error('Grupo no encontrado');
    }
    if (creatorCheck.rows[0].correo_creador !== userEmail) {
        throw new Error('Solo el creador puede eliminar el grupo');
    }

    // Delete join requests first
    await db.query('DELETE FROM SOLICITA_INGRESO_GRUPO WHERE nombre_grupo = $1', [nombreGrupo]);
    // Delete members first (cascading manually)
    await db.query('DELETE FROM PERTENECE_A_GRUPO WHERE nombre_grupo = $1', [nombreGrupo]);
    // Delete group posts (content with nombre_grupo)
    await db.query('DELETE FROM CONTENIDO WHERE nombre_grupo = $1', [nombreGrupo]);
    // Delete group itself
    await db.query('DELETE FROM GRUPO_INTERES WHERE nombre_grupo = $1', [nombreGrupo]);
}

// =============================================================================
// SOLICITUDES DE INGRESO A GRUPOS PRIVADOS
// =============================================================================

/**
 * Request to join a private group
 */
async function requestJoinGroup(userEmail, nombreGrupo) {
    // Check if group exists and is private
    const groupCheck = await db.query(
        'SELECT visibilidad, correo_creador FROM GRUPO_INTERES WHERE nombre_grupo = $1',
        [nombreGrupo]
    );

    if (groupCheck.rows.length === 0) {
        throw new Error('Grupo no encontrado');
    }

    // Check if already a member
    const memberCheck = await db.query(
        'SELECT 1 FROM PERTENECE_A_GRUPO WHERE correo_persona = $1 AND nombre_grupo = $2',
        [userEmail, nombreGrupo]
    );
    if (memberCheck.rows.length > 0) {
        throw new Error('Ya eres miembro de este grupo');
    }

    // Insert request (upsert to handle re-request after rejection)
    const result = await db.query(`
        INSERT INTO SOLICITA_INGRESO_GRUPO (correo_solicitante, nombre_grupo, fecha_solicitud, estado_solicitud)
        VALUES ($1, $2, NOW(), 'Pendiente')
        ON CONFLICT (correo_solicitante, nombre_grupo) 
        DO UPDATE SET estado_solicitud = 'Pendiente', fecha_solicitud = NOW(), fecha_respuesta = NULL
        RETURNING *
    `, [userEmail, nombreGrupo]);

    // Notify group creator
    const creatorEmail = groupCheck.rows[0].correo_creador;
    await notificationsService.createNotification(
        creatorEmail,
        'Grupo',
        `${userEmail} ha solicitado unirse al grupo "${nombreGrupo}"`,
        `/groups/${encodeURIComponent(nombreGrupo)}`
    );

    return result.rows[0];
}

/**
 * Get pending join requests for a group (creator/admin only)
 */
async function getPendingJoinRequests(nombreGrupo, userEmail) {
    // Verify requester is group creator or admin
    const groupCheck = await db.query(
        'SELECT correo_creador FROM GRUPO_INTERES WHERE nombre_grupo = $1',
        [nombreGrupo]
    );

    if (groupCheck.rows.length === 0) {
        throw new Error('Grupo no encontrado');
    }

    // Check if user is creator or admin of the group
    const isCreator = groupCheck.rows[0].correo_creador === userEmail;
    const adminCheck = await db.query(
        `SELECT 1 FROM PERTENECE_A_GRUPO 
         WHERE correo_persona = $1 AND nombre_grupo = $2 AND rol_en_grupo = 'Administrador'`,
        [userEmail, nombreGrupo]
    );

    if (!isCreator && adminCheck.rows.length === 0) {
        throw new Error('No tienes permisos para ver las solicitudes');
    }

    const result = await db.query(`
        SELECT s.clave_solicitud, s.correo_solicitante, s.fecha_solicitud,
               p.nombres, p.apellidos, m.fotografia_url
        FROM SOLICITA_INGRESO_GRUPO s
        JOIN PERSONA p ON s.correo_solicitante = p.correo_principal
        JOIN MIEMBRO m ON p.correo_principal = m.correo_principal
        WHERE s.nombre_grupo = $1 AND s.estado_solicitud = 'Pendiente'
        ORDER BY s.fecha_solicitud DESC
    `, [nombreGrupo]);

    return result.rows;
}

/**
 * Accept a join request (creator/admin only)
 */
async function acceptJoinRequest(requestId, userEmail) {
    // Get request info
    const requestCheck = await db.query(
        'SELECT correo_solicitante, nombre_grupo FROM SOLICITA_INGRESO_GRUPO WHERE clave_solicitud = $1',
        [requestId]
    );

    if (requestCheck.rows.length === 0) {
        throw new Error('Solicitud no encontrada');
    }

    const { correo_solicitante, nombre_grupo } = requestCheck.rows[0];

    // Verify requester has permission
    const groupCheck = await db.query(
        'SELECT correo_creador FROM GRUPO_INTERES WHERE nombre_grupo = $1',
        [nombre_grupo]
    );
    const isCreator = groupCheck.rows[0]?.correo_creador === userEmail;
    const adminCheck = await db.query(
        `SELECT 1 FROM PERTENECE_A_GRUPO 
         WHERE correo_persona = $1 AND nombre_grupo = $2 AND rol_en_grupo = 'Administrador'`,
        [userEmail, nombre_grupo]
    );

    if (!isCreator && adminCheck.rows.length === 0) {
        throw new Error('No tienes permisos para aceptar solicitudes');
    }

    // Update request status
    await db.query(
        `UPDATE SOLICITA_INGRESO_GRUPO 
         SET estado_solicitud = 'Aceptada', fecha_respuesta = NOW() 
         WHERE clave_solicitud = $1`,
        [requestId]
    );

    // Add user to group
    await db.query(`
        INSERT INTO PERTENECE_A_GRUPO (correo_persona, nombre_grupo, fecha_union, rol_en_grupo)
        VALUES ($1, $2, NOW(), 'Miembro')
        ON CONFLICT DO NOTHING
    `, [correo_solicitante, nombre_grupo]);

    // Notify the requester
    await notificationsService.createNotification(
        correo_solicitante,
        'Grupo',
        `Tu solicitud para unirte al grupo "${nombre_grupo}" ha sido aceptada`,
        `/groups/${encodeURIComponent(nombre_grupo)}`
    );

    return { success: true };
}

/**
 * Reject a join request (creator/admin only)
 */
async function rejectJoinRequest(requestId, userEmail) {
    // Get request info
    const requestCheck = await db.query(
        'SELECT correo_solicitante, nombre_grupo FROM SOLICITA_INGRESO_GRUPO WHERE clave_solicitud = $1',
        [requestId]
    );

    if (requestCheck.rows.length === 0) {
        throw new Error('Solicitud no encontrada');
    }

    const { correo_solicitante, nombre_grupo } = requestCheck.rows[0];

    // Verify requester has permission
    const groupCheck = await db.query(
        'SELECT correo_creador FROM GRUPO_INTERES WHERE nombre_grupo = $1',
        [nombre_grupo]
    );
    const isCreator = groupCheck.rows[0]?.correo_creador === userEmail;
    const adminCheck = await db.query(
        `SELECT 1 FROM PERTENECE_A_GRUPO 
         WHERE correo_persona = $1 AND nombre_grupo = $2 AND rol_en_grupo = 'Administrador'`,
        [userEmail, nombre_grupo]
    );

    if (!isCreator && adminCheck.rows.length === 0) {
        throw new Error('No tienes permisos para rechazar solicitudes');
    }

    // Update request status
    await db.query(
        `UPDATE SOLICITA_INGRESO_GRUPO 
         SET estado_solicitud = 'Rechazada', fecha_respuesta = NOW() 
         WHERE clave_solicitud = $1`,
        [requestId]
    );

    // Notify the requester
    await notificationsService.createNotification(
        correo_solicitante,
        'Grupo',
        `Tu solicitud para unirte al grupo "${nombre_grupo}" ha sido rechazada`,
        null
    );

    return { success: true };
}

/**
 * Get user's pending join request status for a group
 */
async function getMyJoinRequestStatus(userEmail, nombreGrupo) {
    const result = await db.query(
        `SELECT clave_solicitud, estado_solicitud, fecha_solicitud 
         FROM SOLICITA_INGRESO_GRUPO 
         WHERE correo_solicitante = $1 AND nombre_grupo = $2`,
        [userEmail, nombreGrupo]
    );
    return result.rows[0] || null;
}

/**
 * Get all sent requests by a user
 */
async function getUserSentRequests(userEmail) {
    const result = await db.query(
        `SELECT nombre_grupo, estado_solicitud
         FROM SOLICITA_INGRESO_GRUPO
         WHERE correo_solicitante = $1`,
        [userEmail]
    );
    return result.rows;
}

module.exports = {
    getPublicGroups,
    getUserGroups,
    createGroup,
    getGroupVisibility,
    joinGroup,
    leaveGroup,
    updateGroup,
    deleteGroup,
    requestJoinGroup,
    getPendingJoinRequests,
    acceptJoinRequest,
    rejectJoinRequest,
    getMyJoinRequestStatus,
    getUserSentRequests
};
