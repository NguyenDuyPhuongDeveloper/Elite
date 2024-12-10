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


    // Tìm kiếm
    const results = await UserProfile.find(query);

    // Tính điểm tương thích
    return results.map(target => ({
        user: target,
        compatibilityScore: calculateCompatibilityScore(user, target),
    })).sort((a, b) => b.compatibilityScore - a.compatibilityScore);
};


exports.performAdvancedSearch = async (userId, filters = {}) =>
{
    const userData = await User.findById(userId).populate('profile');
    const user = userData?.profile;

    if (!user) throw new Error('User not found');

    // Chỉ lấy location và radius từ hồ sơ người dùng, các giá trị khác từ filters
    const effectiveFilters = {
        ageRange: filters.ageRange || { min: 18, max: 99 },
        gender: filters.gender || null,
        location: user.location.coordinates || [0, 0], // Lấy từ hồ sơ người dùng
        radius: filters.radius || user.locationRadius || 50, // Giá trị mặc định 50km
        goals: filters.goals || null,
        relationshipStatus: filters.relationshipStatus || null,
        children: filters.children || undefined, // Chỉ thêm nếu không undefined
        childrenDesire: filters.childrenDesire || undefined,
        smoking: filters.smoking || undefined,
        drinking: filters.drinking || undefined,
    };
    // Tính toán khoảng năm sinh
    const currentYear = new Date().getFullYear();
    const minBirthYear = currentYear - effectiveFilters.ageRange.max;
    const maxBirthYear = currentYear - effectiveFilters.ageRange.min;

    // Xây dựng query
    const query = {
        _id: { $ne: userId }, // Loại trừ bản thân
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

        // Nếu vẫn không có kết quả, trả về thông báo
        if (results.length === 0)
        {
            console.log("No users found after relaxing filters.");
            return {
                message: "Không tìm thấy người dùng phù hợp. Thử mở rộng phạm vi tìm kiếm.",
                results: [],
            };
        }
    }

    // Tính điểm tương thích
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

