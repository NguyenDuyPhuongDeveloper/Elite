const express = require('express');
const router = express.Router();
const {
    createInteraction,
    getInteractions,
    getInteractionsBetweenUsers,
    undoLastInteraction,
    getProfileViews
} = require('../controllers/interactionController');


// Tạo tương tác
router.post('/', createInteraction);
// Lấy lượt xem hồ sơ
router.get('/profile-views/:userId', getProfileViews);

// Lấy tất cả tương tác của người dùng
router.get('/:userId', getInteractions);

// Lấy tương tác giữa hai người dùng
router.get('/:userId/:targetUserId', getInteractionsBetweenUsers);
// Xóa lượt tương tác cuối
router.delete('/undo/:userId', undoLastInteraction);


module.exports = router;
