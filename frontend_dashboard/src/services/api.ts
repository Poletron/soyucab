/**
 * API Service - Conexión con el backend de SoyUCAB
 * Dashboard Ejecutivo (sin autenticación requerida)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Fetch wrapper simplificado (sin autenticación)
 */
async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const headers = {
        'Content-Type': 'application/json',
        // Usuario por defecto para el dashboard de demostración
        'x-user-email': 'demo@ucab.edu.ve',
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response;
}

// ============================================
// Reportes
// ============================================

export type ReportType = 'viralidad' | 'lideres' | 'eventos' | 'crecimiento' | 'grupos' | 'referentes' | 'tutorias' | 'nexos' | 'ofertas';

export async function getReportPreview(reportType: ReportType) {
    const res = await apiFetch(`/api/report/preview/${reportType}`);
    return res.json();
}

export async function generateReportPDF(reportType: ReportType): Promise<Blob> {
    const res = await apiFetch('/api/report/generate', {
        method: 'POST',
        body: JSON.stringify({ reportType }),
    });
    return res.blob();
}

/**
 * Descarga el PDF del reporte
 */
export async function downloadReportPDF(reportType: ReportType, filename?: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/report/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-email': 'demo@ucab.edu.ve',
            },
            body: JSON.stringify({ reportType }),
        });

        if (!response.ok) {
            throw new Error(`Error generating PDF: ${response.status}`);
        }

        // Generate filename with date
        const date = new Date().toISOString().split('T')[0];
        const reportNames: Record<ReportType, string> = {
            viralidad: 'contenido_viral',
            lideres: 'lideres_opinion',
            eventos: 'interes_eventos',
            crecimiento: 'crecimiento_demografico',
            grupos: 'grupos_activos',
            referentes: 'referentes_comunidad',
            tutorias: 'areas_tutorias',
            nexos: 'nexos_vigentes',
            ofertas: 'ofertas_laborales'
        };
        const downloadFilename = filename || `reporte_${reportNames[reportType]}_${date}.pdf`;

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading PDF:', error);
        throw error;
    }
}
