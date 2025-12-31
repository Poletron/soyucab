/**
 * Upload Service - SoyUCAB
 * Business logic for file uploads
 */

const db = require('../config/db');

/**
 * Update user's profile photo URL in database
 */
async function updateProfilePhoto(userEmail, photoUrl) {
    await db.query(
        'UPDATE MIEMBRO SET fotografia_url = $1 WHERE correo_principal = $2',
        [photoUrl, userEmail]
    );
}

module.exports = {
    updateProfilePhoto
};
