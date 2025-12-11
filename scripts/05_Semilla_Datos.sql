-- =============================================================================
-- SCRIPT DE POBLADO DE DATOS COMPLETO - PROYECTO SOYUCAB
-- Objetivo: Datos de calidad para todas las 25 tablas
-- =============================================================================

SET client_min_messages TO WARNING;

-- =============================================================================
-- 1. CATÁLOGOS BASE (TIPO_REACCION, TIPO_NEXO, ROL)
-- =============================================================================

INSERT INTO TIPO_REACCION (nombre_reaccion, descripcion, url_icono) VALUES 
('Me Gusta', 'Indicador de agrado general', '👍'),
('Me Encanta', 'Indicador de alto agrado', '❤️'),
('Me Divierte', 'Indicador de humor', '😂'),
('Me Asombra', 'Indicador de sorpresa', '😮'),
('Me Entristece', 'Indicador de empatía triste', '😢'),
('Me Interesa', 'Indicador de interés en eventos', '📅');

INSERT INTO TIPO_NEXO (nombre_nexo, descripcion) VALUES 
('Convenio Pasantías', 'Permite contratar pasantes'),
('Patrocinante Silver', 'Aporta recursos a eventos'),
('Alianza Académica', 'Intercambio de conocimientos'),
('Empleado', 'Trabaja actualmente en la organización'),
('Pasante', 'Realizando pasantías profesionales'),
('Egresado', 'Ex-estudiante de la institución'),
('Patrocinante Gold', 'Patrocinador principal de eventos'),
('Mentor', 'Mentor en programas de aceleración'),
('Investigador', 'Miembro activo de grupo de investigación');

INSERT INTO ROL (nombre_rol, descripcion) VALUES
('Estudiante', 'Usuario estudiante activo'),
('Egresado', 'Ex-alumno de la universidad'),
('Profesor', 'Docente universitario'),
('Moderador', 'Moderador de contenido'),
('Admin', 'Administrador del sistema');

-- =============================================================================
-- 2. USUARIOS PRINCIPALES (MIEMBRO + PERSONA + CONFIGURACION)
-- =============================================================================

-- Función para crear usuarios masivamente
DO $$
DECLARE
    users TEXT[][] := ARRAY[
        ['oscar@ucab.edu.ve', 'V-28000001', 'Oscar', 'Jaramillo', '2001-05-15', 'Masculino', 'Desarrollador Full Stack', 'Venezuela', 'Caracas'],
        ['luis@ucab.edu.ve', 'V-28000002', 'Luis', 'Torres', '2001-08-20', 'Masculino', 'Ingeniero de Datos', 'Venezuela', 'Caracas'],
        ['pedro@ucab.edu.ve', 'V-28000003', 'Pedro', 'Urdaneta', '2000-12-10', 'Masculino', 'DevOps Enthusiast', 'Venezuela', 'Puerto Ordaz'],
        ['maria@ucab.edu.ve', 'V-28000004', 'Maria', 'Perez', '2002-01-01', 'Femenino', 'Diseñadora Gráfica', 'Venezuela', 'Caracas'],
        ['juan@ucab.edu.ve', 'V-28000005', 'Juan', 'Gomez', '2002-02-02', 'Masculino', 'Analista de Sistemas', 'Venezuela', 'Caracas'],
        ['ana.garcia@ucab.edu.ve', 'V-29000001', 'Ana María', 'García López', '2000-03-15', 'Femenino', 'Comunicación Social', 'Venezuela', 'Caracas'],
        ['carlos.mendez@ucab.edu.ve', 'V-29000002', 'Carlos', 'Méndez Rojas', '1999-07-22', 'Masculino', 'Ingeniería Industrial', 'Venezuela', 'Valencia'],
        ['sofia.hernandez@ucab.edu.ve', 'V-29000003', 'Sofía', 'Hernández Pérez', '2001-11-08', 'Femenino', 'Psicología', 'Venezuela', 'Maracaibo'],
        ['diego.ramirez@ucab.edu.ve', 'V-29000004', 'Diego Alejandro', 'Ramírez Torres', '2000-05-30', 'Masculino', 'Desarrollador Móvil', 'Venezuela', 'Caracas'],
        ['valentina.silva@ucab.edu.ve', 'V-29000005', 'Valentina', 'Silva Moreno', '2002-01-14', 'Femenino', 'Diseñadora UX/UI', 'Venezuela', 'Barquisimeto'],
        ['andres.castro@ucab.edu.ve', 'V-29000006', 'Andrés', 'Castro Díaz', '1998-09-03', 'Masculino', 'MBA Candidate', 'Venezuela', 'Caracas'],
        ['isabella.morales@ucab.edu.ve', 'V-29000007', 'Isabella', 'Morales Guzmán', '2001-06-17', 'Femenino', 'Contabilidad', 'Venezuela', 'Mérida'],
        ['gabriel.vargas@ucab.edu.ve', 'V-29000008', 'Gabriel', 'Vargas Sánchez', '2000-12-25', 'Masculino', 'Marketing Digital', 'Venezuela', 'Caracas'],
        ['camila.ortiz@ucab.edu.ve', 'V-29000009', 'Camila', 'Ortiz Fernández', '2001-04-09', 'Femenino', 'Relaciones Internacionales', 'Venezuela', 'Puerto Ordaz'],
        ['sebastian.lopez@ucab.edu.ve', 'V-29000010', 'Sebastián', 'López Martínez', '1999-08-11', 'Masculino', 'Data Science', 'Venezuela', 'Caracas'],
        ['mariana.torres@ucab.edu.ve', 'V-29000011', 'Mariana', 'Torres Blanco', '2002-02-28', 'Femenino', 'Derecho', 'Venezuela', 'Valencia'],
        ['alejandro.navarro@ucab.edu.ve', 'V-29000012', 'Alejandro', 'Navarro Ruiz', '2000-10-05', 'Masculino', 'Backend Developer', 'Venezuela', 'Caracas'],
        ['daniela.rios@ucab.edu.ve', 'V-29000013', 'Daniela', 'Ríos González', '2001-07-19', 'Femenino', 'Arquitectura', 'Venezuela', 'Maracay'],
        ['nicolas.flores@ucab.edu.ve', 'V-29000014', 'Nicolás', 'Flores Herrera', '1998-03-22', 'Masculino', 'Filosofía', 'Venezuela', 'Caracas'],
        ['lucia.jimenez@ucab.edu.ve', 'V-29000015', 'Lucía', 'Jiménez Acosta', '2002-09-13', 'Femenino', 'Música y Producción', 'Venezuela', 'Barquisimeto'],
        ['mateo.gonzalez@ucab.edu.ve', 'V-29000016', 'Mateo', 'González Paredes', '2001-01-07', 'Masculino', 'Economía', 'Venezuela', 'Caracas'],
        ['paula.martinez@ucab.edu.ve', 'V-29000017', 'Paula Andrea', 'Martínez Vega', '2000-06-21', 'Femenino', 'Biotecnología', 'Venezuela', 'Mérida'],
        ['julian.sanchez@ucab.edu.ve', 'V-29000018', 'Julián', 'Sánchez Mora', '1999-11-30', 'Masculino', 'Ingeniería Civil', 'Venezuela', 'Puerto Ordaz'],
        ['andrea.diaz@ucab.edu.ve', 'V-29000019', 'Andrea', 'Díaz Campos', '2001-08-04', 'Femenino', 'Nutrición', 'Venezuela', 'Valencia'],
        ['roberto.herrera@ucab.edu.ve', 'V-29000020', 'Roberto', 'Herrera Luna', '2000-04-16', 'Masculino', 'Ciberseguridad', 'Venezuela', 'Caracas'],
        ['fernanda.cruz@ucab.edu.ve', 'V-29000021', 'Fernanda', 'Cruz Delgado', '2002-12-02', 'Femenino', 'Publicidad', 'Venezuela', 'Maracaibo'],
        ['miguel.reyes@ucab.edu.ve', 'V-29000022', 'Miguel Ángel', 'Reyes Pinto', '1999-05-25', 'Masculino', 'Teología', 'Venezuela', 'Caracas'],
        ['adriana.medina@ucab.edu.ve', 'V-29000023', 'Adriana', 'Medina Rivas', '2001-10-18', 'Femenino', 'Educación', 'Venezuela', 'Barquisimeto'],
        ['felipe.rojas@ucab.edu.ve', 'V-29000024', 'Felipe', 'Rojas Mendoza', '2000-02-09', 'Masculino', 'Administración', 'Venezuela', 'Caracas'],
        ['lorena.vega@ucab.edu.ve', 'V-29000025', 'Lorena', 'Vega Castillo', '2001-03-28', 'Femenino', 'Trabajo Social', 'Venezuela', 'Valencia'],
        ['ricardo.aguilar@ucab.edu.ve', 'V-29000026', 'Ricardo', 'Aguilar Núñez', '1998-07-14', 'Masculino', 'Inteligencia Artificial', 'Venezuela', 'Caracas'],
        ['natalia.salazar@ucab.edu.ve', 'V-29000027', 'Natalia', 'Salazar Ospina', '2002-04-03', 'Femenino', 'Turismo', 'Venezuela', 'Margarita'],
        ['david.fuentes@ucab.edu.ve', 'V-29000028', 'David', 'Fuentes Arias', '2001-09-22', 'Masculino', 'Cloud Computing', 'Venezuela', 'Caracas'],
        ['carolina.leon@ucab.edu.ve', 'V-29000029', 'Carolina', 'León Quintero', '2000-01-31', 'Femenino', 'Recursos Humanos', 'Venezuela', 'Maracay'],
        ['eduardo.montoya@ucab.edu.ve', 'V-29000030', 'Eduardo', 'Montoya Ramírez', '1999-06-08', 'Masculino', 'Logística', 'Venezuela', 'Puerto La Cruz'],
        ['victoria.paredes@ucab.edu.ve', 'V-29000031', 'Victoria', 'Paredes Villamizar', '2001-11-14', 'Femenino', 'Periodismo', 'Venezuela', 'Caracas'],
        ['pablo.guerrero@ucab.edu.ve', 'V-29000032', 'Pablo', 'Guerrero Peña', '2000-08-27', 'Masculino', 'Fotografía', 'Venezuela', 'Mérida'],
        ['veronica.castro@ucab.edu.ve', 'V-29000033', 'Verónica', 'Castro Mejía', '2002-05-19', 'Femenino', 'Fisioterapia', 'Venezuela', 'Valencia'],
        ['santiago.pena@ucab.edu.ve', 'V-29000034', 'Santiago', 'Peña Cordero', '2001-02-12', 'Masculino', 'Blockchain', 'Venezuela', 'Caracas'],
        ['monica.ramos@ucab.edu.ve', 'V-29000035', 'Mónica', 'Ramos Suárez', '2000-07-06', 'Femenino', 'Medicina', 'Venezuela', 'Maracaibo'],
        ['prof.martinez@ucab.edu.ve', 'V-15000001', 'José Luis', 'Martínez Profesor', '1975-03-10', 'Masculino', 'Profesor Ingeniería', 'Venezuela', 'Caracas'],
        ['prof.rodriguez@ucab.edu.ve', 'V-15000002', 'María Elena', 'Rodríguez Docente', '1980-09-15', 'Femenino', 'Coordinadora Postgrado', 'Venezuela', 'Caracas'],
        ['egresado.tech@gmail.com', 'V-20000001', 'Fernando', 'Tech Egresado', '1990-04-20', 'Masculino', 'CTO Startup', 'Venezuela', 'Caracas'],
        ['alumni.empresaria@gmail.com', 'V-20000002', 'Patricia', 'Empresaria Alumni', '1988-11-05', 'Femenino', 'CEO Consultora', 'Venezuela', 'Caracas'],
        ['nuevo.ingreso@ucab.edu.ve', 'V-31000001', 'Leonardo', 'Nuevo Ingreso', '2005-01-15', 'Masculino', 'Primer Semestre', 'Venezuela', 'Caracas'],
        ['moderador@ucab.edu.ve', 'V-10000001', 'Staff', 'Moderador', '1995-01-01', 'No Especificado', 'Staff de Moderación y Contenido.', 'Venezuela', 'Caracas'],
        ['auditor@ucab.edu.ve', 'V-10000002', 'Staff', 'Auditor', '1990-01-01', 'No Especificado', 'Staff de Auditoría y BI.', 'Venezuela', 'Caracas']
    ];
    u TEXT[];
    vis TEXT[] := ARRAY['Público', 'Público', 'Solo Conexiones'];
BEGIN
    FOREACH u SLICE 1 IN ARRAY users LOOP
        INSERT INTO MIEMBRO (correo_principal, contrasena_hash, fecha_registro, fotografia_url)
        VALUES (u[1], 'hash_' || MD5(u[1]), NOW() - (RANDOM() * INTERVAL '2 years'),
            'https://ui-avatars.com/api/?name=' || REPLACE(u[3] || '+' || u[4], ' ', '+'));
        
        INSERT INTO PERSONA (correo_principal, cedula, nombres, apellidos, fecha_nacimiento, sexo, biografia, pais_residencia, ciudad_residencia)
        VALUES (u[1], u[2], u[3], u[4], u[5]::DATE, u[6], u[7], u[8], u[9]);
        
        INSERT INTO CONFIGURACION (correo_miembro, visibilidad_perfil)
        VALUES (u[1], vis[1 + FLOOR(RANDOM() * 2)::INT]);
    END LOOP;
END $$;

-- =============================================================================
-- 3. ENTIDADES ORGANIZACIONALES
-- =============================================================================

INSERT INTO MIEMBRO (correo_principal, contrasena_hash, fecha_registro, fotografia_url) VALUES
('rrhh@polar.com', 'hash_polar', NOW() - INTERVAL '3 years', 'https://ui-avatars.com/api/?name=Polar'),
('talento@banesco.com', 'hash_banesco', NOW() - INTERVAL '3 years', 'https://ui-avatars.com/api/?name=Banesco'),
('rrhh@movistar.com.ve', 'hash_movistar', NOW() - INTERVAL '2 years', 'https://ui-avatars.com/api/?name=Movistar'),
('innovacion@ucab.edu.ve', 'hash_ciap', NOW() - INTERVAL '4 years', 'https://ui-avatars.com/api/?name=CIAP'),
('giia@ucab.edu.ve', 'hash_giia', NOW() - INTERVAL '5 years', 'https://ui-avatars.com/api/?name=GIIA');

INSERT INTO ENTIDAD_ORGANIZACIONAL (correo_principal, rif, nombre_oficial, descripcion, tipo_entidad, pais_ubicacion, ciudad_ubicacion) VALUES
('rrhh@polar.com', 'J-00006372-9', 'Empresas Polar', 'Alimentos y Bebidas', 'Aliado Externo', 'Venezuela', 'Caracas'),
('talento@banesco.com', 'J-07001234-5', 'Banesco Banco Universal', 'Institución financiera', 'Aliado Externo', 'Venezuela', 'Caracas'),
('rrhh@movistar.com.ve', 'J-30000001-1', 'Telefónica Movistar', 'Telecomunicaciones', 'Aliado Externo', 'Venezuela', 'Caracas'),
('innovacion@ucab.edu.ve', 'J-00012345-6', 'Centro de Innovación UCAB', 'Incubadora de startups', 'Dependencia UCAB', 'Venezuela', 'Caracas'),
('giia@ucab.edu.ve', 'J-00012345-7', 'Grupo Investigación IA', 'Investigación en IA y ML', 'Grupo de Investigación', 'Venezuela', 'Caracas');

INSERT INTO CONFIGURACION (correo_miembro, visibilidad_perfil) VALUES
('rrhh@polar.com', 'Público'),
('talento@banesco.com', 'Público'),
('rrhh@movistar.com.ve', 'Público'),
('innovacion@ucab.edu.ve', 'Público'),
('giia@ucab.edu.ve', 'Público');

-- =============================================================================
-- 4. MIEMBRO_POSEE_ROL (Asignación de roles)
-- =============================================================================

INSERT INTO MIEMBRO_POSEE_ROL (correo_miembro, nombre_rol, fecha_asignacion) VALUES
('oscar@ucab.edu.ve', 'Estudiante', NOW() - INTERVAL '1 year'),
('oscar@ucab.edu.ve', 'Moderador', NOW() - INTERVAL '3 months'),
('luis@ucab.edu.ve', 'Estudiante', NOW() - INTERVAL '1 year'),
('pedro@ucab.edu.ve', 'Estudiante', NOW() - INTERVAL '1 year'),
('maria@ucab.edu.ve', 'Estudiante', NOW() - INTERVAL '1 year'),
('juan@ucab.edu.ve', 'Estudiante', NOW() - INTERVAL '1 year'),
('ana.garcia@ucab.edu.ve', 'Estudiante', NOW() - INTERVAL '10 months'),
('carlos.mendez@ucab.edu.ve', 'Estudiante', NOW() - INTERVAL '10 months'),
('sofia.hernandez@ucab.edu.ve', 'Estudiante', NOW() - INTERVAL '10 months'),
('diego.ramirez@ucab.edu.ve', 'Estudiante', NOW() - INTERVAL '10 months'),
('valentina.silva@ucab.edu.ve', 'Estudiante', NOW() - INTERVAL '10 months'),
('andres.castro@ucab.edu.ve', 'Estudiante', NOW() - INTERVAL '10 months'),
('sebastian.lopez@ucab.edu.ve', 'Estudiante', NOW() - INTERVAL '8 months'),
('sebastian.lopez@ucab.edu.ve', 'Moderador', NOW() - INTERVAL '2 months'),
('alejandro.navarro@ucab.edu.ve', 'Estudiante', NOW() - INTERVAL '8 months'),
('roberto.herrera@ucab.edu.ve', 'Estudiante', NOW() - INTERVAL '8 months'),
('ricardo.aguilar@ucab.edu.ve', 'Estudiante', NOW() - INTERVAL '6 months'),
('david.fuentes@ucab.edu.ve', 'Estudiante', NOW() - INTERVAL '6 months'),
('prof.martinez@ucab.edu.ve', 'Profesor', NOW() - INTERVAL '5 years'),
('prof.rodriguez@ucab.edu.ve', 'Profesor', NOW() - INTERVAL '4 years'),
('egresado.tech@gmail.com', 'Egresado', NOW() - INTERVAL '10 years'),
('alumni.empresaria@gmail.com', 'Egresado', NOW() - INTERVAL '12 years'),
('nuevo.ingreso@ucab.edu.ve', 'Estudiante', NOW() - INTERVAL '1 month');

-- =============================================================================
-- 5. TIENE_NEXO (Relaciones persona-organización)
-- =============================================================================

INSERT INTO TIENE_NEXO (correo_persona, correo_organizacion, nombre_nexo, fecha_inicio, fecha_fin) VALUES
('oscar@ucab.edu.ve', 'innovacion@ucab.edu.ve', 'Pasante', '2024-01-15', NULL),
('luis@ucab.edu.ve', 'giia@ucab.edu.ve', 'Investigador', '2023-09-01', NULL),
('sebastian.lopez@ucab.edu.ve', 'giia@ucab.edu.ve', 'Investigador', '2024-02-01', NULL),
('ricardo.aguilar@ucab.edu.ve', 'giia@ucab.edu.ve', 'Investigador', '2023-06-15', NULL),
('egresado.tech@gmail.com', 'rrhh@polar.com', 'Empleado', '2015-03-01', NULL),
('alumni.empresaria@gmail.com', 'talento@banesco.com', 'Mentor', '2020-01-01', NULL),
('andres.castro@ucab.edu.ve', 'innovacion@ucab.edu.ve', 'Pasante', '2024-06-01', NULL),
('diego.ramirez@ucab.edu.ve', 'rrhh@movistar.com.ve', 'Pasante', '2024-03-01', '2024-09-01'),
('david.fuentes@ucab.edu.ve', 'rrhh@movistar.com.ve', 'Pasante', '2024-07-01', NULL);

-- =============================================================================
-- 6. SOLICITA_CONEXION (Red social)
-- =============================================================================

INSERT INTO SOLICITA_CONEXION (correo_solicitante, correo_solicitado, fecha_solicitud, estado_solicitud) VALUES
('oscar@ucab.edu.ve', 'luis@ucab.edu.ve', NOW() - INTERVAL '6 months', 'Aceptada'),
('oscar@ucab.edu.ve', 'pedro@ucab.edu.ve', NOW() - INTERVAL '5 months', 'Aceptada'),
('luis@ucab.edu.ve', 'pedro@ucab.edu.ve', NOW() - INTERVAL '5 months', 'Aceptada'),
('maria@ucab.edu.ve', 'oscar@ucab.edu.ve', NOW() - INTERVAL '3 months', 'Pendiente'),
('ana.garcia@ucab.edu.ve', 'oscar@ucab.edu.ve', NOW() - INTERVAL '4 months', 'Aceptada'),
('carlos.mendez@ucab.edu.ve', 'luis@ucab.edu.ve', NOW() - INTERVAL '4 months', 'Aceptada'),
('diego.ramirez@ucab.edu.ve', 'oscar@ucab.edu.ve', NOW() - INTERVAL '3 months', 'Aceptada'),
('diego.ramirez@ucab.edu.ve', 'alejandro.navarro@ucab.edu.ve', NOW() - INTERVAL '2 months', 'Aceptada'),
('sebastian.lopez@ucab.edu.ve', 'ricardo.aguilar@ucab.edu.ve', NOW() - INTERVAL '4 months', 'Aceptada'),
('sebastian.lopez@ucab.edu.ve', 'luis@ucab.edu.ve', NOW() - INTERVAL '3 months', 'Aceptada'),
('andres.castro@ucab.edu.ve', 'felipe.rojas@ucab.edu.ve', NOW() - INTERVAL '5 months', 'Aceptada'),
('andres.castro@ucab.edu.ve', 'alumni.empresaria@gmail.com', NOW() - INTERVAL '4 months', 'Aceptada'),
('prof.martinez@ucab.edu.ve', 'oscar@ucab.edu.ve', NOW() - INTERVAL '8 months', 'Aceptada'),
('prof.martinez@ucab.edu.ve', 'luis@ucab.edu.ve', NOW() - INTERVAL '8 months', 'Aceptada'),
('egresado.tech@gmail.com', 'oscar@ucab.edu.ve', NOW() - INTERVAL '6 months', 'Aceptada'),
('nuevo.ingreso@ucab.edu.ve', 'oscar@ucab.edu.ve', NOW() - INTERVAL '1 week', 'Pendiente'),
('valentina.silva@ucab.edu.ve', 'daniela.rios@ucab.edu.ve', NOW() - INTERVAL '2 months', 'Aceptada'),
('gabriel.vargas@ucab.edu.ve', 'fernanda.cruz@ucab.edu.ve', NOW() - INTERVAL '1 month', 'Aceptada'),
('victoria.paredes@ucab.edu.ve', 'ana.garcia@ucab.edu.ve', NOW() - INTERVAL '3 months', 'Aceptada'),
('pablo.guerrero@ucab.edu.ve', 'lucia.jimenez@ucab.edu.ve', NOW() - INTERVAL '2 months', 'Aceptada');

-- =============================================================================
-- 7. GRUPOS DE INTERÉS + PERTENECE_A_GRUPO
-- =============================================================================

INSERT INTO GRUPO_INTERES (nombre_grupo, descripcion_grupo, visibilidad, correo_creador, fecha_creacion) VALUES
('Desarrolladores UCAB', 'Comunidad de programadores', 'Público', 'oscar@ucab.edu.ve', NOW() - INTERVAL '8 months'),
('MBA Network', 'Red de MBA', 'Público', 'andres.castro@ucab.edu.ve', NOW() - INTERVAL '1 year'),
('Data Science Club', 'Data science y ML', 'Público', 'sebastian.lopez@ucab.edu.ve', NOW() - INTERVAL '6 months'),
('Emprendedores UCAB', 'Startups', 'Público', 'andres.castro@ucab.edu.ve', NOW() - INTERVAL '2 years'),
('Gaming UCAB', 'Comunidad gamer', 'Público', 'pedro@ucab.edu.ve', NOW() - INTERVAL '4 months'),
('Fotografía y Arte', 'Arte visual', 'Público', 'pablo.guerrero@ucab.edu.ve', NOW() - INTERVAL '5 months'),
('Investigación IA', 'Investigadores IA', 'Privado', 'ricardo.aguilar@ucab.edu.ve', NOW() - INTERVAL '1 year'),
('Alumni Caracas', 'Egresados Caracas', 'Público', 'egresado.tech@gmail.com', NOW() - INTERVAL '3 years'),
('Comunicación Digital', 'Periodismo digital', 'Público', 'victoria.paredes@ucab.edu.ve', NOW() - INTERVAL '7 months'),
('Salud y Bienestar', 'Wellness', 'Público', 'andrea.diaz@ucab.edu.ve', NOW() - INTERVAL '3 months');

INSERT INTO PERTENECE_A_GRUPO (correo_persona, nombre_grupo, fecha_union, rol_en_grupo) VALUES
('oscar@ucab.edu.ve', 'Desarrolladores UCAB', NOW() - INTERVAL '8 months', 'Administrador'),
('luis@ucab.edu.ve', 'Desarrolladores UCAB', NOW() - INTERVAL '7 months', 'Moderador'),
('diego.ramirez@ucab.edu.ve', 'Desarrolladores UCAB', NOW() - INTERVAL '6 months', 'Miembro'),
('alejandro.navarro@ucab.edu.ve', 'Desarrolladores UCAB', NOW() - INTERVAL '5 months', 'Miembro'),
('david.fuentes@ucab.edu.ve', 'Desarrolladores UCAB', NOW() - INTERVAL '4 months', 'Miembro'),
('roberto.herrera@ucab.edu.ve', 'Desarrolladores UCAB', NOW() - INTERVAL '3 months', 'Miembro'),
('sebastian.lopez@ucab.edu.ve', 'Data Science Club', NOW() - INTERVAL '6 months', 'Administrador'),
('ricardo.aguilar@ucab.edu.ve', 'Data Science Club', NOW() - INTERVAL '5 months', 'Moderador'),
('luis@ucab.edu.ve', 'Data Science Club', NOW() - INTERVAL '4 months', 'Miembro'),
('mateo.gonzalez@ucab.edu.ve', 'Data Science Club', NOW() - INTERVAL '3 months', 'Miembro'),
('pedro@ucab.edu.ve', 'Gaming UCAB', NOW() - INTERVAL '4 months', 'Administrador'),
('juan@ucab.edu.ve', 'Gaming UCAB', NOW() - INTERVAL '3 months', 'Miembro'),
('diego.ramirez@ucab.edu.ve', 'Gaming UCAB', NOW() - INTERVAL '2 months', 'Miembro'),
('andres.castro@ucab.edu.ve', 'MBA Network', NOW() - INTERVAL '1 year', 'Administrador'),
('alumni.empresaria@gmail.com', 'MBA Network', NOW() - INTERVAL '10 months', 'Moderador'),
('felipe.rojas@ucab.edu.ve', 'MBA Network', NOW() - INTERVAL '8 months', 'Miembro'),
('ricardo.aguilar@ucab.edu.ve', 'Investigación IA', NOW() - INTERVAL '1 year', 'Administrador'),
('sebastian.lopez@ucab.edu.ve', 'Investigación IA', NOW() - INTERVAL '10 months', 'Miembro'),
('luis@ucab.edu.ve', 'Investigación IA', NOW() - INTERVAL '8 months', 'Miembro');

-- =============================================================================
-- 8. CONVERSACION + PARTICIPA_EN + MENSAJE (CORREGIDO)
-- =============================================================================

DO $$
DECLARE
    v_fecha_chat1 TIMESTAMP := NOW() - INTERVAL '2 months';
    v_fecha_chat2 TIMESTAMP := NOW() - INTERVAL '1 month';
    v_fecha_chat3 TIMESTAMP := NOW() - INTERVAL '2 weeks';
    v_id_conv1 INTEGER; -- NUEVO: Variable para guardar el ID de la conversación
    v_id_conv2 INTEGER;
    v_id_conv3 INTEGER;
BEGIN
    -- Chat 1: Oscar y Luis
    -- 1. INSERTAR CONVERSACIÓN y capturar el ID generado por SERIAL
    INSERT INTO CONVERSACION (correo_creador, fecha_creacion_chat, titulo_chat, tipo_conversacion) 
    VALUES ('oscar@ucab.edu.ve', v_fecha_chat1, 'Proyecto BD', 'Privado')
    RETURNING clave_conversacion INTO v_id_conv1; -- CAPTURAR EL ID

    -- 2. INSERTAR PARTICIPANTES usando el ID (fk_conversacion)
    INSERT INTO PARTICIPA_EN (fk_conversacion, correo_participante, fecha_ingreso) 
    VALUES (v_id_conv1, 'oscar@ucab.edu.ve', v_fecha_chat1);
    INSERT INTO PARTICIPA_EN (fk_conversacion, correo_participante, fecha_ingreso) 
    VALUES (v_id_conv1, 'luis@ucab.edu.ve', v_fecha_chat1 + INTERVAL '1 minute');

    -- 3. INSERTAR MENSAJES usando el ID (fk_conversacion)
    INSERT INTO MENSAJE (fk_conversacion, fecha_hora_envio, correo_autor_mensaje, texto_mensaje, estado_mensaje) 
    VALUES (v_id_conv1, v_fecha_chat1 + INTERVAL '5 minutes', 'oscar@ucab.edu.ve', 'Hola Luis, ¿cómo vas con el proyecto?', 'Leído');
    INSERT INTO MENSAJE (fk_conversacion, fecha_hora_envio, correo_autor_mensaje, texto_mensaje, estado_mensaje) 
    VALUES (v_id_conv1, v_fecha_chat1 + INTERVAL '10 minutes', 'luis@ucab.edu.ve', 'Bien, ya terminé las consultas SQL', 'Leído');
    INSERT INTO MENSAJE (fk_conversacion, fecha_hora_envio, correo_autor_mensaje, texto_mensaje, estado_mensaje) 
    VALUES (v_id_conv1, v_fecha_chat1 + INTERVAL '15 minutes', 'oscar@ucab.edu.ve', 'Perfecto, nos vemos mañana', 'Leído');

    -- Chat 2: Grupo Gaming
    INSERT INTO CONVERSACION (correo_creador, fecha_creacion_chat, titulo_chat, tipo_conversacion) 
    VALUES ('pedro@ucab.edu.ve', v_fecha_chat2, 'Torneo FIFA', 'Grupo')
    RETURNING clave_conversacion INTO v_id_conv2;

    INSERT INTO PARTICIPA_EN (fk_conversacion, correo_participante, fecha_ingreso) 
    VALUES (v_id_conv2, 'pedro@ucab.edu.ve', v_fecha_chat2);
    INSERT INTO PARTICIPA_EN (fk_conversacion, correo_participante, fecha_ingreso) 
    VALUES (v_id_conv2, 'juan@ucab.edu.ve', v_fecha_chat2 + INTERVAL '1 minute');
    INSERT INTO PARTICIPA_EN (fk_conversacion, correo_participante, fecha_ingreso) 
    VALUES (v_id_conv2, 'diego.ramirez@ucab.edu.ve', v_fecha_chat2 + INTERVAL '2 minutes');
    
    INSERT INTO MENSAJE (fk_conversacion, fecha_hora_envio, correo_autor_mensaje, texto_mensaje, estado_mensaje) 
    VALUES (v_id_conv2, v_fecha_chat2 + INTERVAL '5 minutes', 'pedro@ucab.edu.ve', '¡El torneo es este viernes!', 'Leído');
    INSERT INTO MENSAJE (fk_conversacion, fecha_hora_envio, correo_autor_mensaje, texto_mensaje, estado_mensaje) 
    VALUES (v_id_conv2, v_fecha_chat2 + INTERVAL '8 minutes', 'juan@ucab.edu.ve', 'Yo me anoto 🎮', 'Leído');
    INSERT INTO MENSAJE (fk_conversacion, fecha_hora_envio, correo_autor_mensaje, texto_mensaje, estado_mensaje) 
    VALUES (v_id_conv2, v_fecha_chat2 + INTERVAL '12 minutes', 'diego.ramirez@ucab.edu.ve', 'Cuenta conmigo también', 'Entregado');

    -- Chat 3: Sebastián y Ricardo (Data Science)
    INSERT INTO CONVERSACION (correo_creador, fecha_creacion_chat, titulo_chat, tipo_conversacion) 
    VALUES ('sebastian.lopez@ucab.edu.ve', v_fecha_chat3, 'Paper ML', 'Privado')
    RETURNING clave_conversacion INTO v_id_conv3;

    INSERT INTO PARTICIPA_EN (fk_conversacion, correo_participante, fecha_ingreso) 
    VALUES (v_id_conv3, 'sebastian.lopez@ucab.edu.ve', v_fecha_chat3);
    INSERT INTO PARTICIPA_EN (fk_conversacion, correo_participante, fecha_ingreso) 
    VALUES (v_id_conv3, 'ricardo.aguilar@ucab.edu.ve', v_fecha_chat3 + INTERVAL '1 minute');
    
    INSERT INTO MENSAJE (fk_conversacion, fecha_hora_envio, correo_autor_mensaje, texto_mensaje, estado_mensaje) 
    VALUES (v_id_conv3, v_fecha_chat3 + INTERVAL '5 minutes', 'sebastian.lopez@ucab.edu.ve', '¿Revisaste el modelo de NLP?', 'Leído');
    INSERT INTO MENSAJE (fk_conversacion, fecha_hora_envio, correo_autor_mensaje, texto_mensaje, estado_mensaje) 
    VALUES (v_id_conv3, v_fecha_chat3 + INTERVAL '20 minutes', 'ricardo.aguilar@ucab.edu.ve', 'Sí, el accuracy subió a 94%', 'Enviado');
END $$;

-- =============================================================================
-- 9. TUTORIA + SOLICITA_TUTORIA (CORREGIDO)
-- =============================================================================

DO $$
DECLARE
    v_fecha_tut1 TIMESTAMP := NOW() - INTERVAL '2 years';
    v_fecha_tut2 TIMESTAMP := NOW() - INTERVAL '1 year';
    v_fecha_tut3 TIMESTAMP := NOW() - INTERVAL '3 years';
    v_fecha_tut4 TIMESTAMP := NOW() - INTERVAL '1 year';
    v_fecha_tut5 TIMESTAMP := NOW() - INTERVAL '6 months';
    v_fecha_tut6 TIMESTAMP := NOW() - INTERVAL '8 months';
    v_fecha_tut7 TIMESTAMP := NOW() - INTERVAL '2 years';
    
    v_id_tut1 INTEGER; -- NUEVO: Variables para guardar el ID de la tutoría
    v_id_tut2 INTEGER;
    v_id_tut3 INTEGER;
    v_id_tut4 INTEGER;
    v_id_tut5 INTEGER;
    v_id_tut6 INTEGER;
    v_id_tut7 INTEGER;
BEGIN
    -- Tutorías (INSERTAR y CAPTURAR ID)
    INSERT INTO TUTORIA (correo_tutor, area_conocimiento, fecha_alta, descripcion_enfoque) 
    VALUES ('prof.martinez@ucab.edu.ve', 'Desarrollo de Software', v_fecha_tut1, 'Arquitectura y buenas prácticas')
    RETURNING clave_tutoria INTO v_id_tut1;
    
    INSERT INTO TUTORIA (correo_tutor, area_conocimiento, fecha_alta, descripcion_enfoque) 
    VALUES ('prof.martinez@ucab.edu.ve', 'Bases de Datos', v_fecha_tut2, 'Diseño y optimización')
    RETURNING clave_tutoria INTO v_id_tut2;
    
    INSERT INTO TUTORIA (correo_tutor, area_conocimiento, fecha_alta, descripcion_enfoque) 
    VALUES ('prof.rodriguez@ucab.edu.ve', 'Gerencia de Proyectos', v_fecha_tut3, 'Metodologías ágiles')
    RETURNING clave_tutoria INTO v_id_tut3;
    
    INSERT INTO TUTORIA (correo_tutor, area_conocimiento, fecha_alta, descripcion_enfoque) 
    VALUES ('egresado.tech@gmail.com', 'Emprendimiento Tech', v_fecha_tut4, 'Crear y escalar startups')
    RETURNING clave_tutoria INTO v_id_tut4;
    
    INSERT INTO TUTORIA (correo_tutor, area_conocimiento, fecha_alta, descripcion_enfoque) 
    VALUES ('sebastian.lopez@ucab.edu.ve', 'Data Science', v_fecha_tut5, 'Machine learning con Python')
    RETURNING clave_tutoria INTO v_id_tut5;
    
    INSERT INTO TUTORIA (correo_tutor, area_conocimiento, fecha_alta, descripcion_enfoque) 
    VALUES ('ricardo.aguilar@ucab.edu.ve', 'Inteligencia Artificial', v_fecha_tut6, 'Deep learning y NLP')
    RETURNING clave_tutoria INTO v_id_tut6;
    
    INSERT INTO TUTORIA (correo_tutor, area_conocimiento, fecha_alta, descripcion_enfoque) 
    VALUES ('alumni.empresaria@gmail.com', 'Finanzas Corporativas', v_fecha_tut7, 'Análisis financiero')
    RETURNING clave_tutoria INTO v_id_tut7;

    -- Solicitudes de tutoría (usando el ID simple)
    INSERT INTO SOLICITA_TUTORIA (correo_solicitante, fk_tutoria, fecha_solicitud, estado) 
    VALUES ('oscar@ucab.edu.ve', v_id_tut1, NOW() - INTERVAL '6 months', 'Completada');
    
    INSERT INTO SOLICITA_TUTORIA (correo_solicitante, fk_tutoria, fecha_solicitud, estado) 
    VALUES ('luis@ucab.edu.ve', v_id_tut2, NOW() - INTERVAL '3 months', 'Aceptada');
    
    INSERT INTO SOLICITA_TUTORIA (correo_solicitante, fk_tutoria, fecha_solicitud, estado) 
    VALUES ('andres.castro@ucab.edu.ve', v_id_tut7, NOW() - INTERVAL '1 month', 'Aceptada');
    
    INSERT INTO SOLICITA_TUTORIA (correo_solicitante, fk_tutoria, fecha_solicitud, estado) 
    VALUES ('mateo.gonzalez@ucab.edu.ve', v_id_tut5, NOW() - INTERVAL '2 weeks', 'Enviada');
    
    INSERT INTO SOLICITA_TUTORIA (correo_solicitante, fk_tutoria, fecha_solicitud, estado) 
    VALUES ('diego.ramirez@ucab.edu.ve', v_id_tut4, NOW() - INTERVAL '1 week', 'Enviada');
END $$;

-- =============================================================================
-- 10. OFERTA_LABORAL + SE_POSTULA (CORREGIDO)
-- =============================================================================

DO $$
DECLARE
    v_fecha1 TIMESTAMP := NOW() - INTERVAL '10 days';
    v_fecha2 TIMESTAMP := NOW() - INTERVAL '7 days';
    v_fecha3 TIMESTAMP := NOW() - INTERVAL '15 days';
    v_fecha4 TIMESTAMP := NOW() - INTERVAL '5 days';
    v_fecha5 TIMESTAMP := NOW() - INTERVAL '3 days';
    
    v_id_oferta1 INTEGER; -- NUEVO: Variables para guardar el ID de la oferta
    v_id_oferta2 INTEGER;
    v_id_oferta3 INTEGER;
    v_id_oferta4 INTEGER;
    v_id_oferta5 INTEGER;
    v_id_oferta6 INTEGER;
BEGIN
    -- Ofertas (INSERTAR y CAPTURAR ID)
    INSERT INTO OFERTA_LABORAL (correo_organizacion, fecha_publicacion, titulo_oferta, descripcion_cargo, requisitos, modalidad) 
    VALUES ('talento@banesco.com', v_fecha1, 'Analista de Datos Junior', 'Análisis de datos financieros', 'SQL, Python, Excel', 'Híbrido')
    RETURNING clave_oferta INTO v_id_oferta1;
    
    INSERT INTO OFERTA_LABORAL (correo_organizacion, fecha_publicacion, titulo_oferta, descripcion_cargo, requisitos, modalidad) 
    VALUES ('talento@banesco.com', v_fecha2, 'Desarrollador Backend Java', 'Desarrollo de servicios bancarios', 'Java, Spring Boot', 'Presencial')
    RETURNING clave_oferta INTO v_id_oferta2;
    
    INSERT INTO OFERTA_LABORAL (correo_organizacion, fecha_publicacion, titulo_oferta, descripcion_cargo, requisitos, modalidad) 
    VALUES ('rrhh@movistar.com.ve', v_fecha3, 'Ingeniero DevOps', 'Automatización cloud', 'AWS, Docker, Kubernetes', 'Remoto')
    RETURNING clave_oferta INTO v_id_oferta3;
    
    INSERT INTO OFERTA_LABORAL (correo_organizacion, fecha_publicacion, titulo_oferta, descripcion_cargo, requisitos, modalidad) 
    VALUES ('rrhh@movistar.com.ve', v_fecha4, 'Product Manager', 'Gestión de productos digitales', 'Scrum, Jira', 'Híbrido')
    RETURNING clave_oferta INTO v_id_oferta4;
    
    INSERT INTO OFERTA_LABORAL (correo_organizacion, fecha_publicacion, titulo_oferta, descripcion_cargo, requisitos, modalidad) 
    VALUES ('innovacion@ucab.edu.ve', v_fecha5, 'Mentor de Startups', 'Acompañamiento emprendedores', 'Experiencia emprendimiento', 'Presencial')
    RETURNING clave_oferta INTO v_id_oferta5;
    
    INSERT INTO OFERTA_LABORAL (correo_organizacion, fecha_publicacion, titulo_oferta, descripcion_cargo, requisitos, modalidad) 
    VALUES ('rrhh@polar.com', NOW() - INTERVAL '5 days', 'Desarrollador Junior SQL', 'Experto en PostgreSQL', 'SQL Avanzado', 'Presencial')
    RETURNING clave_oferta INTO v_id_oferta6;

    -- Postulaciones (usando el ID simple)
    INSERT INTO SE_POSTULA (correo_persona, fk_oferta, fecha_postulacion, estado_postulacion) 
    VALUES ('sebastian.lopez@ucab.edu.ve', v_id_oferta1, NOW() - INTERVAL '9 days', 'En Revisión');
    
    INSERT INTO SE_POSTULA (correo_persona, fk_oferta, fecha_postulacion, estado_postulacion) 
    VALUES ('luis@ucab.edu.ve', v_id_oferta1, NOW() - INTERVAL '8 days', 'Enviada');
    
    INSERT INTO SE_POSTULA (correo_persona, fk_oferta, fecha_postulacion, estado_postulacion) 
    VALUES ('david.fuentes@ucab.edu.ve', v_id_oferta3, NOW() - INTERVAL '14 days', 'Aceptada');
    
    INSERT INTO SE_POSTULA (correo_persona, fk_oferta, fecha_postulacion, estado_postulacion) 
    VALUES ('roberto.herrera@ucab.edu.ve', v_id_oferta3, NOW() - INTERVAL '13 days', 'En Revisión');
    
    INSERT INTO SE_POSTULA (correo_persona, fk_oferta, fecha_postulacion, estado_postulacion) 
    VALUES ('alejandro.navarro@ucab.edu.ve', v_id_oferta2, NOW() - INTERVAL '6 days', 'Enviada');
    
    INSERT INTO SE_POSTULA (correo_persona, fk_oferta, fecha_postulacion, estado_postulacion) 
    VALUES ('oscar@ucab.edu.ve', v_id_oferta6, NOW() - INTERVAL '4 days', 'Enviada');
END $$;

-- =============================================================================
-- 11. CONTENIDO + PUBLICACION (80+ publicaciones) (CORREGIDO)
-- =============================================================================

DO $$
DECLARE
    contenidos TEXT[] := ARRAY[ /* ... (Mismo array, no necesita cambio) ... */ ];
    autores TEXT[] := ARRAY[ /* ... (Mismo array, no necesita cambio) ... */ ];
    v_fecha TIMESTAMP;
    v_autor TEXT;
    v_contenido TEXT;
    vis TEXT[] := ARRAY['Público', 'Público', 'Público', 'Solo Conexiones'];
    v_id_contenido INTEGER; -- NUEVO: Variable para capturar el ID de CONTENIDO
BEGIN
    FOR i IN 1..80 LOOP
        v_fecha := NOW() - (RANDOM() * INTERVAL '180 days');
        v_autor := autores[1 + FLOOR(RANDOM() * ARRAY_LENGTH(autores, 1))::INT];
        v_contenido := contenidos[1 + FLOOR(RANDOM() * ARRAY_LENGTH(contenidos, 1))::INT] || ' #' || i;
        
        -- 1. INSERTAR CONTENIDO y CAPTURAR el ID
        INSERT INTO CONTENIDO (correo_autor, fecha_hora_creacion, texto_contenido, visibilidad)
        VALUES (v_autor, v_fecha, v_contenido, vis[1 + FLOOR(RANDOM() * ARRAY_LENGTH(vis, 1))::INT])
        RETURNING clave_contenido INTO v_id_contenido; -- CAPTURAR EL ID
        
        -- 2. INSERTAR PUBLICACION usando la FK simple
        INSERT INTO PUBLICACION (fk_contenido) -- Solo necesitamos el ID!
        VALUES (v_id_contenido);
    END LOOP;
END $$;

-- =============================================================================
-- 12. EVENTO (15 eventos pasados y futuros) (CORREGIDO)
-- =============================================================================

DO $$
DECLARE
    eventos TEXT[][] := ARRAY[ /* ... (Mismo array, no necesita cambio) ... */ ];
    ev TEXT[];
    v_fecha_creacion TIMESTAMP;
    v_fecha_inicio TIMESTAMP;
    v_fecha_fin TIMESTAMP;
    v_id_contenido INTEGER; -- NUEVO: Variable para capturar el ID de CONTENIDO
BEGIN
    FOREACH ev SLICE 1 IN ARRAY eventos LOOP
        v_fecha_creacion := NOW() + (ev[4]::INT * INTERVAL '1 day') - INTERVAL '5 days';
        v_fecha_inicio := NOW() + (ev[4]::INT * INTERVAL '1 day');
        v_fecha_fin := v_fecha_inicio + (ev[5]::INT * INTERVAL '1 hour');
        
        -- 1. INSERTAR CONTENIDO y CAPTURAR el ID
        INSERT INTO CONTENIDO (correo_autor, fecha_hora_creacion, texto_contenido, visibilidad)
        VALUES (ev[1], v_fecha_creacion, ev[3], 'Público')
        RETURNING clave_contenido INTO v_id_contenido; -- CAPTURAR EL ID
        
        -- 2. INSERTAR EVENTO usando la FK simple
        INSERT INTO EVENTO (fk_contenido, titulo, fecha_inicio, fecha_fin, ciudad_ubicacion, pais_ubicacion)
        VALUES (v_id_contenido, ev[2], v_fecha_inicio, v_fecha_fin, ev[6], 'Venezuela');
    END LOOP;
END $$;

-- =============================================================================
-- 13. REACCIONA_CONTENIDO (400+ reacciones) (CORREGIDO)
-- =============================================================================

DO $$
DECLARE
    reactores TEXT[] := ARRAY[ /* ... (Mismo array, no necesita cambio) ... */ ];
    reacciones TEXT[] := ARRAY[ /* ... (Mismo array, no necesita cambio) ... */ ];
    -- CAMBIO: Usamos el ID simple para iterar
    v_contenido RECORD; 
    v_reactor TEXT;
    v_reaccion TEXT;
    num_reacciones INT;
BEGIN
    -- Iterar sobre los IDs de CONTENIDO
    FOR v_contenido IN SELECT clave_contenido, correo_autor, fecha_hora_creacion FROM CONTENIDO LOOP
        num_reacciones := 3 + FLOOR(RANDOM() * 10)::INT;
        FOR i IN 1..num_reacciones LOOP
            v_reactor := reactores[1 + FLOOR(RANDOM() * ARRAY_LENGTH(reactores, 1))::INT];
            v_reaccion := reacciones[1 + FLOOR(RANDOM() * ARRAY_LENGTH(reacciones, 1))::INT];
            IF v_reactor <> v_contenido.correo_autor THEN
                -- INSERTAR REACCIÓN usando el ID de contenido
                INSERT INTO REACCIONA_CONTENIDO (correo_miembro, fk_contenido, nombre_reaccion, fecha_hora_reaccion)
                VALUES (v_reactor, v_contenido.clave_contenido, v_reaccion, v_contenido.fecha_hora_creacion + (RANDOM() * INTERVAL '48 hours'))
                ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- =============================================================================
-- 14. COMENTARIO (150+ comentarios) (CORREGIDO)
-- =============================================================================

DO $$
DECLARE
    comentaristas TEXT[] := ARRAY[ /* ... */ ];
    textos TEXT[] := ARRAY[ /* ... */ ];
    -- CAMBIO: Usamos el ID simple para la tabla principal
    v_contenido RECORD;
    v_comentarista TEXT;
    v_texto TEXT;
    num_comentarios INT;
    v_offset INT;
BEGIN
    -- Iterar sobre los IDs de CONTENIDO (limitamos a 50 contenidos públicos para crear comentarios)
    FOR v_contenido IN SELECT clave_contenido, correo_autor, fecha_hora_creacion FROM CONTENIDO WHERE visibilidad = 'Público' ORDER BY RANDOM() LIMIT 50 LOOP
        num_comentarios := 1 + FLOOR(RANDOM() * 5)::INT;
        v_offset := 0;
        FOR i IN 1..num_comentarios LOOP
            v_comentarista := comentaristas[1 + FLOOR(RANDOM() * ARRAY_LENGTH(comentaristas, 1))::INT];
            v_texto := textos[1 + FLOOR(RANDOM() * ARRAY_LENGTH(textos, 1))::INT];
            v_offset := v_offset + 1 + FLOOR(RANDOM() * 30)::INT;
            IF v_comentarista <> v_contenido.correo_autor THEN
                -- INSERTAR COMENTARIO usando el ID simple
                INSERT INTO COMENTARIO (fk_contenido, fecha_hora_comentario, correo_autor_comentario, texto_comentario)
                VALUES (v_contenido.clave_contenido, v_contenido.fecha_hora_creacion + (v_offset * INTERVAL '1 minute'), v_comentarista, v_texto)
                ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- =============================================================================
-- 15. REACCIONA_COMENTARIO (50+ reacciones a comentarios) (CORREGIDO)
-- =============================================================================

DO $$
DECLARE
    reactores TEXT[] := ARRAY[ /* ... */ ];
    reacciones TEXT[] := ARRAY[ /* ... */ ];
    -- CAMBIO: Iterar sobre los IDs de los comentarios
    v_comentario RECORD; 
    v_reactor TEXT;
    v_reaccion TEXT;
BEGIN
    -- Iterar sobre los IDs de los comentarios
    FOR v_comentario IN SELECT clave_comentario, fecha_hora_comentario FROM COMENTARIO ORDER BY RANDOM() LIMIT 50 LOOP
        v_reactor := reactores[1 + FLOOR(RANDOM() * ARRAY_LENGTH(reactores, 1))::INT];
        v_reaccion := reacciones[1 + FLOOR(RANDOM() * ARRAY_LENGTH(reacciones, 1))::INT];
        
        -- INSERTAR REACCIÓN usando el ID simple de COMENTARIO
        INSERT INTO REACCIONA_COMENTARIO (correo_miembro, fk_comentario, nombre_reaccion, fecha_hora_reaccion)
        VALUES (v_reactor, v_comentario.clave_comentario, v_reaccion, v_comentario.fecha_hora_comentario + INTERVAL '1 hour')
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- =============================================================================
-- FIN DEL SCRIPT - RESUMEN
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Poblado completo de las 25 tablas (Usando IDs SERIAL):';
    RAISE NOTICE '   TIPO_REACCION, TIPO_NEXO, ROL';
    RAISE NOTICE '   MIEMBRO, PERSONA, CONFIGURACION, ENTIDAD_ORGANIZACIONAL';
    RAISE NOTICE '   MIEMBRO_POSEE_ROL, TIENE_NEXO, SOLICITA_CONEXION';
    RAISE NOTICE '   GRUPO_INTERES, PERTENECE_A_GRUPO';
    RAISE NOTICE '   CONVERSACION, PARTICIPA_EN, MENSAJE';
    RAISE NOTICE '   TUTORIA, SOLICITA_TUTORIA';
    RAISE NOTICE '   OFERTA_LABORAL, SE_POSTULA';
    RAISE NOTICE '   CONTENIDO, PUBLICACION, EVENTO';
    RAISE NOTICE '   COMENTARIO, REACCIONA_CONTENIDO, REACCIONA_COMENTARIO';
END $$;