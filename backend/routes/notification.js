const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');


// Get all notifications for a user
router.get('/:userId', notificationController.getUserNotifications);

// Mark a notification as read
router.patch('/:notificationId/read', notificationController.markNotificationAsRead);

// Delete a specific notification
router.delete('/:notificationId', notificationController.deleteNotification);

// Clear all notifications for a user
router.delete('/:userId/clear-all', notificationController.clearAllNotifications);

module.exports = router;