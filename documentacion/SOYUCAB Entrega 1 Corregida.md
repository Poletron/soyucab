# **Entrega 1 Editada**

## **Resumen de Cambios entre Versiones del Universo de Discurso**

Este documento detalla las modificaciones realizadas a la definición del Universo de Discurso (UD) y los Requisitos Funcionales (RF) entre la propuesta inicial y la versión editada y corregida.

El objetivo principal de esta revisión fue **acotar el alcance del proyecto** para centrarse estrictamente en su rol de **Red Social y Profesional**, eliminando funcionalidades complejas que pertenecen a un Sistema de Gestión de Aprendizaje (LMS) o a sistemas de análisis geoespacial.

### **1\. Cambios de Alcance y Exclusiones Principales**

El universo de discurso ajustado define fronteras más claras, excluyendo explícitamente:

* **Funcionalidades de LMS (El Cambio Crítico):**  
  * **Versión Vieja:** Proponía un módulo completo de **gestión de tutorías**, que incluía agendamiento, calendario, generación de sesiones virtuales y un sistema de calificación de sesiones   
  * **Versión Nueva:** **Elimina por completo** esta funcionalidad. El alcance se reduce estrictamente a **conectar al tutor con el interesado**. Ya no se gestiona la logística, agenda o calificación de la sesión.  
* **Gestión Geoespacial Compleja:**  
  * **Versión Vieja:** Requería almacenar coordenadas (latitud/longitud) y sugería que la BD realizaría análisis espaciales.  
  * **Versión Nueva:** Simplifica esto radicalmente. La BD **solo captura País y Ciudad**. Se delega toda la lógica de obtención de coordenadas y renderizado del mapa a la capa de aplicación.  
* **Gestión de Eventos:**  
  * **Versión Vieja:** Incluía el **registro de asistencia**.  
  * **Versión Nueva:** Excluye explícitamente la **logística de eventos**. El sistema solo se usa para la promoción y el registro del evento en sí, no para el control de asistentes.  
* **Perfiles Extensibles:**  
  * **Versión Vieja:** Proponía un sistema complejo de **perfiles extensibles** para que los administradores añadieran campos sin modificar el esquema.  
  * **Versión Nueva:** Esta funcionalidad fue **eliminada** para simplificar el modelo. Los atributos de los perfiles ahora son fijos y definidos.

### **2\. Refinamiento del Modelo Conceptual (Entidades)**

Para soportar el nuevo alcance, la narrativa del UD y las entidades clave fueron redefinidas:

* **Modelo de Actores (Más Claro):**  
  * **Versión Vieja:** Se centraba en "Persona" y "Organización".  
  * **Versión Nueva:** Introduce el concepto abstracto **"Miembro"**. Un Miembro puede ser una **"Persona"** o una **"Entidad Organizacional"**. Esto limpia el modelo, ya que ambos pueden crear contenido (Publicaciones, Eventos).  
* **Modelo de Conexiones (Corrección Clave):**  
  * **Versión Vieja:** Usaba el término "Nexo" de forma ambigua, tanto para relaciones entre personas (tutor-tutelado) como para el historial laboral (persona-organización).  
  * **Versión Nueva:** Resuelve esta ambigüedad dividiendo el concepto en dos tipos de relaciones distintas y claras:  
    1. **Conexiones Sociales:** Relaciones "par-a-par" (Persona a Persona), como amistad o seguimiento profesional.  
    2. **Vínculos Institucionales (el "Nexo" corregido):** Relaciones formales que describen la trayectoria (Persona a Entidad Organizacional), como "Estudiante de", "Profesor de", "Empleado de".  
* **Mensajería Privada (Acotada):**  
  * **Versión Vieja:** Se propuso como un RF.  
  * **Versión Nueva:** Se formaliza en el UD, pero se acota explícitamente: la mensajería privada es **solo entre Personas**. Esto es una decisión de diseño para evitar spam por parte de las Entidades Organizacionales.

## 

##   

## 

## 

## 

## **Alcance de la Base de Datos**

Para establecer una base sólida para el proyecto, es imperativo definir con rigor las fronteras del Universo de Discurso. El sistema **SoyUCAB** se centrará exclusivamente en la información pertinente a su rol como plataforma social y profesional para la comunidad ucabista. Su propósito no es replicar todos los sistemas universitarios, sino crear un ecosistema digital enfocado en la conexión y el valor comunitario.

#### **El sistema abarcará:**

* **Gestión de la Comunidad:** La identificación única y la gestión del perfil de todos los actores de la plataforma. Esto incluye tanto a **Personas** (estudiantes activos, egresados, profesores, e investigadores) como a **Entidades Organizacionales** (dependencias formales de la UCAB, empresas aliadas estratégicas, y grupos de investigación). Gestionar sus perfiles públicos implica mantener un directorio centralizado que fomente la visibilidad y el contacto.  
* **Interacción y Contenido:** Toda la dinámica de interacción social y académica. Esto implica el almacenamiento del contenido original generado por los miembros (como **Publicaciones** de texto, análisis o artículos de interés) o **Eventos** (con fechas, descripciones y lugares), diseñados para fomentar la participación. Asimismo, se gestionan todas las interacciones derivadas de dicho contenido, como **Comentarios** que generen debate y **Reacciones** (ej. "Me gusta", "Celebrar") que sirvan como termómetro de la opinión comunitaria.  
* **Conexiones Semánticas:** El sistema gestionará la compleja red de relaciones de la comunidad, dividiéndola en dos tipos de vínculos claros y separados:  
  1. **Conexiones Sociales:** Las relaciones directas, de "par a par", que las **Personas** establecen entre sí (amistad, seguimiento profesional).  
  2. **Vínculos Institucionales:** El registro formal de la trayectoria y el rol de una **Persona** con una **Entidad Organizacional** (ej. "Estudiante de Ingeniería" promoción 2025, o "Profesor de Derecho" desde 2010). Esta separación es crucial para entender el mapa de talento de la institución.  
* **Desarrollo Profesional:** Se dará soporte a las funcionalidades de crecimiento profesional y empleabilidad. Esto se materializa administrando la información relativa a **Ofertas Laborales** publicadas por las organizaciones y las **Postulaciones** formales de las personas a dichas ofertas, facilitando así la inserción laboral de egresados y estudiantes.  
* **Mapa de la Diáspora:** Se registrará la ubicación residencial de las personas (país, ciudad) como un atributo descriptivo clave. Esto permitirá a la aplicación consumir estos datos para la visualización de la presencia global de la comunidad UCAB.  
* **Grupos y Tutorías:** Se permitirá la creación de comunidades autogestionadas (**Grupos de Interés**) y un registro de servicios de **Tutorías** que las personas calificadas pueden ofrecer. El enfoque de las tutorías se limita estrictamente a la *conexión* entre el tutor y el interesado, sirviendo como un directorio de especialistas.  
* **Administración y Personalización:** El sistema debe ser gobernable y seguro. Gestionará la **Configuración de Privacidad** de los miembros (dándoles control sobre sus datos) y la definición de **Roles** (ej. "Administrador", "Egresado", "Reclutador") para controlar el acceso a vistas sensibles y reportes institucionales.

#### **El sistema excluirá explícitamente:**

* **Funcionalidades de LMS (Learning Management System):** Esta es la delimitación más importante y una respuesta directa a la retroalimentación de la cátedra. El sistema **no** es un LMS. No gestionará la logística de agenda, la reserva de sesiones, la entrega de tareas, ni la **calificación de tutorías**. Su rol se limita a conectar al oferente del servicio con el solicitante. Se excluye para mantener el enfoque del proyecto en una *red social* y no en una herramienta de *gestión académica*.  
* **Gestión de Identidad Nacional:** No se almacenarán datos de identificación nacional (como cédula de identidad o pasaporte). La validación de la pertenencia a la comunidad se basa en el correo como identificador suficiente.  
* **Análisis Geoespacial Complejo:** Aunque se captura el país y la ciudad, la lógica de obtención de coordenadas (latitud/longitud) para el mapa se delega a la capa de aplicación. La base de datos no realizará cálculos de proximidad, geo-cercas o análisis de rutas.  
* **Sincronización en Tiempo Real:** El sistema no se sincronizará en tiempo real con los sistemas académicos (SGA) o administrativos de la UCAB. Se asume que la carga de datos de miembros será un proceso controlado (batch) o que el registro es manual, evitando una dependencia de alta complejidad técnica.  
* **Logística de Eventos:** El sistema registrará la existencia y promoción del evento, pero no gestionará la venta de entradas, la logística de catering, el control de acceso físico o la gestión de patrocinadores.

## 

## **Análisis de Requisitos Funcionales**

#### **RF 1: Gestión de Actores y Perfiles**

* **RF 1.1:** El sistema debe permitir el registro de un nuevo **Miembro** en la plataforma, solicitando los datos mínimos de autenticación (correo principal y contraseña) y validando su unicidad.  
* **RF 1.2:** Tras el registro, el sistema debe permitir a un Miembro de tipo **Persona** completar y actualizar su perfil con sus datos demográficos (nombres, apellidos, fecha de nacimiento, sexo, país y ciudad de residencia), así como una breve biografía.  
* **RF 1.3:** El sistema debe permitir a un Miembro de tipo **Entidad Organizacional** completar y actualizar su perfil con sus datos corporativos (RIF, nombre oficial, descripción detallada, tipo de entidad como 'Dependencia UCAB' o 'Aliado Externo').

#### **RF 2: Gestión de Conexiones y Vínculos**

* **RF 2.1:** El sistema debe permitir a una **Persona** enviar una solicitud de conexión social a otra **Persona**, generando una notificación al destinatario.  
* **RF 2.2:** El sistema debe permitir a una **Persona** aceptar o rechazar las solicitudes de conexión social pendientes, actualizando el estado de la conexión.  
* **RF 2.3:** El sistema debe permitir a un administrador o a la propia **Persona** registrar, modificar o eliminar un **Vínculo Institucional (Nexo)**, asociando a la Persona con una **Entidad Organizacional** bajo un **Tipo de Nexo** específico (ej. "Estudiante Activo", "Egresado", "Profesor", "Empleado").

#### **RF 3: Gestión de Contenido e Interacciones (Feed)**

* **RF 3.1:** El sistema debe permitir a cualquier **Miembro** (Persona u Organización) crear una **Publicación** (contenido de texto), visible en el *feed* principal de sus conexiones.  
* **RF 3.2:** El sistema debe permitir a cualquier **Miembro** crear un **Evento** (contenido con título, fecha/hora de inicio, descripción y ubicación desnormalizada), el cual funcionará como una publicación especial.  
* **RF 3.3:** El sistema debe permitir a cualquier **Miembro** publicar un **Comentario** en un Contenido (Publicación o Evento), así como responder a otros comentarios para iniciar hilos de debate.  
* **RF 3.4:** El sistema debe permitir a cualquier **Miembro** asignar una **Reacción** (de un catálogo predefinido, ej. "Me gusta", "Interesante") a un Contenido o a un Comentario, permitiendo sondeos rápidos de opinión.

#### 

#### **RF 4: Gestión de Oportunidades Profesionales**

* **RF 4.1:** El sistema debe permitir a una **Entidad Organizacional** publicar una **Oferta Laboral** (con título, descripción detallada del cargo y requisitos, y modalidad: 'Presencial', 'Remoto', 'Híbrido').  
* **RF 4.2:** El sistema debe permitir a una **Persona** registrar su **Postulación** a una Oferta Laboral, creando un vínculo entre su perfil y la oferta.

#### **RF 5: Gestión de Servicios de Tutoría (Alcance Reducido)**

* **RF 5.1:** El sistema debe permitir a una **Persona** (actuando como tutor) registrar un servicio de **Tutoría** que ofrece, especificando el área de conocimiento (ej. 'Cálculo II', 'Derecho Mercantil', 'Metodología') y una descripción de su enfoque.  
* **RF 5.2:** El sistema debe permitir a una **Persona** (estudiante) buscar y **solicitar** una **Tutoría** registrada por un tutor, iniciando el contacto.  
  * *(Nota: El sistema NO gestionará la agenda, pago o calificación de la sesión, en línea con la exclusión de funcionalidades LMS definida en el Alcance).*

#### **RF 6: Gestión de Grupos de Interés**

* **RF 6.1:** El sistema debe permitir a una **Persona** crear un nuevo **Grupo de Interés** (con nombre único, descripción y reglas básicas).  
* **RF 6.2:** El sistema debe permitir a una **Persona** solicitar unirse, ser invitada, o abandonar un Grupo de Interés existente.

#### **RF 7: Administración y Personalización**

* **RF 7.1:** El sistema debe permitir a cada **Miembro** gestionar su **Configuración** de privacidad (ej. definiendo si su perfil es público, solo para conexiones, o privado).  
* **RF 7.2:** El sistema debe permitir a un administrador del sistema asignar **Roles** (ej. "Admin", "Egresado", "Estudiante") a los Miembros para controlar el acceso a funciones y reportes específicos.

#### **RF 8: Reportes y Visualización**

* **RF 8.1:** El sistema debe ser capaz de proveer los datos agregados (país, ciudad) de las **Personas** para la generación del **Mapa de la Diáspora** en la aplicación, respetando la privacidad individual.  
* **RF 8.2:** El sistema debe permitir la generación de reportes institucionales (ej. "Crecimiento de la comunidad", "Empresas más activas"), cuyo acceso estará restringido según el **Rol** del Miembro.

## **Universo de Discurso**

#### **La Comunidad: Los Actores de SoyUCAB**

La piedra angular de SoyUCAB es su comunidad, el principal activo intangible de la universidad. Para participar en la plataforma, todo individuo o entidad debe poseer una cuenta única, denominada **Miembro**. Este Miembro es el perfil central que agrupa la información de autenticación (correo y contraseña) y se convierte en la identidad digital del actor dentro del ecosistema.

Los Miembros se dividen en dos grandes categorías que reflejan la realidad dual de la comunidad ucabista:

1. **La Persona:** Representa al individuo, el talento humano de la UCAB. Es el estudiante que cursa materias, el egresado que representa a la universidad en el mundo, el profesor que forma a las nuevas generaciones o el personal administrativo que da soporte a la institución. La Persona posee atributos que describen su identidad (nombres, apellidos, fecha de nacimiento) y sus datos de contacto. La Persona registra su ubicación de residencia actual, indicando el **país** y la **ciudad** donde se encuentra. Esta información, tratada con privacidad, es la que nutrirá directamente el "Mapa de la Diáspora", permitiendo a la universidad visualizar la extensión global de su talento y fomentar conexiones regionales.  
2. **La Entidad Organizacional:** Representa a los colectivos e instituciones que forman parte del ecosistema extendido. Esta categoría es amplia y puede ser una **dependencia** interna de la UCAB (como una facultad, escuela, cátedra o grupo de investigación) o una **organización asociada** externa (como una empresa aliada que busca talento, una ONG socio-comunitaria o un socio estratégico internacional). La Entidad Organizacional tiene un perfil público con su información oficial (nombre, descripción, RIF) y también registra su ubicación principal, permitiendo saber dónde operan los socios de la universidad.

Todos los Miembros, sean Personas o Entidades Organizacionales, son actores de primer nivel. Esto significa que ambos tienen la capacidad de generar contenido, publicar en el *feed*, crear eventos y participar en la vida digital de la comunidad, enriqueciendo el diálogo.

#### **Los Vínculos: Las Conexiones de la Comunidad**

Una función esencial de SoyUCAB es modelar las relaciones que definen a la comunidad, y hacerlo con precisión semántica. Para garantizar la claridad y evitar las ambigüedades detectadas en revisiones previas, la plataforma gestionará dos tipos de relaciones fundamentalmente distintos:

1. **Las Conexiones Sociales (Persona a Persona):** Este es el tejido social de la red, la interacción voluntaria. Representa la relación de "amistad", "seguimiento" o "contacto profesional" que una **Persona** desea establecer con otra **Persona**. El sistema permitirá a los usuarios enviarse solicitudes de conexión, aceptarlas o rechazarlas, creando así su red de contactos personales. Esta funcionalidad está limitada estrictamente a las Personas, fomentando el *networking* individual.  
2. **Los Vínculos Institucionales (El "Nexo" Corregido):** Esta es la relación formal, objetiva, que describe la trayectoria académica o profesional de un individuo. Es el vínculo que une a una **Persona** con una **Entidad Organizacional**. El sistema permitirá registrar qué tipo de relación existe (por ejemplo, "Estudiante", "Profesor", "Empleado", "Aliado", "Egresado"), permitiendo construir un historial fidedigno de la participación de la Persona en las distintas dependencias de la UCAB o en las empresas asociadas.

Esta separación intencional (Social vs. Institucional) es clave para el modelo. Permite escenarios complejos pero realistas: un egresado puede ser "amigo" (Conexión Social) de un profesor, mientras que ambos mantienen un "Nexo" (Vínculo Institucional) con su escuela respectiva (uno como "Egresado" y otro como "Profesor").

### **El Intercambio: El Contenido y las Interacciones**

El feed de actividad es el motor de la plataforma, el espacio público donde la comunidad comparte conocimiento, anuncia logros y discute ideas. El sistema está diseñado para gestionar este intercambio de forma estructurada, promoviendo la visibilidad del talento ucabista.

Cualquier Miembro (tanto una Persona como una Entidad Organizacional) puede ser autor de Contenido. Este Contenido es la unidad básica de información y se presenta de dos formas principales:

* **Publicaciones:** Son las entradas estándar del feed, similares a un "post" o "artículo". Están compuestas principalmente por texto y son el vehículo para compartir opiniones, análisis, noticias o reflexiones académicas y profesionales.  
* **Eventos:** Son publicaciones especiales que tienen una connotación temporal y geográfica, diseñadas para movilizar a la comunidad. Además del texto descriptivo, un Evento incluye un título formal, una fecha y hora de inicio, y una ubicación (definida por país y ciudad, alineado con la desnormalización del sistema de geolocalización, para facilitar su promoción). **Como regla de integridad temporal, la fecha y hora de finalización del evento debe ser posterior a la fecha y hora de inicio.**

Una vez que un Contenido es publicado, la comunidad puede interactuar con él, generando valor adicional:

* **Comentarios:** Los Miembros pueden escribir Comentarios en cualquier Publicación o Evento. Esto genera hilos de conversación y permite que el contenido inicial evolucione hacia un debate o una colaboración. El sistema también permitirá que un Comentario sea una respuesta a otro Comentario, facilitando discusiones ordenadas. **Para garantizar la consistencia de los hilos de discusión, se establece que, si un comentario (hijo) responde a otro (padre), ambos deben estar asociados al mismo Contenido (post) raíz.**  
* **Reacciones:** Para interacciones más rápidas y visuales, los Miembros pueden aplicar Reacciones a un Contenido o a un Comentario. Estas reacciones se seleccionarán de un catálogo predefinido (ej. "Me gusta", "Celebrar", "Interesante"), permitiendo expresar un sentimiento sobre la publicación y proveyendo al autor de retroalimentación inmediata. **Para mantener la claridad de la interacción, un Miembro sólo podrá tener una reacción activa por cada Contenido o Comentario. Si el miembro cambia de opinión, su reacción anterior será actualizada por la nueva.**

#### **El Desarrollo: Oportunidades y Servicios**

Más allá de la conexión social, SoyUCAB busca ser un catalizador tangible para el crecimiento profesional y académico de sus miembros. Para ello, gestionará dos áreas de servicio clave, enfocadas en la empleabilidad y el apoyo mutuo:

1. **La Bolsa de Trabajo (Oportunidades):** Este módulo conecta la demanda laboral del ecosistema UCAB con el talento egresado y estudiantil. Las **Entidades Organizacionales** (especialmente las empresas aliadas y las propias dependencias de la UCAB) podrán publicar **Ofertas Laborales**. Estas ofertas detallarán el cargo, la descripción de responsabilidades, los requisitos y la modalidad (presencial, remota o híbrida), creando un mercado de talento curado. Por otra parte, las **Personas** (estudiantes en búsqueda de pasantías y egresados en desarrollo de carrera) podrán navegar por estas ofertas, filtrarlas y registrar su **Postulación** a aquellas que sean de su interés, iniciando el proceso de reclutamiento.  
2. **Servicios de Tutoría (Conexión Académica):** Este módulo fomenta el "networking" académico y el apoyo "par a par". Las **Personas** con experiencia demostrada en un área (como profesores, preparadores o egresados con posgrados) podrán registrar un servicio de **Tutoría**, describiendo el área de conocimiento que dominan (ej. "Estadística Aplicada", "Redacción de Tesis"). Otras Personas (como estudiantes) podrán buscar estos servicios y **solicitar** la tutoría, estableciendo un contacto directo.

   * **Delimitación Clave (Anti-LMS):** Es fundamental reiterar que el rol de la plataforma termina en *conectar* al tutor con el interesado. Como se definió en el Alcance, el sistema **no** gestionará la logística de las sesiones (agendas, horarios, videollamadas) ni las calificaciones académicas. Esta es una decisión de diseño consciente para no invadir el terreno de los sistemas LMS y mantener a SoyUCAB enfocado en su rol de red social.

#### **El Entorno: Grupos, Administración y Privacidad**

Finalmente, la plataforma se complementa con un entorno que permite a la comunidad auto-organizarse y gestionar su experiencia de forma segura, garantizando la confianza, la relevancia y la gobernabilidad del ecosistema.

* **Grupos de Interés:** Las **Personas** tendrán la capacidad de crear y unirse a **Grupos de Interés**. Estos no son solo espacios sociales, sino también núcleos de colaboración académica y profesional. Son comunidades auto-gestionadas (ej. "Club de Debate", "Egresados de Derecho 1990", "Fotografía UCAB", "Cátedra de IA", "Voluntariado Social UCAB") donde los miembros pueden compartir contenido y discusiones enfocadas en un tema común. Estos grupos operan separados del feed principal, permitiendo conversaciones más profundas y específicas sin generar ruido en el flujo de información general. Cada grupo tendrá roles internos (como administrador o moderador) para gestionar la membresía y el contenido.  
* **Administración y Seguridad (Roles):** El sistema contará con un mecanismo de **Roles** (ej. "Administrador", "Moderador de Grupo", "Reclutador", "Egresado"). Este componente es vital para la seguridad y el gobierno de la plataforma, ya que definirá quién puede acceder a qué información y qué acciones puede realizar. Por ejemplo, los reportes institucionales (como el análisis de la diáspora) solo serán visibles para Miembros con el Rol de "Administrador". Un Rol de "Reclutador" (asociado a una ENTIDAD\_ORGANIZACIONAL) podría tener permisos especiales para buscar perfiles de PERSONA que estén abiertos a ofertas, respondiendo así a la necesidad de controlar el acceso a la información sensible.  
* **Privacidad y Configuración:** Cada **Miembro** tendrá control soberano sobre su propia experiencia y huella digital. El sistema permitirá a los usuarios gestionar su **Configuración** personal de forma granular. Esto incluye definir aspectos clave de privacidad (ej. "Hacer mi perfil visible solo para conexiones", "Permitir que reclutadores vean mi perfil", "Ocultar mi correo de contacto") y también preferencias de notificación (ej. "Avisarme solo de comentarios", "Desactivar correos de eventos"). Este control es esencial para construir la confianza del usuario, equilibrando la visibilidad necesaria en una comunidad con la seguridad personal.

#### **La Comunicación Privada: Mensajería (Chats)**

Además de la interacción pública en el feed y en los grupos, una red social robusta requiere un canal de comunicación directo y privado. El sistema SoyUCAB facilitará esto a través de un módulo de mensajería, diseñado para fomentar el networking directo y la colaboración focalizada.

* **Conversaciones Privadas:** El sistema permitirá a las **Personas** iniciar **Conversaciones** privadas. Esta funcionalidad está restringida exclusivamente a las Personas, una decisión de diseño para mantener la naturaleza de la comunicación personal y evitar que las Entidades Organizacionales puedan enviar mensajes masivos o spam, centrándose en la conexión directa (ej. estudiante-profesor, egresado-reclutador, compañero-compañero).  
* **Mensajes:** Dentro de una conversación, los participantes podrán enviar y recibir Mensajes. Cada mensaje será una unidad de comunicación compuesta por el texto, el autor y una marca de tiempo precisa (fecha y hora). El sistema registrará el estado del mensaje (como "enviado" o "leído") para facilitar la comunicación. La implicación clave es que esta mensajería interna mantiene la interacción dentro del ecosistema de SoyUCAB, proveyendo un canal seguro sin necesidad de intercambiar información de contacto personal (como números de teléfono).
