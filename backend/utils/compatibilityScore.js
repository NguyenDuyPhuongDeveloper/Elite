const calculateMatchingScore = (currentProfile, candidateProfile) =>
{
    let score = 0;
    const MAX_SCORE = 100;

    // 1. Điểm sở thích (25 điểm)
    const commonHobbies = currentProfile.hobbies.filter(hobby =>
        candidateProfile.hobbies.includes(hobby)
    );
    score += Math.min(commonHobbies.length * 5, 25); // Mỗi sở thích chung tăng 5 điểm, tối đa 25 điểm.

    // 2. Điểm vị trí địa lý (15 điểm)
    if (currentProfile.location && candidateProfile.location)
    {
        const distance = calculateGeographicDistance(
            currentProfile.location.coordinates,
            candidateProfile.location.coordinates
        );

        // Điểm cao hơn nếu ở gần, giảm dần theo khoảng cách
        if (distance <= 10) score += 15; // Trong phạm vi 10km
        else if (distance <= 30) score += 10; // Trong phạm vi 30km
        else if (distance <= 50) score += 5; // Trong phạm vi 50km
    }

    // 3. Điểm tuổi (15 điểm)
    const currentAge = calculateAge(currentProfile.dateOfBirth);
    const candidateAge = calculateAge(candidateProfile.dateOfBirth);
    const ageDiff = Math.abs(currentAge - candidateAge);

    const isWithinAgePreference =
        currentAge >= candidateProfile.preferenceAgeRange.min &&
        currentAge <= candidateProfile.preferenceAgeRange.max &&
        candidateAge >= currentProfile.preferenceAgeRange.min &&
        candidateAge <= currentProfile.preferenceAgeRange.max;

    if (isWithinAgePreference)
    {
        if (ageDiff <= 3) score += 15;
        else if (ageDiff <= 7) score += 10;
        else if (ageDiff <= 10) score += 5;
    }

    // 4. Điểm mục tiêu quan hệ (15 điểm)
    score += relationshipGoalCompatibility(currentProfile.goals, candidateProfile.goals);

    // 5. Điểm giới tính và quan tâm (10 điểm)
    if (candidateProfile.gender === currentProfile.interestedIn)
    {
        score += 10;
    }

    // 6. Điểm phong cách sống (15 điểm)
    const lifestyleFactors = [
        { factor: 'smoking', weight: 5 },
        { factor: 'drinking', weight: 5 },
        { factor: 'children', weight: 5 }
    ];

    lifestyleFactors.forEach(({ factor, weight }) =>
    {
        if (currentProfile[factor] === candidateProfile[factor])
        {
            score += weight;
        }
    });

    // 7. Điểm mong muốn về con cái (10 điểm)
    score += childrenDesireCompatibility(currentProfile.childrenDesire, candidateProfile.childrenDesire);

    // 8. Điểm học vấn và nghề nghiệp (5 điểm)
    if (currentProfile.education === candidateProfile.education) score += 3;
    if (currentProfile.occupation === candidateProfile.occupation) score += 2;

    // Đảm bảo điểm không vượt quá 100
    return Math.min(Math.round(score), MAX_SCORE);
};

// Helper: Tính tuổi
const calculateAge = dob =>
{
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
};

// Helper: Tính khoảng cách địa lý (Haversine)
const calculateGeographicDistance = (coord1, coord2) =>
{
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Helper: Tương thích mục tiêu quan hệ
const relationshipGoalCompatibility = (goal1, goal2) =>
{
    const compatibility = {
        'Conversation and friendship': { 'Conversation and friendship': 15, 'Casual dating': 10 },
        'Casual dating': { 'Conversation and friendship': 10, 'Casual dating': 15, 'Serious relationship': 10 },
        'Serious relationship': { 'Serious relationship': 15, 'Long-term relationships': 12 },
        'Long-term relationships': { 'Long-term relationships': 15, 'Creating a family': 10 },
        'Creating a family': { 'Creating a family': 15 }
    };
    return compatibility[goal1]?.[goal2] || 0;
};

// Helper: Tương thích mong muốn con cái
const childrenDesireCompatibility = (desire1, desire2) =>
{
    const compatibility = {
        "I don't want children right now, maybe later": { "I don't want children right now, maybe later": 10 },
        "No, I don't want children": { "No, I don't want children": 10, "I don't want children right now, maybe later": 5 },
        "I would like to have children": { "I would like to have children": 10 }
    };
    return compatibility[desire1]?.[desire2] || 0;
};

module.exports = calculateMatchingScore;
