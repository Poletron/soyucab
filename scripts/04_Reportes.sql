-- =============================================================================
-- SCRIPT DE REPORTES (VISTAS) - MÓDULO INTERACCIÓN (CORREGIDO)
-- =============================================================================

-- 1. REPORTE: TOP CONTENIDO VIRAL
-- =============================================================================
CREATE OR REPLACE VIEW V_REPORTE_TOP_VIRAL AS
SELECT 
    -- CAMBIO: Llamada a la función de impacto usando el ID simple
    RANK() OVER (ORDER BY FN_CALCULAR_NIVEL_IMPACTO(c.clave_contenido) DESC) as ranking,
    p.nombres || ' ' || p.apellidos as autor,
    CASE 
        -- CAMBIO: Union por fk_contenido en EVENTO
        WHEN ev.fk_contenido IS NOT NULL THEN 'EVENTO: ' || ev.titulo 
        ELSE SUBSTRING(c.texto_contenido, 1, 50) || '...' 
    END as contenido_titulo,
    c.fecha_hora_creacion,
    
    -- CAMBIO: Función de impacto usando ID simple
    FN_CALCULAR_NIVEL_IMPACTO(c.clave_contenido) as score_viralidad,
    
    (SELECT COUNT(*) FROM COMENTARIO com 
     -- CAMBIO: Subconsulta de comentarios usa la FK simple
     WHERE com.fk_contenido = c.clave_contenido) as total_comentarios,
     
    (SELECT COUNT(*) FROM REACCIONA_CONTENIDO re 
     -- CAMBIO: Subconsulta de reacciones usa la FK simple
     WHERE re.fk_contenido = c.clave_contenido) as total_reacciones
     
FROM CONTENIDO c
JOIN PERSONA p ON c.correo_autor = p.correo_principal
-- CORRECCIÓN: El JOIN ahora se hace por la clave simple
LEFT JOIN EVENTO ev ON c.clave_contenido = ev.fk_contenido 
WHERE c.visibilidad = 'Público' 
ORDER BY score_viralidad DESC
LIMIT 20;


-- 2. REPORTE: LÍDERES DE OPINIÓN (Gamification)
-- =============================================================================
CREATE OR REPLACE VIEW V_REPORTE_LIDERES_OPINION AS
SELECT 
    p.nombres || ' ' || p.apellidos as influencer,
    COUNT(*) as total_publicaciones,
    -- CAMBIO: La función de suma usa la clave_contenido
    SUM(FN_CALCULAR_NIVEL_IMPACTO(c.clave_contenido)) as impacto_acumulado_comunidad,
    p.pais_residencia as ubicacion 
FROM MIEMBRO m
JOIN PERSONA p ON m.correo_principal = p.correo_principal
JOIN CONTENIDO c ON m.correo_principal = c.correo_autor
GROUP BY p.correo_principal, p.nombres, p.apellidos, p.pais_residencia
-- CAMBIO: La condición HAVING también usa la clave simple
HAVING SUM(FN_CALCULAR_NIVEL_IMPACTO(c.clave_contenido)) > 0
ORDER BY impacto_acumulado_comunidad DESC;


-- 3. REPORTE: PROYECCIÓN DE INTERÉS EN EVENTOS
-- =============================================================================
CREATE OR REPLACE VIEW V_REPORTE_INTERES_EVENTOS AS
SELECT 
    e.titulo as nombre_evento,
    e.fecha_inicio,
    e.ciudad_ubicacion as lugar, 
    -- Contamos reacciones usando la FK simple
    COUNT(r.correo_miembro) as interesados_potenciales,
    
    -- Lógica de negocio: Semáforo de Éxito
    CASE 
        WHEN COUNT(r.correo_miembro) >= 50 THEN 'EXITO ASEGURADO'
        WHEN COUNT(r.correo_miembro) BETWEEN 20 AND 49 THEN 'BUENA PROYECCION'
        ELSE 'RIESGO DE BAJA ASISTENCIA'
    END as status_proyeccion
FROM EVENTO e
-- CORRECCIÓN: Join reacciones usando el ID de contenido de EVENTO (fk_contenido)
LEFT JOIN REACCIONA_CONTENIDO r 
    ON e.fk_contenido = r.fk_contenido
-- Solo eventos futuros
WHERE e.fecha_inicio > CURRENT_TIMESTAMP 
GROUP BY e.fk_contenido, e.titulo, e.fecha_inicio, e.ciudad_ubicacion
ORDER BY e.fecha_inicio ASC;

-- En 04_Reportes.sql:

CREATE OR REPLACE VIEW V_REPORTE_CRECIMIENTO_DEMOGRAFICO AS
SELECT 
    -- Agrupación mensual
    TO_CHAR(m.fecha_registro, 'YYYY-MM') as mes_registro,
    
    -- Ocupación (asumiendo que los roles en MIEMBRO_POSEE_ROL se usan como ocupación)
    r.nombre_rol as ocupacion,
    
    -- Conteo
    COUNT(m.correo_principal) as nuevos_registros
    
FROM MIEMBRO m
JOIN MIEMBRO_POSEE_ROL mpr ON m.correo_principal = mpr.correo_miembro
JOIN ROL r ON mpr.nombre_rol = r.nombre_rol
WHERE r.nombre_rol IN ('Estudiante', 'Profesor', 'Egresado')
GROUP BY mes_registro, ocupacion
ORDER BY mes_registro, ocupacion;

-- En 04_Reportes.sql:

-- 2. REPORTE: GRUPOS MÁS ACTIVOS
-- =============================================================================
CREATE OR REPLACE VIEW V_GRUPOS_MAS_ACTIVOS AS
SELECT
    g.nombre_grupo,
    g.descripcion_grupo,
    -- Conteo de miembros
    COUNT(p.correo_persona) as total_miembros
    
FROM GRUPO_INTERES g
LEFT JOIN PERTENECE_A_GRUPO p ON g.nombre_grupo = p.nombre_grupo
GROUP BY g.nombre_grupo, g.descripcion_grupo
ORDER BY total_miembros DESC
LIMIT 10;


CREATE OR REPLACE VIEW V_TOP_REFERENTES_COMUNIDAD AS
SELECT
    p.nombres || ' ' || p.apellidos as referente,
    m.correo_principal as correo,
    -- Llamada a la función de lógica de negocio (ya implementada)
    FN_CALCULAR_NIVEL_AUTORIDAD(m.correo_principal) as score_autoridad
FROM MIEMBRO m
JOIN PERSONA p ON m.correo_principal = p.correo_principal
ORDER BY score_autoridad DESC
LIMIT 15;