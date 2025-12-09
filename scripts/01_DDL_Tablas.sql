-- =============================================================================
-- SCRIPT DE CREACIÓN DE TABLAS - PROYECTO SOYUCAB
-- Base de Datos: PostgreSQL
-- Equipo: Oscar Jaramillo, Luis Torres, Pedro Urdaneta
-- Versión Corregida según Modelo Relacional
-- =============================================================================

-- =============================================================================
-- 1. ACTORES CENTRALES
-- =============================================================================

CREATE TABLE MIEMBRO (
    correo_principal VARCHAR(255) PRIMARY KEY,
    contrasena_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP NOT NULL,
    fotografia_url VARCHAR(255)
);

CREATE TABLE PERSONA (
    correo_principal VARCHAR(255) PRIMARY KEY,
    cedula VARCHAR(20), -- Agregado para integridad con MD, aunque no en DD original
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    sexo VARCHAR(20),
    biografia TEXT,
    pais_residencia VARCHAR(100),
    ciudad_residencia VARCHAR(100),
    CONSTRAINT fk_persona_miembro FOREIGN KEY (correo_principal) REFERENCES MIEMBRO(correo_principal)
);

CREATE TABLE ENTIDAD_ORGANIZACIONAL (
    correo_principal VARCHAR(255) PRIMARY KEY,
    rif VARCHAR(20) NOT NULL UNIQUE,
    nombre_oficial VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_entidad VARCHAR(50) NOT NULL CHECK (tipo_entidad IN ('Dependencia UCAB', 'Aliado Externo', 'Grupo de Investigación')),
    pais_ubicacion VARCHAR(100),
    ciudad_ubicacion VARCHAR(100),
    CONSTRAINT fk_entidad_miembro FOREIGN KEY (correo_principal) REFERENCES MIEMBRO(correo_principal)
);

-- =============================================================================
-- 2. MENSAJERÍA
-- =============================================================================

CREATE TABLE CONVERSACION (
    correo_creador VARCHAR(255) NOT NULL,
    fecha_creacion_chat TIMESTAMP NOT NULL,
    titulo_chat VARCHAR(100),
    tipo_conversacion VARCHAR(20),
    PRIMARY KEY (correo_creador, fecha_creacion_chat),
    CONSTRAINT fk_conv_creador FOREIGN KEY (correo_creador) REFERENCES PERSONA(correo_principal)
);

CREATE TABLE PARTICIPA_EN (
    correo_creador_chat VARCHAR(255) NOT NULL,
    fecha_creacion_chat TIMESTAMP NOT NULL,
    correo_participante VARCHAR(255) NOT NULL,
    fecha_ingreso TIMESTAMP NOT NULL,
    PRIMARY KEY (correo_creador_chat, fecha_creacion_chat, correo_participante),
    CONSTRAINT fk_participa_chat FOREIGN KEY (correo_creador_chat, fecha_creacion_chat) REFERENCES CONVERSACION(correo_creador, fecha_creacion_chat),
    CONSTRAINT fk_participa_persona FOREIGN KEY (correo_participante) REFERENCES PERSONA(correo_principal)
);

CREATE TABLE MENSAJE (
    correo_creador_chat VARCHAR(255) NOT NULL,
    fecha_creacion_chat TIMESTAMP NOT NULL,
    fecha_hora_envio TIMESTAMP NOT NULL,
    correo_autor_mensaje VARCHAR(255) NOT NULL,
    texto_mensaje TEXT NOT NULL,
    estado_mensaje VARCHAR(20) NOT NULL CHECK (estado_mensaje IN ('Enviado', 'Leído', 'Entregado')),
    PRIMARY KEY (correo_creador_chat, fecha_creacion_chat, fecha_hora_envio),
    CONSTRAINT fk_mensaje_chat FOREIGN KEY (correo_creador_chat, fecha_creacion_chat) REFERENCES CONVERSACION(correo_creador, fecha_creacion_chat),
    CONSTRAINT fk_mensaje_autor FOREIGN KEY (correo_autor_mensaje) REFERENCES PERSONA(correo_principal)
);

-- =============================================================================
-- 3. CONTENIDO E INTERACCIONES
-- =============================================================================

CREATE TABLE CONTENIDO (
    correo_autor VARCHAR(255) NOT NULL,
    fecha_hora_creacion TIMESTAMP NOT NULL,
    texto_contenido TEXT,
    visibilidad VARCHAR(30) NOT NULL CHECK (visibilidad IN ('Público', 'Solo Conexiones', 'Privado')),
    archivo_url VARCHAR(255),
    PRIMARY KEY (correo_autor, fecha_hora_creacion),
    CONSTRAINT fk_contenido_autor FOREIGN KEY (correo_autor) REFERENCES MIEMBRO(correo_principal)
);

CREATE TABLE PUBLICACION (
    correo_autor VARCHAR(255) NOT NULL,
    fecha_hora_creacion TIMESTAMP NOT NULL,
    PRIMARY KEY (correo_autor, fecha_hora_creacion),
    CONSTRAINT fk_publicacion_contenido FOREIGN KEY (correo_autor, fecha_hora_creacion) REFERENCES CONTENIDO(correo_autor, fecha_hora_creacion)
);

CREATE TABLE EVENTO (
    correo_autor VARCHAR(255) NOT NULL,
    fecha_hora_creacion TIMESTAMP NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    pais_ubicacion VARCHAR(100),
    ciudad_ubicacion VARCHAR(100),
    PRIMARY KEY (correo_autor, fecha_hora_creacion),
    CONSTRAINT fk_evento_contenido FOREIGN KEY (correo_autor, fecha_hora_creacion) REFERENCES CONTENIDO(correo_autor, fecha_hora_creacion),
    CONSTRAINT check_fechas_evento CHECK (fecha_fin > fecha_inicio)
);

CREATE TABLE COMENTARIO (
    fk_contenido_autor VARCHAR(255) NOT NULL,
    fk_contenido_fecha TIMESTAMP NOT NULL,
    fecha_hora_comentario TIMESTAMP NOT NULL,
    correo_autor_comentario VARCHAR(255) NOT NULL,
    texto_comentario TEXT NOT NULL,
    fk_padre_autor_cont VARCHAR(255),
    fk_padre_fecha_cont TIMESTAMP,
    fk_padre_fecha_coment TIMESTAMP,
    PRIMARY KEY (fk_contenido_autor, fk_contenido_fecha, fecha_hora_comentario),
    CONSTRAINT fk_comentario_contenido FOREIGN KEY (fk_contenido_autor, fk_contenido_fecha) REFERENCES CONTENIDO(correo_autor, fecha_hora_creacion),
    CONSTRAINT fk_comentario_autor FOREIGN KEY (correo_autor_comentario) REFERENCES MIEMBRO(correo_principal),
    CONSTRAINT fk_comentario_padre FOREIGN KEY (fk_padre_autor_cont, fk_padre_fecha_cont, fk_padre_fecha_coment) REFERENCES COMENTARIO(fk_contenido_autor, fk_contenido_fecha, fecha_hora_comentario),
    -- Constraint de calidad: evita comentarios vacíos o con solo espacios
    CONSTRAINT check_comentario_no_vacio CHECK (LENGTH(TRIM(texto_comentario)) > 0)
);

-- Catálogo de Reacciones (Implícito en Constraints)
CREATE TABLE TIPO_REACCION (
    nombre_reaccion VARCHAR(50) PRIMARY KEY,
    descripcion VARCHAR(255),
    url_icono VARCHAR(255)
);

CREATE TABLE REACCIONA_CONTENIDO (
    correo_miembro VARCHAR(255) NOT NULL,
    correo_autor_contenido VARCHAR(255) NOT NULL,
    fecha_hora_creacion_contenido TIMESTAMP NOT NULL,
    nombre_reaccion VARCHAR(50) NOT NULL,
    fecha_hora_reaccion TIMESTAMP NOT NULL,
    PRIMARY KEY (correo_miembro, correo_autor_contenido, fecha_hora_creacion_contenido), -- Asumiendo 1 reaccion por usuario por contenido (Unique Constraint implicit in logic)
    CONSTRAINT fk_reacc_cont_miembro FOREIGN KEY (correo_miembro) REFERENCES MIEMBRO(correo_principal),
    CONSTRAINT fk_reacc_cont_contenido FOREIGN KEY (correo_autor_contenido, fecha_hora_creacion_contenido) REFERENCES CONTENIDO(correo_autor, fecha_hora_creacion),
    CONSTRAINT fk_reacc_cont_tipo FOREIGN KEY (nombre_reaccion) REFERENCES TIPO_REACCION(nombre_reaccion)
);

CREATE TABLE REACCIONA_COMENTARIO (
    correo_miembro VARCHAR(255) NOT NULL,
    correo_autor_contenido VARCHAR(255) NOT NULL,
    fecha_hora_creacion_contenido TIMESTAMP NOT NULL,
    fecha_hora_comentario TIMESTAMP NOT NULL,
    nombre_reaccion VARCHAR(50) NOT NULL,
    fecha_hora_reaccion TIMESTAMP NOT NULL,
    PRIMARY KEY (correo_miembro, correo_autor_contenido, fecha_hora_creacion_contenido, fecha_hora_comentario),
    CONSTRAINT fk_reacc_coment_miembro FOREIGN KEY (correo_miembro) REFERENCES MIEMBRO(correo_principal),
    CONSTRAINT fk_reacc_coment_comentario FOREIGN KEY (correo_autor_contenido, fecha_hora_creacion_contenido, fecha_hora_comentario) REFERENCES COMENTARIO(fk_contenido_autor, fk_contenido_fecha, fecha_hora_comentario),
    CONSTRAINT fk_reacc_coment_tipo FOREIGN KEY (nombre_reaccion) REFERENCES TIPO_REACCION(nombre_reaccion)
);

-- =============================================================================
-- 4. CONEXIONES SOCIALES
-- =============================================================================

CREATE TABLE SOLICITA_CONEXION (
    correo_solicitante VARCHAR(255) NOT NULL,
    correo_solicitado VARCHAR(255) NOT NULL,
    fecha_solicitud TIMESTAMP NOT NULL,
    estado_solicitud VARCHAR(20) NOT NULL CHECK (estado_solicitud IN ('Pendiente', 'Aceptada', 'Rechazada')),
    PRIMARY KEY (correo_solicitante, correo_solicitado),
    CONSTRAINT fk_solicitante FOREIGN KEY (correo_solicitante) REFERENCES PERSONA(correo_principal),
    CONSTRAINT fk_solicitado FOREIGN KEY (correo_solicitado) REFERENCES PERSONA(correo_principal),
    CONSTRAINT check_narcisismo CHECK (correo_solicitante <> correo_solicitado)
);

CREATE TABLE TIPO_NEXO (
    nombre_nexo VARCHAR(100) PRIMARY KEY,
    descripcion TEXT
);

CREATE TABLE TIENE_NEXO (
    correo_persona VARCHAR(255) NOT NULL,
    correo_organizacion VARCHAR(255) NOT NULL,
    nombre_nexo VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    PRIMARY KEY (correo_persona, correo_organizacion, nombre_nexo),
    CONSTRAINT fk_nexo_persona FOREIGN KEY (correo_persona) REFERENCES PERSONA(correo_principal),
    CONSTRAINT fk_nexo_org FOREIGN KEY (correo_organizacion) REFERENCES ENTIDAD_ORGANIZACIONAL(correo_principal),
    CONSTRAINT fk_nexo_tipo FOREIGN KEY (nombre_nexo) REFERENCES TIPO_NEXO(nombre_nexo)
);

-- =============================================================================
-- 5. GRUPOS, TUTORÍAS Y CONFIGURACIÓN
-- =============================================================================

CREATE TABLE GRUPO_INTERES (
    nombre_grupo VARCHAR(150) PRIMARY KEY,
    descripcion_grupo TEXT,
    visibilidad VARCHAR(20) NOT NULL CHECK (visibilidad IN ('Público', 'Privado')),
    correo_creador VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    CONSTRAINT fk_grupo_creador FOREIGN KEY (correo_creador) REFERENCES PERSONA(correo_principal)
);

CREATE TABLE PERTENECE_A_GRUPO (
    correo_persona VARCHAR(255) NOT NULL,
    nombre_grupo VARCHAR(150) NOT NULL,
    fecha_union TIMESTAMP NOT NULL,
    rol_en_grupo VARCHAR(30) NOT NULL CHECK (rol_en_grupo IN ('Miembro', 'Moderador', 'Administrador')),
    PRIMARY KEY (correo_persona, nombre_grupo),
    CONSTRAINT fk_pert_persona FOREIGN KEY (correo_persona) REFERENCES PERSONA(correo_principal),
    CONSTRAINT fk_pert_grupo FOREIGN KEY (nombre_grupo) REFERENCES GRUPO_INTERES(nombre_grupo)
);

CREATE TABLE TUTORIA (
    correo_tutor VARCHAR(255) NOT NULL,
    area_conocimiento VARCHAR(150) NOT NULL,
    fecha_alta TIMESTAMP NOT NULL,
    descripcion_enfoque TEXT,
    PRIMARY KEY (correo_tutor, area_conocimiento, fecha_alta),
    CONSTRAINT fk_tutoria_tutor FOREIGN KEY (correo_tutor) REFERENCES PERSONA(correo_principal)
);

CREATE TABLE SOLICITA_TUTORIA (
    correo_solicitante VARCHAR(255) NOT NULL,
    correo_tutor_tutoria VARCHAR(255) NOT NULL,
    area_conocimiento_tutoria VARCHAR(150) NOT NULL,
    fecha_alta_tutoria TIMESTAMP NOT NULL,
    fecha_solicitud TIMESTAMP NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('Enviada', 'Aceptada', 'Rechazada', 'Completada')),
    PRIMARY KEY (correo_solicitante, correo_tutor_tutoria, area_conocimiento_tutoria, fecha_alta_tutoria),
    CONSTRAINT fk_sol_tut_solicitante FOREIGN KEY (correo_solicitante) REFERENCES PERSONA(correo_principal),
    CONSTRAINT fk_sol_tut_tutoria FOREIGN KEY (correo_tutor_tutoria, area_conocimiento_tutoria, fecha_alta_tutoria) REFERENCES TUTORIA(correo_tutor, area_conocimiento, fecha_alta)
);

CREATE TABLE CONFIGURACION (
    correo_miembro VARCHAR(255) PRIMARY KEY,
    visibilidad_perfil VARCHAR(30) NOT NULL CHECK (visibilidad_perfil IN ('Público', 'Solo Conexiones', 'Privado')),
    notif_comentarios BOOLEAN DEFAULT TRUE,
    notif_eventos BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_config_miembro FOREIGN KEY (correo_miembro) REFERENCES MIEMBRO(correo_principal)
);

-- =============================================================================
-- 6. OPORTUNIDADES (OFERTAS LABORALES) - Agregado según Data Dictionary
-- =============================================================================

CREATE TABLE OFERTA_LABORAL (
    correo_organizacion VARCHAR(255) NOT NULL,
    fecha_publicacion TIMESTAMP NOT NULL,
    titulo_oferta VARCHAR(255) NOT NULL,
    descripcion_cargo TEXT NOT NULL,
    requisitos TEXT,
    modalidad VARCHAR(20) NOT NULL CHECK (modalidad IN ('Presencial', 'Remoto', 'Híbrido')),
    PRIMARY KEY (correo_organizacion, fecha_publicacion, titulo_oferta),
    CONSTRAINT fk_oferta_org FOREIGN KEY (correo_organizacion) REFERENCES ENTIDAD_ORGANIZACIONAL(correo_principal)
);

CREATE TABLE SE_POSTULA (
    correo_persona VARCHAR(255) NOT NULL,
    correo_organizacion_oferta VARCHAR(255) NOT NULL,
    fecha_publicacion_oferta TIMESTAMP NOT NULL,
    titulo_oferta VARCHAR(255) NOT NULL,
    fecha_postulacion TIMESTAMP NOT NULL,
    estado_postulacion VARCHAR(20) NOT NULL CHECK (estado_postulacion IN ('Enviada', 'En Revisión', 'Rechazada', 'Aceptada')),
    PRIMARY KEY (correo_persona, correo_organizacion_oferta, fecha_publicacion_oferta, titulo_oferta),
    CONSTRAINT fk_postula_persona FOREIGN KEY (correo_persona) REFERENCES PERSONA(correo_principal),
    CONSTRAINT fk_postula_oferta FOREIGN KEY (correo_organizacion_oferta, fecha_publicacion_oferta, titulo_oferta) REFERENCES OFERTA_LABORAL(correo_organizacion, fecha_publicacion, titulo_oferta)
);

-- =============================================================================
-- 7. ROLES Y PERMISOS (Implícito en Constraints / DD)
-- =============================================================================

CREATE TABLE ROL (
    nombre_rol VARCHAR(50) PRIMARY KEY,
    descripcion TEXT
);

CREATE TABLE MIEMBRO_POSEE_ROL (
    correo_miembro VARCHAR(255) NOT NULL,
    nombre_rol VARCHAR(50) NOT NULL,
    fecha_asignacion TIMESTAMP NOT NULL,
    PRIMARY KEY (correo_miembro, nombre_rol),
    CONSTRAINT fk_posee_miembro FOREIGN KEY (correo_miembro) REFERENCES MIEMBRO(correo_principal),
    CONSTRAINT fk_posee_rol FOREIGN KEY (nombre_rol) REFERENCES ROL(nombre_rol)
);