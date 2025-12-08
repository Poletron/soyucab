**Proyecto: Red Social Institucional SoyUCAB** 

En un entorno globalizado y altamente competitivo, las instituciones de educación superior enfrentan el desafío estratégico de mantener y fortalecer los lazos con su comunidad, un ecosistema diverso que incluye estudiantes actuales, profesores, personal administrativo y, de manera muy especial, a sus egresados. La dispersión geográfica, la dinámica acelerada del mercado laboral y el inevitable transcurso del tiempo son factores que pueden debilitar este nexo vital. Dicha comunidad, particularmente el colectivo de egresados, constituye uno de los activos intangibles más importantes de una universidad: son sus embajadores en el mundo profesional, una fuente invaluable de conocimiento y experiencia, y un pilar fundamental para el desarrollo y la sostenibilidad institucional a largo plazo. 

Las plataformas sociales generalistas existentes, si bien son útiles, presentan limitaciones significativas para una gestión comunitaria institucional. Carecen de la personalización necesaria, no ofrecen control sobre los datos y la privacidad, y sus algoritmos no están alineados con los objetivos estratégicos de la universidad. Es en este contexto que surge la necesidad de una solución tecnológica a medida. Para abordar esta necesidad de manera proactiva y visionaria, la Universidad Católica Andrés Bello (UCAB) ha decidido emprender el desarrollo de su propia plataforma social, denominada SoyUCAB. 

El propósito fundamental de SoyUCAB trasciende la mera creación de un repositorio de contactos o una red social convencional. Se busca consolidar un ecosistema digital que fomente un sentido de comunidad y pertenencia activo y duradero entre todos sus miembros, independientemente de su ubicación geográfica o del tiempo transcurrido desde el inicio de su relación formal con la Universidad. Esta red no solo servirá como un punto de encuentro social y profesional, sino que se posicionará como una herramienta estratégica para: 

 Fomentar la Colaboración: Conectar a egresados, profesores y estudiantes para proyectos de investigación, oportunidades de negocio y programas de tutoría. 

 Fortalecer la Institución: Servir como canal oficial para la convocatoria a procesos electorales de cuerpos colegiados, como los consejos de escuela, facultad y universitario. 

 Comunicación Eficiente: Garantizar la difusión ágil y segmentada de información institucional relevante. 

 Servicios de Valor Añadido: Ofrecer acceso a una bolsa de trabajo exclusiva, programas de formación continua, eventos y otros beneficios para los miembros de la comunidad. 

 Toma de Decisiones Basada en Datos: Proveer a la universidad de información valiosa sobre la trayectoria y distribución de sus egresados para la toma de decisiones académicas y estratégicas.  
La piedra angular de este ambicioso proyecto es la construcción de una base de datos robusta, escalable y segura, que sirva como el sistema nervioso central para todas las funcionalidades presentes y futuras de la red. El diseño de esta base de datos es una tarea de máxima criticidad y debe ser abordado desde una perspectiva que garantice no solo el rendimiento y la integridad, sino también una flexibilidad excepcional para adaptarse a la evolución de las necesidades de la comunidad a lo largo del tiempo. Este documento detalla los conceptos, funcionalidades y requisitos esenciales que guiarán el diseño y desarrollo de dicha base de datos. 

La comunidad de SoyUCAB estará conformada por una diversidad de actores, cada uno con roles, permisos y necesidades de interacción distintas. El modelo de datos debe ser capaz de representar esta heterogeneidad de manera elegante y eficiente. Los miembros se pueden clasificar en tres grandes categorías: 

 Personas: Constituyen el núcleo de la red. Este grupo incluye a estudiantes (pregrado, postgrado, extensión), egresados, profesores (activos y jubilados), e integrantes del personal administrativo y obrero. El sistema debe poder gestionar el ciclo de vida de una persona dentro de la institución, reconociendo que sus roles pueden cambiar y coexistir. 

 Dependencias UCAB: Son entidades institucionales que tendrán una presencia activa en la red. Ejemplos incluyen las Escuelas, Facultades, Centros de Investigación, Agrupaciones Estudiantiles, Coordinaciones, y Secretariado. Estas entidades actuarán como generadoras de contenido, organizadoras de eventos y puntos focales para subcomunidades específicas. 

 Organizaciones Asociadas: Entidades externas que mantienen un vínculo estratégico con la UCAB. Este grupo puede incluir fundaciones, cátedras patrocinadas por empresas, compañías aliadas para pasantías, y asociaciones de egresados formalmente constituidas. 

Para cada persona, es indispensable registrar información que permita su identificación unívoca y su caracterización detallada. Se debe contemplar un conjunto de datos básicos (nombres, apellidos, fecha de nacimiento, sexo, ocupación, ubicación geográfica) y datos de contacto. No obstante, el verdadero valor reside en la capacidad del diseño para incorporar un conjunto extensible de atributos que enriquezcan el perfil, tales como áreas de interés profesional, habilidades técnicas, idiomas, historial de publicaciones, y enlaces a perfiles profesionales externos. 

Las interacciones entre los miembros constituyen la esencia de la red social. El modelo de datos debe poder representar una amplia gama de relaciones semánticas, que van más allá de una simple "amistad". Se deben considerar: 

 Relaciones Simétricas: Vínculos bidireccionales donde ambas partes tienen el mismo estatus (ej. "Amigos").  
 Relaciones Asimétricas: Vínculos unidireccionales (ej. un miembro "sigue" a una Dependencia UCAB para recibir sus actualizaciones, sin necesidad de que la dependencia lo siga de vuelta). 

 Relaciones Tipificadas: Vínculos que describen la naturaleza de la conexión, como "fue mi tutor de tesis", "compañero de promoción", "colega en la empresa X", etc. 

El sistema deberá gestionar el ciclo de vida completo de una solicitud de relación (envío, pendiente de aceptación, aceptada, rechazada), incluyendo un sistema de notificaciones. Una vez formalizada, la relación puede ser disuelta unilateralmente por cualquiera de las partes. 

La relación de un miembro con la Universidad es a menudo multifacética, múltiple y evolutiva. Un individuo puede ser simultáneamente estudiante de postgrado y empleado; un egresado puede convertirse años después en profesor. La base de datos debe modelar con precisión y flexibilidad estos nexos, que representan cada uno de los roles formales que un miembro ha tenido o tiene con la institución. 

Cada nexo debe tener asociada información descriptiva pertinente y contextual. Por ejemplo, para un nexo de tipo "egresado de pregrado", es crucial registrar su Tarjeta Académica Inteligente (TAI), el título obtenido, la escuela, el año de ingreso, la fecha del acto de graduación, y quizás menciones honoríficas. Para un nexo de tipo "profesor", se debería almacenar la fecha de ingreso, categoría (ordinario, contratado), dedicación (tiempo completo, medio tiempo) y el historial de departamentos a los que ha estado adscrito. 

El gran desafío de diseño en este punto es la flexibilidad y extensibilidad. La estructura de la base de datos debe poder crecer o disminuir en el tiempo, permitiendo a los administradores de la plataforma definir nuevos tipos de nexos o agregar/eliminar atributos asociados a los nexos existentes con gran agilidad, idealmente sin requerir modificaciones estructurales profundas (ALTER TABLE) en la base de datos. Se debe concebir una solución que permita esta dinámica. 

Cualquier miembro de la red tendrá la capacidad de crear y definir grupos de interés, que servirán como espacios de colaboración, debate y organización para subcomunidades. Un grupo es un conjunto de miembros que comparten una afinidad o un objetivo. El modelo debe soportar diferentes tipos de grupos: 

 Públicos: Abiertos para que cualquier miembro de la red se una. Su contenido es visible para todos. 

 Privados: La membresía requiere la aprobación de un administrador. Su contenido es visible únicamente para los miembros. 

 Secretos: No son visibles en los resultados de búsqueda. La única forma de unirse es a través de una invitación directa de un miembro. 

Para cada grupo, se debe registrar su creador, la fecha de fundación, sus administradores/moderadores y una descripción de su propósito. Dentro de un  
grupo, los miembros podrán iniciar hilos de discusión, compartir archivos, crear encuestas y organizar eventos exclusivos para el grupo. 

Los eventos son un componente clave para dinamizar la comunidad y fomentar el encuentro, tanto virtual como presencial. Pueden ser organizados por cualquier miembro (persona, dependencia o grupo). El sistema debe gestionar el ciclo de vida completo de un evento: borrador, publicado, en curso, finalizado, archivado. 

Se debe registrar la información completa de cada evento: nombre, descripción, categoría (conferencia, taller, *webinar*, acto de grado, encuentro de egresados), fecha y hora de inicio y fin, lugar (incluyendo enlace para eventos virtuales), y organizador. Los miembros podrán manifestar su interés en asistir, y esta intención será visible para la comunidad. El sistema deberá permitir a los organizadores gestionar una lista de asistentes, registrar la asistencia efectiva post-evento y compartir materiales (fotos, videos, presentaciones) en la página del evento. 

**1\. Funcionalidades y Aplicaciones de la Plataforma** 

La plataforma deberá ofrecer un alto grado de personalización. Cada miembro podrá configurar la visibilidad granular de cada sección de su perfil. Adicionalmente, deberá existir un centro de notificaciones configurable, permitiendo al usuario decidir qué tipo de actividades generan alertas (nuevas solicitudes de relación, invitaciones a grupos, menciones en publicaciones) y a través de qué canales las recibe (en la plataforma, por correo electrónico). El respeto a la privacidad y el control del usuario sobre sus datos son principios no negociables del diseño. 

La base de datos debe soportar un motor de búsqueda y consulta potente y flexible que permita a los miembros explorar la red de manera eficiente y significativa. Se espera que el sistema pueda resolver interrogantes complejas, como: 

1\. Búsqueda por Atributos: "Encontrar a todos los egresados de Comunicación Social, mención Publicidad, que actualmente trabajen en el área de Marketing Digital y residan en Madrid." 

2\. Búsqueda por Relaciones: "Mostrar todos los miembros de la red que son 'amigos' de al menos tres profesores de la Escuela de Ingeniería Informática." 

3\. Análisis de Red (Clausura Transitiva): "A partir de mi perfil, encontrar todas las rutas de conexión de hasta 3 grados de separación para llegar a miembros que trabajen en la empresa 'X'." 

4\. Descubrimiento de Contenido: Una búsqueda unificada que permita encontrar no solo miembros, sino también grupos, eventos y publicaciones relevantes para una palabra clave.  
Sobre esta sólida base de datos se podrán construir aplicaciones modulares que enriquezcan la experiencia y el valor de la plataforma. Se debe pensar en el diseño de la base de datos de forma que facilite la implementación futura de módulos como: 

 Sistema de Tutorías: Una aplicación que permita a estudiantes o jóvenes egresados buscar y solicitar la guía de egresados o profesores con más experiencia (tutores) basándose en criterios como carrera, industria, habilidades y áreas de interés. 

 Bolsa de Trabajo y Oportunidades Profesionales: Un espacio donde las organizaciones asociadas y los propios egresados puedan publicar ofertas de empleo, pasantías o proyectos, dirigidas específicamente a la comunidad ucabista. El sistema podría incluso sugerir candidatos idóneos para cada oferta. 

 Mapa de la Diáspora UCAB: Una aplicación geoespacial interactiva que visualice la distribución de los egresados por el mundo, facilitando la creación de capítulos locales de la asociación de egresados. 

**2\. Entregables del Proyecto** 

Para la evaluación del proyecto, los equipos deberán presentar los siguientes entregables, siguiendo las pautas y fechas establecidas en el cronograma del curso. 

**2.1. Primera Entrega: Planificación y Requisitos** 

La primera entrega de este proyecto consiste de la elaboración de un documento que describa el problema y su alcance, en particular, esto es lo que se denomina el Universo de Discurso, a partir del cual se va a realizar el modelado conceptual de esta base de datos. El Universo de Discurso es una descripción narrativa en lenguaje natural claro y conciso de los entes que juegan un papel protagónico en el dominio del problema. Parte del Universo de Discurso ya está descrito en el enunciado del proyecto, por lo que no es necesario transcribirlo. La documentación debe centrarse en detallar cualquier adaptación a un concepto, relación o propiedad existente, o las funcionalidades extras u otras aplicaciones que el equipo proponga. 

Para cada uno de los entes identificados (adaptados o nuevos), el documento a entregar debe incluir: 

1\. se debe dar una definición, 

2\. se deben describir sus propiedades, 

3\. se deben explicar los diferentes roles que juegan en este universo, y 

4\. se deben explicitar las interrelaciones que existen con los otros entes del problema. 

Para definir este universo, se han enumerado los conceptos sobre los cuales se desea registrar información, basándose en los aspectos comunes a las redes  
sociales; como ilustración, se puede consultar la siguiente referencia para obtener ideas generales y, en particular, analizar el modelo de LinkedIn por estar más relacionado con los objetivos de SoyUCAB: https://www.genbeta.com/a fondo/10-redes-sociales-alla-facebook-twitter-youtube-que-tienes-que-conocer. El Universo de Discurso debe ser lo suficientemente completo y claro para dar soporte a las funcionalidades, interacciones y salidas de datos que se definirán en los siguientes apartados: 

 Lista de requisitos de la aplicación. Es necesario explicitar cuáles requisitos de información se van a poder satisfacer con la base de datos, para lo cual estos requisitos deben ser claramente especificados en este documento. 

 Diseño de las interfaces de la aplicación (*Mockups o Wireframes*).  Diseño de reportes. 

Adicionalmente, el Universo de Discurso debe incluir el alcance de la base de datos que se va a desarrollar para el problema; en particular se deben identificar los entes externos que le dan contexto y la explicación del porqué esos entes externos no se incluyen en el desarrollo de la base de datos. 

El documento del Universo de Discurso que constituye esta entrega debe contener las siguientes partes: 

 Descripción de los entes que juegan un papel protagónico en el problema con todos los detalles enumerados más arriba (1 al 4\) de cada uno de ellos. 

 Explicación del alcance de la base de datos. 

 Enumeración de los requisitos de información a los cuales debe responder la base de datos. 

 Diseño de interfaces y reportes 

 Planificación de las actividades a ejecutar para el desarrollo del proyecto durante el semestre, indicando fechas y persona(s) responsable(s) de cada actividad. 

**2.2. Segunda Entrega: Diseño Conceptual y Lógico** 

Utilizando el universo de discurso elaborado en la primera entrega, modele la base de datos para la red social soyUCAB. Este esquema debe contemplar todos los aspectos identificados por su profesor al revisar su universo de discurso. Se debe entregar: 

 Esquema Entidad Relación Extendido completo, correcto, extensible y normalizado utilizando la notación (min,max) de Navathe. Para cada entidad, solo incluya las claves. Como complemento del esquema, el equipo debe entregar un diccionario de datos, el cual consiste en una tabla detallada por cada entidad/interrelación. En esta tabla, debes documentar todos los atributos (no solo las claves), especificando para cada uno su nombre, tipo de dato, una descripción clara de su propósito y opcionalmente, cualquier otra regla de negocio o formato que le aplique.  
 Utilizando la lógica de primer orden y el lenguaje natural, exprese correctamente todas las restricciones explícitas no representables a través de las estructuras inherentes o implícitas del modelo ERE. 

 Explicación de las decisiones de diseño: cada situación donde haya encontrado dificultades para modelar y haya considerado varias alternativas de cómo representar algún aspecto del universo de discurso, debe ser explicado en este apartado. En otras palabras, puede defender su diseño en algunos aspectos, explicando por qué lo modeló de esa forma. 

 La traducción del esquema conceptual a un esquema lógico bajo el modelo relacional y la especificación en lenguaje natural y en lógica de primer orden de todas las restricciones explícitas relativas a aspectos no representables con las estructuras y restricciones implícitas del modelo relacional. 

 Reglas de Integridad del negocio explícitas que deben ser aplicadas al esquema lógico (especificando las tablas y columnas involucradas). 

**2.3. Tercera Entrega** 

El objetivo principal del proyecto es que cada equipo diseñe e implemente un sistema de base de datos funcional para la red social de egresados. Este sistema debe operar como una base de datos transaccional (OLTP) capaz de soportar en tiempo real las interacciones clave de la plataforma, como la gestión de perfiles, publicaciones, conexiones y mensajería. 

El equipo de trabajo debe seleccionar un sistema gestor de base de datos relacional para implementar una base de datos relacional; un generador de reportes para implementar los reportes necesarios y en su defecto utilizar el mismo ambiente de desarrollo. Todos los integrantes del equipo deben hacer uso de los mismos recursos y el sistema a implementar debe estar unificado. 

Adicionalmente, el equipo deberá diseñar e implementar los reportes de gestión y análisis que permitan medir el crecimiento y la interacción dentro de la comunidad (ej: número de usuarios activos, publicaciones populares, etc.). 

Se debe entregar: 

 El Modelo Entidad Relación corregido. 

 Los *scripts* de creación de la base de datos (incluir DROP, CREATE, INSERT y ALTER si aplica) 

 La automatización de todas las reglas de integridad tanto implícitas como explícitas se debe realizar utilizando el sistema gestor de base de datos – o sea deben utilizar los mecanismos de implementación de integridad provistos por el sistema gestor seleccionado. Cada miembro del equipo tiene la responsabilidad de implementar un mínimo de 3 *constraints*, 1 *triggers* y 1 programa almacenado.  
 Los reportes deben ser generados con una herramienta de reportes (Ejemplo: JasperReports,jsreport, entre otras). 

 Cada entidad debe contener datos registrados. Los datos a registrar serán asignados en clase. Sin datos cargados no se efectuará la revisión del proyecto. 

 La corrección se efectuará en una computadora por equipo.  Deben estar presentes todos los integrantes del equipo. 

**2.4. Cuarta Entrega** 

El equipo de trabajo debe seleccionar un ambiente de desarrollo para implementar algunas interfaces de captura de información y su integración con la base de datos. Todos los integrantes del equipo deben hacer uso de los mismos recursos y el sistema a implementar debe estar unificado. 

Se debe entregar: 

 Implementación del proyecto (CRUD, interfaces, algoritmos, etc). La lista de requisitos a evaluar será acordada con el profesor. 

 Se debe implementar (utilizando los recursos del sistema gestor de BD elegido) todo el diseño de seguridad lógica que aplique para el negocio presentado tomando en cuenta las actividades transaccionales a automatizar: roles, cuentas, privilegios de sistema y privilegios sobre objetos. 

 Las tablas que se muestran en la aplicación deben contener paginado, búsqueda y ordenamiento por columnas. 

 La aplicación es Web. 

**Nota:** Cada entidad en la base de datos debe contener un conjunto significativo, coherente y realista de datos de prueba para la revisión del proyecto. La ausencia de datos suficientes impedirá la correcta y completa evaluación de las funcionalidades implementadas.