const Matching = require('../models/Matching');
const Notification = require('../models/Notification');
const UserProfile = require('../models/UserProfile');
const mongoose = require('mongoose');

exports.createPotentialMatch = async (req, res) =>
{
    try
    {
        const { user1, user2, compatibilityScore } = req.body;

        // Check if a match already exists
        const existingMatch = await Matching.findOne({
            $or: [
                { user1, user2 },
                { user1: user2, user2: user1 }
            ]
        });

        if (existingMatch)
        {
            return res.status(400).json({ message: 'Match already exists' });
        }

        const newMatch = new Matching({
            user1,
            user2,
            compatibilityScore,
            status: 'Pending'
        });

        await newMatch.save();

        // Create a notification for the potential match
        await Notification.create({
            recipient: user2,
            sender: user1,
            type: 'MATCH',
            content: `New potential match with compatibility score: ${ compatibilityScore }`,
            relatedEntity: {
                entityType: 'Matching',
                entityId: newMatch._id
            }
        });

        res.status(201).json(newMatch);
    } catch (error)
    {
        res.status(500).json({ message: 'Error creating potential match', error: error.message });
    }
};

exports.getMatchStatus = async (req, res) =>
{
    try
    {
        const { userId, targetUserId } = req.params;

        const match = await Matching.findOne({
            $or: [
                { user1: userId, user2: targetUserId },
                { user1: targetUserId, user2: userId },
            ],

        });

        if (!match)
        {
            return res.status(404).json({ status: 'No Match' });
        }

        res.json({
            status: match.status,
            compatibilityScore: match.compatibilityScore
        });
    } catch (error)
    {
        res.status(500).json({ message: 'Error fetching match status', error: error.message });
    }
};

exports.getUserMatches = async (req, res) =>
{
    try
    {
        const { userId } = req.params;

        // Tìm kiếm các ghép đôi liên quan đến userId
        const matches = await Matching.find({
            $or: [{ user1: userId }, { user2: userId }],
            status: 'Matched'
        }).sort({ matchedAt: -1 })
            .populate('user1', 'username ') // Lấy thông tin từ user1
            .populate('user2', 'username '); // Lấy thông tin từ user2

        res.json(matches);
    } catch (error)
    {
        res.status(500).json({ message: 'Error fetching user matches', error: error.message });
    }
};


exports.updateMatchStatus = async (req, res) =>
{
    try
    {
        const { matchId } = req.params;
        const { status } = req.body;

        const match = await Matching.findById(matchId);
        if (!match)
        {
            return res.status(404).json({ message: 'Match not found' });
        }

        match.status = status;
        match.matchedAt = status === 'Matched' ? new Date() : null;
        match.unmatchedAt = status === 'Unmatched' ? new Date() : null;

        await match.save();

        // Create a notification about match status change
        await Notification.create({
            recipient: match.user2,
            sender: match.user1,
            type: 'MATCH',
            content: `Match status updated to: ${ status }`,
            relatedEntity: {
                entityType: 'Matching',
                entityId: match._id
            }
        });

        res.json(match);
    } catch (error)
    {
        res.status(500).json({ message: 'Error updating match status', error: error.message });
    }
};

exports.getPotentialMatches = async (req, res) =>
{
    try
    {
        const { userId } = req.params;

        // Find potential matches based on compatibility criteria
        const potentialMatches = await UserProfile.aggregate([
            {
                $match: {
                    _id: { $ne: new mongoose.Types.ObjectId(userId) }

                }
            },
            // Add matching logic here based on your compatibility algorithm
            { $sample: { size: 10 } } // Randomly select 10 potential matches
        ]);

        res.json(potentialMatches);
    } catch (error)
    {
        res.status(500).json({ message: 'Error fetching potential matches', error: error.message });
    }
};