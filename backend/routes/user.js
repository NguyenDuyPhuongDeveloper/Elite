const express = require('express');
const { getUserProfile, updateUserProfile, searchUsers, getMatches } = require('../controllers/userController');
const { protect } = require('../middlewares/auth.middleware');
const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/search', protect, searchUsers);
router.get('/match', protect, getMatches);

module.exports = router;