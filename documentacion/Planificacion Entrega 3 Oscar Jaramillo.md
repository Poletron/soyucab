# **PLANIFICACIÓN DE IMPLEMENTACIÓN (ENTREGA 3\)**

### **Integrante:** Oscar Jaramillo

## **1\. Tablas Asignadas**

1. CONTENIDO (Entidad Padre / Supertipo)  
2. PUBLICACION (Entidad Hija)  
3. EVENTO (Entidad Hija)  
4. COMENTARIO  
5. REACCIONA\_CONTENIDO  
6. TIPO\_REACCION

## **2\. Objetos de Base de Datos**

### **2.1. Procedimiento Almacenado (Stored Procedure)**

**Nombre:** SP\_CERRAR\_EVENTO\_Y\_CREAR\_RESEÑA

**Objetivo de Negocio:** Automatizar el ciclo de vida de los eventos institucionales. Al finalizar un evento, el sistema debe cambiar su estado y preparar inmediatamente un espacio (borrador de publicación) para que los organizadores publiquen resultados, fotos o conclusiones. Esto fomenta la generación de contenido post-evento.

**Tablas Involucradas:**

* EVENTO (Actualización de estado).  
* CONTENIDO (Inserción del padre).  
* PUBLICACION (Inserción del hijo).

**Parámetros de Entrada:**

* p\_id\_evento (Integer): Identificador del evento que finaliza.  
* p\_id\_autor (Integer): Identificador del usuario/dependencia responsable de la reseña.

**Algoritmo / Lógica del Proceso:**

1. **Validación de Existencia:** Verificar que el p\_id\_evento corresponda a un evento válido existente.  
2. **Transacción de Estado (Tabla EVENTO):** Actualizar el campo de estado del evento a 'FINALIZADO' (o establecer fecha de cierre).  
3. **Creación de Contenido (Tabla CONTENIDO):**  
   * Insertar una nueva tupla en CONTENIDO con fecha\_publicacion \= NOW() y el p\_id\_autor.  
   * Capturar el ID autogenerado (v\_nuevo\_id).  
4. **Generación de Borrador (Tabla PUBLICACION):**  
   * Insertar una nueva tupla en PUBLICACION vinculada a v\_nuevo\_id.  
   * Establecer titulo \= "Reseña del Evento: \[Nombre del Evento Original\]".  
   * Establecer es\_borrador \= TRUE.  
5. **Feedback:** Retornar mensaje de éxito indicando el ID de la nueva publicación generada.

### **2.2. Función Almacenada (Stored Function)**

**Nombre:** FN\_CALCULAR\_NIVEL\_IMPACTO

Objetivo de Negocio:

Proveer una métrica estandarizada para cuantificar la "viralidad" o impacto de cualquier contenido en la red. Se utiliza una fórmula ponderada que valora más el esfuerzo de comentar que la acción simple de reaccionar.

**Tablas Involucradas:**

* COMENTARIO (Conteo de registros).  
* REACCIONA\_CONTENIDO (Conteo de registros).

**Parámetros de Entrada:**

* p\_id\_contenido (Integer): ID del contenido a evaluar.

**Algoritmo / Lógica de Cálculo:**

1. **Conteo de Comentarios:** Calcular v\_num\_comentarios \= COUNT(\*) de la tabla COMENTARIO donde fk\_contenido \= p\_id\_contenido.  
2. **Conteo de Reacciones:** Calcular v\_num\_reacciones \= COUNT(\*) de la tabla REACCIONA\_CONTENIDO donde fk\_contenido \= p\_id\_contenido.  
3. **Aplicación de Fórmula Ponderada:**  
   * Impacto \= (v\_num\_comentarios \* 3\) \+ (v\_num\_reacciones \* 1\)  
   * Justificación: Un comentario denota mayor compromiso (engagement) que un clic de reacción.  
4. **Retorno:** Devolver el valor entero resultante.

### **2.3. Trigger (Disparador)**

**Nombre:** TRG\_EVITAR\_AUTO\_REACCION

**Evento de Activación:** BEFORE INSERT en tabla REACCIONA\_CONTENIDO.

**Objetivo de Negocio:** Integridad de Métricas de Interacción (Anti-Spam). Evitar la manipulación artificial de las métricas de popularidad, garantizando que el "Engagement" refleje el interés genuino de terceros y no sea auto-generado por el propio creador.

**Tablas Involucradas:**

* REACCIONA\_CONTENIDO (Tabla Base / Interceptada).  
* CONTENIDO (Tabla Consultada para validación).

**Lógica de Ejecución:**

1. **Intercepción:** El disparador se activa antes de que se confirme una nueva reacción en la base de datos.  
2. **Consulta de Autoría:** Utilizando el fk\_contenido de la nueva reacción, se consulta la tabla CONTENIDO para recuperar el ID del autor original (id\_autor).  
3. **Verificación de Identidad:** Se compara el usuario que intenta reaccionar (NEW.id\_usuario) con el autor del contenido recuperado.  
4. **Acción de Bloqueo:**  
   * **SI** (id\_usuario\_reaccion \== id\_autor\_contenido): Se cancela la transacción y se emite un error de aplicación (RAISE EXCEPTION: "No puedes reaccionar a tu propio contenido").  
   * **SINO**: Se permite la inserción normalmente.

## **3\. Diseño de Reportes**

### **3.1. Reporte: Top Contenido Viral**

Descripción: Ranking estratégico para identificar qué temas o eventos generan mayor conversación en la comunidad.

Fuente de Datos: Tablas CONTENIDO, PUBLICACION, EVENTO y uso de la función FN\_CALCULAR\_NIVEL\_IMPACTO.

**Columnas del Reporte:**

1. **Título del Contenido:** (Obtenido de Publicación o Evento).  
2. **Tipo:** ('Evento' o 'Publicación').  
3. **Autor:** Nombre de la Persona o Dependencia.  
4. **Fecha Publicación:** fecha\_creacion.  
5. **Nivel de Impacto (Score):** Resultado de FN\_CALCULAR\_NIVEL\_IMPACTO(id\_contenido).

Criterio de Ordenamiento: Descendente por Nivel de Impacto.

Filtros Sugeridos: Top 10, Último mes.

### **3.2. Reporte: Líderes de Opinión**

Descripción: Identifica a los usuarios más activos en la generación de contenido original, útil para premiar a "Embajadores SoyUCAB".

Fuente de Datos: Agrupación (GROUP BY) sobre tabla CONTENIDO.

**Columnas del Reporte:**

1. **Nombre del Usuario:** (Join con entidad Persona).  
2. **Total Publicaciones:** Conteo de contenidos tipo 'Publicación'.  
3. **Total Eventos Creados:** Conteo de contenidos tipo 'Evento'.  
4. **Total Contenidos:** Sumatoria total.

Criterio de Ordenamiento: Descendente por Total Contenidos.

Filtros Sugeridos: Solo usuarios con \> 5 contenidos en el último mes.

### **3.3. Reporte: Interés en Eventos Futuros**

Descripción: Permite a la logística de la universidad prever la asistencia y popularidad de eventos próximos basándose en la interacción previa (Expectativa).

Fuente de Datos: Tabla EVENTO filtrada por fecha futura \+ Métricas de interacción.

**Columnas del Reporte:**

1. **Nombre del Evento:** nombre\_evento.  
2. **Fecha de Realización:** fecha\_inicio.  
3. **Días Restantes:** Cálculo (fecha\_inicio \- CURRENT\_DATE).  
4. **Interés Previo:** Resultado de FN\_CALCULAR\_NIVEL\_IMPACTO(id\_contenido).  
   * Nota: En eventos futuros, esto mide comentarios o reacciones de anticipación.

Criterio de Ordenamiento: Descendente por Interés Previo.

Condición de Negocio: WHERE fecha\_inicio \> NOW().