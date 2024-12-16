const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchController');
const { protect } = require('../middlewares/auth.middleware');


// Create a new potential match
router.post('/create', matchingController.createPotentialMatch);

// Get matching status between two users
router.get('/:userId/status/:targetUserId', matchingController.getMatchStatus);

// Get all matches for a user
router.get('/:userId/matches', matchingController.getUserMatches);

// Accept or reject a match
router.patch('/:matchId/update', matchingController.updateMatchStatus);

// Get potential matches for a user
router.get('/:userId/potential-matches', matchingController.getPotentialMatches);
router.post('/create-or-get', protect, matchingController.createOrGetMatch);


module.exports = router;
