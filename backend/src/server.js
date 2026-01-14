/**
 * ============================================
 * SoyUCAB Backend - API REST
 * ============================================
 * Servidor Express para la red social universitaria
 * Integra PostgreSQL (con RLS) y JsReport (PDFs)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Módulos internos
const db = require('./config/db');
const { authMiddleware } = require('./middleware/auth.middleware');

// Rutas
const healthRoutes = require('./routes/health.routes');
const feedRoutes = require('./routes/feed.routes');
const reportRoutes = require('./routes/report.routes');
const authRoutes = require('./routes/auth.routes');
const contentRoutes = require('./routes/content.routes');
const uploadRoutes = require('./routes/upload.routes');
const groupsRoutes = require('./routes/groups.routes');
const connectionsRoutes = require('./routes/connections.routes');
const messagesRoutes = require('./routes/messages.routes');
const tutoringRoutes = require('./routes/tutoring.routes');
const usersRoutes = require('./routes/users.routes');
const offersRoutes = require('./routes/offers.routes');
const eventsRoutes = require('./routes/events.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const adminRoutes = require('./routes/admin.routes');
const path = require('path');

// Configuración
const PORT = process.env.PORT || 3000;
const app = express();

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// CORS (permitir peticiones desde cualquier origen en desarrollo)
app.use(cors({
    origin: '*',
    exposedHeaders: ['Content-Disposition']
}));

// Parseo de JSON
app.use(express.json());

// Logging de peticiones
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Middleware de autenticación (extrae usuario del header)
app.use(authMiddleware);

// ============================================
// RUTAS
// ============================================

// Health Check
app.use('/api/health', healthRoutes);

// Feed (Contenido)
app.use('/api/feed', feedRoutes);

// Reportes
app.use('/api/report', reportRoutes);

// Autenticación
app.use('/api/auth', authRoutes);

// CRUD Contenido (Publicaciones, Eventos, Comentarios, Reacciones)
app.use('/api/content', contentRoutes);

// Upload de Imágenes
app.use('/api/upload', uploadRoutes);

// Grupos de Interés
app.use('/api/groups', groupsRoutes);

// Conexiones Sociales
app.use('/api/connections', connectionsRoutes);

// Mensajería
app.use('/api/messages', messagesRoutes);

// Usuarios (búsqueda, perfiles)
app.use('/api/users', usersRoutes);

// Tutorías
app.use('/api/tutoring', tutoringRoutes);

// Eventos
app.use('/api/events', eventsRoutes);

// Ofertas Laborales
app.use('/api/offers', offersRoutes);

// Notificaciones
app.use('/api/notifications', notificationsRoutes);

// Admin (Role management)
app.use('/api/admin', adminRoutes);

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ruta raíz (info básica)
app.get('/', (req, res) => {
    res.json({
        name: 'SoyUCAB API',
        version: '1.0.0',
        description: 'API REST para la red social universitaria',
        endpoints: {
            health: '/api/health',
            feed: '/api/feed',
            feedStats: '/api/feed/stats',
            reportTypes: '/api/report/types',
            reportGenerate: 'POST /api/report/generate',
            reportPreview: '/api/report/preview/:type'
        },
        documentation: 'Envía header x-user-email para autenticación'
    });
});

// ============================================
// MANEJO DE ERRORES
// ============================================

// 404 - Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.path,
        method: req.method
    });
});

// Error handler global
app.use((err, req, res, next) => {
    console.error('[ERROR]', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: err.message
    });
});

// ============================================
// INICIO DEL SERVIDOR
// ============================================

async function startServer() {
    console.log('============================================');
    console.log('  SoyUCAB Backend - Iniciando...');
    console.log('============================================');

    // Verificar conexión a BD
    console.log('[STARTUP] Conectando a PostgreSQL...');
    const dbConnected = await db.testConnection();

    if (!dbConnected) {
        console.error('[STARTUP] ⚠️  No se pudo conectar a la BD. El servidor iniciará de todos modos.');
    }

    // Iniciar servidor HTTP
    app.listen(PORT, '0.0.0.0', () => {
        console.log('============================================');
        console.log(`  ✅ Servidor corriendo en puerto ${PORT}`);
        console.log(`  📍 http://localhost:${PORT}`);
        console.log(`  📍 http://localhost:${PORT}/api/health`);
        console.log('============================================');
    });
}

startServer().catch(err => {
    console.error('[FATAL] Error al iniciar servidor:', err);
    process.exit(1);
});
