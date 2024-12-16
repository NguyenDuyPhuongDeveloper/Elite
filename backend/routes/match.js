const express = require('express');
const router = express.Router();
const {
    createOrGetMatch,
    getUserMatches,
    updateMatchStatus,
    respondToMatchRequest,
    getMatchStatus,
} = require('../controllers/matchController'); // Đảm bảo đường dẫn đúng
const { protect } = require('../middlewares/auth.middleware')
router.post('/create-or-get/', protect, createOrGetMatch); // Thêm route với callback hợp lệ
router.get('/:userId/matches', protect, getUserMatches);
router.put('/:matchId/status', protect, updateMatchStatus);
router.post('/respond', protect, respondToMatchRequest);
router.get('/match-status/:userId/:targetUserId', protect, getMatchStatus);

module.exports = router;
