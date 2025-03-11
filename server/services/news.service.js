require("dotenv").config();
const axios = require("axios");
const News = require("../models/news.model");
const Headline = require("../models/headlines.model");

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const MEDIASTACK_API_KEY = process.env.MEDIASTACK_API_KEY;

const categories = ["Business", "Health", "Sports", "Technology", "Science", "Politics", "Entertainment"];
const countries = ["in", "us"];
const languages = ["en", "hi"];

const fetchAndStoreNews = async () => {
    try {
        for (const category of categories) {
            for (const country of countries) {
                for (const language of languages) {
                    console.log(`Fetching news for Category: ${category}, Country: ${country}, Language: ${language}`);

                    let gnewsUrl = `https://gnews.io/api/v4/search?q=${category}&country=${country}&lang=${language}&token=${GNEWS_API_KEY}`;

                    try {
                        let response = await axios.get(gnewsUrl);
                        let articles = response.data.articles || [];

                        if (!articles.length) {
                            // console.log(`No results from GNews for ${category}, ${country}, ${language}. Fetching from Mediastack...`);
                            let mediastackUrl = `http://api.mediastack.com/v1/news?access_key=${MEDIASTACK_API_KEY}&keywords=${category}&countries=${country}&languages=${language}`;
                            response = await axios.get(mediastackUrl);
                            articles = response.data.articles || [];
                        }

                        const newArticles = [];
                        for (let article of articles) {
                            const existingNews = await News.findOne({ url: article.url });
                            if (!existingNews) {
                                const savedArticle = await News.create({
                                    title: article.title,
                                    description: article.description || "No description available",
                                    url: article.url,
                                    publishedAt: article.publishedAt || new Date(),
                                    source: article.source?.name || "Unknown",
                                    verified: false,
                                    reportCount: 0,
                                    reportedUsers: [],
                                    category: category,
                                    country: country,
                                    language: language
                                });
                                newArticles.push(savedArticle);
                            }
                        }

                        console.log(`Fetched and stored ${newArticles.length} articles for ${category}, ${country}, ${language}.`);
                    } catch (error) {
                        console.error(`Error fetching news for ${category}, ${country}, ${language}:`, error.message);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error in fetchAndStoreNews:", error.message);
        throw new Error("Failed to fetch news.");
    }
};

const fetchAndStoreHeadlines = async () => {
    try {
        let headlinesUrl = `https://gnews.io/api/v4/top-headlines?category=general&lang=en&apikey=${GNEWS_API_KEY}`;
        let response = await axios.get(headlinesUrl);

        const newHeadlines = [];
        for (let article of response.data.articles) {
            const existingNews = await News.findOne({ url: article.url });
            const existingHeadline = await Headline.findOne({ url: article.url });

            if (!existingNews) {
                await News.create({
                    title: article.title,
                    description: article.description || "No description available",
                    url: article.url,
                    publishedAt: article.publishedAt,
                    source: article.source?.name || "Unknown",
                    verified: false, 
                    reportCount: 0,
                    reportedUsers: [],
                    category: "General",
                    country: "",
                    language: ""
                });
            }

            if (!existingHeadline) {
                const savedHeadline = await Headline.create({
                    title: article.title,
                    description: article.description || "No description available",
                    url: article.url,
                    publishedAt: article.publishedAt,
                    source: article.source?.name || "Unknown",
                    verified: false, 
                    reportCount: 0,
                    reportedUsers: []
                });
                newHeadlines.push(savedHeadline);
            }
        }

        return newHeadlines;
    } catch (error) {
        console.error("Error fetching headlines:", error.message);
        throw new Error("Failed to fetch headlines.");
    }
};

module.exports = { fetchAndStoreNews, fetchAndStoreHeadlines };
