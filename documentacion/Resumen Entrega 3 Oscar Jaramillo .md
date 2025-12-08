# **Planificación Entrega 3 (Oscar Jaramillo)**

## **1\. Estrategia de Seguridad**

Para la implementación física de la base de datos (PostgreSQL), el equipo ha definido una arquitectura de seguridad basada en **Roles (RBAC)** y el **Principio de Menor Privilegio**, garantizando que cada actor del sistema solo tenga acceso a lo estrictamente necesario.

**Roles Definidos para el Proyecto:**

1. **ROL\_ANONIMO:** Acceso de solo lectura a información pública (Catálogos, Eventos públicos).  
2. **ROL\_MIEMBRO:** Usuario autenticado estándar (Estudiantes, Egresados). Puede gestionar su perfil, interactuar y crear contenido.  
3. **ROL\_INSTITUCIONAL:** Entidades (Escuelas, Empresas). Privilegios para gestión de ofertas y eventos oficiales.  
4. **ROL\_MODERADOR:** Gestión de comunidad y censura de contenido.  
5. **ROL\_AUDITOR:** Acceso exclusivo de lectura para herramientas de reportería.

### **Módulo: Gestión de Contenido e Interacciones**

Enfoque: Dinámica del "Feed", viralidad y ciclo de vida de publicaciones.

* **Tablas Asignadas:**  
  * CONTENIDO (Superclase), PUBLICACION, EVENTO.  
  * COMENTARIO, REACCIONA\_CONTENIDO, TIPO\_REACCION.  
* **Restricciones de Integridad (Constraints):** Estas reglas se implementarán como CHECK CONSTRAINTS nativos en las tablas para blindar la calidad de los datos.  
1. **Integridad Temporal de Eventos** (CK\_EVENTO\_FECHAS):  
   * **Regla:** fecha\_fin \> fecha\_inicio  
   * **Justificación:** Garantiza la coherencia lógica del tiempo. Un evento no puede finalizar antes de haber comenzado.  
2. **Dominio de Visibilidad** (CK\_CONTENIDO\_VISIBILIDAD):  
   * **Regla:** visibilidad IN ('Publico', 'Privado', 'Solo Conexiones')  
   * **Justificación:** Restringe el atributo a una lista cerrada de valores válidos, evitando errores tipográficos o estados indefinidos que rompan la lógica de privacidad.  
3. **Calidad de Comentarios** (CK\_COMENTARIO\_NO\_VACIO):  
   * **Regla:** LENGTH(TRIM(texto\_comentario)) \> 0  
   * **Justificación:** Evita el "Spam" o comentarios basura que solo contienen espacios en blanco o cadenas vacías. Todo comentario debe aportar contenido.

* **Objetos:**  
  1. **SP: SP\_CERRAR\_EVENTO\_Y\_CREAR\_RESEÑA:**  
     * Justificación: Automatiza el flujo de trabajo post-evento. Al finalizar un evento, el sistema cambia su estado y genera automáticamente un borrador de publicación para documentar resultados, asegurando continuidad en el contenido.  
  2. **Función: FN\_CALCULAR\_NIVEL\_IMPACTO:**  
     * Justificación: Estandariza el cálculo de popularidad para los reportes. Aplica una fórmula ponderada (Comentarios \> Reacciones) para medir el "Engagement" real.  
  3. **Trigger: TRG\_EVITAR\_AUTO\_REACCION:**  
     * Justificación: Regla de integridad de negocio (Anti-Spam). Impide que un usuario infle artificialmente sus métricas reaccionando a su propio contenido.

**Reportes de Gestión:**

1. **Top Contenido Viral:** Ranking de publicaciones/eventos con mayor índice de impacto.  
2. **Líderes de Opinión:** Identificación de usuarios que generan mayor volumen de contenido original.  
3. **Interés en Eventos Futuros:** Proyección de asistencia basada en interacciones previas a la fecha del evento.