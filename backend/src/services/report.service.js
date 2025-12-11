/**
 * Servicio de Reportes - SoyUCAB
 * Genera reportes en PDF usando JsReport
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const JSREPORT_URL = process.env.JSREPORT_URL || 'http://jsreport:5488';

// Load logo as base64 for PDF embedding
let LOGO_BASE64 = '';
try {
    const logoPath = path.join(__dirname, '../assets/logo.png');
    const logoBuffer = fs.readFileSync(logoPath);
    LOGO_BASE64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    console.log('[REPORT] Logo loaded successfully');
} catch (err) {
    console.log('[REPORT] Logo not found, using text fallback');
}

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

// ============================================
// TEMPLATES HTML
// ============================================

/**
 * Genera el HTML del reporte con estilo Figma (KPI cards, badges, colores)
 */
function renderHtmlTemplate(reportType, data, generatedAt) {
    const titles = {
        viralidad: 'Top Contenido Viral',
        lideres: 'Líderes de Opinión',
        eventos: 'Proyección de Interés en Eventos',
        crecimiento: 'Crecimiento Demográfico',
        grupos: 'Grupos Más Activos',
        referentes: 'Top Referentes de la Comunidad'
    };

    const subtitles = {
        viralidad: 'Ranking de publicaciones con mayor impacto',
        lideres: 'Usuarios más activos en generación de contenido',
        eventos: 'Predicción de asistencia basada en interacciones',
        crecimiento: 'Nuevos registros por mes y tipo de ocupación',
        grupos: 'Grupos de interés ordenados por cantidad de miembros',
        referentes: 'Usuarios con mayor autoridad en la comunidad'
    };

    const title = titles[reportType] || 'Reporte SoyUCAB';
    const subtitle = subtitles[reportType] || '';

    // Calculate KPIs based on data
    let kpis = [];
    let tableHeaders = '';
    let tableRows = '';

    if (reportType === 'viralidad') {
        const totalContenido = data.length;
        const avgScore = data.length > 0
            ? (data.reduce((sum, r) => sum + (parseFloat(r.score_viralidad) || 0), 0) / data.length).toFixed(1)
            : 0;
        const totalComentarios = data.reduce((sum, r) => sum + (parseInt(r.total_comentarios) || 0), 0);
        const topContent = data[0]?.contenido_titulo || 'N/A';

        // Get score level badge
        const getScoreLevel = (score) => {
            if (score >= 10) return { level: 'Muy Alto', color: '#047732' };
            if (score >= 5) return { level: 'Alto', color: '#40b4e5' };
            if (score >= 2) return { level: 'Medio', color: '#ffc526' };
            return { level: 'Bajo', color: '#ef4444' };
        };

        kpis = [
            { label: 'Total Contenido', value: totalContenido, color: '#40b4e5', sublabel: 'publicaciones' },
            { label: 'Score Promedio', value: avgScore, color: '#047732', sublabel: 'nivel de impacto' },
            { label: 'Total Comentarios', value: totalComentarios, color: '#ffc526', sublabel: 'en total' },
            { label: 'Mejor Contenido', value: topContent.substring(0, 25) + '...', color: '#12100c', sublabel: '#1 en ranking' }
        ];

        tableHeaders = `
            <th class="rank-col">Rank</th>
            <th>Autor</th>
            <th>Contenido</th>
            <th class="center">Fecha</th>
            <th class="center">Score</th>
            <th class="center">Comentarios</th>
            <th class="center">Reacciones</th>
            <th class="center">Nivel</th>
        `;
        tableRows = data.map((row, index) => {
            const scoreInfo = getScoreLevel(row.score_viralidad || 0);
            return `
            <tr>
                <td><span class="rank-badge ${index < 3 ? 'top3' : ''}">${row.ranking || index + 1}</span></td>
                <td class="author">${row.autor || '-'}</td>
                <td class="content-title">${row.contenido_titulo || '-'}</td>
                <td class="center date">${row.fecha_hora_creacion ? new Date(row.fecha_hora_creacion).toLocaleDateString('es-VE') : '-'}</td>
                <td class="center"><span class="score-badge">${row.score_viralidad || 0}</span></td>
                <td class="center comment-count">${row.total_comentarios || 0}</td>
                <td class="center reaction-count">${row.total_reacciones || 0}</td>
                <td class="center"><span class="level-badge" style="border-color: ${scoreInfo.color}; color: ${scoreInfo.color}">${scoreInfo.level}</span></td>
            </tr>
        `}).join('');
    } else if (reportType === 'lideres') {
        const totalLideres = data.length;
        const totalPubs = data.reduce((sum, r) => sum + (parseInt(r.total_publicaciones) || 0), 0);
        const totalImpacto = data.reduce((sum, r) => sum + (parseFloat(r.impacto_acumulado_comunidad) || 0), 0);
        const topInfluencer = data[0]?.influencer || 'N/A';

        kpis = [
            { label: 'Total Líderes', value: totalLideres, color: '#40b4e5', icon: '👥' },
            { label: 'Publicaciones', value: totalPubs, color: '#047732', icon: '📝' },
            { label: 'Impacto Total', value: totalImpacto.toFixed(0), color: '#ffc526', icon: '🔥' },
            { label: 'Top Influencer', value: topInfluencer.split(' ')[0], color: '#40b4e5', icon: '🏆' }
        ];

        tableHeaders = `
            <th class="rank-col">#</th>
            <th>Influencer</th>
            <th class="center">Publicaciones</th>
            <th class="center">Impacto Acumulado</th>
            <th>Ubicación</th>
        `;
        tableRows = data.map((row, index) => `
            <tr>
                <td><span class="rank-badge ${index < 3 ? 'top3' : ''}">${index + 1}</span></td>
                <td class="author">${row.influencer || '-'}</td>
                <td class="center">${row.total_publicaciones || 0}</td>
                <td class="center"><span class="score-badge">${row.impacto_acumulado_comunidad || 0}</span></td>
                <td>${row.ubicacion || '-'}</td>
            </tr>
        `).join('');
    } else if (reportType === 'eventos') {
        const totalEventos = data.length;
        const totalInteresados = data.reduce((sum, r) => sum + (parseInt(r.interesados_potenciales) || 0), 0);
        const exitoCount = data.filter(r => r.status_proyeccion === 'EXITO ASEGURADO').length;
        const nextEvent = data[0]?.nombre_evento || 'N/A';

        kpis = [
            { label: 'Eventos Futuros', value: totalEventos, color: '#40b4e5', icon: '📅' },
            { label: 'Interesados', value: totalInteresados, color: '#047732', icon: '👍' },
            { label: 'Éxito Asegurado', value: exitoCount, color: '#ffc526', icon: '✅' },
            { label: 'Próximo Evento', value: nextEvent.substring(0, 15), color: '#40b4e5', icon: '🎯' }
        ];

        tableHeaders = `
            <th>Evento</th>
            <th>Fecha Inicio</th>
            <th>Lugar</th>
            <th class="center">Interesados</th>
            <th class="center">Proyección</th>
        `;
        tableRows = data.map(row => {
            const statusClass = row.status_proyeccion === 'EXITO ASEGURADO' ? 'status-success'
                : row.status_proyeccion === 'RIESGO DE BAJA ASISTENCIA' ? 'status-warning' : 'status-info';
            return `
            <tr>
                <td class="event-name">${row.nombre_evento || '-'}</td>
                <td class="date">${row.fecha_inicio ? new Date(row.fecha_inicio).toLocaleDateString('es-VE') : '-'}</td>
                <td>${row.lugar || '-'}</td>
                <td class="center">${row.interesados_potenciales || 0}</td>
                <td class="center"><span class="status-badge ${statusClass}">${row.status_proyeccion || '-'}</span></td>
            </tr>
        `}).join('');
    } else if (reportType === 'crecimiento') {
        // Crecimiento Demográfico
        const totalRegistros = data.reduce((sum, r) => sum + (parseInt(r.nuevos_registros) || 0), 0);
        const mesesUnicos = [...new Set(data.map(r => r.mes_registro))].length;
        const ocupaciones = [...new Set(data.map(r => r.ocupacion))];
        const topOcupacion = data.reduce((max, r) =>
            (parseInt(r.nuevos_registros) || 0) > (parseInt(max?.nuevos_registros) || 0) ? r : max, data[0])?.ocupacion || 'N/A';

        kpis = [
            { label: 'Total Registros', value: totalRegistros, color: '#40b4e5', sublabel: 'nuevos miembros' },
            { label: 'Meses Analizados', value: mesesUnicos, color: '#047732', sublabel: 'períodos' },
            { label: 'Tipos Ocupación', value: ocupaciones.length, color: '#ffc526', sublabel: 'categorías' },
            { label: 'Más Registros', value: topOcupacion, color: '#12100c', sublabel: 'ocupación líder' }
        ];

        tableHeaders = `
            <th>Mes</th>
            <th>Ocupación</th>
            <th class="center">Nuevos Registros</th>
        `;
        tableRows = data.map(row => `
            <tr>
                <td class="date">${row.mes_registro || '-'}</td>
                <td>${row.ocupacion || '-'}</td>
                <td class="center"><span class="score-badge">${row.nuevos_registros || 0}</span></td>
            </tr>
        `).join('');
    } else if (reportType === 'grupos') {
        // Grupos Más Activos
        const totalGrupos = data.length;
        const totalMiembros = data.reduce((sum, r) => sum + (parseInt(r.total_miembros) || 0), 0);
        const promedioMiembros = totalGrupos > 0 ? (totalMiembros / totalGrupos).toFixed(1) : 0;
        const grupoTop = data[0]?.nombre_grupo || 'N/A';

        kpis = [
            { label: 'Total Grupos', value: totalGrupos, color: '#40b4e5', sublabel: 'grupos activos' },
            { label: 'Total Miembros', value: totalMiembros, color: '#047732', sublabel: 'participantes' },
            { label: 'Promedio', value: promedioMiembros, color: '#ffc526', sublabel: 'miembros/grupo' },
            { label: 'Grupo #1', value: grupoTop.substring(0, 15), color: '#12100c', sublabel: 'más activo' }
        ];

        tableHeaders = `
            <th class="rank-col">#</th>
            <th>Nombre del Grupo</th>
            <th>Descripción</th>
            <th class="center">Miembros</th>
        `;
        tableRows = data.map((row, index) => `
            <tr>
                <td><span class="rank-badge ${index < 3 ? 'top3' : ''}">${index + 1}</span></td>
                <td class="author">${row.nombre_grupo || '-'}</td>
                <td class="content-title">${(row.descripcion_grupo || '-').substring(0, 50)}...</td>
                <td class="center"><span class="score-badge">${row.total_miembros || 0}</span></td>
            </tr>
        `).join('');
    } else if (reportType === 'referentes') {
        // Top Referentes Comunidad
        const totalReferentes = data.length;
        const maxScore = data.length > 0 ? Math.max(...data.map(r => parseFloat(r.score_autoridad) || 0)) : 0;
        const avgScore = data.length > 0
            ? (data.reduce((sum, r) => sum + (parseFloat(r.score_autoridad) || 0), 0) / data.length).toFixed(1)
            : 0;
        const topReferente = data[0]?.referente || 'N/A';

        kpis = [
            { label: 'Total Referentes', value: totalReferentes, color: '#40b4e5', sublabel: 'líderes identificados' },
            { label: 'Score Máximo', value: maxScore.toFixed(0), color: '#047732', sublabel: 'autoridad más alta' },
            { label: 'Score Promedio', value: avgScore, color: '#ffc526', sublabel: 'nivel medio' },
            { label: 'Top Referente', value: topReferente.split(' ')[0], color: '#12100c', sublabel: '#1 autoridad' }
        ];

        tableHeaders = `
            <th class="rank-col">#</th>
            <th>Referente</th>
            <th>Correo</th>
            <th class="center">Score Autoridad</th>
        `;
        tableRows = data.map((row, index) => `
            <tr>
                <td><span class="rank-badge ${index < 3 ? 'top3' : ''}">${index + 1}</span></td>
                <td class="author">${row.referente || '-'}</td>
                <td class="date">${row.correo || '-'}</td>
                <td class="center"><span class="score-badge">${row.score_autoridad || 0}</span></td>
            </tr>
        `).join('');
    }

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>${title} - SoyUCAB</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: #f8f9fa;
            color: #12100c;
            padding: 30px;
        }
        .container {
            max-width: 1100px;
            margin: 0 auto;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            overflow: hidden;
        }
        .header {
            padding: 24px 32px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header h1 { font-size: 24px; font-weight: 600; color: #12100c; }
        .header .subtitle { color: #6b7280; font-size: 14px; margin-top: 4px; }
        .logo { font-size: 24px; font-weight: 700; }
        .logo .soy { color: #12100c; }
        .logo .ucab { color: #ffc526; }
        .export-btn {
            background: #ffc526;
            color: #12100c;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
        }
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            padding: 24px 32px;
            background: #fafafa;
        }
        .kpi-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #e5e7eb;
        }
        .kpi-label { font-size: 12px; color: #6b7280; margin-bottom: 8px; }
        .kpi-value { font-size: 28px; font-weight: 700; }
        .kpi-icon { font-size: 32px; float: right; }
        .content { padding: 24px 32px; }
        .section-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
        .section-subtitle { font-size: 14px; color: #6b7280; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th {
            background: #f8f9fa;
            padding: 14px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            color: #6b7280;
            border-bottom: 2px solid #e5e7eb;
        }
        td {
            padding: 14px 12px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 14px;
        }
        tr:hover { background: #fafafa; }
        .center { text-align: center; }
        .rank-col { width: 50px; }
        .rank-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #e5e7eb;
            color: #6b7280;
            font-weight: 600;
            font-size: 12px;
        }
        .rank-badge.top3 { background: #40b4e5; color: white; }
        .author { font-weight: 500; }
        .content-title { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .date { color: #6b7280; font-size: 13px; }
        .score-badge {
            background: #047732;
            color: white;
            padding: 4px 12px;
            border-radius: 16px;
            font-weight: 600;
            font-size: 13px;
        }
        .comment-count { color: #ffc526; font-weight: 600; }
        .reaction-count { color: #047732; font-weight: 600; }
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-success { background: #dcfce7; color: #047732; }
        .status-warning { background: #fef3c7; color: #d97706; }
        .status-info { background: #e0f2fe; color: #0284c7; }
        .event-name { font-weight: 500; }
        .footer {
            padding: 20px 32px;
            background: #12100c;
            color: #9ca3af;
            font-size: 12px;
            text-align: center;
        }
        .meta { padding: 12px 32px; background: #f0f0f0; font-size: 12px; color: #6b7280; }
        .no-data { text-align: center; padding: 40px; color: #9ca3af; }
        .kpi-sublabel { font-size: 12px; color: #6b7280; margin-top: 4px; }
        .level-badge {
            display: inline-block;
            padding: 4px 12px;
            border: 2px solid;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1>${title}</h1>
                <p class="subtitle">${subtitle}</p>
            </div>
            <div class="logo">
                ${LOGO_BASE64 ? `<img src="${LOGO_BASE64}" alt="SoyUCAB" style="height: 40px;">` : '<span class="soy">Soy</span><span class="ucab">UCAB</span>'}
            </div>
        </div>
        
        <div class="kpi-grid">
            ${kpis.map(kpi => `
            <div class="kpi-card">
                <p class="kpi-label">${kpi.label}</p>
                <p class="kpi-value" style="color: ${kpi.color}">${kpi.value}</p>
                <p class="kpi-sublabel">${kpi.sublabel || ''}</p>
            </div>
            `).join('')}
        </div>

        <div class="content">
            <h2 class="section-title">${reportType === 'viralidad' ? 'Ranking de Contenido por Impacto' :
            reportType === 'lideres' ? 'Ranking de Líderes de Opinión' :
                'Eventos Próximos y Proyección'
        }</h2>
            <p class="section-subtitle">${reportType === 'viralidad' ? 'Ordenado por score de viralidad (FN_CALCULAR_NIVEL_IMPACTO)' :
            reportType === 'lideres' ? 'Ordenado por impacto acumulado en la comunidad' :
                'Ordenado por fecha de inicio (próximos primero)'
        }</p>
            
            ${data.length > 0 ? `
            <table>
                <thead><tr>${tableHeaders}</tr></thead>
                <tbody>${tableRows}</tbody>
            </table>
            ` : '<p class="no-data">No hay datos disponibles para este período.</p>'}
        </div>

        <div class="footer">
            © ${new Date().getFullYear()} SoyUCAB - Universidad Católica Andrés Bello | Reporte generado automáticamente
        </div>
    </div>
</body>
</html>
    `;
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
        default:
            throw new Error(`Tipo de reporte no válido: ${reportType}`);
    }

    // 2. Generar HTML
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
    getReferentesReportData
};
