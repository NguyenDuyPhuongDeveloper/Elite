const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Tìm kiếm cơ bản
router.get('/basic', searchController.basicSearch);

// Tìm kiếm nâng cao
router.post('/advanced', searchController.advancedSearch);

// Gợi ý hồ sơ
router.get('/recommendations', searchController.recommendProfiles);

module.exports = router;
