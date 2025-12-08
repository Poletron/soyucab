/**
 * Configuración de Base de Datos - SoyUCAB
 * Conexión a PostgreSQL con soporte para inyección de usuario (RLS)
 */

const { Pool } = require('pg');

// Pool de conexiones
const pool = new Pool({
    host: process.env.DB_HOST || 'db_soyucab',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'db_soyucab',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password123',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

/**
 * Ejecuta una consulta simple (sin contexto de usuario)
 */
async function query(text, params) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('[DB] Query ejecutada', { text: text.substring(0, 50), duration, rows: res.rowCount });
    return res;
}

/**
 * Ejecuta una consulta CON contexto de usuario para RLS
 * Inyecta el correo del usuario en la sesión de Postgres
 * @param {string} text - Consulta SQL
 * @param {Array} params - Parámetros de la consulta
 * @param {string} userEmail - Correo del usuario autenticado
 */
async function queryAsUser(text, params, userEmail) {
    const client = await pool.connect();
    try {
        // Iniciar transacción e inyectar usuario
        await client.query('BEGIN');
        // Usar format() de Postgres para escapar el valor de forma segura
        await client.query(`SELECT set_config('app.user_email', $1, true)`, [userEmail]);

        // Ejecutar consulta principal
        const res = await client.query(text, params);

        await client.query('COMMIT');
        console.log('[DB] QueryAsUser ejecutada', { user: userEmail, rows: res.rowCount });
        return res;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

/**
 * Verificar conexión a la base de datos
 */
async function testConnection() {
    try {
        const res = await pool.query('SELECT NOW() as now, current_database() as db');
        console.log('[DB] Conexión exitosa:', res.rows[0]);
        return true;
    } catch (err) {
        console.error('[DB] Error de conexión:', err.message);
        return false;
    }
}

module.exports = {
    query,
    queryAsUser,
    testConnection,
    pool
};
