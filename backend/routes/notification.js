const express = require('express');
const {
    createNotification,
    getNotifications,
    markAsRead,
    deleteNotification,
    clearAllNotifications,
} = require('../controllers/notificationController');

const router = express.Router();

// Create a notification
router.post('/', createNotification);

// Get notifications for a user
router.get('/:recipientId', getNotifications);

// Mark a notification as read
router.patch('/:notificationId/read', markAsRead);

// Delete a notification
router.delete('/:notificationId', deleteNotification);

// Clear all notifications for a user
router.delete('/clear/:recipientId', clearAllNotifications);

module.exports = router;
