/**
 * Middleware de Autenticación - SoyUCAB
 * Simula autenticación mediante header x-user-email
 * (En producción, esto sería JWT o OAuth)
 */

/**
 * Extrae el usuario del header y lo adjunta al request
 */
function authMiddleware(req, res, next) {
    // Obtener usuario del header (o usar default para desarrollo)
    const userEmail = req.headers['x-user-email'] || process.env.DEFAULT_USER || null;

    if (!userEmail) {
        // En modo desarrollo, permitimos continuar sin usuario
        console.log('[AUTH] Petición sin usuario autenticado');
        req.userEmail = null;
    } else {
        console.log('[AUTH] Usuario:', userEmail);
        req.userEmail = userEmail;
    }

    next();
}

/**
 * Middleware que REQUIERE autenticación
 */
function requireAuth(req, res, next) {
    if (!req.userEmail) {
        return res.status(401).json({
            error: 'No autorizado',
            message: 'Debe proporcionar el header x-user-email'
        });
    }
    next();
}

/**
 * Middleware factory que REQUIERE un rol específico
 * @param {string} roleName - Nombre del rol requerido
 */
function requireRole(roleName) {
    return async (req, res, next) => {
        if (!req.userEmail) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        try {
            const db = require('../config/db');
            const result = await db.query(
                'SELECT 1 FROM MIEMBRO_POSEE_ROL WHERE correo_miembro = $1 AND nombre_rol = $2',
                [req.userEmail, roleName]
            );

            if (result.rows.length === 0) {
                return res.status(403).json({
                    error: 'Acceso denegado',
                    message: `Requiere rol: ${roleName}`
                });
            }

            next();
        } catch (error) {
            console.error('[AUTH] Error checking role:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    };
}

module.exports = {
    authMiddleware,
    requireAuth,
    requireRole
};
