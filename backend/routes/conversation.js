const express = require('express');
const {
    getConversations,
    getOrCreateConversation,
    getMessages,
    sendMessage
} = require('../controllers/conversationController');
const { protect } = require('../middlewares/auth.middleware'); // Middleware bảo vệ

const router = express.Router();

router.get('/', protect, getConversations); // Lấy danh sách các cuộc trò chuyện
router.get('/:userId', protect, getOrCreateConversation); // Tạo hoặc lấy cuộc trò chuyện
router.get('/messages/:conversationId', protect, getMessages); // Lấy tin nhắn
router.post('/send', protect, sendMessage); // Gửi tin nhắn mới

module.exports = router;
