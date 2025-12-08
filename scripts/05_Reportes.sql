-- =============================================================================
-- SCRIPT DE REPORTES (VISTAS) - MÓDULO INTERACCIÓN
-- Responsable: Oscar Jaramillo
-- Objetivo: Generar reportes estratégicos sin herramientas externas.
-- =============================================================================

-- 1. REPORTE: TOP CONTENIDO VIRAL
-- Descripción: Muestra las publicaciones con mayor impacto calculado.
-- Uso: SELECT * FROM V_REPORTE_TOP_VIRAL;
-- =============================================================================
CREATE OR REPLACE VIEW V_REPORTE_TOP_VIRAL AS
SELECT 
    RANK() OVER (ORDER BY FN_CALCULAR_NIVEL_IMPACTO(c.correo_autor, c.fecha_hora_creacion) DESC) as ranking,
    p.nombres || ' ' || p.apellidos as autor,
    CASE 
        WHEN ev.fecha_hora_creacion IS NOT NULL THEN 'EVENTO: ' || ev.titulo
        ELSE SUBSTRING(c.texto_contenido, 1, 50) || '...' 
    END as contenido_titulo,
    c.fecha_hora_creacion,
    -- Aquí llamamos a TU función de negocio
    FN_CALCULAR_NIVEL_IMPACTO(c.correo_autor, c.fecha_hora_creacion) as score_viralidad,
    (SELECT COUNT(*) FROM COMENTARIO com 
     WHERE com.fk_contenido_autor = c.correo_autor 
       AND com.fk_contenido_fecha = c.fecha_hora_creacion) as total_comentarios,
    (SELECT COUNT(*) FROM REACCIONA_CONTENIDO re 
     WHERE re.correo_autor_contenido = c.correo_autor 
       AND re.fecha_hora_creacion_contenido = c.fecha_hora_creacion) as total_reacciones
FROM CONTENIDO c
JOIN PERSONA p ON c.correo_autor = p.correo_principal
LEFT JOIN EVENTO ev ON c.correo_autor = ev.correo_autor AND c.fecha_hora_creacion = ev.fecha_hora_creacion
WHERE c.visibilidad = 'Público' -- Solo reportamos lo público por ética (Check Case Sensitive 'Público')
ORDER BY score_viralidad DESC
LIMIT 20;


-- 2. REPORTE: LÍDERES DE OPINIÓN (Gamification)
-- Descripción: Usuarios que generan más contenido y obtienen más respuesta.
-- Uso: SELECT * FROM V_REPORTE_LIDERES_OPINION;
-- =============================================================================
CREATE OR REPLACE VIEW V_REPORTE_LIDERES_OPINION AS
SELECT 
    p.nombres || ' ' || p.apellidos as influencer,
    COUNT(*) as total_publicaciones,
    -- Sumamos el impacto de todo su contenido
    SUM(FN_CALCULAR_NIVEL_IMPACTO(c.correo_autor, c.fecha_hora_creacion)) as impacto_acumulado_comunidad,
    p.pais_residencia as ubicacion -- Usamos pais de residencia porque LUGAR se eliminó
FROM MIEMBRO m
JOIN PERSONA p ON m.correo_principal = p.correo_principal
JOIN CONTENIDO c ON m.correo_principal = c.correo_autor
GROUP BY p.correo_principal, p.nombres, p.apellidos, p.pais_residencia
HAVING SUM(FN_CALCULAR_NIVEL_IMPACTO(c.correo_autor, c.fecha_hora_creacion)) > 0
ORDER BY impacto_acumulado_comunidad DESC;


-- 3. REPORTE: PROYECCIÓN DE INTERÉS EN EVENTOS
-- Descripción: Predice asistencia a eventos futuros basándose en "Me Interesa" (o cualquier reacción para simplificar).
-- Uso: SELECT * FROM V_REPORTE_INTERES_EVENTOS;
-- =============================================================================
CREATE OR REPLACE VIEW V_REPORTE_INTERES_EVENTOS AS
SELECT 
    e.titulo as nombre_evento,
    e.fecha_inicio,
    e.ciudad_ubicacion as lugar, -- Usamos ciudad
    -- Contamos reacciones (Simplificación: Todas las reacciones, o filtrar por tipo si nombre_reaccion es conocido)
    COUNT(r.correo_miembro) as interesados_potenciales,
    
    -- Lógica de negocio: Semáforo de Éxito
    CASE 
        WHEN COUNT(r.correo_miembro) >= 50 THEN 'EXITO ASEGURADO'
        WHEN COUNT(r.correo_miembro) BETWEEN 20 AND 49 THEN 'BUENA PROYECCION'
        ELSE 'RIESGO DE BAJA ASISTENCIA'
    END as status_proyeccion
FROM EVENTO e
-- JOIN a CONTENIDO implícito en la PK COMPARTIDA si se necesitara datos de contenido, pero EVENTO tiene el titulo.
-- Join reacciones
LEFT JOIN REACCIONA_CONTENIDO r 
    ON e.correo_autor = r.correo_autor_contenido 
    AND e.fecha_hora_creacion = r.fecha_hora_creacion_contenido
-- Solo eventos futuros
WHERE e.fecha_inicio > CURRENT_TIMESTAMP 
GROUP BY e.correo_autor, e.fecha_hora_creacion, e.titulo, e.fecha_inicio, e.ciudad_ubicacion
ORDER BY e.fecha_inicio ASC;


-- =============================================================================
-- 4. PERMISOS PARA LAS VISTAS DE REPORTES
-- =============================================================================
-- Solo el MODERADOR tiene acceso a los reportes estratégicos
-- (Los usuarios comunes no pueden ver métricas de viralidad ni rankings)
GRANT SELECT ON V_REPORTE_TOP_VIRAL TO rol_moderador;
GRANT SELECT ON V_REPORTE_LIDERES_OPINION TO rol_moderador;
GRANT SELECT ON V_REPORTE_INTERES_EVENTOS TO rol_moderador;
