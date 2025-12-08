# **Diseño de Seguridad Integral y Control de Acceso (RBAC)**

Estrategia: Role-Based Access Control (RBAC) con Principio de Menor Privilegio.

## **1\. Definición de Roles de Base de Datos**

Para garantizar la integridad y privacidad de la red social, se han definido los siguientes roles jerárquicos a nivel de Base de Datos (PostgreSQL):

### **1.1. Roles de Usuario Final**

* **ROL\_ANONIMO (Invitado):**  
  * **Descripción:** Usuarios no autenticados o visitantes externos.  
  * **Alcance:** Solo lectura (SELECT) sobre perfiles (PERSONA), contenidos y catálogos marcados explícitamente como "Públicos".  
* **ROL\_MIEMBRO (Usuario Estándar):**  
  * **Descripción:** Rol base para cualquier persona autenticada.  
  * **Alcance:**  
    * **Perfil:** Edición de datos propios (PERSONA, CONFIGURACION).  
    * **Social:** Gestión de solicitudes de conexión y mensajes privados.  
    * **Grupos:** Crear grupos, unirse a grupos.  
    * **Desarrollo:** Solicitar tutorías, postularse a ofertas.  
    * **Contenido:** Crear publicaciones, comentar y reaccionar.  
* **ROL\_INSTITUCIONAL (Entidad Organizacional):**  
  * **Descripción:** Representa a las entidades de la UCAB y organizaciones aliadas.  
  * **Alcance:** Hereda de ROL\_MIEMBRO.  
    * **Privilegios Extra:** Gestión de Eventos Institucionales, Creación de Ofertas Laborales.  
    * **Restricción:** No accede a mensajería privada personal ni solicita tutorías (es ofertante).

### **1.2. Roles Administrativos**

* **ROL\_MODERADOR (Gestión de Comunidad):**  
  * **Descripción:** Personal encargado de velar por el cumplimiento de normas.  
  * **Alcance:** Moderación de contenidos, gestión de denuncias y catálogos.  
* **ROL\_AUDITOR (Analítica):**  
  * **Descripción:** Solo lectura para reportes.

## **2\. Tabla de Privilegios Global**

| Módulo | Objeto de BD | ROL\_ANONIMO | ROL\_MIEMBRO | ROL\_INSTITUCIONAL | ROL\_MODERADOR |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Actores** | MIEMBRO | SELECT | SELECT, UPDATE (Propio) | SELECT, UPDATE | SELECT |
|  | PERSONA | SELECT (Pub) | SELECT, UPDATE (Propio) | SELECT | SELECT |
|  | ENTIDAD\_ORGANIZACIONAL | SELECT | SELECT | UPDATE (Propio) | SELECT, UPDATE |
|  | CONFIGURACION | \- | SELECT, UPDATE (Propia) | SELECT, UPDATE | SELECT |
|  | TIENE\_NEXO / TIPO\_NEXO | \- | SELECT | SELECT, INSERT | SELECT, INSERT |
|  | ROL / ASIGNA\_ROL | SELECT | SELECT | SELECT | SELECT, INSERT |
| **Social** | SOLICITA\_CONEXION | \- | SELECT, INSERT, UPDATE | \- | SELECT |
| **Mensajería** | CONVERSACION | \- | SELECT, INSERT (Propia) | \- | \- |
|  | MENSAJE | \- | SELECT, INSERT (Propio) | \- | \- |
|  | PARTICIPA\_EN | \- | SELECT, INSERT | \- | \- |
| **Grupos** | GRUPO\_INTERES | SELECT (Pub) | SELECT, INSERT (Crear) | SELECT, INSERT | SELECT, UPDATE |
|  | PERTENECE\_A\_GRUPO | \- | SELECT, INSERT (Unirse) | SELECT | SELECT |
| **Desarrollo** | TUTORIA | SELECT | SELECT, INSERT (Como Tutor) | SELECT | SELECT |
|  | SOLICITA\_TUTORIA | \- | SELECT, INSERT (Solicitante) | SELECT | SELECT |
|  | OFERTA\_LABORAL | SELECT | SELECT | SELECT, INSERT | SELECT, DELETE |
|  | SE\_POSTULA | \- | SELECT, INSERT | SELECT (Ver postulantes) | \- |
| **Contenido** | CONTENIDO (Base) | SELECT (Pub) | SELECT, INSERT | SELECT, INSERT | SELECT, UPDATE (Estado) |
|  | PUBLICACION | SELECT (Pub) | SELECT, INSERT, UPDATE | SELECT, INSERT, UPDATE | SELECT, UPDATE |
|  | EVENTO | SELECT (Pub) | SELECT, INSERT | SELECT, INSERT, UPDATE | SELECT, UPDATE |
| **Interacción** | COMENTARIO | SELECT (Pub) | SELECT, INSERT | SELECT, INSERT | SELECT, DELETE |
|  | REACCIONA\_CONTENIDO | \- | SELECT, INSERT, DELETE | SELECT, INSERT | SELECT |
|  | REACCIONA\_COMENTARIO | \- | SELECT, INSERT, DELETE | SELECT, INSERT | SELECT |
|  | TIPO\_REACCION | SELECT | SELECT | SELECT | SELECT, INSERT |

