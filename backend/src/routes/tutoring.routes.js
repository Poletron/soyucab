const express = require('express');
const router = express.Router();
const tutoringService = require('../services/tutoring.service');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * GET /api/tutoring/search
 * Search for tutors
 */
router.get('/search', requireAuth, async (req, res) => {
    try {
        const { query, subject } = req.query;
        const tutors = await tutoringService.searchTutors(req.userEmail, query, subject);
        res.json({ success: true, data: tutors });
    } catch (err) {
        console.error('[TUTORING] Error searching tutors:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/tutoring/my-connections
 * Get user's mentorship connections
 */
router.get('/my-connections', requireAuth, async (req, res) => {
    try {
        const connections = await tutoringService.getMyMentorships(req.userEmail);
        res.json({ success: true, data: connections });
    } catch (err) {
        console.error('[TUTORING] Error fetching connections:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/tutoring/register
 * Register as a tutor
 */
router.post('/register', requireAuth, async (req, res) => {
    const { subjects, description } = req.body; // subjects is comma separated or array? Frontend sends single subject from select usually, but let's handle single for now as per UI
    // UI `tutorFormData.subjects` is a string from a Select.

    if (!subjects || !description) {
        return res.status(400).json({ success: false, error: 'Faltan datos requeridos' });
    }

    try {
        const result = await tutoringService.registerAsTutor(req.userEmail, subjects, description);
        res.json({ success: true, message: 'Registrado como tutor exitosamente', data: result });
    } catch (err) {
        console.error('[TUTORING] Error registering tutor:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/tutoring/request
 * Request a mentorship
 */
router.post('/request', requireAuth, async (req, res) => {
    const { tutoriaId } = req.body;

    if (!tutoriaId) {
        return res.status(400).json({ success: false, error: 'ID de tutoría requerido' });
    }

    try {
        const result = await tutoringService.requestMentorship(req.userEmail, tutoriaId);
        res.json({ success: true, message: 'Solicitud enviada', data: result });
    } catch (err) {
        console.error('[TUTORING] Error requesting mentorship:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
