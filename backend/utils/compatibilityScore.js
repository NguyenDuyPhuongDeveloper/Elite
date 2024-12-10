const calculateMatchingScore = (currentProfile, candidateProfile, weights = {}) =>
{
    let score = 0;
    const MAX_SCORE = 100;

    // Trọng số mặc định
    const defaultWeights = {
        hobbies: 5,
        maxHobbies: 25,
        location: { within10: 15, within30: 10, within50: 5 },
        age: { maxDiff3: 15, maxDiff7: 10, maxDiff10: 5 },
        goals: 15,
        gender: 10,
        lifestyle: { smoking: 5, drinking: 5, children: 5 },
        childrenDesire: 10,
        education: 3,
        occupation: 2,
    };

    // Kết hợp trọng số tùy chỉnh với mặc định
    const effectiveWeights = {
        ...defaultWeights,
        ...weights,
        location: { ...defaultWeights.location, ...weights.location },
        age: { ...defaultWeights.age, ...weights.age },
        lifestyle: { ...defaultWeights.lifestyle, ...weights.lifestyle },
    };

    // 1. Điểm sở thích
    const commonHobbies = currentProfile.hobbies.filter(hobby =>
        candidateProfile.hobbies.includes(hobby)
    );
    score += Math.min(
        commonHobbies.length * effectiveWeights.hobbies,
        effectiveWeights.maxHobbies
    );

    // 2. Điểm vị trí địa lý
    if (currentProfile.location && candidateProfile.location)
    {
        const distance = calculateGeographicDistance(
            currentProfile.location.coordinates,
            candidateProfile.location.coordinates
        );

        if (distance <= 10) score += effectiveWeights.location.within10;
        else if (distance <= 30) score += effectiveWeights.location.within30;
        else if (distance <= 50) score += effectiveWeights.location.within50;
    }

    // 3. Điểm tuổi
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
        if (ageDiff <= 3) score += effectiveWeights.age.maxDiff3;
        else if (ageDiff <= 7) score += effectiveWeights.age.maxDiff7;
        else if (ageDiff <= 10) score += effectiveWeights.age.maxDiff10;
    }

    // 4. Điểm mục tiêu quan hệ
    score += relationshipGoalCompatibility(
        currentProfile.goals,
        candidateProfile.goals
    ) * (effectiveWeights.goals / 15);

    // 5. Điểm giới tính và quan tâm
    if (candidateProfile.gender === currentProfile.interestedIn)
    {
        score += effectiveWeights.gender;
    }

    // 6. Điểm phong cách sống
    const lifestyleFactors = [
        { factor: 'smoking', weight: effectiveWeights.lifestyle.smoking },
        { factor: 'drinking', weight: effectiveWeights.lifestyle.drinking },
        { factor: 'children', weight: effectiveWeights.lifestyle.children },
    ];

    lifestyleFactors.forEach(({ factor, weight }) =>
    {
        if (currentProfile[factor] === candidateProfile[factor])
        {
            score += weight;
        }
    });

    // 7. Điểm mong muốn về con cái
    score += childrenDesireCompatibility(
        currentProfile.childrenDesire,
        candidateProfile.childrenDesire
    ) * (effectiveWeights.childrenDesire / 10);

    // 8. Điểm học vấn và nghề nghiệp
    if (currentProfile.education === candidateProfile.education)
    {
        score += effectiveWeights.education;
    }
    if (currentProfile.occupation === candidateProfile.occupation)
    {
        score += effectiveWeights.occupation;
    }

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
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()))
    {
        age--;
    }
    return age;
};

// Helper: Tính khoảng cách địa lý (Haversine formula)
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
