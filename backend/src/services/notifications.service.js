const db = require('../config/db');

/**
 * Get notifications for a user
 * @param {string} userEmail - User's email
 * @returns {Promise<Array>} - List of notifications
 */
async function getNotifications(userEmail) {
    const sql = `
        SELECT * FROM NOTIFICACION 
        WHERE correo_usuario = $1 
        ORDER BY fecha_creacion DESC 
        LIMIT 50
    `;
    const result = await db.query(sql, [userEmail]);
    return result.rows;
}

/**
 * Get unread count
 * @param {string} userEmail 
 * @returns {Promise<number>}
 */
async function getUnreadCount(userEmail) {
    const sql = `SELECT COUNT(*) FROM NOTIFICACION WHERE correo_usuario = $1 AND leida = FALSE`;
    const result = await db.query(sql, [userEmail]);
    return parseInt(result.rows[0].count);
}

/**
 * Mark a notification as read
 * @param {number} id - Notification ID
 * @param {string} userEmail - Owner email (security check)
 */
async function markAsRead(id, userEmail) {
    await db.query(
        `UPDATE NOTIFICACION SET leida = TRUE WHERE clave_notificacion = $1 AND correo_usuario = $2`,
        [id, userEmail]
    );
}

/**
 * Mark all as read
 * @param {string} userEmail 
 */
async function markAllAsRead(userEmail) {
    await db.query(
        `UPDATE NOTIFICACION SET leida = TRUE WHERE correo_usuario = $1 AND leida = FALSE`,
        [userEmail]
    );
}

/**
 * Create a notification (Internal use)
 * @param {string} userEmail 
 * @param {string} type 
 * @param {string} message 
 * @param {string} url 
 */
async function createNotification(userEmail, type, message, url = null) {
    await db.query(
        `INSERT INTO NOTIFICACION (correo_usuario, tipo_notificacion, mensaje, url_accion)
         VALUES ($1, $2, $3, $4)`,
        [userEmail, type, message, url]
    );
}

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    createNotification
};
