const News = require("../models/news.model");
const Headlines = require("../models/headlines.model");
const User = require("../models/user.model");
const sendSummaryEmail = require("../utils/summarizer.utils");

const getNews = async (req, res) => {
    try {
        const { language, country, category, startDate, endDate, search } = req.body;

        let filter = {};

        if (language) filter.language = language;
        if (country) filter.country = country;
        if (category) filter.category = category;
        if (startDate || endDate) {
            filter.publishedAt = {};
            if (startDate) filter.publishedAt.$gte = new Date(startDate);
            if (endDate) filter.publishedAt.$lte = new Date(endDate);
        }
        if (search) {
            const regex = new RegExp(search, "i");
            filter.$or = [
                { title: regex },
                { description: regex }
            ];
        }

        const news = await News.find(filter).sort({ publishedAt: -1 });

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
        }
        else
        {
            user.bookmarks = user.bookmarks.filter(bookmark => bookmark !== url);
        }
        await user.save();
        res.json({ 
            message: user.bookmarks.includes(url) 
                ? "News bookmarked successfully." 
                : "Bookmark removed successfully.",
            bookmarks: user.bookmarks 
        });
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
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        let newsItem = await News.findOne({ url });
        if (!newsItem) {
            return res.status(404).json({ error: "News article not found." });
        }
        if (user.reportedArticles.includes(url)) {
            return res.status(400).json({ error: "You have already reported this article." });
        }
        newsItem.reportCount += 1;
        await newsItem.save();
        user.reportedArticles.push(url);
        await user.save();
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
        const reportedArticles = user.reportedArticles || [];
        let news = await News.find({
            $or: [
                { category: { $in: preferredCategories } },
                { language: preferredLanguage },
                { country: preferredCountry }
            ]
        })
        .sort({ publishedAt: -1 });
        news = news.filter(article => !reportedArticles.includes(article.url));
        res.json(news);
    } catch (error) {
        console.error("Error fetching preferred news:", error.message);
        res.status(500).json({ error: "Failed to fetch preferred news." });
    }
};

const deleteArticle = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: "Article URL is required." });
        }
        const deletedNews = await News.findOneAndDelete({ url });
        if (!deletedNews) {
            return res.status(404).json({ error: "Article not found." });
        }
        res.json({ message: "Article deleted successfully." });
    } catch (error) {
        console.error("Error deleting article:", error.message);
        res.status(500).json({ error: "Failed to delete article." });
    }
};

const getFlaggedArticles = async (req, res) => {
    try {
        const flaggedNews = await News.find({ reportCount: { $gt: 3 } }).sort({ reportCount: -1 });
        res.json(flaggedNews);
    } catch (error) {
        console.error("Error fetching flagged articles:", error.message);
        res.status(500).json({ error: "Failed to fetch flagged articles." });
    }
};

const removeFlags = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: "Article URL is required." });
        }
        let newsItem = await News.findOne({ url });
        if (!newsItem) {
            return res.status(404).json({ error: "Article not found." });
        }
        newsItem.reportCount = 0;
        await newsItem.save();
        res.json({ message: "Flags removed successfully.", reportCount: newsItem.reportCount });
    } catch (error) {
        console.error("Error removing flags:", error.message);
        res.status(500).json({ error: "Failed to remove flags." });
    }
};

const getBookmarks = async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: "Username is required." });
        }
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        const bookmarkedArticles = await News.find({ url: { $in: user.bookmarks } }).sort({ publishedAt: -1 });
        res.json(bookmarkedArticles);
    } catch (error) {
        console.error("Error fetching bookmarks:", error.message);
        res.status(500).json({ error: "Failed to fetch bookmarks." });
    }
};


const sendNewsSummaries = async () => {
    try {
        const topArticles = await News.find().sort({ viewcount: -1 }).limit(10);

        const users = await User.find({ summary: true });

        for (const user of users) {
            await sendSummaryEmail(user.email, topArticles);
        }

        console.log("News summary emails sent successfully.");
    } catch (error) {
        console.error("Error sending news summary emails:", error.message);
    }
};

module.exports = { 
    getNews, 
    getHeadlines, 
    incrementViewCount, 
    bookmarkNews, 
    reportArticle, 
    getPreferredNews, 
    deleteArticle, 
    getFlaggedArticles, 
    removeFlags,
    getBookmarks,
    sendNewsSummaries
};
