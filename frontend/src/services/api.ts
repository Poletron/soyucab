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

export type ReportType = 'viralidad' | 'lideres' | 'eventos' | 'crecimiento' | 'grupos' | 'referentes' | 'tutorias' | 'nexos' | 'ofertas';

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
            eventos: 'interes_eventos',
            crecimiento: 'crecimiento_red',
            grupos: 'grupos_interes',
            referentes: 'referentes',
            tutorias: 'tutorias',
            nexos: 'nexos',
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

// ============================================
// Autenticación
// ============================================

export interface UserProfile {
    email: string;
    nombre: string;
    apellido: string;
    foto?: string;
    fecha_registro?: string;
    biografia?: string;
    ciudad_residencia?: string;
    pais_residencia?: string;
    tipo?: 'Persona' | 'Organizacion';
    rif?: string;
    tipo_entidad?: string;
}

export interface LoginResponse {
    success: boolean;
    message?: string;
    error?: string;
    user?: UserProfile;
    roles?: string[];
}

export interface RegisterData {
    email: string;
    password?: string;
    nombre?: string;
    apellido?: string;
    fechaNacimiento?: string;
    // Location splits
    pais?: string;
    ciudad?: string;
    // Organization fields
    type?: 'persona' | 'organizacion';
    organizationName?: string;
    rif?: string;
    entityType?: string;
    description?: string;
    // Legacy support (to be removed if unused)
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
export function getCurrentUser(): { email: string; name: string; foto?: string } | null {
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName');
    const foto = localStorage.getItem('userFoto');
    if (email) {
        return { email, name: name || 'Usuario', foto: foto || undefined };
    }
    return null;
}

// ============================================
// Utilidades
// ============================================

export function setCurrentUser(email: string, name?: string, foto?: string) {
    localStorage.setItem('userEmail', email);
    if (name) localStorage.setItem('userName', name);
    if (foto) localStorage.setItem('userFoto', foto);
}

export function logout() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userFoto');
}

/**
 * Get user statistics (connections, groups, posts)
 */
export async function getUserStats(): Promise<{ success: boolean; stats?: { total_conexiones: number; total_grupos: number; total_publicaciones: number }; error?: string }> {
    const res = await apiFetch('/api/auth/stats');
    return res.json();
}

// ============================================
// Contenido CRUD (Posts, Eventos)
// ============================================

export interface CreatePostData {
    texto: string;
    visibilidad?: 'Público' | 'Solo Conexiones' | 'Privado';
    tipo?: 'publicacion' | 'evento';
    evento?: {
        titulo: string;
        fecha_inicio: string;
        fecha_fin: string;
        ciudad?: string;
        pais?: string;
    };
}

export async function createPost(data: CreatePostData) {
    const res = await apiFetch('/api/content', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function deletePost(id: number) {
    const res = await apiFetch(`/api/content/${id}`, {
        method: 'DELETE',
    });
    return res.json();
}

// Crear evento
export interface CreateEventData {
    titulo: string;
    descripcion?: string;
    fecha_inicio: string;
    hora_inicio?: string;
    fecha_fin?: string;
    hora_fin?: string;
    ubicacion?: string;
    visibilidad?: string;
}

export async function createEvent(data: CreateEventData) {
    const res = await apiFetch('/api/events', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function getUpcomingEvents() {
    const res = await apiFetch('/api/events');
    return res.json();
}

export async function reactToPost(id: number, reaccion: string = 'Me Gusta') {
    const res = await apiFetch(`/api/content/${id}/react`, {
        method: 'POST',
        body: JSON.stringify({ reaccion }),
    });
    return res.json();
}

export async function removeReaction(id: number) {
    const res = await apiFetch(`/api/content/${id}/react`, {
        method: 'DELETE',
    });
    return res.json();
}

export async function commentOnPost(id: number, texto: string) {
    const res = await apiFetch(`/api/content/${id}/comment`, {
        method: 'POST',
        body: JSON.stringify({ texto }),
    });
    return res.json();
}

export async function getComments(id: number) {
    const res = await apiFetch(`/api/content/${id}/comments`);
    return res.json();
}



// ============================================
// Conexiones Sociales
// ============================================

export async function getConnections() {
    const res = await apiFetch('/api/connections');
    return res.json();
}

export async function getPendingRequests() {
    const res = await apiFetch('/api/connections/pending');
    return res.json();
}

export async function sendConnectionRequest(correo_destino: string) {
    const res = await apiFetch('/api/connections/request', {
        method: 'POST',
        body: JSON.stringify({ correo_destino }),
    });
    return res.json();
}

export async function acceptConnectionRequest(id: number) {
    const res = await apiFetch(`/api/connections/accept/${id}`, {
        method: 'PUT',
    });
    return res.json();
}

export async function rejectConnectionRequest(id: number) {
    const res = await apiFetch(`/api/connections/reject/${id}`, {
        method: 'PUT',
    });
    return res.json();
}

export async function getConnectionStatus(correo: string) {
    const res = await apiFetch(`/api/connections/status/${encodeURIComponent(correo)}`);
    return res.json();
}

// ============================================
// Uploads
// ============================================

export async function uploadImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
            'x-user-email': getCurrentUserEmail(),
        },
        body: formData,
    });

    return response.json();
}

export async function uploadProfilePhoto(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/api/upload/profile`, {
        method: 'POST',
        headers: {
            'x-user-email': getCurrentUserEmail(),
        },
        body: formData,
    });

    return response.json();
}

// ============================================
// Perfil (Update)
// ============================================

export interface ProfileUpdateData {
    nombre?: string;
    apellido?: string;
    biografia?: string;
    pais?: string;
    ciudad?: string;
}

export async function updateProfile(data: ProfileUpdateData) {
    const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return res.json();
}

// ============================================
// Mensajería
// ============================================

export interface Conversation {
    clave_conversacion: number;
    titulo_chat?: string;
    tipo_conversacion: string;
    fecha_creacion_chat: string;
    ultimo_mensaje?: string;
    fecha_ultimo_mensaje?: string;
    mensajes_sin_leer: number;
    otros_participantes: string[];
}

export interface Message {
    clave_mensaje: number;
    fecha_hora_envio: string;
    correo_autor_mensaje: string;
    texto_mensaje: string;
    estado_mensaje: string;
    nombres?: string;
    apellidos?: string;
    fotografia_url?: string;
}

export async function getConversations(): Promise<{ success: boolean; data: Conversation[] }> {
    const res = await apiFetch('/api/messages/conversations');
    return res.json();
}

export async function getMessages(conversationId: number): Promise<{ success: boolean; data: Message[] }> {
    const res = await apiFetch(`/api/messages/${conversationId}`);
    return res.json();
}

export async function sendMessage(conversacionId: number, texto: string) {
    const res = await apiFetch('/api/messages/send', {
        method: 'POST',
        body: JSON.stringify({ conversacion_id: conversacionId, texto }),
    });
    return res.json();
}

export async function startConversation(correoDestino: string, mensajeInicial?: string) {
    const res = await apiFetch('/api/messages/conversation/start', {
        method: 'POST',
        body: JSON.stringify({ correo_destino: correoDestino, mensaje_inicial: mensajeInicial }),
    });
    return res.json();
}

export async function getConversationInfo(conversationId: number) {
    const res = await apiFetch(`/api/messages/conversation/${conversationId}/info`);
    return res.json();
}

// ============================================
// Búsqueda de Usuarios
// ============================================

export interface UserSearchResult {
    correo_principal: string;
    nombres: string;
    apellidos: string;
    biografia?: string;
    fotografia_url?: string;
    estado_conexion: 'conectado' | 'pendiente_enviada' | 'pendiente_recibida' | 'no_conectado';
    total_conexiones: number;
}

export async function searchUsers(query: string): Promise<{ success: boolean; data: UserSearchResult[] }> {
    const res = await apiFetch(`/api/users/search?q=${encodeURIComponent(query)}`);
    return res.json();
}

export async function getUserProfile(email: string) {
    const res = await apiFetch(`/api/users/${encodeURIComponent(email)}`);
    return res.json();
}

export async function getConnectionSuggestions(): Promise<{ success: boolean; data: UserSearchResult[] }> {
    const res = await apiFetch('/api/users/suggestions/connect');
    return res.json();
}

// ============================================
// Ofertas Laborales
// ============================================

export interface JobOffer {
    clave_oferta: number;
    correo_organizacion: string;
    fecha_publicacion: string;
    fecha_vencimiento?: string;
    titulo_oferta: string;
    descripcion_cargo: string;
    requisitos?: string;
    modalidad: 'Presencial' | 'Remoto' | 'Híbrido';
    nombre_organizacion: string;
    tipo_entidad: string;
    foto_organizacion?: string;
    total_postulaciones: number;
}

export async function getOffers(): Promise<{ success: boolean; data: JobOffer[] }> {
    const res = await apiFetch('/api/offers');
    return res.json();
}

export async function getOfferDetail(id: number) {
    const res = await apiFetch(`/api/offers/${id}`);
    return res.json();
}

export async function createOffer(data: {
    titulo: string;
    descripcion: string;
    requisitos?: string;
    modalidad: string;
}) {
    const res = await apiFetch('/api/offers', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function applyToOffer(offerId: number) {
    const res = await apiFetch(`/api/offers/${offerId}/apply`, {
        method: 'POST',
    });
    return res.json();
}

export async function getMyApplications() {
    const res = await apiFetch('/api/offers/my/applications');
    return res.json();
}

export async function getMyPublishedOffers() {
    const res = await apiFetch('/api/offers/my/published');
    return res.json();
}

// ============================================
// Grupos de Interés
// ============================================

export interface Group {
    nombre_grupo: string;
    descripcion_grupo?: string;
    visibilidad: 'Publico' | 'Privado' | 'Secreto';
    correo_creador: string;
    fecha_creacion: string;
    total_miembros?: number;
    es_miembro?: boolean;
}

export async function getGroups(): Promise<{ success: boolean; data: Group[] }> {
    const res = await apiFetch('/api/groups');
    return res.json();
}

export async function getGroupDetails(name: string): Promise<{ success: boolean; data: Group }> {
    const res = await apiFetch(`/api/groups/${encodeURIComponent(name)}`);
    return res.json();
}

export async function createGroup(data: {
    nombre: string;
    descripcion: string;
    visibilidad: string;
}) {
    const res = await apiFetch('/api/groups', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function joinGroup(name: string) {
    const res = await apiFetch(`/api/groups/${encodeURIComponent(name)}/join`, {
        method: 'POST',
    });
    return res.json();
}

export async function leaveGroup(name: string) {
    const res = await apiFetch(`/api/groups/${encodeURIComponent(name)}/leave`, {
        method: 'POST',
    });
    return res.json();
}

export async function getMyGroups(): Promise<{ success: boolean; data: Group[] }> {
    const res = await apiFetch('/api/groups/my');
    return res.json();
}

// ============================================
// TUTORING
// ============================================

export async function searchTutors(query: string, subject: string) {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (subject) params.append('subject', subject);

    const res = await apiFetch(`/api/tutoring/search?${params.toString()}`);
    return res.json();
}

export async function getMyMentorships() {
    const res = await apiFetch('/api/tutoring/my-connections');
    return res.json();
}

export async function requestMentorship(tutoriaId: number) {
    const res = await apiFetch('/api/tutoring/request', {
        method: 'POST',
        body: JSON.stringify({ tutoriaId }),
    });
    return res.json();
}

export async function registerAsTutor(data: { subjects: string, experience: string, description: string }) {
    const res = await apiFetch('/api/tutoring/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return res.json();
}
