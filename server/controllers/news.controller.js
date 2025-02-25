require("dotenv").config();
const axios = require("axios");

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const MEDIASTACK_API_KEY = process.env.MEDIASTACK_API_KEY;

const getNews = async (req, res) => {
    try {
        const { query, category, from, to, country, language } = req.query;

        // Construct GNews API URL
        let gnewsUrl = `https://gnews.io/api/v4/search?q=${query||"latest"}&token=${GNEWS_API_KEY}`;

        if (category) gnewsUrl += `&category=${category}`;
        if (from) gnewsUrl += `&from=${from}`;
        if (to) gnewsUrl += `&to=${to}`;
        if (country) gnewsUrl += `&country=${country}`;
        if (language) gnewsUrl += `&lang=${language}`;

        // Fetch from GNews API
        let response = await axios.get(gnewsUrl);

        // If GNews has no results, fallback to Mediastack
        if (!response.data.articles.length) {
            console.log("⚠️ No results from GNews. Fetching from Mediastack...");
            let mediastackUrl = `http://api.mediastack.com/v1/news?access_key=${MEDIASTACK_API_KEY}&keywords=${query || "latest"}`;
            if (category) mediastackUrl += `&categories=${category}`;
            if (country) mediastackUrl += `&countries=${country}`;
            if (language) mediastackUrl += `&languages=${language}`;
            if (from) mediastackUrl += `&date=${from},${to || ""}`;

            response = await axios.get(mediastackUrl);
        }

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching news:", error.message);
        res.status(500).json({ error: "Failed to fetch news." });
    }
}

const getHeadlines = async (req, res) => {
    try {
        
        let headlines = `https://gnews.io/api/v4/top-headlines?category=general&lang=en&apikey=${GNEWS_API_KEY}`;

        let response = await axios.get(headlines);

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching news:", error.message);
        res.status(500).json({ error: "Failed to fetch news." });
    }
}

module.exports = {
    getNews,
    getHeadlines
}