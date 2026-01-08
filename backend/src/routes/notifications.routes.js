const express = require('express');
const router = express.Router();
const notificationsService = require('../services/notifications.service');
const { requireAuth } = require('../middleware/auth.middleware');

// Get all notifications
router.get('/', requireAuth, async (req, res) => {
    try {
        const notifications = await notificationsService.getNotifications(req.userEmail);
        const unreadCount = await notificationsService.getUnreadCount(req.userEmail);

        res.json({
            success: true,
            data: notifications,
            unreadCount
        });
    } catch (err) {
        console.error('[NOTIFICATIONS] Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Mark as read
router.put('/:id/read', requireAuth, async (req, res) => {
    try {
        await notificationsService.markAsRead(req.params.id, req.userEmail);
        res.json({ success: true, message: 'Marcada como leída' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Mark all as read
router.put('/read-all', requireAuth, async (req, res) => {
    try {
        await notificationsService.markAllAsRead(req.userEmail);
        res.json({ success: true, message: 'Todas marcadas como leídas' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
