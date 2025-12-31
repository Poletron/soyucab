const db = require('../config/db');

/**
 * Service for Tutoring management
 */
const tutoringService = {
    /**
     * Search for tutors based on query and subject
     * @param {string} userEmail - Current user email (to exclude self)
     * @param {string} query - Search term for name/bio
     * @param {string} subject - Specific subject to filter
     */
    async searchTutors(userEmail, query, subject) {
        let sql = `
            SELECT 
                t.clave_tutoria,
                t.correo_tutor,
                t.area_conocimiento,
                t.descripcion_enfoque,
                p.nombres,
                p.apellidos,
                p.biografia,
                m.fotografia_url,
                (
                    SELECT COUNT(*) 
                    FROM SOLICITA_TUTORIA st 
                    WHERE st.fk_tutoria = t.clave_tutoria AND st.estado = 'Aceptada'
                )::INTEGER as active_students
            FROM TUTORIA t
            INNER JOIN PERSONA p ON t.correo_tutor = p.correo_principal
            INNER JOIN MIEMBRO m ON t.correo_tutor = m.correo_principal
            WHERE t.correo_tutor != $1
        `;

        const params = [userEmail];
        let paramIndex = 2;

        if (subject && subject !== 'all') {
            sql += ` AND t.area_conocimiento = $${paramIndex}`;
            params.push(subject);
            paramIndex++;
        }

        if (query) {
            sql += ` AND (
                LOWER(p.nombres) LIKE LOWER($${paramIndex}) OR 
                LOWER(p.apellidos) LIKE LOWER($${paramIndex}) OR
                LOWER(t.descripcion_enfoque) LIKE LOWER($${paramIndex})
            )`;
            params.push(`%${query}%`);
            paramIndex++;
        }

        sql += ` ORDER BY t.fecha_alta DESC LIMIT 50`;

        const result = await db.query(sql, params);
        return result.rows;
    },

    /**
     * Get user's mentorship connections (as student or mentor)
     */
    async getMyMentorships(userEmail) {
        // As a student
        const studentSql = `
            SELECT 
                st.clave_solicitud,
                st.estado,
                st.fecha_solicitud,
                t.area_conocimiento,
                p.nombres as other_name,
                p.apellidos as other_lastname,
                m.fotografia_url as other_photo,
                'Mentoreado' as my_role
            FROM SOLICITA_TUTORIA st
            INNER JOIN TUTORIA t ON st.fk_tutoria = t.clave_tutoria
            INNER JOIN PERSONA p ON t.correo_tutor = p.correo_principal
            INNER JOIN MIEMBRO m ON t.correo_tutor = m.correo_principal
            WHERE st.correo_solicitante = $1
        `;

        // As a mentor
        const mentorSql = `
            SELECT 
                st.clave_solicitud,
                st.estado,
                st.fecha_solicitud,
                t.area_conocimiento,
                p.nombres as other_name,
                p.apellidos as other_lastname,
                m.fotografia_url as other_photo,
                'Mentor' as my_role
            FROM SOLICITA_TUTORIA st
            INNER JOIN TUTORIA t ON st.fk_tutoria = t.clave_tutoria
            INNER JOIN PERSONA p ON st.correo_solicitante = p.correo_principal
            INNER JOIN MIEMBRO m ON st.correo_solicitante = m.correo_principal
            WHERE t.correo_tutor = $1
        `;

        const [studentRes, mentorRes] = await Promise.all([
            db.query(studentSql, [userEmail]),
            db.query(mentorSql, [userEmail])
        ]);

        return [...studentRes.rows, ...mentorRes.rows];
    },

    /**
     * Register as a new tutor
     */
    async registerAsTutor(userEmail, area, description) {
        // Check if already registered for this area
        const check = await db.query(
            `SELECT clave_tutoria FROM TUTORIA WHERE correo_tutor = $1 AND area_conocimiento = $2`,
            [userEmail, area]
        );

        if (check.rows.length > 0) {
            throw new Error('Ya estás registrado como tutor de esta materia');
        }

        const sql = `
            INSERT INTO TUTORIA (correo_tutor, area_conocimiento, descripcion_enfoque, fecha_alta)
            VALUES ($1, $2, $3, NOW())
            RETURNING clave_tutoria
        `;

        const result = await db.query(sql, [userEmail, area, description]);
        return result.rows[0];
    },

    /**
     * Request a mentorship
     */
    async requestMentorship(studentEmail, tutoriaId) {
        // Check if request already exists
        const check = await db.query(
            `SELECT clave_solicitud FROM SOLICITA_TUTORIA WHERE correo_solicitante = $1 AND fk_tutoria = $2`,
            [studentEmail, tutoriaId]
        );

        if (check.rows.length > 0) {
            throw new Error('Ya has solicitado esta mentoría');
        }

        const sql = `
            INSERT INTO SOLICITA_TUTORIA (correo_solicitante, fk_tutoria, fecha_solicitud, estado)
            VALUES ($1, $2, NOW(), 'Enviada')
            RETURNING clave_solicitud
        `;

        const result = await db.query(sql, [studentEmail, tutoriaId]);
        return result.rows[0];
    }
};

module.exports = tutoringService;
