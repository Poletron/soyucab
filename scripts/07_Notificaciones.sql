-- =============================================================================
-- 8. SISTEMA DE NOTIFICACIONES
-- =============================================================================

CREATE TABLE NOTIFICACION (
    clave_notificacion SERIAL PRIMARY KEY,
    correo_usuario VARCHAR(255) NOT NULL,
    tipo_notificacion VARCHAR(50) NOT NULL CHECK (tipo_notificacion IN ('Sistema', 'Conexión', 'Reacción', 'Comentario', 'Mensaje', 'Grupo', 'Evento')),
    mensaje TEXT NOT NULL,
    url_accion VARCHAR(255),
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_notif_usuario FOREIGN KEY (correo_usuario) REFERENCES MIEMBRO(correo_principal)
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_notif_usuario ON NOTIFICACION(correo_usuario);
CREATE INDEX idx_notif_leida ON NOTIFICACION(leida);
