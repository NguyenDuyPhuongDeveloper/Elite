const Interaction = require('../models/Interaction');
const Matching = require('../models/Matching');
const User = require('../models/User');
const Notification = require('../models/Notification');
const calculateMatchingScore = require('../utils/compatibilityScore'); // Assuming compatibility calculation utility exists

exports.createInteraction = async (req, res) =>
{
    const { userFrom, userTo, type } = req.body;

    try
    {
        // Validate request body
        if (!userFrom || !userTo || !type)
        {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // Check if the interaction already exists
        const existingInteraction = await Interaction.findOne({
            userFrom,
            userTo,
            type,
        });

        if (existingInteraction)
        {
            return res.status(200).json({
                message: 'Interaction already exists',
                interaction: existingInteraction,
            });
        }

        // Save the interaction
        const interaction = new Interaction({ userFrom, userTo, type });
        await interaction.save();
        console.log(`user ${ userFrom } has ${ type } ${ userTo }`);

        // Handle interactions based on type
        if (type === 'Like' || type === 'SuperLike')
        {
            const reciprocalInteraction = await Interaction.findOne({
                userFrom: userTo,
                userTo: userFrom,
                type: { $in: ['Like', 'SuperLike'] },
            });

            if (reciprocalInteraction)
            {
                // Both users like each other, update Matching as 'Matched'
                const userData1 = await User.findById(userFrom).populate('profile');
                const user1 = userData1.profile;
                const userData2 = await User.findById(userTo).populate('profile');
                const user2 = userData2.profile;

                const compatibilityScore = calculateMatchingScore(user1, user2);

                const match = await Matching.findOneAndUpdate(
                    {
                        $or: [
                            { user1: userFrom, user2: userTo },
                            { user1: userTo, user2: userFrom },
                        ],
                    },
                    {
                        $set: {
                            compatibilityScore,
                            status: 'Matched',
                            matchedAt: new Date(),
                        },
                        $setOnInsert: {
                            user1: userFrom,
                            user2: userTo,
                        },
                    },
                    { upsert: true, new: true }
                );
                const notification = new Notification({
                    recipient: userFrom,
                    sender: userTo,
                    type: 'MATCH',
                    content: `You and ${ userData1.username } matched!`,
                    relatedEntity: {
                        entityType: 'Matching',
                        entityId: match._id,
                    },
                });
                await notification.save();
                return res.status(200).json({
                    message: 'Matched successfully!',
                    match,
                    notification
                });
            } else
            {
                // Only one side likes, create or update Matching with 'Pending' status
                const compatibilityScore = 50; // Default score when it's pending
                await Matching.findOneAndUpdate(
                    {
                        $or: [
                            { user1: userFrom, user2: userTo },
                            { user1: userTo, user2: userFrom },
                        ],
                    },
                    {
                        $set: {
                            compatibilityScore,
                            status: 'Pending',
                        },
                        $setOnInsert: {
                            user1: userFrom,
                            user2: userTo,
                        },
                    },
                    { upsert: true, new: true }
                );
                console.log(`Pending match created between ${ userFrom } and ${ userTo }`);
            }
        } else if (type === 'Dislike')
        {
            // If interaction is 'Dislike', update or create Matching as 'Rejected'
            await Matching.findOneAndUpdate(
                {
                    $or: [
                        { user1: userFrom, user2: userTo },
                        { user1: userTo, user2: userFrom },
                    ],
                },
                {
                    $set: { status: 'Rejected' },
                    $setOnInsert: {
                        user1: userFrom,
                        user2: userTo,
                    },
                },
                { upsert: true, new: true }
            );
            console.log(`Match rejected between ${ userFrom } and ${ userTo }`);
        }
        res.status(201).json(interaction);
    } catch (error)
    {
        console.error('Error creating interaction:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.getInteractions = async (req, res) =>
{
    const { userId } = req.params;

    try
    {
        if (!userId)
        {
            return res.status(400).json({ message: 'Missing userId' });
        }

        // Lấy danh sách các interactions
        const interactions = await Interaction.find({ userFrom: userId });

        // Lấy thông tin chi tiết người dùng từ UserProfile
        const detailedInteractions = await Promise.all(
            interactions.map(async (interaction) =>
            {
                const userToDetails = await User.findById(interaction.userTo).populate('profile');
                return {
                    ...interaction.toObject(),
                    userTo: {
                        firstName: userToDetails?.profile?.firstName || 'Unknown',
                        lastName: userToDetails?.profile?.lastName || 'Unknown',
                        avatar: userToDetails?.avatar || null,
                        username: userToDetails?.username || null,
                    },
                };
            })
        );

        res.status(200).json(detailedInteractions);
    } catch (error)
    {
        console.error('Error fetching interactions:', error);
        res.status(500).json({ message: 'Failed to get interactions', error: error.message });
    }
};


exports.getInteractionsBetweenUsers = async (req, res) =>
{
    const { userId, targetUserId } = req.params;

    try
    {
        if (!userId || !targetUserId)
        {
            return res.status(400).json({ message: 'Missing userId or targetUserId' });
        }

        const interactions = await Interaction.find({
            userFrom: userId,
            userTo: targetUserId,
        }).populate('userTo', 'firstName lastName avatar');

        res.status(200).json(interactions);
    } catch (error)
    {
        console.error('Error fetching interactions between users:', error);
        res.status(500).json({ message: 'Failed to get interactions between users', error: error.message });
    }
};

exports.undoLastInteraction = async (req, res) =>
{
    const { userId } = req.params;
    console.log("UserId undo: ", userId)

    try
    {
        if (!userId)
        {
            return res.status(400).json({ message: 'Missing userId' });
        }

        const lastInteraction = await Interaction.findOne({ userFrom: userId }).sort({ createdAt: -1 });

        if (!lastInteraction)
        {
            return res.status(404).json({ message: 'No interaction to undo' });
        }

        await Interaction.deleteOne({ _id: lastInteraction._id });

        res.status(200).json({ message: 'Last interaction undone successfully' });
    } catch (error)
    {
        console.error('Error undoing last interaction:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
