/**
 * Rutas de Reportes - SoyUCAB
 * Generación de reportes en PDF via JsReport
 */

const express = require('express');
const router = express.Router();
const reportService = require('../services/report.service');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * POST /api/report/generate
 * Genera un reporte en PDF
 * 
 * Body: {
 *   reportType: 'viralidad' | 'lideres' | 'eventos',
 *   params: { ... } // Parámetros opcionales
 * }
 */
router.post('/generate', requireAuth, async (req, res) => {
    try {
        const { reportType } = req.body;

        // Validación
        const validTypes = ['viralidad', 'lideres', 'eventos'];
        if (!reportType || !validTypes.includes(reportType)) {
            return res.status(400).json({
                success: false,
                error: `Tipo de reporte inválido. Opciones: ${validTypes.join(', ')}`
            });
        }

        console.log(`[REPORT] Generando reporte: ${reportType} para usuario: ${req.userEmail}`);

        // Generar reporte
        const result = await reportService.generateReport(reportType, req.userEmail);

        // Enviar PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_${reportType}_${Date.now()}.pdf`);
        res.send(result.pdf);

    } catch (error) {
        console.error('[REPORT] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/report/preview/:type
 * Obtiene los datos del reporte en JSON (para preview)
 */
router.get('/preview/:type', requireAuth, async (req, res) => {
    try {
        const { type } = req.params;
        let data;

        switch (type) {
            case 'viralidad':
                data = await reportService.getViralReportData(req.userEmail);
                break;
            case 'lideres':
                data = await reportService.getLideresReportData(req.userEmail);
                break;
            case 'eventos':
                data = await reportService.getEventosReportData(req.userEmail);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Tipo de reporte no válido'
                });
        }

        res.json({
            success: true,
            reportType: type,
            count: data.length,
            data
        });

    } catch (error) {
        console.error('[REPORT PREVIEW] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/report/types
 * Lista los tipos de reportes disponibles
 */
router.get('/types', (req, res) => {
    res.json({
        success: true,
        types: [
            {
                id: 'viralidad',
                name: 'Top Contenido Viral',
                description: 'Ranking de contenido con mayor impacto (comentarios + reacciones)',
                view: 'V_REPORTE_TOP_VIRAL'
            },
            {
                id: 'lideres',
                name: 'Líderes de Opinión',
                description: 'Usuarios más activos en generación de contenido',
                view: 'V_REPORTE_LIDERES_OPINION'
            },
            {
                id: 'eventos',
                name: 'Interés en Eventos',
                description: 'Proyección de asistencia a eventos futuros',
                view: 'V_REPORTE_INTERES_EVENTOS'
            }
        ]
    });
});

module.exports = router;
