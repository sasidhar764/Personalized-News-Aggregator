const News = require("../models/news.model");
const Headlines = require("../models/headlines.model");
const User = require("../models/user.model");

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

const bookmarkNews = async (req, res) => {
    try {
        const { username, url } = req.body;
        if (!username || !url) {
            return res.status(400).json({ error: "Username and URL are required." });
        }
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        if (!user.bookmarks.includes(url)) {
            user.bookmarks.push(url);
            await user.save();
        }
        res.json({ message: "News bookmarked successfully.", bookmarks: user.bookmarks });
    } catch (error) {
        console.error("Error bookmarking news:", error.message);
        res.status(500).json({ error: "Failed to bookmark news." });
    }
};

const reportArticle = async (req, res) => {
    try {
        const { username, url } = req.body;
        if (!username || !url) {
            return res.status(400).json({ error: "Username and URL are required." });
        }
        let newsItem = await News.findOne({ url });
        if (!newsItem) {
            return res.status(404).json({ error: "News article not found." });
        }
        if (!newsItem.reportedUsers.includes(username)) {
            newsItem.reportCount += 1;
            newsItem.reportedUsers.push(username);
            await newsItem.save();
        } else {
            return res.status(400).json({ error: "You have already reported this article." });
        }
        res.json({ message: "Article reported successfully.", reportCount: newsItem.reportCount });
    } catch (error) {
        console.error("Error reporting article:", error.message);
        res.status(500).json({ error: "Failed to report article." });
    }
};

const getPreferredNews = async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: "Username is required." });
        }
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        const preferredCategories = user.preferredCategory || [];
        const preferredLanguage = user.language;
        const preferredCountry = user.country;
        let news = await News.find({
            $or: [
                { category: { $in: preferredCategories } },
                { language: preferredLanguage },
                { country: preferredCountry }
            ]
        }).sort({ publishedAt: -1 });
        news = news.filter(article => !article.reportedUsers.includes(username));
        res.json(news);
    } catch (error) {
        console.error("Error fetching preferred news:", error.message);
        res.status(500).json({ error: "Failed to fetch preferred news." });
    }
};

module.exports = { getNews, getHeadlines, incrementViewCount, bookmarkNews, reportArticle, getPreferredNews };
