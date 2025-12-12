-- =============================================================================
-- SCRIPT DE FUNCIONES Y PROCEDIMIENTOS ALMACENADOS
-- =============================================================================

-- =============================================================================
-- 1. FUNCIÓN: CALCULAR NIVEL DE IMPACTO
-- Autor: Oscar Jaramillo
-- =============================================================================

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
        SELECT 1 FROM CONTENIDO 
        WHERE clave_contenido = p_clave_contenido
    ) INTO v_existe;

    IF NOT v_existe THEN
        RETURN 0;
    END IF;

    -- 2. Contar Comentarios (Cada uno vale 3 puntos)
    SELECT COUNT(*) INTO v_total_comentarios
    FROM COMENTARIO
    WHERE fk_contenido = p_clave_contenido;

    -- 3. Contar Reacciones (Cada una vale 1 punto)
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

-- =============================================================================
-- 2. PROCEDIMIENTO: CERRAR EVENTO Y CREAR RESEÑA AUTOMÁTICA
-- Autor: Oscar Jaramillo
-- =============================================================================

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
    
    -- B. Crear borrador de Reseña (Insert Padre)
    INSERT INTO CONTENIDO (correo_autor, fecha_hora_creacion, texto_contenido, visibilidad)
    VALUES (
        v_correo_autor,
        v_fecha_actual,
        'Reseña del Evento: ' || v_titulo_evento || '. [Borrador Automático]',
        'Privado'
    );

    -- C. Crear detalle Publicación (Insert Hijo)
    INSERT INTO PUBLICACION (fk_contenido)
    VALUES ( (SELECT clave_contenido FROM CONTENIDO WHERE correo_autor = v_correo_autor AND fecha_hora_creacion = v_fecha_actual) );

    RAISE NOTICE 'Reseña creada exitosamente para el autor % en fecha %.', v_correo_autor, v_fecha_actual;
END;
$$;

-- =============================================================================
-- 3. FUNCIÓN: CALCULAR NIVEL DE AUTORIDAD (REFERENTES)
-- Autor: Luis Torres
-- =============================================================================

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

-- =============================================================================
-- 4. PROCEDIMIENTO: CREAR GRUPO CON FUNDADOR
-- Autor: Luis Torres
-- =============================================================================

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

-- =============================================================================
-- 5. FUNCIÓN: CALCULAR TASAS DE CIERRE DE OFERTAS
-- Autor: Pedro Urdaneta
-- =============================================================================

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
        CASE 
            WHEN COUNT(SP.correo_persona) > 0 THEN
                (CAST(SUM(CASE WHEN SP.estado_postulacion IN ('Aceptada', 'Rechazada') THEN 1 ELSE 0 END) AS NUMERIC) * 100 / COUNT(SP.correo_persona))
            ELSE 0
        END AS tasa_cierre
    FROM
        OFERTA_LABORAL OL
    JOIN
        SE_POSTULA SP ON OL.clave_oferta = SP.fk_oferta
    GROUP BY
        OL.clave_oferta, OL.titulo_oferta
    HAVING
        COUNT(SP.correo_persona) > 0
    ORDER BY
        tasa_cierre DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 6. PROCEDIMIENTO: PUBLICAR OFERTA VALIDADA (CON NEXO)
-- Autor: Pedro Urdaneta
-- =============================================================================

CREATE OR REPLACE PROCEDURE sp_publicar_oferta_validada(
    p_correo_organizacion VARCHAR,
    p_fecha_publicacion TIMESTAMP,
    p_titulo_oferta VARCHAR,
    p_descripcion_cargo TEXT,
    p_requisitos TEXT,
    p_modalidad VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    nexo_activo_encontrado BOOLEAN;
BEGIN
    -- Lógica de validación de nexo vigentes
    SELECT EXISTS (
        SELECT 1
        FROM TIENE_NEXO TN
        WHERE 
            TN.correo_organizacion = p_correo_organizacion
            -- Verifica que la fecha de fin sea NULL (indefinida) O que sea posterior o igual a la fecha actual
            AND (TN.fecha_fin IS NULL OR TN.fecha_fin >= NOW()::DATE)
    ) INTO nexo_activo_encontrado;

    IF nexo_activo_encontrado THEN
        INSERT INTO OFERTA_LABORAL (
            correo_organizacion, fecha_publicacion, titulo_oferta, descripcion_cargo, requisitos, modalidad
        ) VALUES (
            p_correo_organizacion, p_fecha_publicacion, p_titulo_oferta, p_descripcion_cargo, p_requisitos, p_modalidad
        );
    ELSE
        RAISE EXCEPTION 
            'La entidad organizacional (%) no está autorizada para publicar vacantes sin nexos vigentes.', p_correo_organizacion;
    END IF;
END;
$$;