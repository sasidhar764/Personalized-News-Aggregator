require("dotenv").config();
const axios = require("axios");
const News = require("../models/news.model");

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const MEDIASTACK_API_KEY = process.env.MEDIASTACK_API_KEY;

const getNews = async (req, res) => {
    try {
        const { query, category, from, to, country, language } = req.query;

        let gnewsUrl = `https://gnews.io/api/v4/search?q=${query || "latest"}&token=${GNEWS_API_KEY}`;
        if (category) gnewsUrl += `&category=${category}`;
        if (from) gnewsUrl += `&from=${from}`;
        if (to) gnewsUrl += `&to=${to}`;
        if (country) gnewsUrl += `&country=${country}`;
        if (language) gnewsUrl += `&lang=${language}`;

        let response = await axios.get(gnewsUrl);

        if (!response.data.articles || !response.data.articles.length) {
            console.log("⚠️ No results from GNews. Fetching from Mediastack...");
            let mediastackUrl = `http://api.mediastack.com/v1/news?access_key=${MEDIASTACK_API_KEY}&keywords=${query || "latest"}`;
            if (category) mediastackUrl += `&categories=${category}`;
            if (country) mediastackUrl += `&countries=${country}`;
            if (language) mediastackUrl += `&languages=${language}`;
            if (from) mediastackUrl += `&date=${from},${to || ""}`;

            response = await axios.get(mediastackUrl);
        }

        const articles = response.data.articles || [];

        // Store news in MongoDB
        const savedNews = await Promise.all(articles.map(async (article) => {
            const existingNews = await News.findOne({ url: article.url });
            if (!existingNews) {
                return await News.create({
                    title: article.title,
                    description: article.description || "No description available",
                    url: article.url,
                    publishedAt: article.publishedAt || new Date(),
                    source: article.source?.name || "Unknown",
                    verified: false, // Default not verified
                    reportCount: 0,
                    reportedUsers: []
                });
            }
            return existingNews;
        }));

        res.json(savedNews);
    } catch (error) {
        console.error("Error fetching news:", error.message);
        res.status(500).json({ error: "Failed to fetch news." });
    }
};

const getHeadlines = async (req, res) => {
    try {
        let headlinesUrl = `https://gnews.io/api/v4/top-headlines?category=general&lang=en&apikey=${GNEWS_API_KEY}`;
        let response = await axios.get(headlinesUrl);

        // Store news in MongoDB
        const savedNews = await Promise.all(response.data.articles.map(async (article) => {
            const existingNews = await News.findOne({ url: article.url });
            if (!existingNews) {
                return await News.create({
                    title: article.title,
                    description: article.description || "No description available",
                    url: article.url,
                    publishedAt: article.publishedAt,
                    source: article.source?.name || "Unknown",
                    verified: false, 
                    reportCount: 0,
                    reportedUsers: []
                });
            }
            return existingNews;
        }));

        res.json(savedNews);
    } catch (error) {
        console.error("Error fetching headlines:", error.message);
        res.status(500).json({ error: "Failed to fetch headlines." });
    }
};

module.exports = { getNews, getHeadlines };