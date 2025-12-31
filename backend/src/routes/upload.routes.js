/**
 * Rutas de Upload (Imágenes) - SoyUCAB
 * Manejo de archivos multimedia con Multer
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('../middleware/auth.middleware');

// Crear directorio de uploads si no existe (con manejo de errores)
const uploadDir = path.join(__dirname, '../../uploads');
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (err) {
    console.warn('[UPLOAD] No se pudo crear directorio uploads:', err.message);
    // En Docker, el directorio debe crearse en el Dockerfile
}

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo imágenes.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

/**
 * POST /api/upload
 * Subir una imagen
 */
router.post('/', requireAuth, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No se recibió ningún archivo' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
        success: true,
        message: 'Imagen subida correctamente',
        url: imageUrl,
        filename: req.file.filename
    });
});

/**
 * POST /api/upload/profile
 * Actualizar foto de perfil
 */
router.post('/profile', requireAuth, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No se recibió ningún archivo' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const db = require('../config/db');

    try {
        await db.query(
            'UPDATE MIEMBRO SET fotografia_url = $1 WHERE correo_principal = $2',
            [imageUrl, req.userEmail]
        );

        res.json({
            success: true,
            message: 'Foto de perfil actualizada',
            url: imageUrl
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Manejador de errores de Multer
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, error: 'El archivo es demasiado grande (máx 5MB)' });
        }
        return res.status(400).json({ success: false, error: err.message });
    }
    if (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
    next();
});

module.exports = router;
