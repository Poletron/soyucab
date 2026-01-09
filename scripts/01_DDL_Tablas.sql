-- =============================================================================
-- SCRIPT DE CREACIÓN DE TABLAS - PROYECTO SOYUCAB
-- Base de Datos: PostgreSQL
-- Equipo: Oscar Jaramillo, Luis Torres, Pedro Urdaneta
-- =============================================================================

-- =============================================================================
-- 1. ACTORES CENTRALES
-- =============================================================================

CREATE TABLE MIEMBRO (
    correo_principal VARCHAR(255) PRIMARY KEY,
    contrasena_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP NOT NULL,
    fotografia_url VARCHAR(255),
    CONSTRAINT check_formato_correo CHECK (correo_principal ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE PERSONA (
    correo_principal VARCHAR(255) PRIMARY KEY,
    cedula VARCHAR(20),
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    sexo VARCHAR(20),
    biografia TEXT,
    pais_residencia VARCHAR(100),
    ciudad_residencia VARCHAR(100),
    CONSTRAINT fk_persona_miembro FOREIGN KEY (correo_principal) REFERENCES MIEMBRO(correo_principal),
    CONSTRAINT check_sexo_valido CHECK (sexo IN ('Masculino', 'Femenino', 'Otro', 'Prefiero no decirlo')),
    CONSTRAINT check_fecha_nacimiento CHECK (fecha_nacimiento < CURRENT_DATE)
);

CREATE TABLE ENTIDAD_ORGANIZACIONAL (
    correo_principal VARCHAR(255) PRIMARY KEY,
    rif VARCHAR(20) NOT NULL UNIQUE,
    nombre_oficial VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_entidad VARCHAR(50) NOT NULL CHECK (tipo_entidad IN ('Dependencia UCAB', 'Aliado Externo', 'Grupo de Investigación')),
    pais_ubicacion VARCHAR(100),
    ciudad_ubicacion VARCHAR(100),
    CONSTRAINT fk_entidad_miembro FOREIGN KEY (correo_principal) REFERENCES MIEMBRO(correo_principal),
    CONSTRAINT check_formato_rif CHECK (rif ~ '^[JVEGP]-[0-9]+-[0-9]$')
);

-- =============================================================================
-- 2. MENSAJERÍA
-- =============================================================================

CREATE TABLE CONVERSACION (
    clave_conversacion SERIAL PRIMARY KEY,
    correo_creador VARCHAR(255) NOT NULL,
    fecha_creacion_chat TIMESTAMP NOT NULL,
    titulo_chat VARCHAR(100),
    tipo_conversacion VARCHAR(20),
    CONSTRAINT fk_conv_creador FOREIGN KEY (correo_creador) REFERENCES PERSONA(correo_principal),
    CONSTRAINT check_tipo_conversacion CHECK (tipo_conversacion IN ('Privada', 'Grupal'))
);

CREATE TABLE PARTICIPA_EN (
    clave_participacion SERIAL PRIMARY KEY,
    fk_conversacion INTEGER NOT NULL,
    correo_participante VARCHAR(255) NOT NULL,
    fecha_ingreso TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_participa_chat FOREIGN KEY (fk_conversacion) REFERENCES CONVERSACION(clave_conversacion),
    CONSTRAINT fk_participa_persona FOREIGN KEY (correo_participante) REFERENCES PERSONA(correo_principal),
    CONSTRAINT uq_participa_chat UNIQUE (fk_conversacion, correo_participante) 
);

CREATE TABLE MENSAJE (
    clave_mensaje SERIAL PRIMARY KEY,
    fk_conversacion INTEGER NOT NULL,
    fecha_hora_envio TIMESTAMP NOT NULL,
    correo_autor_mensaje VARCHAR(255) NOT NULL,
    texto_mensaje TEXT NOT NULL,
    estado_mensaje VARCHAR(20) NOT NULL CHECK (estado_mensaje IN ('Enviado', 'Leído', 'Entregado')),
    
    CONSTRAINT fk_mensaje_chat FOREIGN KEY (fk_conversacion) REFERENCES CONVERSACION(clave_conversacion),
    CONSTRAINT fk_mensaje_autor FOREIGN KEY (correo_autor_mensaje) REFERENCES PERSONA(correo_principal)
);

-- =============================================================================
-- 3. GRUPOS DE INTERÉS
-- =============================================================================

CREATE TABLE GRUPO_INTERES (
    nombre_grupo VARCHAR(150) PRIMARY KEY,
    descripcion_grupo TEXT,
    visibilidad VARCHAR(20) NOT NULL,
    correo_creador VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    CONSTRAINT CK_VISIBILIDAD_SEGURA CHECK (visibilidad IN ('Público', 'Privado')),
    CONSTRAINT fk_grupo_creador FOREIGN KEY (correo_creador) REFERENCES MIEMBRO(correo_principal)
);

CREATE TABLE PERTENECE_A_GRUPO (
    clave_pertenencia SERIAL PRIMARY KEY,
    correo_persona VARCHAR(255) NOT NULL,
    nombre_grupo VARCHAR(150) NOT NULL,
    fecha_union TIMESTAMP NOT NULL,
    rol_en_grupo VARCHAR(30) NOT NULL CHECK (rol_en_grupo IN ('Miembro', 'Moderador', 'Administrador')),
    CONSTRAINT fk_pert_persona FOREIGN KEY (correo_persona) REFERENCES PERSONA(correo_principal),
    CONSTRAINT fk_pert_grupo FOREIGN KEY (nombre_grupo) REFERENCES GRUPO_INTERES(nombre_grupo)
);

-- =============================================================================
-- 4. CONTENIDO E INTERACCIONES
-- =============================================================================

CREATE TABLE CONTENIDO (
    clave_contenido SERIAL PRIMARY KEY,
    correo_autor VARCHAR(255) NOT NULL,
    fecha_hora_creacion TIMESTAMP NOT NULL,
    texto_contenido TEXT,
    visibilidad VARCHAR(30) NOT NULL CHECK (visibilidad IN ('Público', 'Solo Conexiones', 'Privado')),
    archivo_url VARCHAR(255),
    -- FK opcional para posts de grupo (NULL = feed global)
    nombre_grupo VARCHAR(150) DEFAULT NULL,
    CONSTRAINT fk_contenido_autor FOREIGN KEY (correo_autor) REFERENCES MIEMBRO(correo_principal),
    CONSTRAINT fk_contenido_grupo FOREIGN KEY (nombre_grupo) REFERENCES GRUPO_INTERES(nombre_grupo)
);

-- Índice para optimizar consultas de feed de grupo
CREATE INDEX idx_contenido_nombre_grupo ON CONTENIDO(nombre_grupo);

CREATE TABLE PUBLICACION (
    clave_publicacion SERIAL PRIMARY KEY,
    fk_contenido INTEGER NOT NULL UNIQUE,
    CONSTRAINT fk_publicacion_contenido FOREIGN KEY (fk_contenido) REFERENCES CONTENIDO(clave_contenido)
);

CREATE TABLE EVENTO (
    clave_evento SERIAL PRIMARY KEY,
    fk_contenido INTEGER NOT NULL UNIQUE,
    titulo VARCHAR(255) NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    pais_ubicacion VARCHAR(100),
    ciudad_ubicacion VARCHAR(100),
    CONSTRAINT fk_evento_contenido FOREIGN KEY (fk_contenido) REFERENCES CONTENIDO(clave_contenido),
    CONSTRAINT check_fechas_evento CHECK (fecha_fin > fecha_inicio)
);

CREATE TABLE COMENTARIO (
    clave_comentario SERIAL PRIMARY KEY,
    fk_contenido INTEGER NOT NULL, 
    fecha_hora_comentario TIMESTAMP NOT NULL,
    correo_autor_comentario VARCHAR(255) NOT NULL,
    fk_comentario_padre INTEGER, 
    texto_comentario TEXT NOT NULL,
    
    CONSTRAINT fk_comentario_contenido FOREIGN KEY (fk_contenido) REFERENCES CONTENIDO(clave_contenido),
    CONSTRAINT fk_comentario_autor FOREIGN KEY (correo_autor_comentario) REFERENCES MIEMBRO(correo_principal),
    CONSTRAINT fk_comentario_padre_ref FOREIGN KEY (fk_comentario_padre) REFERENCES COMENTARIO(clave_comentario),
    CONSTRAINT check_comentario_no_vacio CHECK (LENGTH(TRIM(texto_comentario)) > 0)
);

CREATE TABLE TIPO_REACCION (
    nombre_reaccion VARCHAR(50) PRIMARY KEY,
    descripcion VARCHAR(255),
    url_icono VARCHAR(255)
);

CREATE TABLE REACCIONA_CONTENIDO (
    clave_reaccion SERIAL PRIMARY KEY,
    correo_miembro VARCHAR(255) NOT NULL,
    fk_contenido INTEGER NOT NULL,
    nombre_reaccion VARCHAR(50) NOT NULL,
    fecha_hora_reaccion TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_reacc_cont_miembro FOREIGN KEY (correo_miembro) REFERENCES MIEMBRO(correo_principal),
    CONSTRAINT fk_reacc_cont_contenido FOREIGN KEY (fk_contenido) REFERENCES CONTENIDO(clave_contenido),
    CONSTRAINT fk_reacc_cont_tipo FOREIGN KEY (nombre_reaccion) REFERENCES TIPO_REACCION(nombre_reaccion),
    CONSTRAINT uq_reaccion_unica_por_usuario UNIQUE (correo_miembro, fk_contenido)
);

CREATE TABLE REACCIONA_COMENTARIO (
    clave_reaccion SERIAL PRIMARY KEY,
    correo_miembro VARCHAR(255) NOT NULL,
    fk_comentario INTEGER NOT NULL,
    nombre_reaccion VARCHAR(50) NOT NULL,
    fecha_hora_reaccion TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_reacc_coment_miembro FOREIGN KEY (correo_miembro) REFERENCES MIEMBRO(correo_principal),
    CONSTRAINT fk_reacc_coment_comentario FOREIGN KEY (fk_comentario) REFERENCES COMENTARIO(clave_comentario),
    CONSTRAINT fk_reacc_coment_tipo FOREIGN KEY (nombre_reaccion) REFERENCES TIPO_REACCION(nombre_reaccion)
);



-- =============================================================================
-- 5. CONEXIONES SOCIALES
-- =============================================================================

CREATE TABLE SOLICITA_CONEXION (
    clave_solicitud SERIAL PRIMARY KEY,
    correo_solicitante VARCHAR(255) NOT NULL,
    correo_solicitado VARCHAR(255) NOT NULL,
    fecha_solicitud TIMESTAMP NOT NULL,
    estado_solicitud VARCHAR(20) NOT NULL,
    CONSTRAINT CK_FLUJO_SOLICITUD CHECK (estado_solicitud IN ('Pendiente', 'Aceptada', 'Rechazada')),
    CONSTRAINT CK_GRAFO_ANTI_REFLEXIVO CHECK (correo_solicitante <> correo_solicitado),
    CONSTRAINT fk_solicitante FOREIGN KEY (correo_solicitante) REFERENCES PERSONA(correo_principal),
    CONSTRAINT fk_solicitado FOREIGN KEY (correo_solicitado) REFERENCES PERSONA(correo_principal),
    CONSTRAINT check_narcisismo CHECK (correo_solicitante <> correo_solicitado)
);

CREATE TABLE TIPO_NEXO (
    nombre_nexo VARCHAR(100) PRIMARY KEY,
    descripcion TEXT
);

CREATE TABLE TIENE_NEXO (
    clave_nexo SERIAL PRIMARY KEY,
    correo_persona VARCHAR(255) NOT NULL,
    correo_organizacion VARCHAR(255) NOT NULL,
    nombre_nexo VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    CONSTRAINT fk_nexo_persona FOREIGN KEY (correo_persona) REFERENCES PERSONA(correo_principal),
    CONSTRAINT fk_nexo_org FOREIGN KEY (correo_organizacion) REFERENCES ENTIDAD_ORGANIZACIONAL(correo_principal),
    CONSTRAINT fk_nexo_tipo FOREIGN KEY (nombre_nexo) REFERENCES TIPO_NEXO(nombre_nexo),
    CONSTRAINT check_fechas_nexo CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
);

-- =============================================================================
-- 6. TUTORÍAS Y CONFIGURACIÓN
-- =============================================================================

CREATE TABLE TUTORIA (
    clave_tutoria SERIAL PRIMARY KEY,
    correo_tutor VARCHAR(255) NOT NULL,
    area_conocimiento VARCHAR(150) NOT NULL,
    fecha_alta TIMESTAMP NOT NULL,
    descripcion_enfoque TEXT,
    CONSTRAINT fk_tutoria_tutor FOREIGN KEY (correo_tutor) REFERENCES PERSONA(correo_principal)
);

CREATE TABLE SOLICITA_TUTORIA (
    clave_solicitud SERIAL PRIMARY KEY,
    correo_solicitante VARCHAR(255) NOT NULL,
    fk_tutoria INTEGER NOT NULL, 
    fecha_solicitud TIMESTAMP NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('Enviada', 'Aceptada', 'Rechazada', 'Completada')),
    
    CONSTRAINT fk_sol_tut_solicitante FOREIGN KEY (correo_solicitante) REFERENCES PERSONA(correo_principal),
    CONSTRAINT fk_sol_tut_tutoria FOREIGN KEY (fk_tutoria) REFERENCES TUTORIA(clave_tutoria),
    CONSTRAINT uq_solicitud_tutoria_unica UNIQUE (correo_solicitante, fk_tutoria)
);

CREATE TABLE CONFIGURACION (
    correo_miembro VARCHAR(255) PRIMARY KEY,
    visibilidad_perfil VARCHAR(30) NOT NULL CHECK (visibilidad_perfil IN ('Público', 'Solo Conexiones', 'Privado')),
    notif_comentarios BOOLEAN DEFAULT TRUE,
    notif_eventos BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_config_miembro FOREIGN KEY (correo_miembro) REFERENCES MIEMBRO(correo_principal)
);

-- =============================================================================
-- 7. OPORTUNIDADES (OFERTAS LABORALES)
-- =============================================================================

CREATE TABLE OFERTA_LABORAL (
    clave_oferta SERIAL PRIMARY KEY,
    correo_organizacion VARCHAR(255) NOT NULL,
    fecha_publicacion TIMESTAMP NOT NULL,
    fecha_vencimiento TIMESTAMP, 
    titulo_oferta VARCHAR(255) NOT NULL,
    descripcion_cargo TEXT NOT NULL,
    requisitos TEXT,
    modalidad VARCHAR(20) NOT NULL CHECK (modalidad IN ('Presencial', 'Remoto', 'Híbrido')),
    CONSTRAINT fk_oferta_org FOREIGN KEY (correo_organizacion) REFERENCES ENTIDAD_ORGANIZACIONAL(correo_principal),
    CONSTRAINT check_fechas_oferta CHECK (fecha_vencimiento IS NULL OR fecha_vencimiento > fecha_publicacion)
);

CREATE TABLE SE_POSTULA (
    clave_postulacion SERIAL PRIMARY KEY,
    correo_persona VARCHAR(255) NOT NULL,
    fk_oferta INTEGER NOT NULL,
    fecha_postulacion TIMESTAMP NOT NULL,
    estado_postulacion VARCHAR(20) NOT NULL CHECK (estado_postulacion IN ('Enviada', 'En Revisión', 'Rechazada', 'Aceptada')),
    
    CONSTRAINT fk_postula_persona FOREIGN KEY (correo_persona) REFERENCES PERSONA(correo_principal),
    CONSTRAINT fk_postula_oferta FOREIGN KEY (fk_oferta) REFERENCES OFERTA_LABORAL(clave_oferta),
    CONSTRAINT uq_postulacion_unica UNIQUE (correo_persona, fk_oferta)
);

-- =============================================================================
-- 8. ROLES Y PERMISOS
-- =============================================================================

CREATE TABLE ROL (
    nombre_rol VARCHAR(50) PRIMARY KEY,
    descripcion TEXT
);

CREATE TABLE MIEMBRO_POSEE_ROL (
    clave_miembro_rol SERIAL PRIMARY KEY,
    correo_miembro VARCHAR(255) NOT NULL,
    nombre_rol VARCHAR(50) NOT NULL,
    fecha_asignacion TIMESTAMP NOT NULL,
    CONSTRAINT fk_posee_miembro FOREIGN KEY (correo_miembro) REFERENCES MIEMBRO(correo_principal),
    CONSTRAINT fk_posee_rol FOREIGN KEY (nombre_rol) REFERENCES ROL(nombre_rol)
);

-- =============================================================================
-- 9. SISTEMA DE NOTIFICACIONES (Requisito implícito RF 7.2)
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