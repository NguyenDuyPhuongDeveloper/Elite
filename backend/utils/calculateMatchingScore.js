const calculateMatchingScore = (currentProfile, candidateProfile) =>
{
    let score = 0;

    // Tính điểm tương thích dựa trên sở thích
    if (currentProfile.hobbies.some((hobby) => candidateProfile.hobbies.includes(hobby)))
    {
        score += 20;
    }

    // Tính điểm tương thích dựa trên vị trí
    if (currentProfile.location?.city === candidateProfile.location?.city)
    {
        score += 30;
    }

    // Tính điểm tương thích dựa trên tôn giáo
    if (currentProfile.religion === candidateProfile.religion)
    {
        score += 10;
    }

    // Tính điểm chênh lệch tuổi
    const ageDiff = Math.abs(
        calculateAge(currentProfile.dateOfBirth) - calculateAge(candidateProfile.dateOfBirth)
    );
    if (ageDiff <= 5) score += 20;

    return score;
};

// Helper: Tính tuổi
const calculateAge = (dob) =>
{
    const diffMs = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diffMs).getUTCFullYear() - 1970);
};

module.exports = calculateMatchingScore; // Xuất hàm chính
