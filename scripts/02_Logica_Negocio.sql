-- =============================================================================
-- OBJETO: FUNCIÓN DE LÓGICA DE NEGOCIO
-- Responsable: Oscar Jaramillo
-- Nombre: FN_CALCULAR_NIVEL_IMPACTO
-- Descripción: Calcula la "Viralidad" ponderando comentarios y reacciones.
-- Fórmula: (Comentarios * 3) + (Reacciones * 1)
-- =============================================================================

-- =============================================================================
-- OBJETO: FUNCIÓN DE LÓGICA DE NEGOCIO
-- Responsable: Oscar Jaramillo
-- Nombre: FN_CALCULAR_NIVEL_IMPACTO
-- Descripción: Calcula la "Viralidad" ponderando comentarios y reacciones.
-- Fórmula: (Comentarios * 3) + (Reacciones * 1)
-- =============================================================================

CREATE OR REPLACE FUNCTION FN_CALCULAR_NIVEL_IMPACTO(p_correo_autor VARCHAR, p_fecha_creacion TIMESTAMP)
RETURNS DECIMAL AS $$
DECLARE
    v_total_comentarios INT := 0;
    v_total_reacciones INT := 0;
    v_score_impacto DECIMAL := 0.0;
    v_existe BOOLEAN;
BEGIN
    -- 1. Validación: Verificar si el contenido existe
    SELECT EXISTS(
        SELECT 1 FROM CONTENIDO 
        WHERE correo_autor = p_correo_autor 
          AND fecha_hora_creacion = p_fecha_creacion
    ) INTO v_existe;

    IF NOT v_existe THEN
        RETURN 0; -- Si no existe, el impacto es 0
    END IF;

    -- 2. Contar Comentarios (Cada uno vale 3 puntos)
    -- Se cuenta todo el hilo (comentarios padres e hijos)
    SELECT COUNT(*) INTO v_total_comentarios
    FROM COMENTARIO
    WHERE fk_contenido_autor = p_correo_autor 
      AND fk_contenido_fecha = p_fecha_creacion;

    -- 3. Contar Reacciones (Cada una vale 1 punto)
    SELECT COUNT(*) INTO v_total_reacciones
    FROM REACCIONA_CONTENIDO
    WHERE correo_autor_contenido = p_correo_autor 
      AND fecha_hora_creacion_contenido = p_fecha_creacion;

    -- 4. Aplicar la Fórmula de Negocio Ponderada
    v_score_impacto := (v_total_comentarios * 3) + (v_total_reacciones * 1);

    -- 5. Retornar el resultado
    RETURN v_score_impacto;

EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error inesperado, retornar -1 para alertar
        RETURN -1;
END;
$$ LANGUAGE plpgsql;



-- 2. PROCEDIMIENTO: CERRAR EVENTO Y CREAR RESEÑA
-- Descripción: Finaliza un evento activo y genera el borrador de la reseña.
-- =============================================================================
CREATE OR REPLACE PROCEDURE SP_CERRAR_EVENTO_Y_CREAR_RESEÑA(p_correo_autor VARCHAR, p_fecha_creacion TIMESTAMP)
LANGUAGE plpgsql
AS $$
DECLARE
    v_titulo_evento VARCHAR(255);
    v_fecha_actual TIMESTAMP := NOW();
BEGIN
    -- A. Verificar datos del evento
    SELECT e.titulo
    INTO v_titulo_evento
    FROM EVENTO e
    WHERE e.correo_autor = p_correo_autor 
      AND e.fecha_hora_creacion = p_fecha_creacion
      -- Asumiendo que el estado se determina por la fecha o si queremos agregar una columna de estado.
      -- El modelo relacional NO TIENE columna 'estado' en EVENTO (solo fechas).
      -- Usaremos la fecha_fin para validar si ya pasó, o simplemente ignoramos el estado explícito
      -- ya que el modelo "bueno" NO tiene estado.
      -- Sin embargo, el requerimiento implicaba "cerrarlo". 
      -- Si no hay columna estado, tal vez "cerrar" signifique actualizar fecha_fin a NOW() si era futuro?
      -- O tal vez el usuario olvidó el estado en el Modelo Relacional?
      -- Siguiendo DDL estricto: NO HAY ESTADO.
      -- Vamos a suponer que la lógica de negocio solo crea la reseña.
      ;

    IF NOT FOUND THEN
        RAISE NOTICE 'Aviso: El evento no existe.';
        RETURN;
    END IF;

    -- B. "Cerrar" el evento
    -- Como no hay campo estado, no hacemos nada de update de estado.
    -- (Nota: Esto es una discrepancia entre la lógica antigua y el modelo relacional "bueno").

    -- C. Crear borrador de Reseña (Insert Padre)
    INSERT INTO CONTENIDO (correo_autor, fecha_hora_creacion, texto_contenido, visibilidad)
    VALUES (
        p_correo_autor,
        v_fecha_actual,
        'Reseña del Evento: ' || v_titulo_evento || '. [Borrador Automático]',
        'Privado' -- Nace privado para edición
    );

    -- D. Crear detalle Publicación (Insert Hijo)
    INSERT INTO PUBLICACION (correo_autor, fecha_hora_creacion)
    VALUES (p_correo_autor, v_fecha_actual);

    RAISE NOTICE 'Reseña creada exitosamente para el autor % en fecha %.', p_correo_autor, v_fecha_actual;
END;
$$;
