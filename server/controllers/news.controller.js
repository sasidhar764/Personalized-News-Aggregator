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

const incrementViewCount = async (req, res) => {
    try {
        const { url } = req.body;
        
        let newsItem = await News.findOne({ url });

        if (!newsItem) {
            return res.status(404).json({ error: "News or headline not found." });
        }

        newsItem.viewcount = (newsItem.viewcount || 0) + 1;
        await newsItem.save();

        res.json({ message: "View count incremented.", viewcount: newsItem.viewcount });
    } catch (error) {
        console.error("Error incrementing view count:", error.message);
        res.status(500).json({ error: "Failed to increment view count." });
    }
};

module.exports = { getNews, getHeadlines, incrementViewCount };
