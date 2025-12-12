-- =============================================================================
-- SCRIPT DE SEGURIDAD (DCL) - ROLES Y RLS
-- Proyecto: SoyUCAB
-- Objetivo: Implementación estricta de RBAC y Matriz de Privacidad.
-- =============================================================================

-- =============================================================================
-- 1. LIMPIEZA INICIAL - POLÍTICAS RLS
-- =============================================================================
-- Limpieza inicial de políticas
DROP POLICY IF EXISTS p_contenido_publico ON CONTENIDO;
DROP POLICY IF EXISTS p_contenido_privado ON CONTENIDO;
DROP POLICY IF EXISTS p_contenido_conexiones ON CONTENIDO;

-- Eliminamos la función de identidad
DROP FUNCTION IF EXISTS fn_get_auth_correo();


-- =============================================================================
-- 2. LIMPIEZA INICIAL - USUARIOS Y ROLES
-- =============================================================================
-- NOTA: Los usuarios deben eliminarse antes que los roles padre
DROP ROLE IF EXISTS usr_oscar;
DROP ROLE IF EXISTS usr_luis;
DROP ROLE IF EXISTS usr_extrano;
DROP ROLE IF EXISTS usr_polar;
DROP ROLE IF EXISTS usr_admin_moderador;
DROP ROLE IF EXISTS usr_auditor;
DROP ROLE IF EXISTS usr_anonimo;

-- Ahora eliminamos los roles genéricos
DROP ROLE IF EXISTS rol_persona;
DROP ROLE IF EXISTS rol_entidad;
DROP ROLE IF EXISTS rol_moderador;
DROP ROLE IF EXISTS rol_auditor;
DROP ROLE IF EXISTS rol_anonimo;


-- =============================================================================
-- 3. CREACIÓN DE PERFILES (ROLES GENÉRICOS)
-- =============================================================================

-- A. Rol Anónimo (Invitado - solo lectura de contenido público)
CREATE ROLE rol_anonimo NOLOGIN;

-- B. Rol Persona (Estudiantes, Profesores, Egresados)
CREATE ROLE rol_persona NOLOGIN;

-- C. Rol Entidad (Organizaciones, Empresas)
CREATE ROLE rol_entidad NOLOGIN;

-- D. Rol Moderador (Gestión de Comunidad)
-- BYPASSRLS para que pueda ver contenido privado reportado.
CREATE ROLE rol_moderador NOLOGIN BYPASSRLS; 

-- E. Rol Auditor (Herramientas de BI y Reportería)
-- Acceso de solo lectura para análisis y métricas
CREATE ROLE rol_auditor NOLOGIN; 


-- =============================================================================
-- 4. CREACIÓN DE USUARIOS (ACTORES)
-- =============================================================================
-- +----------------------+---------------------+----------------+----------+
-- | Usuario PostgreSQL   | Correo Asociado     | Rol            | Password |
-- +----------------------+---------------------+----------------+----------+
-- | usr_anonimo          | (sin autenticar)    | Anónimo        | guest    |
-- | usr_oscar            | oscar@ucab.edu.ve   | Persona        | 1234     |
-- | usr_luis             | luis@ucab.edu.ve    | Persona (amigo)| 1234     |
-- | usr_extrano          | nuevo.ingreso@...   | Persona (solo) | 1234     |
-- | usr_polar            | rrhh@polar.com      | Entidad        | 1234     |
-- | usr_admin_moderador  | (staff)             | Moderador      | admin123 |
-- | usr_auditor          | (BI/reportes)       | Auditor        | audit123 |
-- +----------------------+---------------------+----------------+----------+

-- Usuario Anónimo/Invitado (solo lectura de contenido público)
CREATE ROLE usr_anonimo WITH LOGIN PASSWORD 'guest' IN ROLE rol_anonimo;

-- Usuarios Normales (rol_persona)
CREATE ROLE usr_oscar WITH LOGIN PASSWORD '1234' IN ROLE rol_persona;
CREATE ROLE usr_luis WITH LOGIN PASSWORD '1234' IN ROLE rol_persona;
CREATE ROLE usr_extrano WITH LOGIN PASSWORD '1234' IN ROLE rol_persona;

-- Usuario Corporativo (rol_entidad)
CREATE ROLE usr_polar WITH LOGIN PASSWORD '1234' IN ROLE rol_entidad;

-- Usuario Staff - Moderador (BYPASSRLS - puede ver contenido privado)
CREATE ROLE usr_admin_moderador WITH LOGIN PASSWORD 'admin123' IN ROLE rol_moderador;

-- Usuario Auditor (solo lectura para BI y reportes)
CREATE ROLE usr_auditor WITH LOGIN PASSWORD 'audit123' IN ROLE rol_auditor;


-- =============================================================================
-- 5. ASIGNACIÓN DE PERMISOS (MATRIZ DE ACCESO)
-- =============================================================================

-- PERMISOS ROL ANÓNIMO (Solo lectura de contenido público)
-- Según documentación: SELECT sobre PERSONA, CONTENIDO, catálogos públicos
GRANT USAGE ON SCHEMA public TO rol_anonimo;
GRANT SELECT ON PERSONA, CONTENIDO, PUBLICACION, EVENTO, COMENTARIO TO rol_anonimo;
GRANT SELECT ON TIPO_REACCION, TIPO_NEXO, ROL, GRUPO_INTERES, TUTORIA, OFERTA_LABORAL TO rol_anonimo;

-- PERMISOS COMUNES (Usuarios autenticados)
GRANT USAGE ON SCHEMA public TO rol_persona, rol_entidad, rol_moderador, rol_auditor;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO rol_persona, rol_entidad, rol_moderador, rol_auditor;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_persona, rol_entidad, rol_moderador, rol_auditor;

-- PERMISOS DEL MODERADOR (Poder Total de Gestión)
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO rol_moderador;

-- PERMISOS DE CONTENIDO (Compartidos entre PERSONA y ENTIDAD)
GRANT INSERT, UPDATE ON CONTENIDO, PUBLICACION, EVENTO, COMENTARIO, REACCIONA_CONTENIDO TO rol_persona, rol_entidad;

-- REGLA ANTI-SPAM DE MENSAJERÍA
-- Solo las PERSONAS pueden iniciar chats y enviar mensajes.
GRANT INSERT, UPDATE ON SOLICITA_CONEXION, CONVERSACION, MENSAJE, PARTICIPA_EN TO rol_persona;

-- PERMISOS DE OFERTAS
GRANT INSERT, UPDATE ON OFERTA_LABORAL TO rol_entidad;
GRANT INSERT, UPDATE ON SE_POSTULA TO rol_persona;


-- =============================================================================
-- 6. TABLA DE MAPEO USUARIO POSTGRES → CORREO
-- =============================================================================
-- Esta tabla permite mapear usuarios de PostgreSQL a correos de la aplicación
-- de forma dinámica (se ejecuta después de 05_Semilla_Datos.sql)
-- =============================================================================

CREATE TABLE IF NOT EXISTS MAPEO_USUARIO_POSTGRES (
    usuario_postgres VARCHAR(63) PRIMARY KEY,
    correo_aplicacion VARCHAR(255) NOT NULL,
    descripcion VARCHAR(100),
    CONSTRAINT fk_mapeo_miembro FOREIGN KEY (correo_aplicacion) REFERENCES MIEMBRO(correo_principal)
);

-- Poblar tabla de mapeo con usuarios de demostración
INSERT INTO MAPEO_USUARIO_POSTGRES (usuario_postgres, correo_aplicacion, descripcion) VALUES
('usr_oscar', 'oscar@ucab.edu.ve', 'Estudiante con conexiones'),
('usr_luis', 'luis@ucab.edu.ve', 'Estudiante amigo de Oscar'),
('usr_extrano', 'nuevo.ingreso@ucab.edu.ve', 'Usuario sin conexiones sociales'),
('usr_polar', 'rrhh@polar.com', 'Empresa Polar'),
('usr_admin_moderador', 'moderador@ucab.edu.ve', 'Moderador del sistema'),
('usr_auditor', 'auditor@ucab.edu.ve', 'Auditor de reportes')
ON CONFLICT (usuario_postgres) DO UPDATE SET correo_aplicacion = EXCLUDED.correo_aplicacion;

-- IMPORTANTE: Dar acceso a todos los roles para que fn_get_auth_correo() funcione
GRANT SELECT ON MAPEO_USUARIO_POSTGRES TO rol_persona, rol_entidad, rol_anonimo, rol_moderador, rol_auditor;


-- =============================================================================
-- 7. FUNCIÓN DE IDENTIDAD (MAPEO) - VERSIÓN DINÁMICA
-- =============================================================================
-- Soporta AMBOS modos:
--   1. API Mode: Lee la variable de sesión 'app.user_email' (Backend Node.js)
--   2. Terminal Mode: Busca en MAPEO_USUARIO_POSTGRES (pgAdmin/psql)
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_get_auth_correo() RETURNS VARCHAR(255) AS $$
DECLARE
    v_api_user VARCHAR(255);
    v_mapped_email VARCHAR(255);
BEGIN
    -- PRIORIDAD 1: Verificar si la API inyectó un usuario en la sesión
    BEGIN
        v_api_user := current_setting('app.user_email', true);
        IF v_api_user IS NOT NULL AND v_api_user <> '' THEN
            RETURN v_api_user;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Variable no existe, continuamos
    END;
    
    -- PRIORIDAD 2: Modo Terminal - Búsqueda dinámica en tabla de mapeo
    SELECT correo_aplicacion INTO v_mapped_email
    FROM MAPEO_USUARIO_POSTGRES
    WHERE usuario_postgres = current_user;
    
    RETURN v_mapped_email; -- Retorna NULL si no encuentra
END;
$$ LANGUAGE plpgsql STABLE;


-- =============================================================================
-- 8. SEGURIDAD A NIVEL DE FILA (RLS) - TABLA CONTENIDO
-- =============================================================================

ALTER TABLE CONTENIDO ENABLE ROW LEVEL SECURITY;

-- Política 1: Visibilidad Pública
CREATE POLICY p_contenido_publico ON CONTENIDO FOR SELECT
USING (visibilidad = 'Público');

-- Política 2: Visibilidad Privada (Autor)
CREATE POLICY p_contenido_privado ON CONTENIDO FOR SELECT
USING (correo_autor = fn_get_auth_correo());

-- Política 3: Visibilidad Conexiones (Amigos)
CREATE POLICY p_contenido_conexiones ON CONTENIDO FOR SELECT
USING (
    visibilidad = 'Solo Conexiones' 
    AND EXISTS (
        SELECT 1 FROM SOLICITA_CONEXION
        WHERE estado_solicitud = 'Aceptada'
        AND (
            (correo_solicitante = fn_get_auth_correo() AND correo_solicitado = correo_autor)
            OR 
            (correo_solicitado = fn_get_auth_correo() AND correo_solicitante = correo_autor)
        )
    )
);

-- NOTA: El rol_moderador ignora estas políticas gracias a BYPASSRLS.


-- =============================================================================
-- 9. PERMISOS PARA VISTAS DE REPORTES
-- =============================================================================
-- Solo el MODERADOR y AUDITOR tienen acceso a los reportes estratégicos

-- Reportes principales de interacción (Oscar)
GRANT SELECT ON V_REPORTE_TOP_VIRAL TO rol_moderador, rol_auditor;
GRANT SELECT ON V_REPORTE_LIDERES_OPINION TO rol_moderador, rol_auditor;
GRANT SELECT ON V_REPORTE_INTERES_EVENTOS TO rol_moderador, rol_auditor;

-- Reportes adicionales de análisis (Luis)
GRANT SELECT ON V_REPORTE_CRECIMIENTO_DEMOGRAFICO TO rol_moderador, rol_auditor;
GRANT SELECT ON V_GRUPOS_MAS_ACTIVOS TO rol_moderador, rol_auditor;
GRANT SELECT ON V_TOP_REFERENTES_COMUNIDAD TO rol_moderador, rol_auditor;

-- Reportes de Pedro (Tutorías, Nexos, Ofertas)
GRANT SELECT ON vista_top5_areas_conocimiento_demanda TO rol_moderador, rol_auditor;
GRANT SELECT ON vista_nexos_vigentes_vs_por_vencer TO rol_moderador, rol_auditor;
GRANT SELECT ON vista_top10_ofertas_mas_postuladas TO rol_moderador, rol_auditor;


-- =============================================================================
-- 10. PERMISOS PARA FUNCIONES Y PROCEDIMIENTOS
-- =============================================================================
-- Funciones de lógica de negocio usadas por las vistas de reportes

-- Funciones de cálculo de métricas (usadas internamente por las vistas)
GRANT EXECUTE ON FUNCTION FN_CALCULAR_NIVEL_IMPACTO(INTEGER) TO rol_moderador, rol_auditor;
GRANT EXECUTE ON FUNCTION FN_CALCULAR_NIVEL_AUTORIDAD(VARCHAR) TO rol_moderador, rol_auditor;
GRANT EXECUTE ON FUNCTION fn_calcular_tasas_cierre_ofertas() TO rol_moderador, rol_auditor;

-- Procedimiento de publicación de ofertas (solo entidades)
GRANT EXECUTE ON PROCEDURE sp_publicar_oferta_validada(VARCHAR, TIMESTAMP, VARCHAR, TEXT, TEXT, VARCHAR) TO rol_entidad;

-- Función de identidad (todos los usuarios autenticados)
GRANT EXECUTE ON FUNCTION fn_get_auth_correo() TO rol_persona, rol_entidad, rol_moderador, rol_auditor;
