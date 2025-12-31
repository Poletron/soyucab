/**
 * Report Templates - SoyUCAB
 * HTML template generation for PDF reports
 * Extracted from report.service.js for maintainability
 */

const fs = require('fs');
const path = require('path');

// Load logo as base64 for PDF embedding
let LOGO_BASE64 = '';
try {
    const logoPath = path.join(__dirname, '../assets/logo.png');
    const logoBuffer = fs.readFileSync(logoPath);
    LOGO_BASE64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    console.log('[REPORT TEMPLATE] Logo loaded successfully');
} catch (err) {
    console.log('[REPORT TEMPLATE] Logo not found, using text fallback');
}

// ============================================
// REPORT METADATA
// ============================================

const REPORT_TITLES = {
    viralidad: 'Top Contenido Viral',
    lideres: 'Líderes de Opinión',
    eventos: 'Proyección de Interés en Eventos',
    crecimiento: 'Crecimiento Demográfico',
    grupos: 'Grupos Más Activos',
    referentes: 'Top Referentes de la Comunidad',
    tutorias: 'Top Áreas de Conocimiento en Tutorías',
    nexos: 'Nexos Vigentes vs Por Vencer',
    ofertas: 'Top 10 Ofertas Más Postuladas'
};

const REPORT_SUBTITLES = {
    viralidad: 'Ranking de publicaciones con mayor impacto',
    lideres: 'Usuarios más activos en generación de contenido',
    eventos: 'Predicción de asistencia basada en interacciones',
    crecimiento: 'Nuevos registros por mes y tipo de ocupación',
    grupos: 'Grupos de interés ordenados por cantidad de miembros',
    referentes: 'Usuarios con mayor autoridad en la comunidad',
    tutorias: 'Top 5 áreas de conocimiento más demandadas',
    nexos: 'Estado de convenios y relaciones institucionales',
    ofertas: 'Ofertas laborales con más postulaciones'
};

// ============================================
// CSS STYLES
// ============================================

const CSS_STYLES = `
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
.kpi-sublabel { font-size: 12px; color: #6b7280; margin-top: 4px; }
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
.status-danger { background: #fee2e2; color: #dc2626; }
.event-name { font-weight: 500; }
.footer {
    padding: 20px 32px;
    background: #12100c;
    color: #9ca3af;
    font-size: 12px;
    text-align: center;
}
.no-data { text-align: center; padding: 40px; color: #9ca3af; }
.level-badge {
    display: inline-block;
    padding: 4px 12px;
    border: 2px solid;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 600;
}
`;

// ============================================
// KPI BUILDERS
// ============================================

function buildKPIsViralidad(data) {
    const totalContenido = data.length;
    const avgScore = data.length > 0
        ? (data.reduce((sum, r) => sum + (parseFloat(r.score_viralidad) || 0), 0) / data.length).toFixed(1)
        : 0;
    const totalComentarios = data.reduce((sum, r) => sum + (parseInt(r.total_comentarios) || 0), 0);
    const topContent = data[0]?.contenido_titulo || 'N/A';

    return [
        { label: 'Total Contenido', value: totalContenido, color: '#40b4e5', sublabel: 'publicaciones' },
        { label: 'Score Promedio', value: avgScore, color: '#047732', sublabel: 'nivel de impacto' },
        { label: 'Total Comentarios', value: totalComentarios, color: '#ffc526', sublabel: 'en total' },
        { label: 'Mejor Contenido', value: topContent.substring(0, 25) + '...', color: '#12100c', sublabel: '#1 en ranking' }
    ];
}

function buildKPIsLideres(data) {
    const totalLideres = data.length;
    const totalPubs = data.reduce((sum, r) => sum + (parseInt(r.total_publicaciones) || 0), 0);
    const totalImpacto = data.reduce((sum, r) => sum + (parseFloat(r.impacto_acumulado_comunidad) || 0), 0);
    const topInfluencer = data[0]?.influencer || 'N/A';

    return [
        { label: 'Total Líderes', value: totalLideres, color: '#40b4e5', sublabel: 'identificados' },
        { label: 'Publicaciones', value: totalPubs, color: '#047732', sublabel: 'total creadas' },
        { label: 'Impacto Total', value: totalImpacto.toFixed(0), color: '#ffc526', sublabel: 'acumulado' },
        { label: 'Top Influencer', value: topInfluencer.split(' ')[0], color: '#40b4e5', sublabel: '#1' }
    ];
}

function buildKPIsEventos(data) {
    const totalEventos = data.length;
    const totalInteresados = data.reduce((sum, r) => sum + (parseInt(r.interesados_potenciales) || 0), 0);
    const exitoCount = data.filter(r => r.status_proyeccion === 'EXITO ASEGURADO').length;
    const nextEvent = data[0]?.nombre_evento || 'N/A';

    return [
        { label: 'Eventos Futuros', value: totalEventos, color: '#40b4e5', sublabel: 'programados' },
        { label: 'Interesados', value: totalInteresados, color: '#047732', sublabel: 'potenciales' },
        { label: 'Éxito Asegurado', value: exitoCount, color: '#ffc526', sublabel: 'eventos' },
        { label: 'Próximo Evento', value: nextEvent.substring(0, 15), color: '#40b4e5', sublabel: '' }
    ];
}

function buildKPIsCrecimiento(data) {
    const totalRegistros = data.reduce((sum, r) => sum + (parseInt(r.nuevos_registros) || 0), 0);
    const mesesUnicos = [...new Set(data.map(r => r.mes_registro))].length;
    const ocupaciones = [...new Set(data.map(r => r.ocupacion))];
    const topOcupacion = data.reduce((max, r) =>
        (parseInt(r.nuevos_registros) || 0) > (parseInt(max?.nuevos_registros) || 0) ? r : max, data[0])?.ocupacion || 'N/A';

    return [
        { label: 'Total Registros', value: totalRegistros, color: '#40b4e5', sublabel: 'nuevos miembros' },
        { label: 'Meses Analizados', value: mesesUnicos, color: '#047732', sublabel: 'períodos' },
        { label: 'Tipos Ocupación', value: ocupaciones.length, color: '#ffc526', sublabel: 'categorías' },
        { label: 'Más Registros', value: topOcupacion, color: '#12100c', sublabel: 'ocupación líder' }
    ];
}

function buildKPIsGrupos(data) {
    const totalGrupos = data.length;
    const totalMiembros = data.reduce((sum, r) => sum + (parseInt(r.total_miembros) || 0), 0);
    const promedioMiembros = totalGrupos > 0 ? (totalMiembros / totalGrupos).toFixed(1) : 0;
    const grupoTop = data[0]?.nombre_grupo || 'N/A';

    return [
        { label: 'Total Grupos', value: totalGrupos, color: '#40b4e5', sublabel: 'grupos activos' },
        { label: 'Total Miembros', value: totalMiembros, color: '#047732', sublabel: 'participantes' },
        { label: 'Promedio', value: promedioMiembros, color: '#ffc526', sublabel: 'miembros/grupo' },
        { label: 'Grupo #1', value: grupoTop.substring(0, 15), color: '#12100c', sublabel: 'más activo' }
    ];
}

function buildKPIsReferentes(data) {
    const totalReferentes = data.length;
    const maxScore = data.length > 0 ? Math.max(...data.map(r => parseFloat(r.score_autoridad) || 0)) : 0;
    const avgScore = data.length > 0
        ? (data.reduce((sum, r) => sum + (parseFloat(r.score_autoridad) || 0), 0) / data.length).toFixed(1)
        : 0;
    const topReferente = data[0]?.referente || 'N/A';

    return [
        { label: 'Total Referentes', value: totalReferentes, color: '#40b4e5', sublabel: 'líderes identificados' },
        { label: 'Score Máximo', value: maxScore.toFixed(0), color: '#047732', sublabel: 'autoridad más alta' },
        { label: 'Score Promedio', value: avgScore, color: '#ffc526', sublabel: 'nivel medio' },
        { label: 'Top Referente', value: topReferente.split(' ')[0], color: '#12100c', sublabel: '#1 autoridad' }
    ];
}

function buildKPIsTutorias(data) {
    const totalSolicitudes = data.reduce((sum, r) => sum + (parseInt(r.total_solicitudes_area) || 0), 0);
    const totalTutores = data.reduce((sum, r) => sum + (parseInt(r.total_tutores_disponibles) || 0), 0);
    const areasCount = data.length;
    const topArea = data[0]?.area_conocimiento || 'N/A';

    return [
        { label: 'Total Solicitudes', value: totalSolicitudes, color: '#40b4e5', sublabel: 'demanda tutorías' },
        { label: 'Áreas Analizadas', value: areasCount, color: '#047732', sublabel: 'top 5 áreas' },
        { label: 'Tutores Totales', value: totalTutores, color: '#ffc526', sublabel: 'disponibles' },
        { label: 'Área Top', value: topArea.substring(0, 15), color: '#12100c', sublabel: 'más demandada' }
    ];
}

function buildKPIsNexos(data) {
    const totalNexos = data.length;
    const vigentes = data.filter(r => r.estado_vigencia === 'Vigente').length;
    const porVencer = data.filter(r => r.estado_vigencia === 'Por Vencer').length;
    const vencidos = data.filter(r => r.estado_vigencia === 'Vencido').length;

    return [
        { label: 'Total Nexos', value: totalNexos, color: '#40b4e5', sublabel: 'convenios activos' },
        { label: 'Vigentes', value: vigentes, color: '#047732', sublabel: 'en regla' },
        { label: 'Por Vencer', value: porVencer, color: '#ffc526', sublabel: 'próximos 30 días' },
        { label: 'Vencidos', value: vencidos, color: '#ef4444', sublabel: 'requieren acción' }
    ];
}

function buildKPIsOfertas(data) {
    const totalOfertas = data.length;
    const totalPostulantes = data.reduce((sum, r) => sum + (parseInt(r.cantidad_postulantes) || 0), 0);
    const promedioPostulantes = totalOfertas > 0 ? (totalPostulantes / totalOfertas).toFixed(1) : 0;
    const topOferta = data[0]?.titulo_oferta || 'N/A';

    return [
        { label: 'Total Ofertas', value: totalOfertas, color: '#40b4e5', sublabel: 'ofertas analizadas' },
        { label: 'Total Postulantes', value: totalPostulantes, color: '#047732', sublabel: 'aplicaciones' },
        { label: 'Promedio', value: promedioPostulantes, color: '#ffc526', sublabel: 'postulantes/oferta' },
        { label: 'Oferta Top', value: topOferta.substring(0, 15), color: '#12100c', sublabel: 'más popular' }
    ];
}

// ============================================
// TABLE ROW BUILDERS
// ============================================

function getScoreLevel(score) {
    if (score >= 10) return { level: 'Muy Alto', color: '#047732' };
    if (score >= 5) return { level: 'Alto', color: '#40b4e5' };
    if (score >= 2) return { level: 'Medio', color: '#ffc526' };
    return { level: 'Bajo', color: '#ef4444' };
}

function buildTableViralidad(data) {
    const headers = `
        <th class="rank-col">Rank</th>
        <th>Autor</th>
        <th>Contenido</th>
        <th class="center">Fecha</th>
        <th class="center">Score</th>
        <th class="center">Comentarios</th>
        <th class="center">Reacciones</th>
        <th class="center">Nivel</th>
    `;
    const rows = data.map((row, index) => {
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
    return { headers, rows };
}

function buildTableLideres(data) {
    const headers = `
        <th class="rank-col">#</th>
        <th>Influencer</th>
        <th class="center">Publicaciones</th>
        <th class="center">Impacto Acumulado</th>
        <th>Ubicación</th>
    `;
    const rows = data.map((row, index) => `
        <tr>
            <td><span class="rank-badge ${index < 3 ? 'top3' : ''}">${index + 1}</span></td>
            <td class="author">${row.influencer || '-'}</td>
            <td class="center">${row.total_publicaciones || 0}</td>
            <td class="center"><span class="score-badge">${row.impacto_acumulado_comunidad || 0}</span></td>
            <td>${row.ubicacion || '-'}</td>
        </tr>
    `).join('');
    return { headers, rows };
}

function buildTableEventos(data) {
    const headers = `
        <th>Evento</th>
        <th>Fecha Inicio</th>
        <th>Lugar</th>
        <th class="center">Interesados</th>
        <th class="center">Proyección</th>
    `;
    const rows = data.map(row => {
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
    return { headers, rows };
}

function buildTableCrecimiento(data) {
    const headers = `
        <th>Mes</th>
        <th>Ocupación</th>
        <th class="center">Nuevos Registros</th>
    `;
    const rows = data.map(row => `
        <tr>
            <td class="date">${row.mes_registro || '-'}</td>
            <td>${row.ocupacion || '-'}</td>
            <td class="center"><span class="score-badge">${row.nuevos_registros || 0}</span></td>
        </tr>
    `).join('');
    return { headers, rows };
}

function buildTableGrupos(data) {
    const headers = `
        <th class="rank-col">#</th>
        <th>Nombre del Grupo</th>
        <th>Descripción</th>
        <th class="center">Miembros</th>
    `;
    const rows = data.map((row, index) => `
        <tr>
            <td><span class="rank-badge ${index < 3 ? 'top3' : ''}">${index + 1}</span></td>
            <td class="author">${row.nombre_grupo || '-'}</td>
            <td class="content-title">${(row.descripcion_grupo || '-').substring(0, 50)}...</td>
            <td class="center"><span class="score-badge">${row.total_miembros || 0}</span></td>
        </tr>
    `).join('');
    return { headers, rows };
}

function buildTableReferentes(data) {
    const headers = `
        <th class="rank-col">#</th>
        <th>Referente</th>
        <th>Correo</th>
        <th class="center">Score Autoridad</th>
    `;
    const rows = data.map((row, index) => `
        <tr>
            <td><span class="rank-badge ${index < 3 ? 'top3' : ''}">${index + 1}</span></td>
            <td class="author">${row.referente || '-'}</td>
            <td class="date">${row.correo || '-'}</td>
            <td class="center"><span class="score-badge">${row.score_autoridad || 0}</span></td>
        </tr>
    `).join('');
    return { headers, rows };
}

function buildTableTutorias(data) {
    const headers = `
        <th class="rank-col">#</th>
        <th>Área de Conocimiento</th>
        <th class="center">Total Solicitudes</th>
        <th class="center">Tutores Disponibles</th>
    `;
    const rows = data.map((row, index) => `
        <tr>
            <td><span class="rank-badge ${index < 3 ? 'top3' : ''}">${index + 1}</span></td>
            <td class="author">${row.area_conocimiento || '-'}</td>
            <td class="center"><span class="score-badge">${row.total_solicitudes_area || 0}</span></td>
            <td class="center">${row.total_tutores_disponibles || 0}</td>
        </tr>
    `).join('');
    return { headers, rows };
}

function buildTableNexos(data) {
    const headers = `
        <th>Tipo Convenio</th>
        <th>Persona</th>
        <th>Organización</th>
        <th class="center">Fecha Inicio</th>
        <th class="center">Fecha Fin</th>
        <th class="center">Estado</th>
    `;
    const rows = data.map(row => {
        const statusClass = row.estado_vigencia === 'Vigente' ? 'status-success'
            : row.estado_vigencia === 'Por Vencer' ? 'status-warning' : 'status-danger';
        return `
        <tr>
            <td class="author">${row.tipo_convenio || '-'}</td>
            <td>${row.nombre_persona || '-'}</td>
            <td>${row.nombre_organizacion || '-'}</td>
            <td class="center date">${row.fecha_inicio ? new Date(row.fecha_inicio).toLocaleDateString('es-VE') : '-'}</td>
            <td class="center date">${row.fecha_fin ? new Date(row.fecha_fin).toLocaleDateString('es-VE') : 'Indefinido'}</td>
            <td class="center"><span class="status-badge ${statusClass}">${row.estado_vigencia || '-'}</span></td>
        </tr>
    `}).join('');
    return { headers, rows };
}

function buildTableOfertas(data) {
    const headers = `
        <th class="rank-col">#</th>
        <th>Título Oferta</th>
        <th>Organización</th>
        <th class="center">Postulantes</th>
    `;
    const rows = data.map((row, index) => `
        <tr>
            <td><span class="rank-badge ${index < 3 ? 'top3' : ''}">${index + 1}</span></td>
            <td class="author">${row.titulo_oferta || '-'}</td>
            <td>${row.nombre_organizacion || '-'}</td>
            <td class="center"><span class="score-badge">${row.cantidad_postulantes || 0}</span></td>
        </tr>
    `).join('');
    return { headers, rows };
}

// ============================================
// MAIN RENDER FUNCTION
// ============================================

/**
 * Renders the complete HTML template for a report
 * @param {string} reportType - Type of report
 * @param {Array} data - Report data rows
 * @param {string} generatedAt - Timestamp string
 * @returns {string} Complete HTML document
 */
function renderHtmlTemplate(reportType, data, generatedAt) {
    const title = REPORT_TITLES[reportType] || 'Reporte SoyUCAB';
    const subtitle = REPORT_SUBTITLES[reportType] || '';

    // Build KPIs based on report type
    let kpis = [];
    let tableData = { headers: '', rows: '' };

    switch (reportType) {
        case 'viralidad':
            kpis = buildKPIsViralidad(data);
            tableData = buildTableViralidad(data);
            break;
        case 'lideres':
            kpis = buildKPIsLideres(data);
            tableData = buildTableLideres(data);
            break;
        case 'eventos':
            kpis = buildKPIsEventos(data);
            tableData = buildTableEventos(data);
            break;
        case 'crecimiento':
            kpis = buildKPIsCrecimiento(data);
            tableData = buildTableCrecimiento(data);
            break;
        case 'grupos':
            kpis = buildKPIsGrupos(data);
            tableData = buildTableGrupos(data);
            break;
        case 'referentes':
            kpis = buildKPIsReferentes(data);
            tableData = buildTableReferentes(data);
            break;
        case 'tutorias':
            kpis = buildKPIsTutorias(data);
            tableData = buildTableTutorias(data);
            break;
        case 'nexos':
            kpis = buildKPIsNexos(data);
            tableData = buildTableNexos(data);
            break;
        case 'ofertas':
            kpis = buildKPIsOfertas(data);
            tableData = buildTableOfertas(data);
            break;
    }

    // Section descriptions
    const sectionTitles = {
        viralidad: 'Ranking de Contenido por Impacto',
        lideres: 'Ranking de Líderes de Opinión',
        eventos: 'Eventos Próximos y Proyección',
        crecimiento: 'Registros por Mes y Ocupación',
        grupos: 'Grupos por Cantidad de Miembros',
        referentes: 'Ranking de Autoridad en Comunidad',
        tutorias: 'Áreas de Conocimiento en Demanda',
        nexos: 'Estado de Convenios Institucionales',
        ofertas: 'Ranking de Ofertas por Postulaciones'
    };

    const sectionSubtitles = {
        viralidad: 'Ordenado por score de viralidad (FN_CALCULAR_NIVEL_IMPACTO)',
        lideres: 'Ordenado por impacto acumulado en la comunidad',
        eventos: 'Ordenado por fecha de inicio (próximos primero)',
        crecimiento: 'Agrupado por mes y tipo de ocupación',
        grupos: 'Ordenado por cantidad de miembros activos',
        referentes: 'Ordenado por score de autoridad',
        tutorias: 'Top 5 áreas más demandadas',
        nexos: 'Estado actual de convenios',
        ofertas: 'Ordenado por cantidad de postulaciones'
    };

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>${title} - SoyUCAB</title>
    <style>${CSS_STYLES}</style>
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
            <h2 class="section-title">${sectionTitles[reportType] || 'Datos del Reporte'}</h2>
            <p class="section-subtitle">${sectionSubtitles[reportType] || ''}</p>
            
            ${data.length > 0 ? `
            <table>
                <thead><tr>${tableData.headers}</tr></thead>
                <tbody>${tableData.rows}</tbody>
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

module.exports = {
    renderHtmlTemplate,
    REPORT_TITLES,
    REPORT_SUBTITLES
};
