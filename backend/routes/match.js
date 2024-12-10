const express = require('express');
const { getMatches } = require('../controllers/matchController');

const router = express.Router();

// Route: GET /api/match
router.get('/', getMatches);

module.exports = router;
