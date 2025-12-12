# 🎓 SoyUCAB - Red Social Institucional

Sistema de red social institucional para la Universidad Católica Andrés Bello (UCAB), desarrollado como proyecto de Base de Datos.

---

## 🚀 GUÍA RÁPIDA DE DESPLIEGUE (Entrega 3)

> [!IMPORTANT]
> **Requisitos**: Docker Desktop instalado y ejecutándose.

### Paso 1: Clonar e iniciar

```bash
git clone <URL_DEL_REPOSITORIO>
cd soyucab
docker compose up -d --build
```

### Paso 2: Verificar (esperar ~20 segundos)

```bash
docker compose ps
```

Deben aparecer 5 contenedores `running`:
- `soyucab_postgres` ✅
- `soyucab_backend` ✅
- `soyucab_jsreport` ✅
- `soyucab_pgadmin` ✅
- `soyucab_reports_dashboard` ✅

### Paso 3: ¡Listo para usar!

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **📊 Dashboard de Reportes** | http://localhost | Panel principal con visualización de datos y descarga de PDFs |
| **🔗 API Backend** | http://localhost:3000 | Endpoints REST para reportes |
| **🛢️ pgAdmin** | http://localhost:8080 | Administrador visual de la BD |
| **📄 JsReport** | http://localhost:5488 | Motor de generación de PDFs |

---

## 📊 DEMOSTRACIÓN DE REPORTES (Rúbrica 3)

### Desde el Dashboard (Recomendado)

1. Abrir http://localhost
2. Navegar entre las pestañas para ver cada reporte:
   - **Top Viral** - Contenido con mayor engagement
   - **Líderes de Opinión** - Usuarios con más impacto
   - **Proyección Eventos** - Análisis de asistencia
   - **Crecimiento Demográfico** - Nuevos registros por mes
   - **Grupos Activos** - Comunidades más grandes
   - **Referentes** - Usuarios más influyentes
3. Hacer clic en **"Descargar PDF"** en cualquier reporte

### Desde Postman/cURL (Alternativa)

```bash
# Generar PDF de Top Viral
curl -X POST http://localhost:3000/api/reports/generate/top-viral \
  -H "Content-Type: application/json" \
  -d '{"format": "pdf"}' \
  --output reporte_viral.pdf

# Ver datos JSON de Líderes
curl http://localhost:3000/api/reports/preview/lideres
```

### Tipos de Reportes Disponibles

| Endpoint | Descripción | Vista SQL |
|----------|-------------|-----------|
| `top-viral` | Publicaciones más virales | V_REPORTE_TOP_VIRAL |
| `lideres` | Líderes de opinión | V_REPORTE_LIDERES_OPINION |
| `eventos` | Proyección de eventos | V_REPORTE_INTERES_EVENTOS |
| `crecimiento` | Crecimiento demográfico | V_REPORTE_CRECIMIENTO_DEMOGRAFICO |
| `grupos` | Grupos más activos | V_GRUPOS_MAS_ACTIVOS |
| `referentes` | Top referentes | V_TOP_REFERENTES_COMUNIDAD |
| `tutorias` | Top Áreas de Tutorías | vista_top5_areas_conocimiento_demanda |
| `nexos` | Nexos Vigentes vs Por Vencer | vista_nexos_vigentes_vs_por_vencer |
| `ofertas` | Top 10 Ofertas Laborales | vista_top10_ofertas_mas_postuladas |

---

## 🔐 CREDENCIALES

### pgAdmin 4 (http://localhost:8080)

| Campo | Valor |
|-------|-------|
| **Email** | `admin@soyucab.com` |
| **Contraseña** | `admin` |

### Conexión a PostgreSQL (desde pgAdmin)

| Campo | Valor |
|-------|-------|
| **Host** | `db_soyucab` |
| **Puerto** | `5432` |
| **Base de Datos** | `db_soyucab` |
| **Usuario** | `postgres` |
| **Contraseña** | `password123` |

> [!CAUTION]
> Usar `db_soyucab` como host (nombre del contenedor), NO `localhost`.

### Usuarios de Demostración

| Usuario PostgreSQL | Correo | Rol | Contraseña |
|-------------------|--------|-----|------------|
| `usr_oscar` | oscar@ucab.edu.ve | Persona | `1234` |
| `usr_luis` | luis@ucab.edu.ve | Persona | `1234` |
| `usr_polar` | rrhh@polar.com | Entidad | `1234` |
| `usr_auditor` | auditor@ucab.edu.ve | Auditor | `audit123` |
| `usr_admin_moderador` | moderador@ucab.edu.ve | Moderador | `admin123` |
| `usr_extrano` | nuevo.ingreso@ucab.edu.ve | Persona | `1234` |
| `usr_anonimo` | (sin autenticar) | Anónimo | `guest` |

---

## 🗂️ ESTRUCTURA DE SCRIPTS SQL

Los scripts se ejecutan automáticamente al iniciar la base de datos:

| Script | Contenido |
|--------|-----------|
| `01_DDL_Tablas.sql` | 25 tablas del modelo relacional |
| `02_Logica_Negocio.sql` | Funciones y procedimientos almacenados |
| `03_Triggers.sql` | Triggers de auditoría y validación |
| `04_Reportes.sql` | 6 vistas para reportes analíticos |
| `05_Semilla_Datos.sql` | Datos de prueba (~500 registros) |
| `06_Seguridad.sql` | Roles, permisos y RLS |

---

## 🔄 COMANDOS ÚTILES

### Reiniciar completamente (borra datos)

```bash
docker compose down -v && docker compose up -d --build
```

### Ver logs de la base de datos

```bash
docker compose logs db_soyucab
```

### Acceder a la consola SQL

```bash
docker exec -it soyucab_postgres psql -U postgres -d db_soyucab
```

### Ejecutar como usuario específico (demostrar RLS)

```bash
docker exec -it soyucab_postgres psql -U usr_oscar -d db_soyucab
```

---

## 🔀 PUERTOS ALTERNATIVOS

Si los puertos estándar están ocupados, usar:

```bash
docker compose -f docker-compose.alt-ports.yml up -d --build
```

| Servicio | Puerto Normal | Puerto Alternativo |
|----------|---------------|-------------------|
| Dashboard | 80 | 4000 |
| Backend API | 3000 | 3001 |
| PostgreSQL | 5432 | 5433 |
| pgAdmin | 8080 | 8088 |
| JsReport | 5488 | 5489 |

---

## 🏗️ ARQUITECTURA DEL SISTEMA

```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  📊 Dashboard      │ ───▶│   🔗 Backend    │────▶│ 🐘 PostgreSQL  │
│  React + Nginx      │     │  Node.js/Express │     │    + Views      │
│     Puerto 80       │     │   Puerto 3000    │     │   Puerto 5432   │
└─────────────────────┘     └────────┬─────────┘     └─────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │   📄 JsReport   │
                            │  (Generador PDF) │
                            │   Puerto 5488    │
                            └──────────────────┘
```

---

## ⚠️ RESOLUCIÓN DE PROBLEMAS

### "Cannot connect to Docker"
1. Verificar que Docker Desktop esté ejecutándose
2. Reiniciar Docker Desktop

### La base de datos no inicializa
```bash
docker compose down -v
docker compose up -d --build
```

### Error al conectar pgAdmin con la BD
- Usar `db_soyucab` como host, NO `localhost`
- El host `localhost` solo funciona fuera de Docker

### Los reportes no cargan
1. Esperar 30 segundos después del `docker compose up`
2. Verificar que el backend esté corriendo: `docker compose logs backend`

---

## 👨‍💻 Desarrollado por

**Oscar Jaramillo** - **Luis Torres** - **Pedro Urdaneta**  
Universidad Católica Andrés Bello (UCAB)  
Septiembre 2025 - Enero 2026
