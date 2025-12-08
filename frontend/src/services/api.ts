/**
 * API Service - Conexión con el backend de SoyUCAB
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Usuario actual (en producción vendría de autenticación)
const getCurrentUserEmail = () => {
    return localStorage.getItem('userEmail') || 'oscar@ucab.edu.ve';
};

/**
 * Fetch wrapper con headers de autenticación
 */
async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'x-user-email': getCurrentUserEmail(),
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
// Health & General
// ============================================

export async function getHealthStatus() {
    const res = await apiFetch('/api/health');
    return res.json();
}

// ============================================
// Feed
// ============================================

export async function getFeed() {
    const res = await apiFetch('/api/feed');
    return res.json();
}

export async function getFeedStats() {
    const res = await apiFetch('/api/feed/stats');
    return res.json();
}

// ============================================
// Reportes
// ============================================

export type ReportType = 'viralidad' | 'lideres' | 'eventos';

export async function getReportTypes() {
    const res = await apiFetch('/api/report/types');
    return res.json();
}

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
                'x-user-email': getCurrentUserEmail(),
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
            eventos: 'interes_eventos'
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

// ============================================
// Autenticación
// ============================================

export interface UserProfile {
    email: string;
    nombre: string;
    apellido: string;
    foto?: string;
    fechaRegistro?: string;
    ubicacion?: string;
    biografia?: string;
}

export interface LoginResponse {
    success: boolean;
    message?: string;
    error?: string;
    user?: UserProfile;
}

export interface RegisterData {
    email: string;
    password?: string;
    nombre: string;
    apellido: string;
    fechaNacimiento?: string;
    ubicacion?: string;
}

/**
 * Iniciar sesión
 */
export async function login(email: string, password?: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success && data.user) {
        // Guardar email en localStorage
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', `${data.user.nombre} ${data.user.apellido}`);
    }

    return data;
}

/**
 * Registrar nuevo usuario
 */
export async function register(userData: RegisterData): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (data.success && data.user) {
        // Guardar email en localStorage
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', `${data.user.nombre} ${data.user.apellido}`);
    }

    return data;
}

/**
 * Obtener perfil del usuario actual
 */
export async function getProfile(): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    const res = await apiFetch('/api/auth/profile');
    return res.json();
}

/**
 * Verificar si hay sesión activa
 */
export function isAuthenticated(): boolean {
    return !!localStorage.getItem('userEmail');
}

/**
 * Obtener datos del usuario guardados
 */
export function getCurrentUser(): { email: string; name: string } | null {
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName');
    if (email) {
        return { email, name: name || 'Usuario' };
    }
    return null;
}

// ============================================
// Utilidades
// ============================================

export function setCurrentUser(email: string) {
    localStorage.setItem('userEmail', email);
}

export function logout() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
}
