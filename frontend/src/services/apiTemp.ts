
// ============================================
// Bolsa de Trabajo
// ============================================

export interface JobOffer {
    clave_oferta: number;
    correo_organizacion: string;
    titulo_oferta: string;
    descripcion_cargo: string;
    requisitos: string;
    modalidad: string;
    fecha_publicacion: string;
    fecha_vencimiento?: string;
    nombre_organizacion?: string;
    foto_organizacion?: string;
    total_postulaciones?: number;
    estado_postulacion?: string; // Para el usuario actual
    ya_postulado?: boolean;
}

export async function getOffers() {
    const res = await apiFetch('/api/offers');
    return res.json();
}

export async function getOfferDetails(id: number) {
    const res = await apiFetch(`/api/offers/${id}`);
    return res.json();
}

export async function createOffer(data: { titulo: string; descripcion: string; requisitos: string; modalidad: string }) {
    const res = await apiFetch('/api/offers', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function applyToOffer(id: number) {
    const res = await apiFetch(`/api/offers/${id}/apply`, {
        method: 'POST',
    });
    return res.json();
}

export async function getMyPublishedOffers() {
    const res = await apiFetch('/api/offers/my/published');
    return res.json();
}

export async function getMyApplications() {
    const res = await apiFetch('/api/offers/my/applications');
    return res.json();
}
