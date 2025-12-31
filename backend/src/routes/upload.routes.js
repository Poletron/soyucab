/**
 * Rutas de Upload (Imágenes) - SoyUCAB
 * REFACTORED: Database logic moved to upload.service.js
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadService = require('../services/upload.service');
const { requireAuth } = require('../middleware/auth.middleware');

// Crear directorio de uploads si no existe
const uploadDir = path.join(__dirname, '../../uploads');
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (err) {
    console.warn('[UPLOAD] No se pudo crear directorio uploads:', err.message);
}

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    cb(null, allowedTypes.includes(file.mimetype));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

/**
 * POST /api/upload
 * Subir una imagen
 */
router.post('/', requireAuth, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No se recibió ningún archivo' });
    }
    res.json({
        success: true,
        message: 'Imagen subida correctamente',
        url: `/uploads/${req.file.filename}`,
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

    try {
        await uploadService.updateProfilePhoto(req.userEmail, imageUrl);
        res.json({ success: true, message: 'Foto de perfil actualizada', url: imageUrl });
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
    if (err) return res.status(400).json({ success: false, error: err.message });
    next();
});

module.exports = router;
