-- =============================================================================
-- OBJETO: FUNCIÓN DE LÓGICA DE NEGOCIO (CORREGIDA)
-- =============================================================================
--Oscar Jaramillo
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

--Luis
-- En 02_Logica_Negocio.sql:

CREATE OR REPLACE FUNCTION FN_CALCULAR_NIVEL_AUTORIDAD(p_correo_miembro VARCHAR)
RETURNS DECIMAL AS $$
DECLARE
    v_score DECIMAL := 0.0;
    v_conexiones_aceptadas INT := 0;
    v_es_lider BOOLEAN := FALSE;
BEGIN
    -- 1. Popularidad (Alto Peso: 5 puntos por conexión aceptada)
    SELECT COUNT(*) INTO v_conexiones_aceptadas
    FROM SOLICITA_CONEXION
    WHERE estado_solicitud = 'Aceptada'
    AND (correo_solicitante = p_correo_miembro OR correo_solicitado = p_correo_miembro);
    v_score := v_score + (v_conexiones_aceptadas * 5); -- Ponderación de 5

    -- 2. Liderazgo (Muy Alto Peso: 50 puntos extra por rol de administrador/moderador)
    SELECT EXISTS (
        SELECT 1
        FROM PERTENECE_A_GRUPO
        WHERE correo_persona = p_correo_miembro
        AND rol_en_grupo IN ('Administrador', 'Moderador')
    ) INTO v_es_lider;
    
    IF v_es_lider THEN
        v_score := v_score + 50; -- Ponderación extra fija por liderazgo
    END IF;

    RETURN v_score;
END;

$$ LANGUAGE plpgsql STABLE;

-- En 02_Logica_Negocio.sql:

CREATE OR REPLACE PROCEDURE SP_CREAR_GRUPO_CON_FUNDADOR(
    p_nombre_grupo VARCHAR, 
    p_descripcion TEXT, 
    p_visibilidad VARCHAR, 
    p_correo_creador VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- INICIA TRANSACCIÓN IMPLÍCITA
    
    -- 1. Insertar el Grupo (Tabla Padre)
    INSERT INTO GRUPO_INTERES (nombre_grupo, descripcion_grupo, visibilidad, correo_creador, fecha_creacion)
    VALUES (p_nombre_grupo, p_descripcion, p_visibilidad, p_correo_creador, NOW());

    -- 2. Insertar al Fundador como Administrador (Tabla Hija)
    INSERT INTO PERTENECE_A_GRUPO (correo_persona, nombre_grupo, fecha_union, rol_en_grupo)
    VALUES (p_correo_creador, p_nombre_grupo, NOW(), 'Administrador');
    
    -- CIERRA TRANSACCIÓN IMPLÍCITA (COMMIT si no hay errores)
    RAISE NOTICE 'Grupo "%" creado exitosamente. Fundador asignado como Administrador.', p_nombre_grupo;
EXCEPTION
    WHEN OTHERS THEN
        -- Si hay error (ej: nombre duplicado), la transacción se revierte (ROLLBACK)
        RAISE EXCEPTION 'Error al crear el grupo y asignar fundador: %', SQLERRM;
END;
$$;

--Pedro

CREATE OR REPLACE FUNCTION fn_calcular_tasas_cierre_ofertas()
RETURNS TABLE (
    titulo_oferta VARCHAR(255),
    total_postulaciones BIGINT,
    total_cerradas BIGINT,
    tasa_cierre_porcentual NUMERIC
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        OL.titulo_oferta,
        COUNT(SP.correo_persona) AS total_postulaciones,
        SUM(CASE WHEN SP.estado_postulacion IN ('Aceptada', 'Rechazada') THEN 1 ELSE 0 END) AS total_cerradas,
        (CAST(SUM(CASE WHEN SP.estado_postulacion IN ('Aceptada', 'Rechazada') THEN 1 ELSE 0 END) AS NUMERIC) * 100 / COUNT(SP.correo_persona)) AS tasa_cierre
    FROM
        OFERTA_LABORAL OL
    JOIN
        SE_POSTULA SP ON OL.correo_organizacion = SP.correo_organizacion_oferta
        AND OL.fecha_publicacion = SP.fecha_publicacion_oferta
        AND OL.titulo_oferta = SP.titulo_oferta
    GROUP BY
        OL.titulo_oferta
    HAVING
        COUNT(SP.correo_persona) > 0
    ORDER BY
        tasa_cierre DESC;
END;
$$ LANGUAGE plpgsql;