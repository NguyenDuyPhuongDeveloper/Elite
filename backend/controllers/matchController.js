const Matching = require('../models/Matching');
const Notification = require('../models/Notification');
const UserProfile = require('../models/UserProfile');
const Conversation = require('../models/Conversation');
const User = require('../models/User')
const calculateMatchingScore = require('../utils/compatibilityScore');
const mongoose = require('mongoose');




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


exports.getMatchStatus = async (req, res) =>
{
    try
    {
        const { userId, targetUserId } = req.params;

        const match = await Matching.findOne({
            $or: [
                { user1: userId, user2: targetUserId },
                { user1: targetUserId, user2: userId },
            ]
        });

        if (!match)
        {
            return res.status(200).json({
                status: 'No Match',
                message: 'No existing match found'
            });
        }

        res.status(200).json({
            status: match.status,
            compatibilityScore: match.compatibilityScore,
            match
        });
    } catch (error)
    {
        res.status(500).json({
            message: 'Error fetching match status',
            error: error.message
        });
    }
};

exports.createOrGetMatch = async (req, res) =>
{
    try
    {
        const { userId } = req.body; // Change from req.body to req.params
        const currentUserId = req.user.id;
        console.log(userId);
        console.log(currentUserId);

        if (!userId || userId === currentUserId)
        {
            return res.status(400).json({ message: 'Cannot match with yourself' });
        }

        // Lấy thông tin người dùng
        const user1 = await UserProfile.findOne({ userId: currentUserId });
        const user2 = await UserProfile.findOne({ userId: userId });



        if (!user1 || !user2)
        {
            return res.status(404).json({ message: 'UserProfile not found' });
        }

        // Kiểm tra trạng thái match
        let match = await Matching.findOne({
            $or: [
                { user1: currentUserId, user2: userId },
                { user1: userId, user2: currentUserId },
            ],
        });

        // Only create a new match if no existing match is found
        if (!match)
        {
            const compatibilityScore = calculateMatchingScore(user1, user2);
            match = new Matching({
                user1: currentUserId,
                user2: userId,
                status: 'Pending',
                compatibilityScore,
            });
            await match.save();

            // Gửi thông báo đến đối phương
            const notification = await Notification.create({
                recipient: user2._id,
                sender: user1._id,
                type: 'MATCH_REQUEST',
                content: `${ user1.firstName } ${ user1.lastName } has sent you a match request.`,
                relatedEntity: {
                    entityType: 'Matching',
                    entityId: match._id,
                },
            });

            return res.status(201).json({
                success: true,
                message: 'Match request sent',
                match,
                notification,
            });
        }

        // If match exists, return its current status
        return res.status(200).json({
            success: true,
            match,
            message: match.status === 'Pending'
                ? 'Match request is pending'
                : 'Existing match found'
        });

    } catch (error)
    {
        console.error('Error creating or fetching match:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
};
exports.respondToMatchRequest = async (req, res) =>
{
    try
    {
        const { matchId, action } = req.body;
        const currentUserId = req.user.id;
        console.log(currentUserId);

        if (!['Matched', 'Rejected'].includes(action))
        {
            return res.status(400).json({ message: 'Invalid action' });
        }

        // Tìm match theo ID
        const match = await Matching.findById(matchId);

        if (!match)
        {
            return res.status(404).json({ message: 'Match request not found' });
        }

        if (match.user2.toString() !== currentUserId)
        {
            return res.status(403).json({ message: 'You are not authorized to respond to this match request' });
        }

        // Cập nhật trạng thái
        match.status = action;
        if (action === 'Matched')
        {
            match.matchedAt = new Date();
        }
        await match.save();

        // Gửi thông báo đến người gửi
        if (action === 'Matched')
        {
            let conversation = await Conversation.findOne({
                participants: { $all: [match.user1, match.user2] },
            });

            if (!conversation)
            {
                conversation = await Conversation.create({
                    participants: [match.user1, match.user2],
                });
            }


            await Notification.create({
                recipient: match.user1,
                sender: match.user2,
                type: 'MATCH',
                content: `${ req.user.username } accepted your match request!`,
                relatedEntity: {
                    entityType: 'Matching',
                    entityId: match._id,
                },
            });
            console.log(conversation);

            return res.status(200).json({
                success: true,
                match,
                conversationId: conversation._id,
            });
        } else if (action === 'Rejected')
        {
            await Notification.create({
                recipient: match.user1,
                sender: match.user2,
                type: 'MATCH',
                content: `${ req.user.firstName } ${ req.user.lastName } rejected your match request.`,
                relatedEntity: {
                    entityType: 'Matching',
                    entityId: match._id,
                },
            });
        }

        res.status(200).json({ success: true, match });
    } catch (error)
    {
        console.error('Error responding to match request:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};

