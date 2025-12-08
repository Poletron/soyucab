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

module.exports = {
    authMiddleware,
    requireAuth
};
