/**
 * Connections Service - SoyUCAB
 * Business logic for social connections management
 */

const db = require('../config/db');
const notificationsService = require('./notifications.service');

/**
 * Get accepted connections for a user
 */
async function getAcceptedConnections(userEmail) {
    const result = await db.query(`
        SELECT 
            CASE 
                WHEN sc.correo_solicitante = $1 THEN sc.correo_solicitado
                ELSE sc.correo_solicitante
            END as correo_conexion,
            p.nombres,
            p.apellidos,
            m.fotografia_url,
            sc.fecha_solicitud as fecha_conexion
        FROM SOLICITA_CONEXION sc
        JOIN PERSONA p ON (
            CASE 
                WHEN sc.correo_solicitante = $1 THEN sc.correo_solicitado
                ELSE sc.correo_solicitante
            END = p.correo_principal
        )
        JOIN MIEMBRO m ON p.correo_principal = m.correo_principal
        WHERE (sc.correo_solicitante = $1 OR sc.correo_solicitado = $1)
        AND sc.estado_solicitud = 'Aceptada'
    `, [userEmail]);

    return result.rows;
}

/**
 * Get pending connection requests received by the user
 */
async function getPendingRequests(userEmail) {
    const result = await db.query(`
        SELECT 
            sc.clave_solicitud,
            sc.correo_solicitante,
            p.nombres,
            p.apellidos,
            m.fotografia_url,
            sc.fecha_solicitud
        FROM SOLICITA_CONEXION sc
        JOIN PERSONA p ON sc.correo_solicitante = p.correo_principal
        JOIN MIEMBRO m ON p.correo_principal = m.correo_principal
        WHERE sc.correo_solicitado = $1
        AND sc.estado_solicitud = 'Pendiente'
        ORDER BY sc.fecha_solicitud DESC
    `, [userEmail]);

    return result.rows;
}

/**
 * Check if a connection request already exists between two users
 */
async function getExistingRequest(userEmail, targetEmail) {
    const result = await db.query(`
        SELECT estado_solicitud FROM SOLICITA_CONEXION 
        WHERE (correo_solicitante = $1 AND correo_solicitado = $2)
           OR (correo_solicitante = $2 AND correo_solicitado = $1)
    `, [userEmail, targetEmail]);

    return result.rows.length > 0 ? result.rows[0].estado_solicitud : null;
}

/**
 * Send a connection request
 */
async function sendConnectionRequest(fromEmail, toEmail) {
    await db.query(`
        INSERT INTO SOLICITA_CONEXION (correo_solicitante, correo_solicitado, fecha_solicitud, estado_solicitud)
        VALUES ($1, $2, NOW(), 'Pendiente')
    `, [fromEmail, toEmail]);

    // Create notification for target user
    await notificationsService.createNotification(
        toEmail,
        'Conexión',
        'Has recibido una solicitud de conexión',
        `/profile/${encodeURIComponent(fromEmail)}`
    );
}

/**
 * Accept a connection request
 */
async function acceptRequest(requestId, userEmail) {
    const result = await db.query(`
        UPDATE SOLICITA_CONEXION 
        SET estado_solicitud = 'Aceptada'
        WHERE clave_solicitud = $1 AND correo_solicitado = $2 AND estado_solicitud = 'Pendiente'
        RETURNING *
    `, [requestId, userEmail]);

    if (result.rowCount > 0) {
        const request = result.rows[0];
        // Notify the requester that their request was accepted
        await notificationsService.createNotification(
            request.correo_solicitante,
            'Conexión',
            'Tu solicitud de conexión ha sido aceptada',
            `/profile/${encodeURIComponent(userEmail)}`
        );
    }

    return result.rowCount > 0;
}

/**
 * Reject a connection request
 */
async function rejectRequest(requestId, userEmail) {
    await db.query(`
        UPDATE SOLICITA_CONEXION 
        SET estado_solicitud = 'Rechazada'
        WHERE clave_solicitud = $1 AND correo_solicitado = $2
    `, [requestId, userEmail]);
}

/**
 * Get connection status between two users
 */
async function getConnectionStatus(userEmail, otherEmail) {
    const result = await db.query(`
        SELECT estado_solicitud, correo_solicitante, clave_solicitud
        FROM SOLICITA_CONEXION 
        WHERE (correo_solicitante = $1 AND correo_solicitado = $2)
           OR (correo_solicitante = $2 AND correo_solicitado = $1)
    `, [userEmail, otherEmail]);

    if (result.rows.length === 0) {
        return { status: 'none', pendingType: null, solicitudId: null };
    }

    const row = result.rows[0];
    const isPending = row.estado_solicitud === 'Pendiente';
    const isSender = row.correo_solicitante === userEmail;

    return {
        status: row.estado_solicitud.toLowerCase(),
        pendingType: isPending ? (isSender ? 'sent' : 'received') : null,
        solicitudId: row.clave_solicitud
    };
}

module.exports = {
    getAcceptedConnections,
    getPendingRequests,
    getExistingRequest,
    sendConnectionRequest,
    acceptRequest,
    rejectRequest,
    getConnectionStatus
};
