-- =============================================================================
-- SCRIPT DE POBLADO DE DATOS (SEED DATA)
-- Proyecto: SoyUCAB
-- Objetivo: Llenar la BD con datos coherentes para pruebas y demos.
-- Nota: Ejecutar esto AL FINAL, después de crear tablas, triggers y funciones.
-- =============================================================================

-- Desactivamos notificaciones para que sea rápido
SET client_min_messages TO WARNING;

-- 1. CATÁLOGOS BASE
-- =============================================================================

-- Lugares
INSERT INTO LUGAR (nombre, tipo) VALUES 
('UCAB Montalbán', 'Campus'),
('UCAB Guayana', 'Campus'),
('Edificio de Aulas', 'Edificio'),
('Aula Magna', 'Auditorio');

-- Tipos de Reacción (Facebook Style)
INSERT INTO TIPO_REACCION (nombre, icono_url) VALUES 
('Me Gusta', '👍'),
('Me Encanta', '❤️'),
('Me Divierte', '😂'),
('Me Asombra', '😮'),
('Me Entristece', '😢'),
('Me Interesa', '📅'); -- Clave para eventos

-- Tipos de Nexo (Para Pedro)
INSERT INTO TIPO_NEXO (nombre, descripcion) VALUES 
('Convenio Pasantías', 'Permite contratar pasantes'),
('Patrocinante Silver', 'Aporta recursos a eventos'),
('Alianza Académica', 'Intercambio de conocimientos');


-- 2. USUARIOS (ACTORES)
-- =============================================================================

-- A. Estudiantes (Equipo de Desarrollo)
-- ID 1: Oscar
INSERT INTO MIEMBRO (correo, password_hash, tipo_miembro, id_lugar) VALUES ('oscar@ucab.edu.ve', 'hash123', 'PERSONA', 1);
INSERT INTO PERSONA (id_miembro, primer_nombre, primer_apellido, fecha_nacimiento, sexo) VALUES ((SELECT MAX(id_miembro) FROM MIEMBRO), 'Oscar', 'Jaramillo', '2001-05-15', 'M');
INSERT INTO CONFIGURACION (id_miembro, privacidad_perfil) VALUES ((SELECT MAX(id_miembro) FROM MIEMBRO), 'PUBLICO');

-- ID 2: Luis
INSERT INTO MIEMBRO (correo, password_hash, tipo_miembro, id_lugar) VALUES ('luis@ucab.edu.ve', 'hash123', 'PERSONA', 1);
INSERT INTO PERSONA (id_miembro, primer_nombre, primer_apellido, fecha_nacimiento, sexo) VALUES ((SELECT MAX(id_miembro) FROM MIEMBRO), 'Luis', 'Torres', '2001-08-20', 'M');
INSERT INTO CONFIGURACION (id_miembro, privacidad_perfil) VALUES ((SELECT MAX(id_miembro) FROM MIEMBRO), 'SOLO_CONEXIONES');

-- ID 3: Pedro
INSERT INTO MIEMBRO (correo, password_hash, tipo_miembro, id_lugar) VALUES ('pedro@ucab.edu.ve', 'hash123', 'PERSONA', 2); -- Guayana
INSERT INTO PERSONA (id_miembro, primer_nombre, primer_apellido, fecha_nacimiento, sexo) VALUES ((SELECT MAX(id_miembro) FROM MIEMBRO), 'Pedro', 'Urdaneta', '2000-12-10', 'M');

-- B. Usuarios "Relleno" (Para hacer bulto en los reportes)
INSERT INTO MIEMBRO (correo, password_hash, tipo_miembro) VALUES ('maria@ucab.edu.ve', 'x', 'PERSONA');
INSERT INTO PERSONA (id_miembro, primer_nombre, primer_apellido, fecha_nacimiento, sexo) VALUES ((SELECT MAX(id_miembro) FROM MIEMBRO), 'Maria', 'Perez', '2002-01-01', 'F');

INSERT INTO MIEMBRO (correo, password_hash, tipo_miembro) VALUES ('juan@ucab.edu.ve', 'x', 'PERSONA');
INSERT INTO PERSONA (id_miembro, primer_nombre, primer_apellido, fecha_nacimiento, sexo) VALUES ((SELECT MAX(id_miembro) FROM MIEMBRO), 'Juan', 'Gomez', '2002-02-02', 'M');

-- C. Empresas
-- ID 6: Empresas Polar
INSERT INTO MIEMBRO (correo, password_hash, tipo_miembro) VALUES ('rrhh@polar.com', 'hash_empresa', 'ENTIDAD');
INSERT INTO ENTIDAD_ORGANIZACIONAL (id_miembro, razon_social, tipo_entidad) VALUES ((SELECT MAX(id_miembro) FROM MIEMBRO), 'Empresas Polar', 'Privada');

-- Nexo con Polar
INSERT INTO TIENE_NEXO (id_entidad, id_tipo_nexo, fecha_inicio, activo) 
VALUES ((SELECT id_miembro FROM MIEMBRO WHERE correo='rrhh@polar.com'), 1, '2023-01-01', TRUE);


-- 3. RED SOCIAL (CONEXIONES)
-- =============================================================================
-- Oscar y Luis son amigos (Aceptada)
INSERT INTO SOLICITA_CONEXION (id_solicitante, id_solicitado, estado) VALUES 
((SELECT id_miembro FROM MIEMBRO WHERE correo='oscar@ucab.edu.ve'), (SELECT id_miembro FROM MIEMBRO WHERE correo='luis@ucab.edu.ve'), 'ACEPTADA');

-- Maria sigue a Oscar (Pendiente)
INSERT INTO SOLICITA_CONEXION (id_solicitante, id_solicitado, estado) VALUES 
((SELECT id_miembro FROM MIEMBRO WHERE correo='maria@ucab.edu.ve'), (SELECT id_miembro FROM MIEMBRO WHERE correo='oscar@ucab.edu.ve'), 'PENDIENTE');


-- 4. CONTENIDO Y EVENTOS (TU MÓDULO)
-- =============================================================================

-- A. PUBLICACIÓN VIRAL (Autor: Oscar)
INSERT INTO CONTENIDO (id_autor, texto_contenido, visibilidad, fecha_creacion) 
VALUES ((SELECT id_miembro FROM MIEMBRO WHERE correo='oscar@ucab.edu.ve'), '¡Ganamos el hackathon de la UCAB! 🚀 #Ingenieria #Coding', 'PUBLICO', NOW() - INTERVAL '2 days');

INSERT INTO PUBLICACION (id_contenido) VALUES ((SELECT MAX(id_contenido) FROM CONTENIDO));
-- Guardamos ID para usarlo abajo
DO $$ 
DECLARE v_id_viral INT;
BEGIN
    SELECT MAX(id_contenido) INTO v_id_viral FROM CONTENIDO;
    
    -- Insertamos MUCHAS reacciones (Simulando viralidad)
    INSERT INTO REACCIONA_CONTENIDO (id_contenido, id_miembro, id_tipo_reaccion) VALUES 
    (v_id_viral, (SELECT id_miembro FROM MIEMBRO WHERE correo='luis@ucab.edu.ve'), 2), -- Me encanta
    (v_id_viral, (SELECT id_miembro FROM MIEMBRO WHERE correo='pedro@ucab.edu.ve'), 1), -- Me gusta
    (v_id_viral, (SELECT id_miembro FROM MIEMBRO WHERE correo='maria@ucab.edu.ve'), 4), -- Me asombra
    (v_id_viral, (SELECT id_miembro FROM MIEMBRO WHERE correo='juan@ucab.edu.ve'), 1); -- Me gusta

    -- Insertamos Comentarios
    INSERT INTO COMENTARIO (id_contenido, id_autor, texto_comentario) VALUES
    (v_id_viral, (SELECT id_miembro FROM MIEMBRO WHERE correo='luis@ucab.edu.ve'), '¡Felicidades bro! 🔥'),
    (v_id_viral, (SELECT id_miembro FROM MIEMBRO WHERE correo='maria@ucab.edu.ve'), 'Increíble trabajo chicos.');
END $$;


-- B. EVENTO PASADO (Para probar SP de cierre)
INSERT INTO CONTENIDO (id_autor, texto_contenido, visibilidad, fecha_creacion) 
VALUES ((SELECT id_miembro FROM MIEMBRO WHERE correo='rrhh@polar.com'), 'Feria de empleo en el edificio de aulas.', 'PUBLICO', NOW() - INTERVAL '1 month');

INSERT INTO EVENTO (id_contenido, titulo, fecha_inicio, fecha_fin, estado, id_lugar)
VALUES ((SELECT MAX(id_contenido) FROM CONTENIDO), 'Feria Polar 2023', NOW() - INTERVAL '1 month', NOW() - INTERVAL '29 days', 'FINALIZADO', 3);


-- C. EVENTO FUTURO (Para Reporte de Proyección de Asistencia)
INSERT INTO CONTENIDO (id_autor, texto_contenido, visibilidad) 
VALUES ((SELECT id_miembro FROM MIEMBRO WHERE correo='oscar@ucab.edu.ve'), 'Torneo de FIFA en el laboratorio.', 'PUBLICO');

INSERT INTO EVENTO (id_contenido, titulo, fecha_inicio, fecha_fin, estado, id_lugar)
VALUES ((SELECT MAX(id_contenido) FROM CONTENIDO), 'Torneo Gamers UCAB', NOW() + INTERVAL '1 week', NOW() + INTERVAL '1 week 4 hours', 'ACTIVO', 3);

-- Gente diciendo "Me Interesa" al evento futuro
DO $$ 
DECLARE v_id_evento INT;
BEGIN
    SELECT MAX(id_contenido) INTO v_id_evento FROM CONTENIDO;
    
    INSERT INTO REACCIONA_CONTENIDO (id_contenido, id_miembro, id_tipo_reaccion) VALUES 
    (v_id_evento, (SELECT id_miembro FROM MIEMBRO WHERE correo='luis@ucab.edu.ve'), 6), -- Me Interesa
    (v_id_evento, (SELECT id_miembro FROM MIEMBRO WHERE correo='pedro@ucab.edu.ve'), 6), -- Me Interesa
    (v_id_evento, (SELECT id_miembro FROM MIEMBRO WHERE correo='juan@ucab.edu.ve'), 6); -- Me Interesa
END $$;


-- 5. OFERTAS LABORALES (MÓDULO PEDRO)
-- =============================================================================
INSERT INTO OFERTA_LABORAL (id_entidad, titulo, descripcion, modalidad, estado)
VALUES ((SELECT id_miembro FROM MIEMBRO WHERE correo='rrhh@polar.com'), 'Desarrollador Junior SQL', 'Se busca experto en PostgreSQL.', 'Presencial', 'ABIERTA');

-- Oscar se postula
INSERT INTO SE_POSTULA (id_persona, id_oferta, estado_postulacion)
VALUES ((SELECT id_miembro FROM MIEMBRO WHERE correo='oscar@ucab.edu.ve'), 1, 'ENVIADA');


RAISE NOTICE '¡Datos Semilla insertados correctamente! La BD está lista para usar.';