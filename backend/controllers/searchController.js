const searchService = require('../services/SearchService');

// Tìm kiếm cơ bản
exports.basicSearch = async (req, res) =>
{
    try
    {
        const { userId } = req.query;
        console.log(userId);
        const filters = req.query.filters ? JSON.parse(req.query.filters) : {}; // Lấy filters từ frontend
        const results = await searchService.performBasicSearch(userId, filters);
        //consosle.log(results);
        res.json(results);
    } catch (error)
    {
        res.status(500).json({ error: error.message });
    }
};


// Tìm kiếm nâng cao
exports.advancedSearch = async (req, res) =>
{
    try
    {
        const { userId, filters } = req.body;
        const results = await searchService.performAdvancedSearch(userId, filters);
        res.json(results);
    } catch (error)
    {
        res.status(500).json({ error: error.message });
    }
};

// Gợi ý hồ sơ
exports.recommendProfiles = async (req, res) =>
{
    try
    {
        const { userId } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;

        if (!userId)
        {
            return res.status(400).json({ message: "User ID is required" });
        }

        const recommendations = await searchService.generateRecommendations(userId, page, limit);

        res.json(recommendations);
    } catch (error)
    {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch recommendations" });
    }
};
