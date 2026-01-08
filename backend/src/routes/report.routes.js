/**
 * Rutas de Reportes - SoyUCAB
 * REFACTORED: Simplified preview logic using dynamic function mapping
 */

const express = require('express');
const router = express.Router();
const reportService = require('../services/report.service');
const { requireAuth } = require('../middleware/auth.middleware');

// Report types configuration
const REPORT_TYPES = {
    viralidad: { name: 'Top Contenido Viral', description: 'Ranking de contenido con mayor impacto', view: 'V_REPORTE_TOP_VIRAL', getData: reportService.getViralReportData },
    lideres: { name: 'Líderes de Opinión', description: 'Usuarios más activos en generación de contenido', view: 'V_REPORTE_LIDERES_OPINION', getData: reportService.getLideresReportData },
    eventos: { name: 'Interés en Eventos', description: 'Proyección de asistencia a eventos futuros', view: 'V_REPORTE_INTERES_EVENTOS', getData: reportService.getEventosReportData },
    crecimiento: { name: 'Crecimiento Demográfico', description: 'Nuevos registros por mes y ocupación', view: 'V_REPORTE_CRECIMIENTO_DEMOGRAFICO', getData: reportService.getCrecimientoReportData },
    grupos: { name: 'Grupos Más Activos', description: 'Top 10 grupos por cantidad de miembros', view: 'V_GRUPOS_MAS_ACTIVOS', getData: reportService.getGruposActivosReportData },
    referentes: { name: 'Top Referentes Comunidad', description: 'Top 15 usuarios por score de autoridad', view: 'V_TOP_REFERENTES_COMUNIDAD', getData: reportService.getReferentesReportData },
    tutorias: { name: 'Top Áreas de Tutorías', description: 'Top 5 áreas de conocimiento más demandadas', view: 'vista_top5_areas_conocimiento_demanda', getData: reportService.getTutoriasReportData },
    nexos: { name: 'Nexos Vigentes vs Por Vencer', description: 'Estado de convenios y relaciones institucionales', view: 'vista_nexos_vigentes_vs_por_vencer', getData: reportService.getNexosReportData },
    ofertas: { name: 'Top 10 Ofertas Laborales', description: 'Ofertas laborales con más postulaciones', view: 'vista_top10_ofertas_mas_postuladas', getData: reportService.getOfertasReportData }
};

const VALID_TYPES = Object.keys(REPORT_TYPES);

/**
 * POST /api/report/generate
 * Genera un reporte en PDF
 */
router.post('/generate', requireAuth, async (req, res) => {
    try {
        const { reportType } = req.body;

        if (!reportType || !VALID_TYPES.includes(reportType)) {
            return res.status(400).json({
                success: false,
                error: `Tipo de reporte inválido. Opciones: ${VALID_TYPES.join(', ')}`
            });
        }

        console.log(`[REPORT] Generando reporte: ${reportType} para usuario: ${req.userEmail}`);
        const result = await reportService.generateReport(reportType, req.userEmail);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_${reportType}_${Date.now()}.pdf`);
        res.send(result.pdf);
    } catch (error) {
        console.error('[REPORT] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/report/preview/:type
 * Obtiene los datos del reporte en JSON (para preview)
 */
// Endpoint específico para datos crudos del mapa (JSON)
router.get('/diaspora', requireAuth, async (req, res) => {
    try {
        const userEmail = req.userEmail;
        const data = await reportService.getDiasporaReportData(userEmail);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching diaspora data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint general para PDFs
router.get('/preview/:type', requireAuth, async (req, res) => {
    try {
        const { type } = req.params;
        const reportConfig = REPORT_TYPES[type];

        if (!reportConfig) {
            return res.status(400).json({ success: false, error: 'Tipo de reporte no válido' });
        }

        const data = await reportConfig.getData(req.userEmail);
        res.json({ success: true, reportType: type, count: data.length, data });
    } catch (error) {
        console.error('[REPORT PREVIEW] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/report/types
 * Lista los tipos de reportes disponibles
 */
router.get('/types', (req, res) => {
    const types = Object.entries(REPORT_TYPES).map(([id, config]) => ({
        id,
        name: config.name,
        description: config.description,
        view: config.view
    }));
    res.json({ success: true, types });
});

module.exports = router;
