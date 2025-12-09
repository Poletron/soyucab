-- =============================================================================
-- SCRIPT DE SEGURIDAD (DCL) - ROLES Y RLS (VERSIÓN FINAL)
-- Proyecto: SoyUCAB
-- Objetivo: Implementación estricta de RBAC y Matriz de Privacidad.
-- Versión: Actualizada a Claves Compuestas
-- =============================================================================

-- 1. LIMPIEZA INICIAL
-- =============================================================================
DROP POLICY IF EXISTS p_contenido_publico ON CONTENIDO;
DROP POLICY IF EXISTS p_contenido_privado ON CONTENIDO;
DROP POLICY IF EXISTS p_contenido_conexiones ON CONTENIDO;
DROP FUNCTION IF EXISTS fn_get_auth_correo;

-- Borramos usuarios y roles si existen
DROP ROLE IF EXISTS usr_oscar;
DROP ROLE IF EXISTS usr_luis;
DROP ROLE IF EXISTS usr_extrano;
DROP ROLE IF EXISTS usr_polar;
DROP ROLE IF EXISTS usr_admin_moderador;

DROP ROLE IF EXISTS rol_persona;
DROP ROLE IF EXISTS rol_entidad;
DROP ROLE IF EXISTS rol_moderador;
DROP ROLE IF EXISTS rol_auditor;

-- 2. CREACIÓN DE PERFILES (ROLES GENÉRICOS)
-- =============================================================================

-- A. Rol Persona (Estudiantes, Profesores, Egresados)
CREATE ROLE rol_persona NOLOGIN;

-- B. Rol Entidad (Organizaciones, Empresas)
CREATE ROLE rol_entidad NOLOGIN;

-- C. Rol Moderador (Gestión de Comunidad)
-- BYPASSRLS para que pueda ver contenido privado reportado.
CREATE ROLE rol_moderador NOLOGIN BYPASSRLS; 

-- D. Rol Auditor (Herramientas de BI y Reportería)
-- Acceso de solo lectura para análisis y métricas
CREATE ROLE rol_auditor NOLOGIN; 


-- 3. CREACIÓN DE USUARIOS (ACTORES)
-- =============================================================================

-- Usuarios Normales
CREATE ROLE usr_oscar WITH LOGIN PASSWORD '1234' IN ROLE rol_persona;
CREATE ROLE usr_luis WITH LOGIN PASSWORD '1234' IN ROLE rol_persona;
CREATE ROLE usr_extrano WITH LOGIN PASSWORD '1234' IN ROLE rol_persona;

-- Usuario Corporativo
CREATE ROLE usr_polar WITH LOGIN PASSWORD '1234' IN ROLE rol_entidad;

-- Usuario Staff (Moderador)
CREATE ROLE usr_admin_moderador WITH LOGIN PASSWORD 'admin123' IN ROLE rol_moderador;


-- 4. ASIGNACIÓN DE PERMISOS (MATRIZ DE ACCESO)
-- =============================================================================

-- PERMISOS COMUNES (Todos pueden leer catálogos y loguearse)
GRANT USAGE ON SCHEMA public TO rol_persona, rol_entidad, rol_moderador, rol_auditor;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO rol_persona, rol_entidad, rol_moderador, rol_auditor;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_persona, rol_entidad, rol_moderador, rol_auditor;

-- PERMISOS DEL MODERADOR (Poder Total de Gestión)
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO rol_moderador;

-- PERMISOS DEL AUDITOR (Solo Lectura para BI y Reportería)
-- Nota: Ya tiene SELECT global, aquí se documenta el propósito

-- PERMISOS DE CONTENIDO (Compartidos)
GRANT INSERT, UPDATE ON CONTENIDO, PUBLICACION, EVENTO, COMENTARIO, REACCIONA_CONTENIDO TO rol_persona, rol_entidad;

-- REGLA ANTI-SPAM DE MENSAJERÍA
-- Solo las PERSONAS pueden iniciar chats y enviar mensajes.
GRANT INSERT, UPDATE ON SOLICITA_CONEXION, CONVERSACION, MENSAJE, PARTICIPA_EN TO rol_persona;

-- PERMISOS DE OFERTAS
GRANT INSERT, UPDATE ON OFERTA_LABORAL TO rol_entidad;
GRANT INSERT, UPDATE ON SE_POSTULA TO rol_persona;


-- 5. FUNCIÓN DE IDENTIDAD (MAPEO) - VERSIÓN HÍBRIDA
-- =============================================================================
-- Soporta AMBOS modos:
--   1. API Mode: Lee la variable de sesión 'app.current_user' (para Backend Node.js)
--   2. Terminal Mode: Mapea el rol de Postgres (para defensa en psql)
-- =============================================================================
CREATE OR REPLACE FUNCTION fn_get_auth_correo() RETURNS VARCHAR(255) AS $$
DECLARE
    v_api_user VARCHAR(255);
BEGIN
    -- PRIORIDAD 1: Verificar si la API inyectó un usuario en la sesión
    BEGIN
        v_api_user := current_setting('app.user_email', true);
        IF v_api_user IS NOT NULL AND v_api_user <> '' THEN
            RETURN v_api_user;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Si la variable no existe, continuamos al modo terminal
        NULL;
    END;
    
    -- PRIORIDAD 2: Modo Terminal - Mapeo de Roles de Postgres
    IF current_user = 'usr_oscar' THEN RETURN 'oscar@ucab.edu.ve';
    ELSIF current_user = 'usr_luis' THEN RETURN 'luis@ucab.edu.ve';
    ELSIF current_user = 'usr_extrano' THEN RETURN 'extranjero@test.com';
    ELSIF current_user = 'usr_polar' THEN RETURN 'rrhh@polar.com';
    ELSE RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;


-- 6. SEGURIDAD A NIVEL DE FILA (RLS)
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
