-- =============================================================================
-- OBJETO: FUNCIÓN DE LÓGICA DE NEGOCIO (CORREGIDA)
-- =============================================================================

-- CAMBIO: La función ahora recibe el ID simple de contenido (clave_contenido)
CREATE OR REPLACE FUNCTION FN_CALCULAR_NIVEL_IMPACTO(p_clave_contenido INTEGER) 
RETURNS DECIMAL AS $$
DECLARE
    v_total_comentarios INT := 0;
    v_total_reacciones INT := 0;
    v_score_impacto DECIMAL := 0.0;
    v_existe BOOLEAN;
BEGIN
    -- 1. Validación: Verificar si el contenido existe
    SELECT EXISTS(
        -- Se valida directamente sobre la PK simple
        SELECT 1 FROM CONTENIDO 
        WHERE clave_contenido = p_clave_contenido
    ) INTO v_existe;

    IF NOT v_existe THEN
        RETURN 0;
    END IF;

    -- 2. Contar Comentarios (Cada uno vale 3 puntos)
    -- Se cuenta usando la FK simple (fk_contenido)
    SELECT COUNT(*) INTO v_total_comentarios
    FROM COMENTARIO
    WHERE fk_contenido = p_clave_contenido;

    -- 3. Contar Reacciones (Cada una vale 1 punto)
    -- Se cuenta usando la FK simple (fk_contenido)
    SELECT COUNT(*) INTO v_total_reacciones
    FROM REACCIONA_CONTENIDO
    WHERE fk_contenido = p_clave_contenido;

    -- 4. Aplicar la Fórmula de Negocio Ponderada
    v_score_impacto := (v_total_comentarios * 3) + (v_total_reacciones * 1);

    RETURN v_score_impacto;

EXCEPTION
    WHEN OTHERS THEN
        RETURN -1;
END;
$$ LANGUAGE plpgsql;


-- 2. PROCEDIMIENTO: CERRAR EVENTO Y CREAR RESEÑA (CORREGIDO)
-- CAMBIO: El procedimiento ahora recibe el ID simple del EVENTO padre
CREATE OR REPLACE PROCEDURE SP_CERRAR_EVENTO_Y_CREAR_RESEÑA(p_clave_contenido INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
    v_titulo_evento VARCHAR(255);
    v_correo_autor VARCHAR(255);
    v_fecha_actual TIMESTAMP := NOW();
BEGIN
    -- A. Obtener datos del evento usando la clave_contenido
    SELECT ev.titulo, c.correo_autor
    INTO v_titulo_evento, v_correo_autor
    FROM EVENTO ev
    JOIN CONTENIDO c ON ev.fk_contenido = c.clave_contenido
    WHERE c.clave_contenido = p_clave_contenido;

    IF NOT FOUND THEN
        RAISE NOTICE 'Aviso: El evento no existe o no tiene contenido asociado.';
        RETURN;
    END IF;

    -- B. Lógica de "Cerrar" el evento (Si la hubiera)
    
    -- C. Crear borrador de Reseña (Insert Padre)
    INSERT INTO CONTENIDO (correo_autor, fecha_hora_creacion, texto_contenido, visibilidad)
    VALUES (
        v_correo_autor,
        v_fecha_actual,
        'Reseña del Evento: ' || v_titulo_evento || '. [Borrador Automático]',
        'Privado'
    );

    -- D. Crear detalle Publicación (Insert Hijo)
    INSERT INTO PUBLICACION (fk_contenido) -- Usamos el nuevo ID generado por el trigger de CONTENIDO (si existiera) o se asume manejo de clave
    VALUES ( (SELECT clave_contenido FROM CONTENIDO WHERE correo_autor = v_correo_autor AND fecha_hora_creacion = v_fecha_actual) );

    RAISE NOTICE 'Reseña creada exitosamente para el autor % en fecha %.', v_correo_autor, v_fecha_actual;
END;
$$;