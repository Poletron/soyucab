# **Planificación Entrega 3**

Equipo: Oscar Jaramillo, Luis Torres, Pedro Urdaneta.

## **1\. Estrategia de Seguridad**

Para la implementación física de la base de datos (PostgreSQL), el equipo ha definido una arquitectura de seguridad basada en **Roles (RBAC)** y el **Principio de Menor Privilegio**, garantizando que cada actor del sistema solo tenga acceso a lo estrictamente necesario.

**Roles Definidos para el Proyecto:**

1. **ROL\_ANONIMO:** Acceso de solo lectura a información pública (Catálogos, Eventos públicos).  
2. **ROL\_MIEMBRO:** Usuario autenticado estándar (Estudiantes, Egresados). Puede gestionar su perfil, interactuar y crear contenido.  
3. **ROL\_INSTITUCIONAL:** Entidades (Escuelas, Empresas). Privilegios para gestión de ofertas y eventos oficiales.  
4. **ROL\_MODERADOR:** Gestión de comunidad y censura de contenido.  
5. **ROL\_AUDITOR:** Acceso exclusivo de lectura para herramientas de reportería.

## **2\. Distribución de Responsabilidades por Módulo**

A continuación, se detalla la asignación de tablas y la lógica programable (Stored Procedures, Functions, Triggers) que desarrollará cada integrante.

### **2.1. Módulo: Gestión de Contenido e Interacciones**

Responsable: Oscar Jaramillo (Ing. Informática)  
Enfoque: Dinámica del "Feed", viralidad y ciclo de vida de publicaciones.

* **Tablas Asignadas:**  
  1. CONTENIDO (Superclase), PUBLICACION, EVENTO.  
  2. COMENTARIO, REACCIONA\_CONTENIDO, TIPO\_REACCION.  
* **Objetos Programables:**  
  1. **SP SP\_CERRAR\_EVENTO\_Y\_CREAR\_RESEÑA:**  
     * *Justificación:* Automatiza el flujo de trabajo post-evento. Al finalizar un evento, el sistema cambia su estado y genera automáticamente un borrador de publicación para documentar resultados, asegurando continuidad en el contenido.  
  2. **Función FN\_CALCULAR\_NIVEL\_IMPACTO:**  
     * *Justificación:* Estandariza el cálculo de popularidad para los reportes. Aplica una fórmula ponderada (Comentarios \> Reacciones) para medir el "Engagement" real.  
  3. **Trigger TRG\_EVITAR\_AUTO\_REACCION:**  
     * *Justificación:* Regla de integridad de negocio (Anti-Spam). Impide que un usuario infle artificialmente sus métricas reaccionando a su propio contenido.
* **Vistas / Reportes:**
  1. `V_REPORTE_TOP_VIRAL`: Ranking de contenido con mayor impacto.
  2. `V_REPORTE_LIDERES_OPINION`: Usuarios más activos en generación de contenido.
  3. `V_REPORTE_INTERES_EVENTOS`: Proyección de asistencia a eventos futuros.

### **2.2. Módulo: Usuarios, Grupos y Comunicación**

Responsable: Luis Torres (Ing. Informática)  
Enfoque: Integridad estructural de la red social, privacidad y mensajería.

* **Tablas Asignadas:**  
  * MIEMBRO, PERSONA, CONFIGURACION.  
  * SOLICITA\_CONEXION (Grafo social).  
  * GRUPO\_INTERES, PERTENECE\_A\_GRUPO.  
  * CONVERSACION, MENSAJE, PARTICIPA\_EN.  
* **Objetos Programables:**  
  1. **SP SP\_CREAR\_GRUPO\_CON\_FUNDADOR:**  
     * *Justificación:* Garantiza la consistencia atómica. Un grupo no puede existir sin miembros; este procedimiento crea el grupo y asigna al creador como Administrador en una sola transacción.  
  2. **Función FN\_VERIFICAR\_ACCESO\_PERFIL:**  
     * *Justificación:* Centraliza la compleja lógica de privacidad. Determina si un usuario A puede ver al usuario B basándose en configuración ('Público', 'Solo Amigos') y el estado de la conexión.  
  3. **Trigger TRG\_SEGURIDAD\_MENSAJERIA:**  
     * *Justificación:* Seguridad crítica. Intercepta cada mensaje para verificar que el remitente sea un participante legítimo de la conversación antes de guardarlo.
* **Vistas / Reportes:**
  1. `V_REPORTE_CRECIMIENTO_DEMOGRAFICO`: Análisis mensual de nuevos registros.
  2. `V_GRUPOS_MAS_ACTIVOS`: Top comunidades por número de miembros.
  3. `V_TOP_REFERENTES_COMUNIDAD`: Usuarios con mayor autoridad en la red.

### **2.3. Módulo: Oportunidades y Vinculación Institucional**

Responsable: Pedro Urdaneta (Relaciones Industriales)  
Enfoque: Gestión de Recursos Humanos, alianzas estratégicas y empleabilidad.

* **Tablas Asignadas:**  
  * ENTIDAD\_ORGANIZACIONAL (Empresas/Dependencias).  
  * TIENE\_NEXO, TIPO\_NEXO (Convenios).  
  * OFERTA\_LABORAL, SE\_POSTULA.  
  * TUTORIA, SOLICITA\_TUTORIA.  
* **Objetos Programables:**  
  1. **SP SP\_PUBLICAR\_OFERTA\_VALIDADA:**  
     * *Justificación:* Control de calidad y legalidad. Impide la publicación de ofertas si la organización no posee un convenio (nexo) vigente y activo con la Universidad.  
  2. **Función FN_CALCULAR_TASAS_CIERRE_OFERTAS:**  
     * *Justificación:* Métrica avanzada para RRHH. Calcula no solo el volumen de postulantes por oferta, sino también la eficiencia del proceso de selección (tasa de cierre/aceptación) para medir el éxito de cada vacante.  
  3. **Trigger TRG\_CERRAR\_POSTULACION\_VENCIDA:**  
     * *Justificación:* Integridad del proceso de selección. Bloquea automáticamente intentos de postulación a ofertas cuyo estado sea 'CERRADA' o cuya fecha límite haya expirado.
* **Vistas / Reportes:**
  1. `vista_top5_areas_conocimiento_demanda`: Áreas más solicitadas para tutorías.
  2. `vista_nexos_vigentes_vs_por_vencer`: Auditoría de convenios institucionales.
  3. `vista_top10_ofertas_mas_postuladas`: Vacantes con mayor atracción de talento.