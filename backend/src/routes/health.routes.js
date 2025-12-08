/**
 * Rutas de Health Check - SoyUCAB
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * GET /api/health
 * Verifica el estado de la API y la conexión a BD
 */
router.get('/', async (req, res) => {
    try {
        const dbStatus = await db.testConnection();

        res.json({
            status: 'ok',
            service: 'SoyUCAB API',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            database: dbStatus ? 'connected' : 'disconnected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;
