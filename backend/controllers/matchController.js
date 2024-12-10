const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const calculateMatchingScore = require('../utils/calculateMatchingScore');

// GET: Fetch matches for a user
exports.getMatches = async (req, res) =>
{
    try
    {
        const { userId, filters } = req.query;

        const user = await User.findById(userId).populate('profile');
        if (!user || !user.profile)
        {
            return res.status(404).json({ message: 'User or profile not found.' });
        }

        const profile = await UserProfile.findById(user.profile);

        let matchCriteria = {
            _id: { $ne: userId },
            gender: profile.interestedIn,
        };

        // Parse filters and add to criteria
        if (filters)
        {
            const parsedFilters = JSON.parse(filters);
            Object.assign(matchCriteria, parsedFilters);
        }

        const candidates = await UserProfile.find(matchCriteria)
            .populate('photos') // Ensure photos are fetched
            .limit(50);

        const matches = candidates.map((candidate) => ({
            candidate,
            score: calculateMatchingScore(profile, candidate),
        }));

        matches.sort((a, b) => b.score - a.score);

        res.status(200).json(matches);
    } catch (error)
    {
        console.error(error);
        res.status(500).json({ message: 'Error fetching matches' });
    }
};
