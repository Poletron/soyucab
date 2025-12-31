/**
 * Rutas de Ofertas Laborales - SoyUCAB
 * Gestión de ofertas y postulaciones
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * GET /api/offers
 * Lista todas las ofertas laborales activas
 */
router.get('/', async (req, res) => {
    try {
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

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error('[OFFERS] Error listando ofertas:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/offers/:id
 * Detalle de una oferta específica
 */
router.get('/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const userEmail = req.userEmail;

    try {
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

        const result = await db.query(sql, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Oferta no encontrada' });
        }

        // Verificar si el usuario ya se postuló
        const postulacionCheck = await db.query(
            'SELECT estado_postulacion FROM SE_POSTULA WHERE correo_persona = $1 AND fk_oferta = $2',
            [userEmail, id]
        );

        const offer = result.rows[0];
        offer.ya_postulado = postulacionCheck.rows.length > 0;
        offer.estado_postulacion = postulacionCheck.rows[0]?.estado_postulacion || null;

        res.json({
            success: true,
            data: offer
        });
    } catch (err) {
        console.error('[OFFERS] Error obteniendo oferta:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/offers
 * Crear una nueva oferta laboral (solo organizaciones)
 * Usa el procedimiento almacenado sp_publicar_oferta_validada
 */
router.post('/', requireAuth, async (req, res) => {
    const { titulo, descripcion, requisitos, modalidad, fecha_vencimiento } = req.body;
    const userEmail = req.userEmail;

    if (!titulo || !descripcion || !modalidad) {
        return res.status(400).json({
            success: false,
            error: 'titulo, descripcion y modalidad son requeridos'
        });
    }

    // Validar modalidad
    const modalidadesValidas = ['Presencial', 'Remoto', 'Híbrido'];
    if (!modalidadesValidas.includes(modalidad)) {
        return res.status(400).json({
            success: false,
            error: 'modalidad debe ser: Presencial, Remoto o Híbrido'
        });
    }

    try {
        // Verificar que el usuario es una entidad organizacional
        const entidadCheck = await db.query(
            'SELECT 1 FROM ENTIDAD_ORGANIZACIONAL WHERE correo_principal = $1',
            [userEmail]
        );

        if (entidadCheck.rows.length === 0) {
            return res.status(403).json({
                success: false,
                error: 'Solo entidades organizacionales pueden publicar ofertas'
            });
        }

        // Usar el stored procedure para validar nexos y crear oferta
        await db.queryAsUser(
            `CALL sp_publicar_oferta_validada($1, NOW(), $2, $3, $4, $5)`,
            [userEmail, titulo, descripcion, requisitos || '', modalidad],
            userEmail
        );

        res.status(201).json({
            success: true,
            message: 'Oferta publicada exitosamente'
        });
    } catch (err) {
        console.error('[OFFERS] Error creando oferta:', err.message);

        // Manejar error del procedimiento (sin nexos vigentes)
        if (err.message.includes('no está autorizada')) {
            return res.status(403).json({
                success: false,
                error: 'La organización no tiene nexos activos para publicar ofertas'
            });
        }

        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/offers/:id/apply
 * Postularse a una oferta
 */
router.post('/:id/apply', requireAuth, async (req, res) => {
    const { id } = req.params;
    const userEmail = req.userEmail;

    try {
        // Verificar que el usuario es una persona (no organización)
        const personaCheck = await db.query(
            'SELECT 1 FROM PERSONA WHERE correo_principal = $1',
            [userEmail]
        );

        if (personaCheck.rows.length === 0) {
            return res.status(403).json({
                success: false,
                error: 'Solo personas pueden postularse a ofertas'
            });
        }

        // Verificar que la oferta existe y no ha vencido
        const ofertaCheck = await db.query(
            `SELECT 1 FROM OFERTA_LABORAL 
             WHERE clave_oferta = $1 
             AND (fecha_vencimiento IS NULL OR fecha_vencimiento > NOW())`,
            [id]
        );

        if (ofertaCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Oferta no encontrada o ya vencida'
            });
        }

        // Insertar postulación
        await db.queryAsUser(
            `INSERT INTO SE_POSTULA (correo_persona, fk_oferta, fecha_postulacion, estado_postulacion)
             VALUES ($1, $2, NOW(), 'Enviada')`,
            [userEmail, id],
            userEmail
        );

        res.status(201).json({
            success: true,
            message: 'Postulación enviada exitosamente'
        });
    } catch (err) {
        // Manejar duplicado
        if (err.message.includes('uq_postulacion_unica') || err.message.includes('duplicate')) {
            return res.status(400).json({
                success: false,
                error: 'Ya te has postulado a esta oferta'
            });
        }

        console.error('[OFFERS] Error postulando:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/offers/my/applications
 * Mis postulaciones
 */
router.get('/my/applications', requireAuth, async (req, res) => {
    const userEmail = req.userEmail;

    try {
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

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error('[OFFERS] Error obteniendo postulaciones:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/offers/my/published
 * Ofertas publicadas por mi organización
 */
router.get('/my/published', requireAuth, async (req, res) => {
    const userEmail = req.userEmail;

    try {
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

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error('[OFFERS] Error obteniendo ofertas publicadas:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
