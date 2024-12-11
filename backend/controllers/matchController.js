const Matching = require('../models/Matching');

exports.createMatch = async (req, res) =>
{
    const { user1, user2, compatibilityScore } = req.body;
    try
    {
        const existingMatch = await Matching.findOne({ user1, user2 });
        if (existingMatch) return res.status(400).json({ message: 'Match already exists' });

        const newMatch = new Matching({ user1, user2, compatibilityScore });
        await newMatch.save();
        res.status(201).json(newMatch);
    } catch (error)
    {
        res.status(500).json({ message: 'Failed to create match', error });
    }
};

exports.getMatchStatus = async (req, res) =>
{
    const { userId, targetUserId } = req.params;
    try
    {
        const match = await Matching.findOne({ user1: userId, user2: targetUserId });
        if (!match) return res.status(404).json({ message: 'Match not found' });
        res.status(200).json(match);
    } catch (error)
    {
        res.status(500).json({ message: 'Failed to get match status', error });
    }
};

exports.acceptMatch = async (req, res) =>
{
    const { matchId } = req.params;
    try
    {
        const match = await Matching.findByIdAndUpdate(matchId, { status: 'Matched', matchedAt: new Date() }, { new: true });
        if (!match) return res.status(404).json({ message: 'Match not found' });
        res.status(200).json(match);
    } catch (error)
    {
        res.status(500).json({ message: 'Failed to accept match', error });
    }
};

exports.rejectMatch = async (req, res) =>
{
    const { matchId } = req.params;
    try
    {
        const match = await Matching.findByIdAndUpdate(matchId, { status: 'Rejected' }, { new: true });
        if (!match) return res.status(404).json({ message: 'Match not found' });
        res.status(200).json(match);
    } catch (error)
    {
        res.status(500).json({ message: 'Failed to reject match', error });
    }
};

exports.getMatchesForUser = async (req, res) =>
{
    const { userId } = req.params;
    try
    {
        const matches = await Matching.find({
            $or: [{ user1: userId }, { user2: userId }],
        }).populate('user1 user2');
        res.status(200).json(matches);
    } catch (error)
    {
        res.status(500).json({ message: 'Failed to get matches for user', error });
    }
};
