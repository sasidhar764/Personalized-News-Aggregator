const express = require("express");
const router = express.Router();
const { 
    getNews, 
    getHeadlines, 
    incrementViewCount, 
    bookmarkNews, 
    getBookmarks, 
    reportArticle, 
    getPreferredNews, 
    deleteArticle, 
    getFlaggedArticles, 
    removeFlags,
    toggleNewsSummary
} = require("../controllers/news.controller");

router.post("/", getNews);
router.get("/headlines", getHeadlines);
router.put("/incrementviewcount", incrementViewCount);
router.post("/bookmark", bookmarkNews);
router.post("/getbookmarks", getBookmarks);
router.post("/reportarticle", reportArticle);
router.post("/preferred", getPreferredNews);
router.delete("/deletearticle", deleteArticle);
router.get("/flaggedarticles", getFlaggedArticles);
router.post("/removeflags", removeFlags);
router.post("/togglesummary", toggleNewsSummary);

module.exports = router;
