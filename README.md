# 🎓 SoyUCAB - Red Social Institucional

Sistema de red social institucional para la Universidad Católica Andrés Bello (UCAB), desarrollado como proyecto de Base de Datos II.

## 📋 Descripción del Proyecto

SoyUCAB es una plataforma social diseñada para conectar a la comunidad ucabista: estudiantes, egresados, profesores y personal administrativo. El sistema incluye:

- **Gestión de perfiles** y nexos institucionales
- **Conexiones sociales** entre miembros
- **Grupos de interés** (públicos, privados y secretos)
- **Sistema de mensajería** privada
- **Eventos** institucionales
- **Ofertas laborales** y sistema de tutorías
- **Reportes analíticos** en PDF

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │────▶│   PostgreSQL    │
│  React + Vite   │     │ Node.js + Express│     │     Database    │
│   Puerto 5173   │     │   Puerto 3000    │     │   Puerto 5432   │
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │    JsReport      │
                        │  (Generador PDF) │
                        │   Puerto 5488    │
                        └──────────────────┘
```

**Servicios adicionales:**
- **pgAdmin 4** (Puerto 8080) - Administración visual de la base de datos

---

## 🚀 Requisitos Previos

- **Docker Desktop** (versión 20.10 o superior)
- **Docker Compose** (incluido en Docker Desktop)
- **Git** (para clonar el repositorio)

> [!NOTE]
> Asegúrese de que Docker Desktop esté ejecutándose antes de iniciar el despliegue.

---

## 📦 Despliegue Rápido

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd soyucab
```

### 2. Iniciar todos los servicios

```bash
docker compose up -d --build
```

> [!TIP]
> La primera ejecución puede tomar varios minutos mientras se descargan las imágenes y se construyen los contenedores.

### 3. Verificar que todos los servicios estén corriendo

```bash
docker compose ps
```

Debería ver 5 contenedores con estado `running`:
- `soyucab_postgres`
- `soyucab_pgadmin`
- `soyucab_backend`
- `soyucab_jsreport`
- `soyucab_frontend`

---

## 🔀 Despliegue con Puertos Alternativos (Evitar Conflictos)

Si tiene otros proyectos ejecutándose que usan los puertos estándar, puede usar la configuración de puertos alternativos:

```bash
docker compose -f docker-compose.alt-ports.yml up -d --build
```

### Tabla de Puertos Alternativos

| Servicio | Puerto Estándar | Puerto Alternativo |
|----------|-----------------|-------------------|
| **Frontend** | 5173 | **4173** |
| **Backend API** | 3000 | **3001** |
| **PostgreSQL** | 5432 | **5433** |
| **pgAdmin** | 8080 | **8088** |
| **JsReport** | 5488 | **5489** |

> [!WARNING]
> Al usar puertos alternativos, recuerde actualizar las URLs de acceso. Por ejemplo, el frontend estará en `http://localhost:4173` en lugar de `http://localhost:5173`.

---

## 🔗 Puntos de Acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:5173 | Aplicación web principal |
| **Backend API** | http://localhost:3000 | API REST |
| **pgAdmin** | http://localhost:8080 | Administrador de BD |
| **JsReport** | http://localhost:5488 | Editor de reportes |

---

## 🔐 Credenciales de Acceso

### Base de Datos PostgreSQL

| Campo | Valor |
|-------|-------|
| **Host** | `localhost` (desde fuera de Docker) o `db_soyucab` (entre contenedores) |
| **Puerto** | `5432` |
| **Base de Datos** | `db_soyucab` |
| **Usuario** | `postgres` |
| **Contraseña** | `password123` |

### pgAdmin 4

| Campo | Valor |
|-------|-------|
| **URL** | http://localhost:8080 |
| **Email** | `admin@soyucab.com` |
| **Contraseña** | `admin` |

> [!IMPORTANT]
> Al conectar pgAdmin a la base de datos, use `db_soyucab` como nombre del host (no `localhost`), ya que pgAdmin corre dentro de Docker.

### Usuario por Defecto de la Aplicación

| Campo | Valor |
|-------|-------|
| **Email** | `oscar@ucab.edu.ve` |

---

## 🗂️ Estructura del Proyecto

```
soyucab/
├── backend/               # API REST (Node.js + Express)
│   ├── Dockerfile
│   ├── src/
│   │   ├── controllers/   # Controladores de la API
│   │   ├── routes/        # Definición de rutas
│   │   └── services/      # Lógica de negocio
│   └── package.json
├── frontend/              # Aplicación web (React + Vite)
│   ├── Dockerfile
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   └── services/      # Servicios de API
│   └── package.json
├── scripts/               # Scripts SQL de inicialización
│   ├── 01_DDL_Tablas.sql       # Definición de tablas
│   ├── 02_Logica_Negocio.sql   # Procedimientos almacenados
│   ├── 03_Triggers.sql         # Triggers
│   ├── 04_Reportes.sql         # Funciones de reportes
│   ├── 05_Semilla_Datos.sql    # Datos de prueba
│   └── 06_Seguridad.sql        # Roles y permisos
├── postman/               # Colección de Postman para testing
│   └── SoyUCAB_API.postman_collection.json
├── documentacion/         # Documentación del proyecto
└── docker-compose.yml     # Orquestación de servicios
```

---

## 📊 Roles de Base de Datos

El sistema implementa **Role-Based Access Control (RBAC)**:

| Rol | Descripción |
|-----|-------------|
| `rol_anonimo` | Usuario no autenticado, solo lectura pública |
| `rol_miembro` | Usuario autenticado estándar |
| `rol_institucional` | Entidades organizacionales |
| `rol_moderador` | Gestión de contenido y comunidad |
| `rol_auditor` | Solo lectura para reportes analíticos |

---

## 🧪 Probar la API

### Usando la colección de Postman

1. Importar el archivo `postman/SoyUCAB_API.postman_collection.json` en Postman
2. Configurar la variable `baseUrl` como `http://localhost:3000`
3. Ejecutar las peticiones disponibles

### Endpoints principales

```bash
# Obtener todos los miembros
GET http://localhost:3000/api/miembros

# Obtener países
GET http://localhost:3000/api/paises

# Generar reporte de líderes
POST http://localhost:3000/api/reports/lideres-influencia

# Generar reporte de publicaciones virales
POST http://localhost:3000/api/reports/top-viral
```

---

## 🔄 Comandos Útiles

### Reiniciar todos los servicios

```bash
docker compose down
docker compose up -d --build
```

### Ver logs de un servicio específico

```bash
# Logs del backend
docker compose logs -f backend

# Logs de la base de datos
docker compose logs -f db_soyucab
```

### Reiniciar la base de datos desde cero

```bash
# Detener servicios y eliminar volúmenes
docker compose down -v

# Volver a iniciar (ejecutará los scripts SQL automáticamente)
docker compose up -d --build
```

### Acceder a la consola de PostgreSQL

```bash
docker exec -it soyucab_postgres psql -U postgres -d db_soyucab
```

---

## ⚠️ Resolución de Problemas

### Docker no inicia los contenedores

1. Verificar que Docker Desktop esté ejecutándose
2. Reiniciar Docker Desktop
3. Ejecutar `docker compose down` y luego `docker compose up -d --build`

### Error de conexión a la base de datos

1. Esperar unos segundos después del `docker compose up` para que PostgreSQL inicialice
2. Verificar con `docker compose logs db_soyucab` que no haya errores

### Puerto en uso

Si algún puerto está ocupado, puede modificar los puertos en `docker-compose.yml`:

```yaml
ports:
  - "PUERTO_LOCAL:PUERTO_CONTENEDOR"
```

Por ejemplo, cambiar `"5173:5173"` a `"4000:5173"` para usar el puerto 4000 localmente.

---

## 👨‍💻 Desarrollado por

**Oscar Jaramillo** - Proyecto de Base de Datos II  
Universidad Católica Andrés Bello (UCAB)  
Septiembre 2025 - Enero 2026

---

## 📝 Notas Adicionales

- Los scripts SQL en `scripts/` se ejecutan automáticamente al iniciar la base de datos por primera vez
- Los datos de prueba incluyen miembros, publicaciones, eventos, grupos y más
- El sistema incluye triggers y procedimientos almacenados para lógica de negocio
- Los reportes se generan en formato PDF usando JsReport
