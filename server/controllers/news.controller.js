const News = require("../models/news.model");
const Headlines = require("../models/headlines.model");

const getNews = async (req, res) => {
    try {
        const news = await News.find().sort({ publishedAt: -1 });
        res.json(news);
    } catch (error) {
        console.error("Error fetching news:", error.message);
        res.status(500).json({ error: "Failed to fetch news." });
    }
};

const getHeadlines = async (req, res) => {
    try {
        const headlines = await Headlines.find().sort({ publishedAt: -1 });
        res.json(headlines);
    } catch (error) {
        console.error("Error fetching headlines:", error.message);
        res.status(500).json({ error: "Failed to fetch headlines." });
    }
};

module.exports = { getNews, getHeadlines };
