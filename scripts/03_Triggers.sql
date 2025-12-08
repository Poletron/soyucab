-- =============================================================================
-- OBJETO: TRIGGER (DISPARADOR)
-- Responsable: Oscar Jaramillo
-- Nombre: TRG_EVITAR_AUTO_REACCION
-- Descripción: Regla de negocio que impide que un autor reaccione a su propio contenido.
-- Tipo: BEFORE INSERT (Se dispara antes de guardar el dato)
-- Tabla: REACCIONA_CONTENIDO
-- =============================================================================

-- PASO 1: CREAR LA FUNCIÓN DEL TRIGGER
CREATE OR REPLACE FUNCTION FN_TRG_EVITAR_AUTO_REACCION()
RETURNS TRIGGER AS $$
BEGIN
    -- Lógica de Comparación:
    -- Con el nuevo esquema, tenemos el autor del contenido directamente en la tabla (FK).
    -- Si el usuario que reacciona (NEW.correo_miembro) ES IGUAL al autor del contenido (NEW.correo_autor_contenido)
    IF NEW.correo_miembro = NEW.correo_autor_contenido THEN
        -- ¡ALTO! Lanzamos un error y cancelamos la operación
        RAISE EXCEPTION 'Violación de Regla de Negocio: No puedes reaccionar a tu propio contenido (Auto-Like prohibido).';
    END IF;

    -- Si no son iguales, todo bien. Dejamos pasar el dato.
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- PASO 2: VINCULAR LA FUNCIÓN A LA TABLA (EL TRIGGER EN SÍ)
CREATE TRIGGER TRG_EVITAR_AUTO_REACCION
BEFORE INSERT ON REACCIONA_CONTENIDO
FOR EACH ROW
EXECUTE FUNCTION FN_TRG_EVITAR_AUTO_REACCION();

-- =============================================================================
-- ZONA DE PRUEBAS (DEBUGGING) - ACTUALIZADA A NUEVO ESQUEMA
-- =============================================================================

/*
   -- PRUEBA 1: INTENTO FALLIDO (El autor intenta reaccionar a lo suyo)
   -- Asumiendo data existente...
   INSERT INTO REACCIONA_CONTENIDO (correo_miembro, correo_autor_contenido, fecha_hora_creacion_contenido, nombre_reaccion, fecha_hora_reaccion)
   VALUES ('oscar@test.com', 'oscar@test.com', '2023-01-01 10:00:00', 'Me gusta', NOW()); 
*/
