/**
 * Servicio de Reportes - SoyUCAB
 * Genera reportes en PDF usando JsReport
 * 
 * REFACTORED: HTML templates extracted to src/templates/reportTemplates.js
 */

const axios = require('axios');
const db = require('../config/db');
const { renderHtmlTemplate } = require('../templates/reportTemplates');

const JSREPORT_URL = process.env.JSREPORT_URL || 'http://jsreport:5488';

// ============================================
// CONSULTAS A VISTAS SQL
// ============================================

/**
 * Obtiene datos del reporte de viralidad
 */
async function getViralReportData(userEmail) {
    const sql = `SELECT * FROM V_REPORTE_TOP_VIRAL LIMIT 20`;
    const result = await db.queryAsUser(sql, [], userEmail);
    return result.rows;
}

/**
 * Obtiene datos del reporte de líderes de opinión
 */
async function getLideresReportData(userEmail) {
    const sql = `SELECT * FROM V_REPORTE_LIDERES_OPINION LIMIT 20`;
    const result = await db.queryAsUser(sql, [], userEmail);
    return result.rows;
}

/**
 * Obtiene datos del reporte de interés en eventos
 */
async function getEventosReportData(userEmail) {
    const sql = `SELECT * FROM V_REPORTE_INTERES_EVENTOS LIMIT 20`;
    const result = await db.queryAsUser(sql, [], userEmail);
    return result.rows;
}

/**
 * Obtiene datos del reporte de crecimiento demográfico
 */
async function getCrecimientoReportData(userEmail) {
    const sql = `SELECT * FROM V_REPORTE_CRECIMIENTO_DEMOGRAFICO ORDER BY mes_registro DESC`;
    const result = await db.queryAsUser(sql, [], userEmail);
    return result.rows;
}

/**
 * Obtiene datos del reporte de grupos más activos
 */
async function getGruposActivosReportData(userEmail) {
    const sql = `SELECT * FROM V_GRUPOS_MAS_ACTIVOS`;
    const result = await db.queryAsUser(sql, [], userEmail);
    return result.rows;
}

/**
 * Obtiene datos del reporte de referentes de la comunidad
 */
async function getReferentesReportData(userEmail) {
    const sql = `SELECT * FROM V_TOP_REFERENTES_COMUNIDAD`;
    const result = await db.queryAsUser(sql, [], userEmail);
    return result.rows;
}

/**
 * Obtiene datos del reporte de áreas de conocimiento más demandadas en tutorías
 */
async function getTutoriasReportData(userEmail) {
    const sql = `SELECT * FROM vista_top5_areas_conocimiento_demanda`;
    const result = await db.queryAsUser(sql, [], userEmail);
    return result.rows;
}

/**
 * Obtiene datos del reporte de nexos vigentes vs por vencer
 */
async function getNexosReportData(userEmail) {
    const sql = `SELECT * FROM vista_nexos_vigentes_vs_por_vencer`;
    const result = await db.queryAsUser(sql, [], userEmail);
    return result.rows;
}

/**
 * Obtiene datos del reporte de ofertas laborales más postuladas
 */
async function getOfertasReportData(userEmail) {
    const sql = `SELECT * FROM vista_top10_ofertas_mas_postuladas`;
    const result = await db.queryAsUser(sql, [], userEmail);
    return result.rows;
}

async function getDiasporaReportData(userEmail) {
    // Agrupa usuarios por país de residencia
    const sql = `
        SELECT 
            pais_residencia, 
            COUNT(*)::int as total 
        FROM PERSONA 
        WHERE pais_residencia IS NOT NULL
        GROUP BY pais_residencia
        ORDER BY total DESC
    `;
    const result = await db.queryAsUser(sql, [], userEmail);
    return result.rows;
}

// ============================================
// INTEGRACIÓN CON JSREPORT
// ============================================

/**
 * Envía HTML a JsReport y obtiene el PDF
 */
async function callJsReport(html) {
    try {
        const response = await axios.post(
            `${JSREPORT_URL}/api/report`,
            {
                template: {
                    content: html,
                    engine: 'none',
                    recipe: 'chrome-pdf',
                    chrome: {
                        landscape: true,
                        format: 'A4',
                        marginTop: '8mm',
                        marginBottom: '8mm',
                        marginLeft: '8mm',
                        marginRight: '10mm'
                    }
                }
            },
            {
                responseType: 'arraybuffer',
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        return Buffer.from(response.data);
    } catch (error) {
        console.error('[JSREPORT] Error:', error.message);
        throw new Error(`Error al generar PDF: ${error.message}`);
    }
}

/**
 * Genera un reporte completo (datos + PDF)
 */
async function generateReport(reportType, userEmail) {
    // 1. Obtener datos según el tipo
    let data;
    switch (reportType) {
        case 'viralidad':
            data = await getViralReportData(userEmail);
            break;
        case 'lideres':
            data = await getLideresReportData(userEmail);
            break;
        case 'eventos':
            data = await getEventosReportData(userEmail);
            break;
        case 'crecimiento':
            data = await getCrecimientoReportData(userEmail);
            break;
        case 'grupos':
            data = await getGruposActivosReportData(userEmail);
            break;
        case 'referentes':
            data = await getReferentesReportData(userEmail);
            break;
        case 'tutorias':
            data = await getTutoriasReportData(userEmail);
            break;
        case 'nexos':
            data = await getNexosReportData(userEmail);
            break;
        case 'ofertas':
            data = await getOfertasReportData(userEmail);
            break;
        case 'diaspora':
            data = await getDiasporaReportData(userEmail);
            break;
        default:
            throw new Error(`Tipo de reporte no válido: ${reportType}`);
    }

    // 2. Generar HTML using extracted template module
    const generatedAt = new Date().toLocaleString('es-VE', {
        dateStyle: 'full',
        timeStyle: 'short'
    });
    const html = renderHtmlTemplate(reportType, data, generatedAt);

    // 3. Convertir a PDF via JsReport
    const pdfBuffer = await callJsReport(html);

    return {
        pdf: pdfBuffer,
        metadata: {
            reportType,
            generatedAt,
            recordCount: data.length
        }
    };
}

module.exports = {
    generateReport,
    getViralReportData,
    getLideresReportData,
    getEventosReportData,
    getCrecimientoReportData,
    getGruposActivosReportData,
    getReferentesReportData,
    getTutoriasReportData,
    getNexosReportData,
    getOfertasReportData,
    getDiasporaReportData
};
