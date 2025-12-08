    -- =============================================================================
    -- SCRIPT DE POBLADO DE DATOS (SEED DATA)
    -- Proyecto: SoyUCAB
    -- Objetivo: Llenar la BD con datos coherentes para pruebas y demos.
    -- Versión: Actualizada al Modelo Relacional Final (Claves Naturales)
    -- =============================================================================

    SET client_min_messages TO WARNING;

    -- 1. CATÁLOGOS BASE
    -- =============================================================================

    -- Tipos de Reacción
    INSERT INTO TIPO_REACCION (nombre_reaccion, descripcion, url_icono) VALUES 
    ('Me Gusta', 'Indicador de agrado general', '👍'),
    ('Me Encanta', 'Indicador de alto agrado', '❤️'),
    ('Me Divierte', 'Indicador de humor', '😂'),
    ('Me Asombra', 'Indicador de sorpresa', '😮'),
    ('Me Entristece', 'Indicador de empatía triste', '😢'),
    ('Me Interesa', 'Indicador de interés en eventos', '📅');

    -- Tipos de Nexo
    INSERT INTO TIPO_NEXO (nombre_nexo, descripcion) VALUES 
    ('Convenio Pasantías', 'Permite contratar pasantes'),
    ('Patrocinante Silver', 'Aporta recursos a eventos'),
    ('Alianza Académica', 'Intercambio de conocimientos');


    -- 2. USUARIOS (ACTORES)
    -- =============================================================================

    -- A. Oscar (Estudiante - Caracas)
    INSERT INTO MIEMBRO (correo_principal, contrasena_hash, fecha_registro, fotografia_url) 
    VALUES ('oscar@ucab.edu.ve', 'hash123', NOW() - INTERVAL '1 year', 'https://ui-avatars.com/api/?name=Oscar+Jaramillo');

    INSERT INTO PERSONA (correo_principal, cedula, nombres, apellidos, fecha_nacimiento, sexo, biografia, pais_residencia, ciudad_residencia)
    VALUES ('oscar@ucab.edu.ve', 'V-28000001', 'Oscar', 'Jaramillo', '2001-05-15', 'Masculino', 'Desarrollador Full Stack', 'Venezuela', 'Caracas');

    INSERT INTO CONFIGURACION (correo_miembro, visibilidad_perfil)
    VALUES ('oscar@ucab.edu.ve', 'Público');

    -- B. Luis (Estudiante - Caracas)
    INSERT INTO MIEMBRO (correo_principal, contrasena_hash, fecha_registro, fotografia_url) 
    VALUES ('luis@ucab.edu.ve', 'hash123', NOW() - INTERVAL '1 year', 'https://ui-avatars.com/api/?name=Luis+Torres');

    INSERT INTO PERSONA (correo_principal, cedula, nombres, apellidos, fecha_nacimiento, sexo, biografia, pais_residencia, ciudad_residencia)
    VALUES ('luis@ucab.edu.ve', 'V-28000002', 'Luis', 'Torres', '2001-08-20', 'Masculino', 'Ingeniero de Datos', 'Venezuela', 'Caracas');

    INSERT INTO CONFIGURACION (correo_miembro, visibilidad_perfil)
    VALUES ('luis@ucab.edu.ve', 'Solo Conexiones');

    -- C. Pedro (Estudiante - Guayana)
    INSERT INTO MIEMBRO (correo_principal, contrasena_hash, fecha_registro, fotografia_url) 
    VALUES ('pedro@ucab.edu.ve', 'hash123', NOW() - INTERVAL '1 year', 'https://ui-avatars.com/api/?name=Pedro+Urdaneta');

    INSERT INTO PERSONA (correo_principal, cedula, nombres, apellidos, fecha_nacimiento, sexo, biografia, pais_residencia, ciudad_residencia)
    VALUES ('pedro@ucab.edu.ve', 'V-28000003', 'Pedro', 'Urdaneta', '2000-12-10', 'Masculino', 'DevOps Enthuziast', 'Venezuela', 'Puerto Ordaz');

    INSERT INTO CONFIGURACION (correo_miembro, visibilidad_perfil)
    VALUES ('pedro@ucab.edu.ve', 'Público');

    -- D. Usuarios de Relleno (Maria, Juan)
    INSERT INTO MIEMBRO (correo_principal, contrasena_hash, fecha_registro) VALUES ('maria@ucab.edu.ve', 'x', NOW());
    INSERT INTO PERSONA (correo_principal, nombres, apellidos, fecha_nacimiento, sexo, pais_residencia, ciudad_residencia) 
    VALUES ('maria@ucab.edu.ve', 'Maria', 'Perez', '2002-01-01', 'Femenino', 'Venezuela', 'Caracas');
    INSERT INTO CONFIGURACION (correo_miembro, visibilidad_perfil) VALUES ('maria@ucab.edu.ve', 'Público');

    INSERT INTO MIEMBRO (correo_principal, contrasena_hash, fecha_registro) VALUES ('juan@ucab.edu.ve', 'x', NOW());
    INSERT INTO PERSONA (correo_principal, nombres, apellidos, fecha_nacimiento, sexo, pais_residencia, ciudad_residencia) 
    VALUES ('juan@ucab.edu.ve', 'Juan', 'Gomez', '2002-02-02', 'Masculino', 'Venezuela', 'Caracas');
    INSERT INTO CONFIGURACION (correo_miembro, visibilidad_perfil) VALUES ('juan@ucab.edu.ve', 'Público');

    -- E. Empresa (Polar)
    INSERT INTO MIEMBRO (correo_principal, contrasena_hash, fecha_registro, fotografia_url) 
    VALUES ('rrhh@polar.com', 'hash_empresa', NOW() - INTERVAL '2 years', 'https://ui-avatars.com/api/?name=Empresas+Polar');

    INSERT INTO ENTIDAD_ORGANIZACIONAL (correo_principal, rif, nombre_oficial, descripcion, tipo_entidad, pais_ubicacion, ciudad_ubicacion)
    VALUES ('rrhh@polar.com', 'J-00006372-9', 'Empresas Polar', 'Alimentos y Bebidas', 'Aliado Externo', 'Venezuela', 'Caracas');

    INSERT INTO CONFIGURACION (correo_miembro, visibilidad_perfil) VALUES ('rrhh@polar.com', 'Público');


    -- 3. INTERACCIONES SOCIALES
    -- =============================================================================

    -- Oscar y Luis amigos
    INSERT INTO SOLICITA_CONEXION (correo_solicitante, correo_solicitado, fecha_solicitud, estado_solicitud)
    VALUES ('oscar@ucab.edu.ve', 'luis@ucab.edu.ve', NOW() - INTERVAL '6 months', 'Aceptada');

    -- Maria sigue a Oscar (Pendiente)
    INSERT INTO SOLICITA_CONEXION (correo_solicitante, correo_solicitado, fecha_solicitud, estado_solicitud)
    VALUES ('maria@ucab.edu.ve', 'oscar@ucab.edu.ve', NOW(), 'Pendiente');


    -- 4. CONTENIDO - PUBLICACIÓN VIRAL
    -- =============================================================================

    -- Necesitamos una fecha fija para referenciar en dependencias
    DO $$
    DECLARE
        v_fecha_viral TIMESTAMP := NOW() - INTERVAL '2 days';
        v_autor_viral VARCHAR := 'oscar@ucab.edu.ve';
    BEGIN
        -- Crear Contenido
        INSERT INTO CONTENIDO (correo_autor, fecha_hora_creacion, texto_contenido, visibilidad)
        VALUES (v_autor_viral, v_fecha_viral, '¡Ganamos el hackathon de la UCAB! 🚀 #Ingenieria #Coding', 'Público');

        -- Crear Publicación
        INSERT INTO PUBLICACION (correo_autor, fecha_hora_creacion)
        VALUES (v_autor_viral, v_fecha_viral);

        -- Reacciones
        INSERT INTO REACCIONA_CONTENIDO (correo_miembro, correo_autor_contenido, fecha_hora_creacion_contenido, nombre_reaccion, fecha_hora_reaccion) VALUES
        ('luis@ucab.edu.ve', v_autor_viral, v_fecha_viral, 'Me Encanta', NOW()),
        ('pedro@ucab.edu.ve', v_autor_viral, v_fecha_viral, 'Me Gusta', NOW()),
        ('maria@ucab.edu.ve', v_autor_viral, v_fecha_viral, 'Me Asombra', NOW()),
        ('juan@ucab.edu.ve', v_autor_viral, v_fecha_viral, 'Me Gusta', NOW());

        -- Comentarios
        INSERT INTO COMENTARIO (fk_contenido_autor, fk_contenido_fecha, fecha_hora_comentario, correo_autor_comentario, texto_comentario) VALUES
        (v_autor_viral, v_fecha_viral, NOW() + INTERVAL '1 minute', 'luis@ucab.edu.ve', '¡Felicidades bro! 🔥'),
        (v_autor_viral, v_fecha_viral, NOW() + INTERVAL '2 minutes', 'maria@ucab.edu.ve', 'Increíble trabajo chicos.');

    END $$;


    -- 5. CONTENIDO - EVENTOS
    -- =============================================================================

    -- A. Evento Pasado (Feria Polar)
    DO $$
    DECLARE
        v_fecha_evento TIMESTAMP := NOW() - INTERVAL '1 month';
        v_autor VARCHAR := 'rrhh@polar.com';
    BEGIN
        INSERT INTO CONTENIDO (correo_autor, fecha_hora_creacion, texto_contenido, visibilidad)
        VALUES (v_autor, v_fecha_evento, 'Feria de empleo en el edificio de aulas.', 'Público');

        INSERT INTO EVENTO (correo_autor, fecha_hora_creacion, titulo, fecha_inicio, fecha_fin, ciudad_ubicacion)
        VALUES (v_autor, v_fecha_evento, 'Feria Polar 2023', v_fecha_evento + INTERVAL '1 hour', v_fecha_evento + INTERVAL '8 hours', 'Caracas');
    END $$;


    -- B. Evento Futuro (Torneo Gamers)
    DO $$
    DECLARE
        v_fecha_creacion TIMESTAMP := NOW();
        v_autor VARCHAR := 'oscar@ucab.edu.ve';
    BEGIN
        INSERT INTO CONTENIDO (correo_autor, fecha_hora_creacion, texto_contenido, visibilidad)
        VALUES (v_autor, v_fecha_creacion, 'Torneo de FIFA en el laboratorio.', 'Público');

        INSERT INTO EVENTO (correo_autor, fecha_hora_creacion, titulo, fecha_inicio, fecha_fin, ciudad_ubicacion)
        VALUES (v_autor, v_fecha_creacion, 'Torneo Gamers UCAB', NOW() + INTERVAL '1 week', NOW() + INTERVAL '1 week 4 hours', 'Caracas');

        -- Reacciones "Me Interesa"
        INSERT INTO REACCIONA_CONTENIDO (correo_miembro, correo_autor_contenido, fecha_hora_creacion_contenido, nombre_reaccion, fecha_hora_reaccion) VALUES
        ('luis@ucab.edu.ve', v_autor, v_fecha_creacion, 'Me Interesa', NOW()),
        ('pedro@ucab.edu.ve', v_autor, v_fecha_creacion, 'Me Interesa', NOW()),
        ('juan@ucab.edu.ve', v_autor, v_fecha_creacion, 'Me Interesa', NOW());
    END $$;


    -- 6. OFERTAS LABORALES
    -- =============================================================================

    DO $$
    DECLARE
        v_fecha_pub TIMESTAMP := NOW() - INTERVAL '5 days';
        v_org VARCHAR := 'rrhh@polar.com';
        v_titulo VARCHAR := 'Desarrollador Junior SQL';
    BEGIN
        INSERT INTO OFERTA_LABORAL (correo_organizacion, fecha_publicacion, titulo_oferta, descripcion_cargo, requisitos, modalidad)
        VALUES (v_org, v_fecha_pub, v_titulo, 'Se busca experto en PostgreSQL.', 'SQL Avanzado', 'Presencial');

        INSERT INTO SE_POSTULA (correo_persona, correo_organizacion_oferta, fecha_publicacion_oferta, titulo_oferta, fecha_postulacion, estado_postulacion)
        VALUES ('oscar@ucab.edu.ve', v_org, v_fecha_pub, v_titulo, NOW(), 'Enviada');
    END $$;

