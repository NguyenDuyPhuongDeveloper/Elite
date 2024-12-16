const express = require('express');
const {
    sendMessage,
    getMessages,
    deleteMessage,
    markAsRead,
    getUnreadMessagesCount
} = require('../controllers/messageController');

const router = express.Router();

// Routes for messages
router.post('/', sendMessage); // Send a new message
router.get('/:conversationId', getMessages); // Get messages in a conversation
router.delete('/:messageId', deleteMessage); // Delete a specific message
router.patch('/:messageId/read', markAsRead); // Mark a message as read
router.get('/unread-messages/:userId', getUnreadMessagesCount);

module.exports = router;
