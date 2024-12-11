async function handleLikeInteraction(currentUserId, targetUserId)
{
    // Check for mutual like
    const mutualLike = await Interaction.findOne({
        userFrom: targetUserId,
        userTo: currentUserId,
        type: 'Like'
    });

    if (mutualLike)
    {
        // Create a match
        await Matching.create({
            user1: currentUserId,
            user2: targetUserId,
            status: 'Matched',
            matchedAt: new Date(),
            compatibilityScore: calculateCompatibilityScore(currentUserId, targetUserId)
        });
    }
}

async function handleSuperLikeInteraction(currentUserId, targetUserId)
{
    // Super Like has higher chance of matching
    const superLikeMatch = await Matching.create({
        user1: currentUserId,
        user2: targetUserId,
        status: 'Matched',
        matchedAt: new Date(),
        compatibilityScore: calculateCompatibilityScore(currentUserId, targetUserId) * 1.5
    });
}