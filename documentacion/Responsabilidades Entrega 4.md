## Responsabilidades Entrega 4: Implementación de la Aplicación
Objetivo: Desarrollo del Sistema Web Completo (Frontend + Backend) integrado con la Base de Datos.

### 1. Arquitectura de la Solución y Justificación Técnica
El equipo ha implementado una arquitectura **Cliente-Servidor de tres capas** con un enfoque moderno de API RESTful, lo cual facilita la escalabilidad y la separación de responsabilidades exigida en proyectos de ingeniería de software.

*   **Capa de Presentación (Frontend):** Desarrollada en **React con TypeScript**. Se justifica su uso por la necesidad de una *Single Page Application (SPA)* reactiva que maneje el estado complejo de notificaciones y feeds en tiempo real sin recargas de página.
*   **Capa de Negocio (Backend):** Implementada en **Node.js con Express**. Se utiliza una **Arquitectura de Servicios**, donde la lógica de negocio se desacopla de los controladores HTTP. Esto permite centralizar reglas complejas (como la validación de nexos institucionales) en módulos reutilizables y testables.
*   **Capa de Persistencia (Base de Datos):** PostgreSQL, gestionando la integridad referencial y las reglas de negocio críticas mediantes Triggers y Stored Procedures (implementados en la Entrega 3).

### 2. Distribución de Desarrollo Full-Stack y Justificación por Módulo

#### 2.1. Módulo: Experiencia de Usuario, Contenido y Viralidad
**Responsable: Oscar Jaramillo**
*Justificación del Alcance:* Este módulo es el motor de interacción de la red. Su implementación se centra en maximizar el *engagement* del usuario mediante un feed dinámico y una gestión robusta de eventos.

*   **Gestión del Feed Principal (`MainFeed.tsx`, `posts.routes.js`):** Implementación de algoritmos de ordenamiento cronológico inverso. Se justifica la separación de la lógica de "Feed Global" vs "Feed de Grupo" en el servicio de contenido para optimizar las consultas SQL.
*   **Sistema de Eventos (`EventsPage.tsx`, `events.controller.js`):** Desarrollo del ciclo de vida del evento. Incluye la integración con el Stored Procedure `SP_CERRAR_EVENTO` para automatizar la generación de reseñas post-evento.
*   **Centro de Notificaciones (Requisito RF 2.1 y RF 7.1):**
    *   *Justificación Formal:* El desarrollo de un sistema de notificaciones no es opcional, sino un cumplimiento estricto del Requisito Funcional 2.1 ("...generando una notificación al destinatario") y la sección de "Funcionalidades" del documento de proyecto original.
    *   *Implementación:* Se desarrolla un sistema de polling/sockets en `App.tsx` y endpoints específicos (`/notifications`) para alertar al usuario sobre solicitudes de conexión y actividad relevante, cerrando el ciclo de retroalimentación de la red social.

#### 2.2. Módulo: Identidad, Comunidades y Mensajería Segura
**Responsable: Luis Torres**
*Justificación del Alcance:* Este módulo garantiza la integridad estructural de la red social (quién es quién) y proporciona los espacios de segregación (grupos) y privacidad (chats) definidos en el Universo de Discurso.

*   **Autenticación y Seguridad (`AuthSystem`, `auth.middleware.js`):** Implementación de JWT (JSON Web Tokens). Se justifica para mantener la sesión del usuario de forma segura y sin estado (stateless) en el servidor, escalando eficientemente.
*   **Grupos de Interés (`GroupsPage.tsx`, `groups.service.js`):** Implementación de la lógica de comunidades segregadas. Se asegura que el contenido publicado dentro de un grupo mantenga su visibilidad restringida (RF 6.1), utilizando filtros específicos en las consultas a la base de datos.
*   **Mensajería Privada (`ChatInterface.tsx`):** Cumplimiento del requisito de comunicación directa. Se implementan validaciones estrictas en el backend para asegurar que solo usuarios conectados (Amigos) puedan iniciar conversaciones, previniendo el spam.

#### 2.3. Módulo: Desarrollo Profesional y Vinculación Corporativa
**Responsable: Pedro Urdaneta**
*Justificación del Alcance:* Este módulo materializa la propuesta de valor diferenciadora de SoyUCAB frente a otras redes: la conexión profesional institucional.

*   **Bolsa de Trabajo (`JobBoard.tsx`, `jobs.controller.js`):** Implementación de la lógica de publicación validada. Se integra con la función de base de datos que verifica la existencia de un convenio activo (Nexo) antes de permitir a una organización publicar una oferta, garantizando la calidad de las vacantes.
*   **Gestión de Tutorías (`TutorshipFinder.tsx`):** Desarrollo del directorio de servicios académicos. Se justifica la implementación de filtros avanzados por "Área de Conocimiento" para facilitar la conexión rápida entre tutor y estudiante (RF 5.1).
*   **Dashboard Organizacional (`OrgDashboard.tsx`):** Interfaz exclusiva para usuarios con Rol Institucional, permitiendo la gestión centralizada de sus ofertas y postulantes.