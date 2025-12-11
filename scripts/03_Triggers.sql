-- =============================================================================
-- OBJETO: TRIGGER (DISPARADOR) (CORREGIDO)
-- =============================================================================

-- PASO 1: CREAR LA FUNCIÓN DEL TRIGGER
CREATE OR REPLACE FUNCTION FN_TRG_EVITAR_AUTO_REACCION()
RETURNS TRIGGER AS $$
DECLARE
    v_correo_autor_contenido VARCHAR(255);
BEGIN
    -- 1. Buscar el autor original del contenido usando la FK simple (NEW.fk_contenido)
    SELECT correo_autor INTO v_correo_autor_contenido
    FROM CONTENIDO
    WHERE clave_contenido = NEW.fk_contenido;

    -- 2. Lógica de Comparación:
    -- Si el usuario que reacciona (NEW.correo_miembro) ES IGUAL al autor del contenido (v_correo_autor_contenido)
    IF NEW.correo_miembro = v_correo_autor_contenido THEN
        RAISE EXCEPTION 'Violación de Regla de Negocio: No puedes reaccionar a tu propio contenido (Auto-Like prohibido).';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- PASO 2: VINCULAR LA FUNCIÓN A LA TABLA (EL TRIGGER EN SÍ)
CREATE TRIGGER TRG_EVITAR_AUTO_REACCION
BEFORE INSERT ON REACCIONA_CONTENIDO
FOR EACH ROW
EXECUTE FUNCTION FN_TRG_EVITAR_AUTO_REACCION();

-- En 03_Triggers.sql:

-- Paso 1: Crear la función del Trigger
CREATE OR REPLACE FUNCTION FN_TRG_SEGURIDAD_MENSAJERIA()
RETURNS TRIGGER AS $$
DECLARE
    -- La conversación ahora es identificada por el ID simple: NEW.fk_conversacion
    v_es_participante BOOLEAN; 
BEGIN
    -- Verificar si el autor (NEW.correo_autor_mensaje) es un participante de la conversación (NEW.fk_conversacion)
    SELECT EXISTS (
        SELECT 1 
        FROM PARTICIPA_EN 
        WHERE fk_conversacion = NEW.fk_conversacion
        AND correo_participante = NEW.correo_autor_mensaje
    ) INTO v_es_participante;

    IF NOT v_es_participante THEN
        -- Si el autor no está en la tabla de participantes para ese ID de chat, BLOQUEAR
        RAISE EXCEPTION 'Violación de Regla de Negocio: El remitente no es un participante activo de esta conversación.';
    END IF;

    RETURN NEW; -- Permitir la inserción
END;
$$ LANGUAGE plpgsql;


-- Paso 2: Vincular la función a la tabla MENSAJE
CREATE TRIGGER TRG_SEGURIDAD_MENSAJERIA
BEFORE INSERT ON MENSAJE
FOR EACH ROW
EXECUTE FUNCTION FN_TRG_SEGURIDAD_MENSAJERIA();

--Pedro
-- En 03_Triggers.sql:

-- =============================================================================
-- OBJETO: FUNCIÓN DE TRIGGER
-- Nombre: FN_TRG_VALIDAR_POSTULACION_VENCIDA
-- =============================================================================
-- En 03_Triggers.sql:

CREATE OR REPLACE FUNCTION FN_TRG_CERRAR_POSTULACION_VENCIDA()
RETURNS TRIGGER AS $$
DECLARE
    vencimiento TIMESTAMP;
BEGIN
    -- CAMBIO CLAVE: Buscar la fecha de vencimiento usando la FK simple (NEW.fk_oferta)
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