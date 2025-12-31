/**
 * Offers Service - SoyUCAB
 * Business logic for job offers and applications
 */

const db = require('../config/db');

/**
 * Get all active job offers
 */
async function getActiveOffers() {
    const sql = `
        SELECT 
            ol.clave_oferta,
            ol.correo_organizacion,
            ol.fecha_publicacion,
            ol.fecha_vencimiento,
            ol.titulo_oferta,
            ol.descripcion_cargo,
            ol.requisitos,
            ol.modalidad,
            eo.nombre_oficial as nombre_organizacion,
            eo.tipo_entidad,
            m.fotografia_url as foto_organizacion,
            (SELECT COUNT(*) FROM SE_POSTULA sp WHERE sp.fk_oferta = ol.clave_oferta) as total_postulaciones
        FROM OFERTA_LABORAL ol
        INNER JOIN ENTIDAD_ORGANIZACIONAL eo ON ol.correo_organizacion = eo.correo_principal
        LEFT JOIN MIEMBRO m ON ol.correo_organizacion = m.correo_principal
        WHERE ol.fecha_vencimiento IS NULL OR ol.fecha_vencimiento > NOW()
        ORDER BY ol.fecha_publicacion DESC
        LIMIT 50
    `;
    const result = await db.query(sql);
    return result.rows;
}

/**
 * Get offer details with application status
 */
async function getOfferDetails(offerId, userEmail) {
    const sql = `
        SELECT 
            ol.*,
            eo.nombre_oficial as nombre_organizacion,
            eo.tipo_entidad,
            eo.descripcion as descripcion_organizacion,
            m.fotografia_url as foto_organizacion,
            (SELECT COUNT(*) FROM SE_POSTULA sp WHERE sp.fk_oferta = ol.clave_oferta) as total_postulaciones
        FROM OFERTA_LABORAL ol
        INNER JOIN ENTIDAD_ORGANIZACIONAL eo ON ol.correo_organizacion = eo.correo_principal
        LEFT JOIN MIEMBRO m ON ol.correo_organizacion = m.correo_principal
        WHERE ol.clave_oferta = $1
    `;
    const result = await db.query(sql, [offerId]);

    if (result.rows.length === 0) return null;

    const offer = result.rows[0];

    // Check if user has applied
    const applicationCheck = await db.query(
        'SELECT estado_postulacion FROM SE_POSTULA WHERE correo_persona = $1 AND fk_oferta = $2',
        [userEmail, offerId]
    );

    offer.ya_postulado = applicationCheck.rows.length > 0;
    offer.estado_postulacion = applicationCheck.rows[0]?.estado_postulacion || null;

    return offer;
}

/**
 * Check if user is an organization
 */
async function isOrganization(email) {
    const result = await db.query(
        'SELECT 1 FROM ENTIDAD_ORGANIZACIONAL WHERE correo_principal = $1',
        [email]
    );
    return result.rows.length > 0;
}

/**
 * Check if user is a person (not organization)
 */
async function isPerson(email) {
    const result = await db.query(
        'SELECT 1 FROM PERSONA WHERE correo_principal = $1',
        [email]
    );
    return result.rows.length > 0;
}

/**
 * Create a job offer using stored procedure
 */
async function createOffer(userEmail, titulo, descripcion, requisitos, modalidad) {
    await db.queryAsUser(
        `CALL sp_publicar_oferta_validada($1, NOW(), $2, $3, $4, $5)`,
        [userEmail, titulo, descripcion, requisitos || '', modalidad],
        userEmail
    );
}

/**
 * Check if offer exists and is not expired
 */
async function isOfferActive(offerId) {
    const result = await db.query(
        `SELECT 1 FROM OFERTA_LABORAL 
         WHERE clave_oferta = $1 
         AND (fecha_vencimiento IS NULL OR fecha_vencimiento > NOW())`,
        [offerId]
    );
    return result.rows.length > 0;
}

/**
 * Apply to a job offer
 */
async function applyToOffer(userEmail, offerId) {
    await db.queryAsUser(
        `INSERT INTO SE_POSTULA (correo_persona, fk_oferta, fecha_postulacion, estado_postulacion)
         VALUES ($1, $2, NOW(), 'Enviada')`,
        [userEmail, offerId],
        userEmail
    );
}

/**
 * Get user's applications
 */
async function getUserApplications(userEmail) {
    const sql = `
        SELECT 
            sp.clave_postulacion,
            sp.fecha_postulacion,
            sp.estado_postulacion,
            ol.clave_oferta,
            ol.titulo_oferta,
            ol.modalidad,
            eo.nombre_oficial as nombre_organizacion
        FROM SE_POSTULA sp
        INNER JOIN OFERTA_LABORAL ol ON sp.fk_oferta = ol.clave_oferta
        INNER JOIN ENTIDAD_ORGANIZACIONAL eo ON ol.correo_organizacion = eo.correo_principal
        WHERE sp.correo_persona = $1
        ORDER BY sp.fecha_postulacion DESC
    `;
    const result = await db.queryAsUser(sql, [userEmail], userEmail);
    return result.rows;
}

/**
 * Get offers published by an organization
 */
async function getPublishedOffers(userEmail) {
    const sql = `
        SELECT 
            ol.*,
            (SELECT COUNT(*) FROM SE_POSTULA sp WHERE sp.fk_oferta = ol.clave_oferta) as total_postulaciones,
            (SELECT COUNT(*) FROM SE_POSTULA sp WHERE sp.fk_oferta = ol.clave_oferta AND sp.estado_postulacion = 'Enviada') as postulaciones_pendientes
        FROM OFERTA_LABORAL ol
        WHERE ol.correo_organizacion = $1
        ORDER BY ol.fecha_publicacion DESC
    `;
    const result = await db.queryAsUser(sql, [userEmail], userEmail);
    return result.rows;
}

module.exports = {
    getActiveOffers,
    getOfferDetails,
    isOrganization,
    isPerson,
    createOffer,
    isOfferActive,
    applyToOffer,
    getUserApplications,
    getPublishedOffers
};
