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