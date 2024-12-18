const UserProfile = require('../models/UserProfile');
const User = require('../models/User');
const calculateMatchingScore = require('../utils/compatibilityScore');
const Interaction = require('../models/Interaction');
const Matching = require('../models/Matching');


// Tìm kiếm cơ bản
exports.performBasicSearch = async (userId, filters) =>
{
    const userData = await User.findById(userId).populate('profile');
    const user = userData.profile;
    if (!user) throw new Error('User not found');
    const effectiveFilters = JSON.parse(filters);
    // Lấy danh sách người bị "Dislike"
    const dislikedUserIds = await Interaction.find({
        userFrom: userId,
        type: 'Dislike',
    }).distinct('userTo');

    // Lấy danh sách người đã "Matched"
    const matchedUserIds = await Matching.find({
        $or: [
            { user1: userId },
            { user2: userId },
        ],
        status: 'Matched',
    }).then(matches => matches.map(match =>
        match.user1.toString() === userId ? match.user2 : match.user1
    ));

    // Hợp nhất danh sách loại trừ
    const excludedUserIds = [...new Set([...dislikedUserIds, ...matchedUserIds, userId])];

    // Tính toán khoảng thời gian sinh dựa trên độ tuổi
    const currentYear = new Date().getFullYear();
    const minBirthYear = effectiveFilters.ageRange
        ? currentYear - effectiveFilters.ageRange.max
        : currentYear - user.preferenceAgeRange.max;
    const maxBirthYear = effectiveFilters.ageRange
        ? currentYear - effectiveFilters.ageRange.min
        : currentYear - user.preferenceAgeRange.min;

    // Xây dựng query tìm kiếm
    const query = {
        userId: { $nin: excludedUserIds },
        dateOfBirth: {
            $gte: new Date(`${ minBirthYear }-01-01`),
            $lte: new Date(`${ maxBirthYear }-12-31`),
        },
        gender: effectiveFilters.interestedIn || user.interestedIn,
        location: {
            $geoWithin: {
                $centerSphere: [
                    effectiveFilters.location
                        ? [effectiveFilters.location.lng, effectiveFilters.location.lat]
                        : user.location.coordinates,
                    (effectiveFilters.locationRadius || user.locationRadius) / 6371,
                ],
            },
        },
    };


    // Tìm kiếm
    const results = await UserProfile.find(query);
    // console.log(results);
    // results.shift();

    // Tìm kiếm và tính điểm tương thích cho các hồ sơ
    const resultsWithScores = results.map(target => ({
        user: target,
        compatibilityScore: calculateMatchingScore(user, target), // Tính điểm tương thích
    }));

    // Sắp xếp kết quả theo điểm tương thích từ cao đến thấp
    const sortedResults = resultsWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    //console.log(sortedResults);
    // Trả về kết quả đã sắp xếp
    return sortedResults;

};


exports.performAdvancedSearch = async (userId, filters = {}) =>
{
    const userData = await User.findById(userId).populate('profile');
    const user = userData?.profile;

    if (!user) throw new Error('User not found');

    // Tính toán khoảng năm sinh
    const currentYear = new Date().getFullYear();
    const minBirthYear = currentYear - (filters.ageRange?.max || 99);
    const maxBirthYear = currentYear - (filters.ageRange?.min || 18);

    // Lấy danh sách người bị "Dislike"
    const dislikedUserIds = await Interaction.find({
        userFrom: userId,
        type: 'Dislike',
    }).distinct('userTo');

    // Lấy danh sách người đã "Matched"
    const matchedUserIds = await Matching.find({
        $or: [
            { user1: userId },
            { user2: userId },
        ],
        status: 'Matched',
    }).then(matches => matches.map(match =>
        match.user1.toString() === userId ? match.user2 : match.user1
    ));

    // Hợp nhất danh sách loại trừ
    const excludedUserIds = [...new Set([...dislikedUserIds, ...matchedUserIds, userId])];

    // Xây dựng bộ lọc từ người dùng và filters
    const effectiveFilters = {
        ageRange: filters.ageRange || { min: 18, max: 99 },
        gender: filters.gender || null,
        location: user.location.coordinates || [0, 0], // Lấy từ hồ sơ người dùng
        radius: filters.radius || user.locationRadius || 50, // Giá trị mặc định 50km
        goals: filters.goals || null,
        relationshipStatus: filters.relationshipStatus || null,
        children: filters.children || undefined,
        childrenDesire: filters.childrenDesire || undefined,
        smoking: filters.smoking || undefined,
        drinking: filters.drinking || undefined,
    };

    // Xây dựng truy vấn loại trừ và lọc
    const query = {
        userId: { $nin: excludedUserIds }, // Loại trừ User bị Dislike hoặc đã Matched
        dateOfBirth: {
            $gte: new Date(`${ minBirthYear }-01-01`),
            $lte: new Date(`${ maxBirthYear }-12-31`),
        },
        location: {
            $geoWithin: {
                $centerSphere: [effectiveFilters.location, effectiveFilters.radius / 6371],
            },
        },
        ...(effectiveFilters.gender && { gender: effectiveFilters.gender }),
        ...(effectiveFilters.goals && { goals: effectiveFilters.goals }),
        ...(effectiveFilters.relationshipStatus && { relationshipStatus: effectiveFilters.relationshipStatus }),
        ...(effectiveFilters.children !== undefined && { children: effectiveFilters.children }),
        ...(effectiveFilters.childrenDesire !== undefined && { childrenDesire: effectiveFilters.childrenDesire }),
        ...(effectiveFilters.smoking !== undefined && { smoking: effectiveFilters.smoking }),
        ...(effectiveFilters.drinking !== undefined && { drinking: effectiveFilters.drinking }),
    };

    // Thực hiện tìm kiếm
    let results = await UserProfile.find(query);

    // Nếu không có kết quả, nới lỏng điều kiện
    if (results.length === 0)
    {
        console.log("No matches found. Relaxing filters...");
        delete query.gender; // Loại bỏ điều kiện giới tính
        query.dateOfBirth = {
            $gte: new Date(`${ minBirthYear - 5 }-01-01`), // Tăng thêm 5 năm tuổi tối đa
            $lte: new Date(`${ maxBirthYear + 5 }-12-31`), // Tăng thêm 5 năm tuổi tối thiểu
        };
        query.location = {
            $geoWithin: {
                $centerSphere: [effectiveFilters.location, (effectiveFilters.radius + 20) / 6371], // Tăng bán kính thêm 20km
            },
        };
        results = await UserProfile.find(query);
    }

    if (results.length === 0)
    {
        console.log("No users found after relaxing filters.");
        return {
            message: "Không tìm thấy người dùng phù hợp. Thử mở rộng phạm vi tìm kiếm.",
            results: [],
        };
    }

    // Tính điểm tương thích
    const sortedResults = results.map(target => ({
        user: target,
        compatibilityScore: calculateMatchingScore(user, target),
    })).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return sortedResults;
};



// Gợi ý hồ sơ
exports.generateRecommendations = async (userId, page = 1, limit = 3) =>
{
    try
    {

        // Lấy thông tin người dùng hiện tại
        const user = await User.findById(userId).populate('profile');
        const userProfile = user.profile;

        if (!userProfile) throw new Error('User profile not found');
        const dislikedUserIds = await Interaction.find({
            userFrom: userId,
            type: 'Dislike',
        }).distinct('userTo');

        const matchedUserIds = await Matching.find({
            $or: [
                { user1: userId },
                { user2: userId },
            ],
            status: 'Matched',
        }).then(matches => matches.map(match =>
            match.user1.toString() === userId ? match.user2 : match.user1
        ));

        const excludedUserIds = [...new Set([...dislikedUserIds, ...matchedUserIds, userId])];

        const candidates = await UserProfile.find({
            userId: { $nin: excludedUserIds }, // Loại bỏ User bị Dislike hoặc đã Matched
        });

        // Tính điểm tương thích cho từng ứng viên
        const scoredCandidates = candidates.map(candidate => ({
            user: candidate,
            compatibilityScore: calculateMatchingScore(userProfile, candidate),
        }));

        // Sắp xếp theo điểm tương thích giảm dần
        scoredCandidates.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
        //scoredCandidates.shift();

        // Giới hạn kết quả tối đa 5 trang (5 * limit hồ sơ)
        const maxResults = Math.min(scoredCandidates.length, 5 * limit);

        // Phân trang
        const startIndex = (page - 1) * limit;
        const endIndex = Math.min(startIndex + limit, maxResults);
        const paginatedResults = scoredCandidates.slice(startIndex, endIndex);

        return {
            totalMatches: maxResults,
            results: paginatedResults,
        };
    } catch (error)
    {
        console.error('Error in generateRecommendations:', error);
        throw new Error('Failed to generate recommendations');
    }
};
