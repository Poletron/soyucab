-- =============================================================================
-- SCRIPT DE TRIGGERS - VALIDACIONES Y REGLAS DE NEGOCIO
-- =============================================================================

-- =============================================================================
-- 1. TRIGGER: EVITAR AUTO-REACCIÓN (Anti Auto-Like)
-- Autor: Oscar Jaramillo
-- =============================================================================

-- FASE 1: Función del Trigger
CREATE OR REPLACE FUNCTION FN_TRG_EVITAR_AUTO_REACCION()
RETURNS TRIGGER AS $$
DECLARE
    v_correo_autor_contenido VARCHAR(255);
BEGIN
    -- 1. Buscar el autor original del contenido
    SELECT correo_autor INTO v_correo_autor_contenido
    FROM CONTENIDO
    WHERE clave_contenido = NEW.fk_contenido;

    -- 2. Lógica de Comparación:
    -- Si el usuario que reacciona ES IGUAL al autor del contenido
    IF NEW.correo_miembro = v_correo_autor_contenido THEN
        RAISE EXCEPTION 'Violación de Regla de Negocio: No puedes reaccionar a tu propio contenido (Auto-Like prohibido).';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- FASE 2: Vincular el Trigger
CREATE TRIGGER TRG_EVITAR_AUTO_REACCION
BEFORE INSERT ON REACCIONA_CONTENIDO
FOR EACH ROW
EXECUTE FUNCTION FN_TRG_EVITAR_AUTO_REACCION();


-- =============================================================================
-- 2. TRIGGER: SEGURIDAD DE MENSAJERÍA
-- Autor: Luis Torres
-- =============================================================================
-- Regla: Solo participantes de una conversación pueden enviar mensajes.

CREATE OR REPLACE FUNCTION FN_TRG_SEGURIDAD_MENSAJERIA()
RETURNS TRIGGER AS $$
DECLARE
    v_es_participante BOOLEAN; 
BEGIN
    -- Verificar si el autor es un participante de la conversación
    SELECT EXISTS (
        SELECT 1 
        FROM PARTICIPA_EN 
        WHERE fk_conversacion = NEW.fk_conversacion
        AND correo_participante = NEW.correo_autor_mensaje
    ) INTO v_es_participante;

    IF NOT v_es_participante THEN
        RAISE EXCEPTION 'Violación de Regla de Negocio: El remitente no es un participante activo de esta conversación.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER TRG_SEGURIDAD_MENSAJERIA
BEFORE INSERT ON MENSAJE
FOR EACH ROW
EXECUTE FUNCTION FN_TRG_SEGURIDAD_MENSAJERIA();

-- =============================================================================
-- 3. TRIGGER: VALIDAR POSTULACIÓN VENCIDA
-- Autor: Pedro Urdaneta
-- =============================================================================
-- Regla: No se permiten postulaciones a ofertas con fecha de vencimiento pasada.

CREATE OR REPLACE FUNCTION FN_TRG_CERRAR_POSTULACION_VENCIDA()
RETURNS TRIGGER AS $$
DECLARE
    vencimiento TIMESTAMP;
BEGIN
    SELECT fecha_vencimiento
    INTO vencimiento
    FROM OFERTA_LABORAL
    WHERE clave_oferta = NEW.fk_oferta; 

    -- Si la fecha de vencimiento existe y es anterior a la postulación, bloquear.
    IF vencimiento IS NOT NULL AND vencimiento < NEW.fecha_postulacion THEN
        RAISE EXCEPTION 
            'Postulación denegada: La oferta laboral ID % venció el %', 
            NEW.fk_oferta, vencimiento::DATE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER TRG_CERRAR_POSTULACION_VENCIDA
BEFORE INSERT ON SE_POSTULA
FOR EACH ROW
EXECUTE FUNCTION FN_TRG_CERRAR_POSTULACION_VENCIDA();