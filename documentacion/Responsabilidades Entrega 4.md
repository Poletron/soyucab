# Responsabilidades Entrega 4

Equipo: Oscar Jaramillo, Luis Torres, Pedro Urdaneta.

## 1. Arquitectura de la Solución

El equipo ha implementado una arquitectura **Cliente-Servidor de tres capas** con enfoque en API RESTful, garantizando separación de responsabilidades y escalabilidad:

- **Capa de Presentación (Frontend):** React con TypeScript, implementando una SPA reactiva.
- **Capa de Negocio (Backend):** Node.js con Express, utilizando una arquitectura de servicios desacoplados.
- **Capa de Persistencia:** PostgreSQL, con las vistas, triggers y funciones desarrollados en la Entrega 3.

## 2. Distribución de Responsabilidades por Módulo

A continuación, se detalla la asignación de funcionalidades que desarrolló cada integrante. Esta distribución mantiene la coherencia con los módulos asignados en la Entrega 3.

---

## 2.1. Módulo: Gestión de Contenido, Feed e Interacciones

**Responsable: Oscar Jaramillo (Ing. Informática)**
**Enfoque:** Dinámica del "Feed", viralidad, eventos y ciclo de vida de publicaciones.

#### Tablas Base de Datos (Entrega 3):
1. CONTENIDO (Superclase), PUBLICACION, EVENTO
2. COMENTARIO, REACCIONA_CONTENIDO, TIPO_REACCION

#### Funcionalidades Frontend:
| Funcionalidad | Descripción |
|---------------|-------------|
| Feed Principal | Visualización de publicaciones con ordenamiento cronológico inverso, sistema de comentarios y reacciones. |
| Creación de Contenido | Formularios para creación de publicaciones multimedia y eventos con validaciones. |
| Gestión de Eventos | Ciclo de vida completo de eventos: creación, edición, inscripción y cierre. |
| Dashboard de Reportería | Hub central con navegación por pestañas para visualización de todos los reportes y generación de PDFs. |

#### Funcionalidades Backend:
| Funcionalidad | Descripción |
|---------------|-------------|
| API de Contenido | CRUD completo para publicaciones, comentarios y reacciones. |
| API de Feed | Endpoints para obtención del feed con filtros y paginación. |
| API de Eventos | Gestión de eventos con integración a Stored Procedures. |
| Sistema de Reportes | Generación de reportes en JSON y PDF mediante integración con JsReport. |

#### Vistas/Reportes (Entrega 3):
| Vista SQL | Descripción |
|-----------|-------------|
| V_REPORTE_TOP_VIRAL | Ranking de contenido con mayor impacto (engagement). |
| V_REPORTE_LIDERES_OPINION | Usuarios más activos en generación de contenido. |
| V_REPORTE_INTERES_EVENTOS | Proyección de asistencia a eventos futuros. |

#### Desarrollo Adicional (Entrega 4):
- **Panel Administrativo de Reportería**: Interfaz para visualización de datos y generación de PDFs.
- **Infraestructura Docker**: Configuración de contenedores para todos los servicios del sistema.

---

## 2.2. Módulo: Usuarios, Grupos, Conexiones y Mensajería

**Responsable: Luis Torres (Ing. Informática)**
**Enfoque:** Integridad estructural de la red social, privacidad, grupos y comunicación directa.

#### Tablas Base de Datos (Entrega 3):
1. MIEMBRO, PERSONA, CONFIGURACION
2. SOLICITA_CONEXION (Grafo social)
3. GRUPO_INTERES, PERTENECE_A_GRUPO
4. CONVERSACION, MENSAJE, PARTICIPA_EN

#### Funcionalidades Frontend:
| Funcionalidad | Descripción |
|---------------|-------------|
| Registro de Usuarios | Formulario de registro con validaciones y verificación de correo institucional. |
| Autenticación | Sistema de login con JWT y manejo de sesiones. |
| Perfil de Usuario | Visualización y edición de información personal, foto y datos académicos/profesionales. |
| Grupos de Interés | Página de comunidades con gestión de membresías y contenido segregado. |
| Mensajería Privada | Sistema de chat entre conexiones con conversaciones en tiempo real. |
| Configuración | Panel de preferencias de privacidad y notificaciones. |

#### Funcionalidades Backend:
| Funcionalidad | Descripción |
|---------------|-------------|
| API de Autenticación | Registro, login, validación de tokens JWT y recuperación de contraseña. |
| API de Usuarios | CRUD de perfiles con gestión de información personal. |
| API de Conexiones | Gestión del grafo social: solicitudes, aceptación, rechazo y eliminación de conexiones. |
| API de Grupos | Creación de grupos, gestión de membresías y roles dentro de comunidades. |
| API de Mensajería | Conversaciones privadas con validación de participantes. |
| API de Notificaciones | Sistema de alertas para solicitudes, mensajes y actividad relevante. |

#### Vistas/Reportes (Entrega 3):
| Vista SQL | Descripción |
|-----------|-------------|
| V_REPORTE_CRECIMIENTO_DEMOGRAFICO | Análisis mensual de nuevos registros por ocupación. |
| V_GRUPOS_MAS_ACTIVOS | Top comunidades por número de miembros activos. |
| V_TOP_REFERENTES_COMUNIDAD | Usuarios con mayor autoridad en la red (conexiones). |

---

## 2.3. Módulo: Oportunidades Laborales, Tutorías y Vinculación Institucional

**Responsable: Pedro Urdaneta (Relaciones Industriales)**
**Enfoque:** Gestión de Recursos Humanos, alianzas estratégicas, tutorías y empleabilidad.

#### Tablas Base de Datos (Entrega 3):
1. ENTIDAD_ORGANIZACIONAL (Empresas/Dependencias)
2. TIENE_NEXO, TIPO_NEXO (Convenios)
3. OFERTA_LABORAL, SE_POSTULA
4. TUTORIA, SOLICITA_TUTORIA

#### Funcionalidades Frontend:
| Funcionalidad | Descripción |
|---------------|-------------|
| Bolsa de Trabajo | Listado de ofertas laborales con filtros, búsqueda y sistema de postulación. Muestra conteo de postulantes por oferta. |
| Directorio de Tutorías | Catálogo de servicios académicos con filtros por área de conocimiento. |
| Panel Organizacional | Interfaz exclusiva para entidades con KPIs (ofertas publicadas, postulantes recibidos) y herramientas de gestión. |

#### Funcionalidades Backend:
| Funcionalidad | Descripción |
|---------------|-------------|
| API de Ofertas Laborales | CRUD de vacantes con validación de nexos institucionales activos. Gestión de postulaciones. |
| API de Tutorías | Publicación de servicios de tutoría y gestión de solicitudes. |

#### Vistas/Reportes (Entrega 3):
| Vista SQL | Descripción |
|-----------|-------------|
| vista_top5_areas_conocimiento_demanda | Áreas académicas más solicitadas para tutorías. |
| vista_nexos_vigentes_vs_por_vencer | Auditoría de convenios institucionales (vigentes, por vencer, vencidos). |
| vista_top10_ofertas_mas_postuladas | Vacantes con mayor atracción de talento. |

---

## 3. Correspondencia con Requisitos Funcionales (Entrega 1 Corregida)

### RF 1: Gestión de Actores y Perfiles
| Requisito | Módulo Responsable | Implementación |
|-----------|-------------------|----------------|
| RF 1.1 Registro de miembro | Luis Torres | Registro con validación de correo único |
| RF 1.2 Perfil de Persona | Luis Torres | Edición de datos demográficos y biografía |
| RF 1.3 Perfil de Entidad Organizacional | Luis Torres | Gestión de datos corporativos (RIF, nombre, tipo) |

### RF 2: Gestión de Conexiones y Vínculos
| Requisito | Módulo Responsable | Implementación |
|-----------|-------------------|----------------|
| RF 2.1 Solicitud de conexión social | Luis Torres | API de conexiones con notificaciones |
| RF 2.2 Aceptar/Rechazar solicitudes | Luis Torres | Gestión de estados de conexión |
| RF 2.3 Vínculos Institucionales (Nexos) | Pedro Urdaneta | Registro de relaciones Persona-Organización |

### RF 3: Gestión de Contenido e Interacciones (Feed)
| Requisito | Módulo Responsable | Implementación |
|-----------|-------------------|----------------|
| RF 3.1 Crear Publicación | Oscar Jaramillo | Formularios de contenido con texto y multimedia |
| RF 3.2 Crear Evento | Oscar Jaramillo | Gestión de eventos con título, fecha y ubicación |
| RF 3.3 Publicar Comentarios | Oscar Jaramillo | Comentarios anidados (hilos de debate) |
| RF 3.4 Asignar Reacciones | Oscar Jaramillo | Reacciones de catálogo predefinido a contenido y comentarios |

### RF 4: Gestión de Oportunidades Profesionales
| Requisito | Módulo Responsable | Implementación |
|-----------|-------------------|----------------|
| RF 4.1 Publicar Oferta Laboral | Pedro Urdaneta | Bolsa de trabajo con validación de nexos |
| RF 4.2 Postulación a Oferta | Pedro Urdaneta | Sistema de postulaciones |

### RF 5: Gestión de Servicios de Tutoría
| Requisito | Módulo Responsable | Implementación |
|-----------|-------------------|----------------|
| RF 5.1 Registrar Tutoría | Pedro Urdaneta | Directorio de tutorías por área |
| RF 5.2 Solicitar Tutoría | Pedro Urdaneta | Sistema de solicitudes tutor-estudiante |

### RF 6: Gestión de Grupos de Interés
| Requisito | Módulo Responsable | Implementación |
|-----------|-------------------|----------------|
| RF 6.1 Crear Grupo de Interés | Luis Torres | Creación de comunidades autogestionadas |
| RF 6.2 Unirse/Abandonar Grupo | Luis Torres | Gestión de membresías con roles |

### RF 7: Administración y Personalización
| Requisito | Módulo Responsable | Implementación |
|-----------|-------------------|----------------|
| RF 7.1 Configuración de Privacidad | Luis Torres | Panel de preferencias (visibilidad, notificaciones) |
| RF 7.2 Asignación de Roles | Luis Torres | Sistema de roles con permisos diferenciados |

### RF 8: Reportes y Visualización
| Requisito | Módulo Responsable | Implementación |
|-----------|-------------------|----------------|
| RF 8.1 Datos para Mapa de Diáspora | Luis Torres | Consulta agregada de ubicaciones (país, ciudad) |
| RF 8.2 Reportes Institucionales | Oscar Jaramillo | Dashboard con 9 reportes y generación de PDF |

---

## 4. Resumen de Distribución de Trabajo

| Integrante | Módulo Principal | Áreas Cubiertas | Reportes |
|------------|------------------|-----------------|----------|
| **Oscar Jaramillo** | Contenido, Feed, Eventos | Feed, publicaciones, comentarios, reacciones, eventos, dashboard de reportes, infraestructura Docker | 3 vistas SQL |
| **Luis Torres** | Usuarios, Grupos, Mensajería | Autenticación, perfiles, conexiones, grupos, mensajería, notificaciones, configuración | 3 vistas SQL |
| **Pedro Urdaneta** | Ofertas, Tutorías, Nexos | Bolsa de trabajo, tutorías, panel organizacional, gestión de convenios | 3 vistas SQL |


