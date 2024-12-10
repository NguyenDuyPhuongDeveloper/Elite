const UserProfile = require('../models/UserProfile');
const User = require('../models/User');
const calculateCompatibilityScore = require('../utils/compatibilityScore');
const calculateDistance = require('../utils/calculateDistance');

// Tìm kiếm cơ bản
exports.performBasicSearch = async (userId, filters) =>
{
    const userData = await User.findById(userId).populate('profile');
    const user = userData.profile;
    if (!user) throw new Error('User not found');
    console.log(filters);


    // Tính toán khoảng thời gian sinh dựa trên độ tuổi
    const currentYear = new Date().getFullYear();
    const minBirthYear = filters.ageRange
        ? currentYear - filters.ageRange.max
        : currentYear - user.preferenceAgeRange.max;
    const maxBirthYear = filters.ageRange
        ? currentYear - filters.ageRange.min
        : currentYear - user.preferenceAgeRange.min;

    // Xây dựng query tìm kiếm
    const query = {
        _id: { $ne: userId },
        dateOfBirth: {
            $gte: new Date(`${ minBirthYear }-01-01`),
            $lte: new Date(`${ maxBirthYear }-12-31`),
        },
        gender: filters.interestedIn || user.interestedIn,
        location: {
            $geoWithin: {
                $centerSphere: [
                    filters.location
                        ? [filters.location.lng, filters.location.lat]
                        : user.location.coordinates,
                    (filters.locationRadius || user.locationRadius) / 6371,
                ],
            },
        },
    };
    console.log(query);

    // Tìm kiếm
    const results = await UserProfile.find(query);

    // Tính điểm tương thích
    return results.map(target => ({
        user: target,
        compatibilityScore: calculateCompatibilityScore(user, target),
    })).sort((a, b) => b.compatibilityScore - a.compatibilityScore);
};


// Tìm kiếm nâng cao
exports.performAdvancedSearch = async (userId, filters) =>
{
    const userData = await User.findById(userId).populate('profile');
    const user = userData.profile;

    if (!user) throw new Error('User not found');

    // Nếu không có filters, lấy từ profile của người dùng
    const effectiveFilters = filters || {
        ageRange: user.preferenceAgeRange,
        gender: user.interestedIn,
        location: user.location.coordinates,
        radius: user.locationRadius,
        goals: user.goals,
        relationshipStatus: user.relationshipStatus,
        children: user.children,
        childrenDesire: user.childrenDesire,
        hobbies: user.hobbies,
        smoking: user.smoking,
        drinking: user.drinking,
    };

    const currentYear = new Date().getFullYear();
    const minBirthYear = currentYear - effectiveFilters.ageRange.max;
    const maxBirthYear = currentYear - effectiveFilters.ageRange.min;

    const query = {
        _id: { $ne: userId },
        dateOfBirth: {
            $gte: new Date(`${ minBirthYear }-01-01`),
            $lte: new Date(`${ maxBirthYear }-12-31`),
        },
        gender: effectiveFilters.gender,
        location: {
            $geoWithin: {
                $centerSphere: [effectiveFilters.location, effectiveFilters.radius / 6371],
            },
        },
    };

    // Áp dụng thêm bộ lọc nâng cao nếu có
    if (effectiveFilters.goals) query.goals = effectiveFilters.goals;
    if (effectiveFilters.relationshipStatus) query.relationshipStatus = effectiveFilters.relationshipStatus;
    if (effectiveFilters.children) query.children = effectiveFilters.children;
    if (effectiveFilters.childrenDesire) query.childrenDesire = effectiveFilters.childrenDesire;
    if (effectiveFilters.hobbies && effectiveFilters.hobbies.length > 0)
    {
        query.hobbies = { $in: effectiveFilters.hobbies };
    }
    if (effectiveFilters.smoking) query.smoking = effectiveFilters.smoking;
    if (effectiveFilters.drinking) query.drinking = effectiveFilters.drinking;

    const results = await UserProfile.find(query);
    return results.map(target => ({
        user: target,
        compatibilityScore: calculateCompatibilityScore(user, target),
    })).sort((a, b) => b.compatibilityScore - a.compatibilityScore);
};


// Gợi ý hồ sơ
exports.generateRecommendations = async (userId, limit = 20) =>
{
    const user = await User.findById(userId).populate('profile');
    const userProfile = user.profile;

    if (!userProfile) throw new Error('User not found');

    // Lấy tất cả các hồ sơ ngoại trừ chính người dùng
    const query = {
        _id: { $ne: userId }, // Loại trừ chính người dùng
    };

    const candidates = await UserProfile.find(query);

    // Tính điểm tương thích
    const recommendations = candidates.map(target => ({
        user: target,
        compatibilityScore: calculateCompatibilityScore(userProfile, target),
    }));

    // Sắp xếp theo điểm tương thích
    recommendations.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // Tổng số hồ sơ trùng khớp
    const totalMatches = recommendations.length;

    // Giới hạn số lượng hồ sơ trả về
    const limitedResults = recommendations.slice(0, limit);

    return {
        totalMatches,
        results: limitedResults,
    };
};

