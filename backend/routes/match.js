const express = require('express');
const router = express.Router();
const {
    createMatch,
    getMatchStatus,
    acceptMatch,
    rejectMatch,
    getMatchesForUser,
} = require('../controllers/matchController');

// Tạo ghép cặp
router.post('/', createMatch);

// Lấy trạng thái ghép cặp
router.get('/:userId/:targetUserId', getMatchStatus);

// Chấp nhận ghép cặp
router.put('/:matchId/accept', acceptMatch);

// Từ chối ghép cặp
router.put('/:matchId/reject', rejectMatch);

// Lấy danh sách ghép cặp của người dùng
router.get('/:userId', getMatchesForUser);

module.exports = router;
