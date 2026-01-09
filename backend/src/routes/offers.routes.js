/**
 * Rutas de Ofertas Laborales - SoyUCAB
 * REFACTORED: Business logic moved to offers.service.js
 */

const express = require('express');
const router = express.Router();
const offersService = require('../services/offers.service');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * GET /api/offers
 * Lista todas las ofertas laborales activas
 */
router.get('/', async (req, res) => {
    try {
        const offers = await offersService.getActiveOffers();
        res.json({ success: true, count: offers.length, data: offers });
    } catch (err) {
        console.error('[OFFERS] Error listando ofertas:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/offers/my/applications
 * Mis postulaciones
 */
router.get('/my/applications', requireAuth, async (req, res) => {
    try {
        const applications = await offersService.getUserApplications(req.userEmail);
        res.json({ success: true, count: applications.length, data: applications });
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
    try {
        const offers = await offersService.getPublishedOffers(req.userEmail);
        res.json({ success: true, count: offers.length, data: offers });
    } catch (err) {
        console.error('[OFFERS] Error obteniendo ofertas publicadas:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/offers/:id
 * Detalle de una oferta específica
 */
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const offer = await offersService.getOfferDetails(req.params.id, req.userEmail);
        if (!offer) {
            return res.status(404).json({ success: false, error: 'Oferta no encontrada' });
        }
        res.json({ success: true, data: offer });
    } catch (err) {
        console.error('[OFFERS] Error obteniendo oferta:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/offers
 * Crear una nueva oferta laboral (solo organizaciones)
 */
router.post('/', requireAuth, async (req, res) => {
    const { titulo, descripcion, requisitos, modalidad } = req.body;

    if (!titulo || !descripcion || !modalidad) {
        return res.status(400).json({ success: false, error: 'titulo, descripcion y modalidad son requeridos' });
    }

    const modalidadesValidas = ['Presencial', 'Remoto', 'Híbrido'];
    if (!modalidadesValidas.includes(modalidad)) {
        return res.status(400).json({ success: false, error: 'modalidad debe ser: Presencial, Remoto o Híbrido' });
    }

    try {
        const isOrg = await offersService.isOrganization(req.userEmail);
        if (!isOrg) {
            return res.status(403).json({ success: false, error: 'Solo entidades organizacionales pueden publicar ofertas' });
        }

        await offersService.createOffer(req.userEmail, titulo, descripcion, requisitos, modalidad);
        res.status(201).json({ success: true, message: 'Oferta publicada exitosamente' });
    } catch (err) {
        console.error('[OFFERS] Error creando oferta:', err.message);
        if (err.message.includes('autorizada') || err.message.includes('no tienen nexos')) {
            return res.status(403).json({ success: false, error: 'La organización no tiene nexos activos para publicar ofertas' });
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/offers/:id/apply
 * Postularse a una oferta
 */
router.post('/:id/apply', requireAuth, async (req, res) => {
    try {
        const isPers = await offersService.isPerson(req.userEmail);
        if (!isPers) {
            return res.status(403).json({ success: false, error: 'Solo personas pueden postularse a ofertas' });
        }

        const isActive = await offersService.isOfferActive(req.params.id);
        if (!isActive) {
            return res.status(404).json({ success: false, error: 'Oferta no encontrada o ya vencida' });
        }

        await offersService.applyToOffer(req.userEmail, req.params.id);
        res.status(201).json({ success: true, message: 'Postulación enviada exitosamente' });
    } catch (err) {
        if (err.message.includes('uq_postulacion_unica') || err.message.includes('duplicate')) {
            return res.status(400).json({ success: false, error: 'Ya te has postulado a esta oferta' });
        }
        console.error('[OFFERS] Error postulando:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
