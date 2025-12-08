  
**Universidad Catolica Andres Bello**  
**Sistemas de Bases de Datos**  
**Profesora Goncalves Da Silva, Marlene**  
**Entrega 2**


**Integrantes**

- Luis Torres 29948009  
- Pedro Urdaneta 27818329  
- Oscar Jaramillo 27931241 

# **Restricciones Explícitas del Negocio**

A continuación, se presenta el listado formal de las reglas de negocio (Restricciones Explícitas) identificadas en el Universo de Discurso, que no pueden ser capturadas en su totalidad por la estructura del Modelo Entidad-Relación Extendido (ERE).

## **El Intercambio (Contenido e Interacciones)**

### **1\. Restricción de Integridad (Intra-entidad Temporal \- EVENTO)**

* **Lenguaje Natural:** "Como regla de integridad temporal, la fecha y hora de finalización del evento debe ser posterior a su fecha y hora de inicio."  
* **Lógica de Primer Orden (LPO):** ∀ e ∈ EVENTO ( e.fecha\_fin \> e.fecha\_inicio )

### **2\. Restricción de Integridad (Referencial / Lógica \- COMENTARIO)**

* **Lenguaje Natural:** "Si un comentario (hijo) responde a otro (padre), ambos deben estar asociados al mismo Contenido (post) raíz."  
* Lógica de Primer Orden (LPO):  
  ∀ c\_h, c\_p ∈ COMENTARIO ( (c\_h, c\_p) ∈ RESPONDE\_A ⇒  
  	(c\_h.correo\_autor\_contenido \= c\_p.correo\_autor\_contenido ∧  
  	c\_h.fecha\_hora\_creacion\_contenido \= c\_p.fecha\_hora\_creacion\_contenido) )

### **3\. Restricción de Dominio (Catálogo \- REACCION)**

* **Lenguaje Natural:** "Las reacciones (para Contenido o Comentarios) se seleccionarán de un catálogo predefinido y controlado por el sistema (ej. 'Me gusta', 'Celebrar', 'Interesante')."  
* Lógica de Primer Orden (LPO):  
  ∀ r ∈ REACCIONA\_CONTENIDO ∃ t ∈ TIPO\_REACCION (r.tipo\_reaccion \= t.nombre\_reaccion)  
  (Nota: La misma lógica aplica para REACCIONA\_COMENTARIO).

### **4\. Restricción de Unicidad (Interacción \- REACCION)**

* **Lenguaje Natural:** "Para mantener la claridad de la interacción, un Miembro solo podrá tener una reacción activa por cada Contenido o Comentario."  
* Lógica de Primer Orden (LPO):  
  ∀ m ∈ MIEMBRO, ∀ c ∈ CONTENIDO ( ∃\!1 r ∈ REACCIONA\_CONTENIDO (r.miembro \= m ∧ r.contenido \= c) )  
  (Nota: ∃\!1 denota existencia única. La misma lógica aplica para REACCIONA\_COMENTARIO).

## **La Comunicación Privada (Mensajería)**

### **5\. Restricción de Dominio (Estado del Mensaje)**

* **Lenguaje Natural:** "El atributo 'estado' de un Mensaje solo puede tomar valores de un conjunto predefinido y conocido por el sistema (por ejemplo: 'Enviado', 'Leído', 'Entregado')."  
* **Lógica de Primer Orden (LPO):**  
  ∀ m ∈ MENSAJE (m.estado \= 'Enviado' ∨ m.estado \= 'Leído' ∨ m.estado \= 'Entregado')

### **6\. Restricción de Autoría de Mensaje**

* **Lenguaje Natural:** "Para que una Persona pueda ser autora de un Mensaje en una Conversación, debe estar registrada como participante de dicha Conversación."  
* **Lógica de Primer Orden (LPO):**   
  ∀ m ∈ MENSAJE, ∀ p ∈ PERSONA, ∀ c ∈ CONVERSACION ( (m.autor \= p ∧ m.conversacion \= c) ⇒ (p, c) ∈ PARTICIPA\_EN )

## **El Desarrollo (Oportunidades y Tutorias)**

### **7\. Postulación a Oferta Laboral**

* ### **Lenguaje Natural**: "Una Persona solo puede postularse una vez a una misma Oferta Laboral."

* ### **Lógica de Primer Orden (LPO):**   ∀ p ∈ PERSONA, ∀ o ∈ OFERTA\_LABORAL    	(∃≤¹ s ∈ SE\_POSTULA (s.correo\_persona \=    	p.correo\_principal ∧ s.correo\_organizacion\_oferta \=    	o.correo\_organizacion ∧ s.fecha\_publicacion\_oferta \=    	o.fecha\_publicacion ∧ s.titulo\_oferta \= o.titulo\_oferta)

**8\. Solicitud de Tutoria**

* **Lenguaje Natural:** "Una Persona (estudiante) solo puede solicitar una vez un mismo servicio de Tutoría."  
* **Lógica de Primer Orden (LPO):**  
  ∀ p ∈ PERSONA, ∀ t ∈ TUTORIA (∃≤¹ s ∈ SOLICITA\_TUTORIA (s.correo\_solicitante \= p.correo\_principal ∧ s.correo\_tutor\_tutoria \= t.correo\_tutor ∧ s.area\_conocimiento\_tutoria \= t.area\_conocimiento ∧ s.fecha\_alta\_tutoria \= t.fecha\_alta))

### 

### **Los Vínculos (Conexiones de la Comunidad)**

### **9\. Restricción de Integridad (Anti-Reflexiva \- CONEXION)**

* **Lenguaje Natural:** "Una Persona no puede enviarse una solicitud de conexión a sí misma."  
* **Lógica de Primer Orden (LPO):**  
  ∀ p\_a, p\_b ∈ PERSONA, ∀ s ∈ SOLICITA\_CONEXION ( (s.solicitante \= p\_a ∧ s.solicitado \= p\_b) ⇒ p\_a ≠ p\_b )

### **10\. Restricción de Dominio (Estado de Solicitud \- CONEXION)**

* **Lenguaje Natural:** "El estado de una solicitud de conexión solo puede ser: 'Pendiente', 'Aceptada' o 'Rechazada'."  
* **Lógica de Primer Orden (LPO):**   
  ∀ s ∈ SOLICITA\_CONEXION ( s.estado\_solicitud ∈ {'Pendiente', 'Aceptada', 'Rechazada'} )

## **Módulo: El Entorno (Grupos, Administración y Privacidad)**

### **11\. Restricción de Integridad Lógica (Creador es Miembro)**

* **Lenguaje Natural:** "La Persona que está registrada como la creadora de un Grupo de Interés debe existir también como un miembro dentro de ese mismo grupo."  
* **Lógica de Primer Orden (LPO):**  
  ∀ g ∈ GRUPO\_INTERES ∃ m ∈ PERTENECE\_A\_GRUPO ( m.correo\_persona \= g.correo\_creador ∧ m.nombre\_grupo \= g.nombre\_grupo )

### **12\. Restricción de Dominio (Visibilidad de Grupo)**

* **Lenguaje Natural:** "La visibilidad de un Grupo de Interés solo puede tomar valores de un conjunto predefinido ('Público', 'Privado')."  
* **Lógica de Primer Orden (LPO):**  
  ∀ g ∈ GRUPO\_INTERES (g.visibilidad \= 'Público' ∨ g.visibilidad \= 'Privado')

### **13\. Restricción de Asignación de Rol**

* **Lenguaje Natural:** "El Rol de 'Reclutador' solo puede ser asignado a un Miembro que sea de tipo Entidad Organizacional."  
* **Lógica de Primer Orden (LPO):**  
  ∀ m ∈ MIEMBRO, ∀ r ∈ ROL ( (m, r) ∈ ASIGNA\_ROL ∧ r.nombre\_rol \= 'Reclutador' ⇒ m ∈ ENTIDAD\_ORGANIZACIONAL )

### **14\. Restricción de Dominio (Visibilidad de Perfil)**

* **Lenguaje Natural:** "El atributo 'visibilidad\_perfil' en la Configuración de un Miembro solo puede tomar valores de un conjunto predefinido (ej. 'Público', 'Solo Conexiones', 'Privado')."  
* Lógica de Primer Orden (LPO):  
  ∀ c ∈ CONFIGURACION ( c.visibilidad\_perfil \= 'Público' ∨ c.visibilidad\_perfil \= 'Solo Conexiones' ∨ c.visibilidad\_perfil \= 'Privado' )

# **Modelo Lógico Relacional**

### **1\. Actores Centrales (Usuarios y Organización)**

**MIEMBRO** (**correo\_principal**, contrasena\_hash, fecha\_registro, fotografia\_url)

* **PK:** correo\_principal

**PERSONA** (**correo\_principal**, cedula, nombres, apellidos, fecha\_nacimiento, sexo, biografia, pais\_residencia, ciudad\_residencia)

* **PK:** correo\_principal  
* **FK:** correo\_principal referencia a MIEMBRO(correo\_principal)

**ENTIDAD\_ORGANIZACIONAL** (**correo\_principal**, rif, nombre\_oficial, descripcion, tipo\_entidad, pais\_ubicacion, ciudad\_ubicacion)

* **PK:** correo\_principal  
* **FK:** correo\_principal referencia a MIEMBRO(correo\_principal)

### **2\. Módulo de Mensajería (Diseño Estricto)**

**CONVERSACION** (correo\_creador, fecha\_creacion\_chat, titulo\_chat, tipo\_conversacion) 

* **PK:** (correo\_creador, fecha\_creacion\_chat)   
* **FK:** correo\_creador referencia a PERSONA(correo\_principal)

**PARTICIPA\_EN** (**correo\_creador\_chat, fecha\_creacion\_chat, correo\_participante,** fecha\_ingreso) 

* **PK:** (correo\_creador\_chat, fecha\_creacion\_chat, correo\_participante)   
* **FK:** (correo\_creador\_chat, fecha\_creacion\_chat) referencia a CONVERSACION(correo\_creador, fecha\_creacion\_chat)   
* **FK:** correo\_participante referencia a PERSONA(correo\_principal)

**MENSAJE** (**correo\_creador\_chat, fecha\_creacion\_chat, fecha\_hora\_envio**, correo\_autor\_mensaje, texto\_mensaje, estado\_mensaje) 

* **PK:** (correo\_creador\_chat, fecha\_creacion\_chat, fecha\_hora\_envio)   
* **FK:** (correo\_creador\_chat, fecha\_creacion\_chat) referencia a CONVERSACION(correo\_creador, fecha\_creacion\_chat)   
* **FK:** correo\_autor\_mensaje referencia a PERSONA(correo\_principal)

### **3\. Contenido e Interacciones (Feed)**

**CONTENIDO** (**correo\_autor, fecha\_hora\_creacion**, texto\_contenido, visibilidad, archivo\_url)

* **PK:** (correo\_autor, fecha\_hora\_creacion)  
* **FK:** correo\_autor referencia a MIEMBRO(correo\_principal)

**PUBLICACION** (**correo\_autor, fecha\_hora\_creacion**)

* **PK:** (correo\_autor, fecha\_hora\_creacion)  
* **FK:** (correo\_autor, fecha\_hora\_creacion) referencia a CONTENIDO(correo\_autor, fecha\_hora\_creacion)

**EVENTO** (**correo\_autor, fecha\_hora\_creacion**, titulo, fecha\_inicio, fecha\_fin, pais\_ubicacion, ciudad\_ubicacion)

* **PK:** (correo\_autor, fecha\_hora\_creacion)  
* **FK:** (correo\_autor, fecha\_hora\_creacion) referencia a CONTENIDO(correo\_autor, fecha\_hora\_creacion)  
* **Restricción:** fecha\_fin \> fecha\_inicio

**COMENTARIO** (**fk\_contenido\_autor, fk\_contenido\_fecha, fecha\_hora\_comentario,** correo\_autor\_comentario, texto\_comentario, fk\_padre\_autor\_cont, fk\_padre\_fecha\_cont, fk\_padre\_fecha\_coment)

* **PK:** (fk\_contenido\_autor, fk\_contenido\_fecha, fecha\_hora\_comentario)  
* **FK:** (fk\_contenido\_autor, fk\_contenido\_fecha) referencia a CONTENIDO(correo\_autor, fecha\_hora\_creacion)  
* **FK:** correo\_autor\_comentario referencia a MIEMBRO(correo\_principal)  
* **FK:** (fk\_padre\_autor\_cont, fk\_padre\_fecha\_cont, fk\_padre\_fecha\_coment) referencia a COMENTARIO(fk\_contenido\_autor, fk\_contenido\_fecha, fecha\_hora\_comentario)

### **4\. Conexiones Sociales**

**SOLICITA\_CONEXION** (**correo\_solicitante, correo\_solicitado**, fecha\_solicitud, estado\_solicitud)

* **PK:** (correo\_solicitante, correo\_solicitado)  
* **FK:** correo\_solicitante referencia a PERSONA(correo\_principal)  
* **FK:** correo\_solicitado referencia a PERSONA(correo\_principal)  
* **Restricción:** correo\_solicitante \!= correo\_solicitado

**TIENE\_NEXO** (**correo\_persona, correo\_organizacion, nombre\_nexo**, fecha\_inicio, fecha\_fin)

* **PK:** (correo\_persona, correo\_organizacion, nombre\_nexo)  
* **FK:** correo\_persona referencia a PERSONA(correo\_principal)  
* **FK:** correo\_organizacion referencia a ENTIDAD\_ORGANIZACIONAL(correo\_principal)  
* **FK:** nombre\_nexo referencia a TIPO\_NEXO(nombre\_nexo)

**TIPO\_NEXO** (**nombre\_nexo**, descripcion)

* **PK:** nombre\_nexo

### **5\. Grupos, Tutorías y Configuración**

**GRUPO\_INTERES** (**nombre\_grupo**, descripcion\_grupo, visibilidad, correo\_creador, fecha\_creacion)

* **PK:** nombre\_grupo  
* **FK:** correo\_creador referencia a PERSONA(correo\_principal)

**PERTENECE\_A\_GRUPO** (correo\_persona, nombre\_grupo, fecha\_union, rol\_en\_grupo)

* **PK:** (**correo\_persona**, nombre\_grupo)  
* **FK:** correo\_persona referencia a PERSONA(correo\_principal)  
* **FK:** nombre\_grupo referencia a GRUPO\_INTERES(nombre\_grupo)

**TUTORIA** (**correo\_tutor, area\_conocimiento, fecha\_alta,** descripcion\_enfoque)

* **PK:** (correo\_tutor, area\_conocimiento, fecha\_alta)  
* **FK:** correo\_tutor referencia a PERSONA(correo\_principal)

**SOLICITA\_TUTORIA** (**correo\_solicitante**, **correo\_tutor\_tutoria, area\_conocimiento**, **fecha\_alta\_tutoria**, fecha\_solicitud, estado)

* **PK:** (correo\_solicitante, correo\_tutor\_tutoria, area\_conocimiento, fecha\_alta\_tutoria)  
* **FK:** correo\_solicitante referencia a PERSONA(correo\_principal)  
* **FK:** (correo\_tutor\_tutoria, area\_conocimiento, fecha\_alta\_tutoria) referencia a TUTORIA(correo\_tutor, area\_conocimiento, fecha\_alta)

**CONFIGURACION** (**correo\_miembro**, visibilidad\_perfil, notif\_comentarios, notif\_eventos)

* **PK:** correo\_miembro  
* **FK:** correo\_miembro referencia a MIEMBRO(correo\_principal)

# **Diccionario de Datos** 

## **Actores Centrales**

### **Tabla: MIEMBRO**

**Descripción:** Tabla superclase. Almacena la información de autenticación y registro común a todos los actores de la plataforma.

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| correo\_principal | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, NOT NULL, UNIQUE | Correo electrónico único del miembro. Usado para login. Llave Primaria. |
| contrasena\_hash | VARCHAR(255) | Simple, Monovaluado, Almacenado | NOT NULL | Hash de la contraseña (ej. SHA-256) por seguridad. |
| fecha\_registro | TIMESTAMP | Simple, Monovaluado, Almacenado | NOT NULL | Fecha y hora exactas en que el miembro se registró en la plataforma. |
| fotografia\_url | VARCHAR(255) | Simple, Monovaluado, Almacenado | NULL | URL de la fotografía de perfil del miembro. Opcional. |

### **Tabla: PERSONA**

**Descripción:** Subclase de MIEMBRO. Almacena la información específica de un individuo (estudiante, egresado, profesor).

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| correo\_principal | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Llave primaria que identifica a la persona. Es una FK que referencia a MIEMBRO(correo\_principal). |
| nombres | VARCHAR(100) | Simple, Monovaluado, Almacenado | NOT NULL | Nombres de pila de la persona. |
| apellidos | VARCHAR(100) | Simple, Monovaluado, Almacenado | NOT NULL | Apellidos de la persona. |
| fecha\_nacimiento | DATE | Simple, Monovaluado, Almacenado | NULL | Fecha de nacimiento. Opcional. |
| sexo | VARCHAR(20) | Simple, Monovaluado, Almacenado | NULL, CHECK | Dominio: 'Masculino', 'Femenino', 'Otro', 'Prefiero no decirlo'. Opcional. |
| pais\_residencia | VARCHAR(100) | Simple, Monovaluado, Almacenado | NULL | País de residencia actual. Usado para el Mapa de la Diáspora. |
| ciudad\_residencia | VARCHAR(100) | Simple, Monovaluado, Almacenado | NULL | Ciudad de residencia actual. Usado para el Mapa de la Diáspora. |
| biografia | TEXT | Simple, Monovaluado, Almacenado | NULL | Texto descriptivo corto del perfil de la persona. Opcional. |

### 

### **Tabla: ENTIDAD\_ORGANIZACIONAL**

**Descripción:** Subclase de MIEMBRO. Almacena la información específica de una organización (Dependencia UCAB, Aliado Externo).

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| correo\_principal | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Llave primaria que identifica a la organización. Es una FK que referencia a MIEMBRO(correo\_principal). |
| rif | VARCHAR(20) | Simple, Monovaluado, Almacenado | NOT NULL, UNIQUE | Registro de Información Fiscal (RIF) de la organización. Formato: J-12345678-9. |
| nombre\_oficial | VARCHAR(255) | Simple, Monovaluado, Almacenado | NOT NULL | Nombre legal o comercial completo de la organización. |
| descripcion\_detallada | TEXT | Simple, Monovaluado, Almacenado | NULL | Descripción de la organización, su misión y visión. Opcional. |
| tipo\_entidad | VARCHAR(50) | Simple, Monovaluado, Almacenado | NOT NULL, CHECK | Dominio: 'Dependencia UCAB', 'Aliado Externo', 'Grupo de Investigación'. (RF 1.3) |
| pais\_ubicacion | VARCHAR(100) | Simple, Monovaluado, Almacenado | NULL | País donde se encuentra la sede principal de la organización. |
| ciudad\_ubicacion | VARCHAR(100) | Simple, Monovaluado, Almacenado | NULL | Ciudad donde se encuentra la sede principal de la organización. |

## **Conexiones y Vínculos**

### **Tabla: SOLICITA\_CONEXION**

**Descripción:** Tabla asociativa que mapea la relación N:M unaria SOLICITA\_CONEXION entre Personas. Almacena el historial de solicitudes.

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| correo\_solicitante | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a la PERSONA que envía la solicitud. |
| correo\_solicitado | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a la PERSONA que recibe la solicitud. |
| fecha\_solicitud | TIMESTAMP | Simple, Monovaluado, Almacenado | NOT NULL | Fecha y hora en que se envió la solicitud. |
| estado\_solicitud | VARCHAR(20) | Simple, Monovaluado, Almacenado | NOT NULL, CHECK | Dominio: 'Pendiente', 'Aceptada', 'Rechazada' (Regla 9). |

### **Tabla: TIPO\_NEXO**

**Descripción:** Tabla catálogo. Almacena los tipos de vínculos institucionales permitidos (ej. "Estudiante", "Profesor", "Egresado").

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| nombre\_nexo | VARCHAR(100) | Simple, Monovaluado, Almacenado | PK, NOT NULL, UNIQUE | Llave primaria. El nombre descriptivo del tipo de nexo. |
| descripcion | TEXT | Simple, Monovaluado, Almacenado | NULL | Explicación del alcance y significado del nexo. |

### 

### **Tabla: TIENE\_NEXO**

**Descripción:** Tabla asociativa que mapea la relación ternaria N:M:P TIENE\_NEXO. Conecta a una Persona, una Organización y un Tipo de Nexo.

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| correo\_persona | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a la PERSONA. |
| correo\_organizacion | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a la ENTIDAD\_ORGANIZACIONAL. |
| nombre\_nexo | VARCHAR(100) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia al TIPO\_NEXO. |
| fecha\_inicio | DATE | Simple, Monovaluado, Almacenado | NOT NULL | Fecha en que comenzó este vínculo institucional. |
| fecha\_fin | DATE | Simple, Monovaluado, Almacenado | NULL | Fecha en que finalizó el vínculo. NULL si está activo. |

## **Módulo 3: Contenido e Interacciones (El Feed)**

### **Tabla: CONTENIDO**

**Descripción:** Superclase (Entidad Débil) para la jerarquía de contenido. Depende de MIEMBRO a través de la relación identificadora CREA.

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| correo\_autor | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia al MIEMBRO autor. |
| fecha\_hora\_creacion | TIMESTAMP | Simple, Monovaluado, Almacenado | PK, NOT NULL | Parte de la PK (clave parcial). Momento exacto de la creación. |
| texto\_contenido | TEXT | Simple, Monovaluado, Almacenado | NULL | El cuerpo principal del contenido (post o descripción del evento). |
| visibilidad | VARCHAR(30) | Simple, Monovaluado, Almacenado | NOT NULL, CHECK | Dominio: 'Público', 'Solo Conexiones', 'Privado'. |

### **Tabla: PUBLICACION**

**Descripción:** Subclase de CONTENIDO. Representa un post estándar en el feed.

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| correo\_autor | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a CONTENIDO. |
| fecha\_hora\_creacion | TIMESTAMP | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a CONTENIDO. |

### **Tabla: EVENTO**

**Descripción:** Subclase de CONTENIDO. Representa un evento con atributos temporales y de ubicación.

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| correo\_autor | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a CONTENIDO. |
| fecha\_hora\_creacion | TIMESTAMP | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a CONTENIDO. |
| titulo | VARCHAR(255) | Simple, Monovaluado, Almacenado | NOT NULL | Título oficial del evento. |
| fecha\_inicio | TIMESTAMP | Simple, Monovaluado, Almacenado | NOT NULL | Momento de inicio del evento. |
| fecha\_fin | TIMESTAMP | Simple, Monovaluado, Almacenado | NOT NULL, CHECK | Momento exacto de finalización. (Regla 1: fecha\_fin > fecha\_inicio). |
| pais\_ubicacion | VARCHAR(100) | Simple, Monovaluado, Almacenado | NULL | País donde se realizará el evento. |
| ciudad\_ubicacion | VARCHAR(100) | Simple, Monovaluado, Almacenado | NULL | Ciudad donde se realizará el evento. |

### **Tabla: COMENTARIO**

**Descripción:** Entidad Débil que depende de CONTENIDO (vía TIENE) y también referencia a MIEMBRO (vía ESCRIBE) y a sí misma (vía RESPONDE\_A).

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| fk\_contenido\_autor | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a CONTENIDO(correo\_autor). |
| fk\_contenido\_fecha | TIMESTAMP | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a CONTENIDO(fecha\_hora\_creacion). |
| fecha\_hora\_comentario | TIMESTAMP | Simple, Monovaluado, Almacenado | PK, NOT NULL | Parte de la PK (clave parcial). Momento exacto del comentario. |
| correo\_autor\_comentario | VARCHAR(255) | Simple, Monovaluado, Almacenado | FK, NOT NULL | Referencia al MIEMBRO que escribió el comentario. |
| texto\_comentario | TEXT | Simple, Monovaluado, Almacenado | NOT NULL | El cuerpo del comentario. |
| fk\_padre\_autor\_cont | VARCHAR(255) | Simple, Monovaluado, Almacenado | FK, NULL | PK (Parte 1) del comentario padre al que responde. |
| fk\_padre\_fecha\_cont | TIMESTAMP | Simple, Monovaluado, Almacenado | FK, NULL | PK (Parte 2) del comentario padre al que responde. |
| fk\_padre\_fecha\_coment | TIMESTAMP | Simple, Monovaluado, Almacenado | FK, NULL | PK (Parte 3) del comentario padre al que responde. |

### **Tabla: TIPO\_REACCION**

**Descripción:** Tabla catálogo. Almacena los tipos de reacciones permitidas (ej. "Me gusta", "Celebrar"). (Regla 3).

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| nombre\_reaccion | VARCHAR(50) | Simple, Monovaluado, Almacenado | PK, NOT NULL, UNIQUE | Llave primaria. El nombre de la reacción (ej. "Me gusta"). |
| descripcion | TEXT | Simple, Monovaluado, Almacenado | NULL | Explicación breve de la reacción. |
| url\_icono | VARCHAR(255) | Simple, Monovaluado, Almacenado | NULL | Ubicación del recurso gráfico para la reacción. |

### **Tabla: REACCIONA\_CONTENIDO**

**Descripción:** Tabla asociativa que mapea la relación ternaria N:M:P REACCIONA\_CONTENIDO.

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| correo\_miembro | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia al MIEMBRO que reacciona. |
| correo\_autor\_contenido | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a CONTENIDO(correo\_autor). |
| fecha\_hora\_creacion\_contenido | TIMESTAMP | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a CONTENIDO(fecha\_hora\_creacion). |
| nombre\_reaccion | VARCHAR(50) | Simple, Monovaluado, Almacenado | FK, NOT NULL | Referencia a TIPO\_REACCION(nombre\_reaccion). |
| fecha\_hora\_reaccion | TIMESTAMP | Simple, Monovaluado, Almacenado | NOT NULL | Momento exacto en que se produjo la reacción. |

### **Tabla: REACCIONA\_COMENTARIO**

**Descripción:** Tabla asociativa que mapea la relación ternaria N:M:P REACCIONA\_COMENTARIO.

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| correo\_miembro | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia al MIEMBRO que reacciona. |
| correo\_autor\_contenido | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a COMENTARIO. |
| fecha\_hora\_creacion\_contenido | TIMESTAMP | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a COMENTARIO. |
| fecha\_hora\_comentario | TIMESTAMP | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a COMENTARIO. |
| nombre\_reaccion | VARCHAR(50) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a TIPO\_REACCION. |
| fecha\_hora\_reaccion | TIMESTAMP | Simple, Monovaluado, Almacenado | NOT NULL | Momento exacto en que se produjo la reacción. |

## **Oportunidades y Tutorías**

### **Tabla: OFERTA\_LABORAL**

**Descripción:** Entidad Débil. Depende de ENTIDAD\_ORGANIZACIONAL a través de la relación identificadora PUBLICA\_OFERTA.

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| correo\_organizacion | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a ENTIDAD\_ORGANIZACIONAL. |
| fecha\_publicacion | TIMESTAMP | Simple, Monovaluado, Almacenado | PK, NOT NULL | Parte de la PK (clave parcial). Momento de publicación. |
| titulo\_oferta | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, NOT NULL | Parte de la PK (clave parcial). Título del cargo. |
| descripcion\_cargo | TEXT | Simple, Monovaluado, Almacenado | NOT NULL | Descripción detallada de responsabilidades y funciones. |
| requisitos | TEXT | Simple, Monovaluado, Almacenado | NULL | Requisitos y calificaciones deseadas. Opcional. |
| modalidad | VARCHAR(20) | Simple, Monovaluado, Almacenado | NOT NULL, CHECK | Dominio: 'Presencial', 'Remoto', 'Híbrido' (RF 4.1). |

### **Tabla: SE\_POSTULA**

**Descripción:** Tabla asociativa que mapea la relación N:M SE\_POSTULA. Conecta a una PERSONA con una OFERTA\_LABORAL.

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| correo\_persona | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a PERSONA. |
| correo\_organizacion\_oferta | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a OFERTA\_LABORAL. |
| fecha\_publicacion\_oferta | TIMESTAMP | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a OFERTA\_LABORAL. |
| titulo\_oferta | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a OFERTA\_LABORAL. |
| fecha\_postulacion | TIMESTAMP | Simple, Monovaluado, Almacenado | NOT NULL | Momento exacto en que la persona se postula. |
| estado\_postulacion | VARCHAR(20) | Simple, Monovaluado, Almacenado | NOT NULL, CHECK | Dominio: 'Enviada', 'En Revisión', 'Rechazada', 'Aceptada'. |

### **Tabla: TUTORIA**

**Descripción:** Entidad Débil. Depende de PERSONA (el tutor) a través de la relación identificadora OFRECE.

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| correo\_tutor | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a la PERSONA que es tutora. |
| area\_conocimiento | VARCHAR(150) | Simple, Monovaluado, Almacenado | PK, NOT NULL | Parte de la PK (clave parcial). Área de la tutoría (ej. "Cálculo II"). |
| fecha\_alta | TIMESTAMP | Simple, Monovaluado, Almacenado | PK, NOT NULL | Parte de la PK (clave parcial). Fecha en que se registró el servicio. |
| descripcion\_enfoque | TEXT | Simple, Monovaluado, Almacenado | NULL | Breve descripción del enfoque pedagógico o temas cubiertos. |

### 

### 

### **Tabla: SOLICITA\_TUTORIA**

**Descripción:** Tabla asociativa que mapea la relación N:M SOLICITA\_TUTORIA. Conecta a una PERSONA (estudiante) con un servicio de TUTORIA.

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| correo\_solicitante | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a PERSONA (estudiante). |
| correo\_tutor\_tutoria | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a TUTORIA. |
| area\_conocimiento\_tutoria | VARCHAR(150) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a TUTORIA. |
| fecha\_alta\_tutoria | TIMESTAMP | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a TUTORIA. |
| fecha\_solicitud | TIMESTAMP | Simple, Monovaluado, Almacenado | NOT NULL | Momento exacto en que se solicita la tutoría. |
| estado\_solicitud | VARCHAR(20) | Simple, Monovaluado, Almacenado | NOT NULL, CHECK | Dominio: 'Enviada', 'Aceptada', 'Rechazada', 'Completada'. |

## 

## 

## 

## 

## **Módulo 5: Soporte y Administración**

### **Tabla: ROL**

**Descripción:** Tabla catálogo. Almacena los roles de seguridad y permisos (RF 7.2).

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| nombre\_rol | VARCHAR(50) | Simple, Monovaluado, Almacenado | PK, NOT NULL, UNIQUE | Llave primaria. Nombre del rol (ej. "Admin", "Reclutador"). |
| descripcion | TEXT | Simple, Monovaluado, Almacenado | NULL | Explicación de los permisos y responsabilidades del rol. |

### **Tabla: MIEMBRO\_POSEE\_ROL**

**Descripción:** Tabla asociativa que mapea la relación N:M MIEMBRO\_POSEE\_ROL.

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| correo\_miembro | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a MIEMBRO. |
| nombre\_rol | VARCHAR(50) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a ROL. |
| fecha\_asignacion | TIMESTAMP | Simple, Monovaluado, Almacenado | NOT NULL | Momento exacto en que el rol fue asignado al miembro. |

### 

### 

### 

### **Tabla: CONFIGURACION**

**Descripción:** Entidad Débil que implementa la relación 1:1 TIENE\_CONFIG. Almacena las preferencias de privacidad del usuario (RF 7.1).

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| correo\_miembro | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | PK de la tabla. Referencia 1:1 a MIEMBRO. |
| visibilidad\_perfil | VARCHAR(30) | Simple, Monovaluado, Almacenado | NOT NULL, CHECK | Dominio: 'Público', 'Solo Conexiones', 'Privado' (Regla 14). |
| notif\_comentarios | BOOLEAN | Simple, Monovaluado, Almacenado | NOT NULL, DEFAULT true | Preferencia de notificación para nuevos comentarios. |
| notif\_eventos | BOOLEAN | Simple, Monovaluado, Almacenado | NOT NULL, DEFAULT true | Preferencia de notificación para nuevos eventos. |
| notif\_mensajes | BOOLEAN | Simple, Monovaluado, Almacenado | NOT NULL, DEFAULT true | Preferencia de notificación para nuevos mensajes privados. |

## **Grupos de Interés**

### **Tabla: GRUPO\_INTERES**

**Descripción:** Entidad Fuerte. Representa una comunidad autogestionada (RF 6.1).

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| nombre\_grupo | VARCHAR(150) | Simple, Monovaluado, Almacenado | PK, NOT NULL, UNIQUE | Llave primaria. Nombre único del grupo. |
| descripcion\_grupo | TEXT | Simple, Monovaluado, Almacenado | NULL | Descripción de la temática y reglas del grupo. |
| visibilidad | VARCHAR(20) | Simple, Monovaluado, Almacenado | NOT NULL, CHECK | Dominio: 'Público', 'Privado' (Regla 12). |
| correo\_creador | VARCHAR(255) | Simple, Monovaluado, Almacenado | FK, NOT NULL | Referencia a la PERSONA que creó el grupo (vía CREA\_GRUPO). |
| fecha\_creacion | TIMESTAMP | Simple, Monovaluado, Almacenado | NOT NULL | Momento exacto de creación del grupo. |

### **Tabla: PERTENECE\_A\_GRUPO**

**Descripción:** Tabla asociativa que mapea la relación N:M PERTENECE\_A\_GRUPO (RF 6.2).

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| correo\_persona | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a la PERSONA que se une. |
| nombre\_grupo | VARCHAR(150) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia al GRUPO\_INTERES. |
| fecha\_union | TIMESTAMP | Simple, Monovaluado, Almacenado | NOT NULL | Momento en que la persona se unió al grupo. |
| rol\_en\_grupo | VARCHAR(30) | Simple, Monovaluado, Almacenado | NOT NULL, CHECK | Dominio: 'Miembro', 'Moderador', 'Administrador'. |

## 

## 

## **Mensajería Privada (Chats)**

### **Tabla: CONVERSACION**

**Descripción:** Entidad Fuerte. Representa un hilo de chat individual o grupal.

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| correo\_creador | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a PERSONA (creador). |
| fecha\_creacion\_chat | TIMESTAMP | Simple, Monovaluado, Almacenado | PK, NOT NULL | Parte de la PK. Momento en que se inició la conversación. |
| titulo\_chat | VARCHAR(100) | Simple, Monovaluado, Almacenado | NULL | Título opcional del chat (para chats grupales o 1-a-1). |
| tipo\_conversacion | VARCHAR(20) | Simple, Monovaluado, Almacenado | NULL | Tipo de conversación. |

### **Tabla: PARTICIPA\_EN**

**Descripción:** Tabla asociativa que mapea la relación N:M PARTICIPA\_EN. Vincula a las PERSONAS con las CONVERSACIONes.

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| correo\_creador\_chat | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a CONVERSACION. |
| fecha\_creacion\_chat | TIMESTAMP | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a CONVERSACION. |
| correo\_participante | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a la PERSONA participante. |
| fecha\_ingreso | TIMESTAMP | Simple, Monovaluado, Almacenado | NOT NULL | Momento en que la persona se unió a la conversación. |

### 

### **Tabla: MENSAJE**

**Descripción:** Entidad Débil. Depende de CONVERSACION (vía CONTIENE\_MENSAJE) y referencia al autor (vía ENVIA\_MENSAJE).

| Atributo | Tipo de Dato | Tipo de Atributo | Restricciones | Descripción |
| :---- | :---- | :---- | :---- | :---- |
| correo\_creador\_chat | VARCHAR(255) | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a CONVERSACION. |
| fecha\_creacion\_chat | TIMESTAMP | Simple, Monovaluado, Almacenado | PK, FK, NOT NULL | Parte de la PK. Referencia a CONVERSACION. |
| fecha\_hora\_envio | TIMESTAMP | Simple, Monovaluado, Almacenado | PK, NOT NULL | Parte de la PK (clave parcial). Momento exacto del envío. |
| correo\_autor\_mensaje | VARCHAR(255) | Simple, Monovaluado, Almacenado | FK, NOT NULL | Referencia a la PERSONA que envió el mensaje. (Regla 6). |
| texto\_mensaje | TEXT | Simple, Monovaluado, Almacenado | NOT NULL | El contenido del mensaje. |
| estado\_mensaje | VARCHAR(20) | Simple, Monovaluado, Almacenado | NOT NULL, CHECK | Dominio: 'Enviado', 'Leído', 'Entregado' (Regla 5). |
