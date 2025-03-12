const express = require("express");
const router = express.Router();
const { getNews, getHeadlines, incrementViewCount, bookmarkNews, reportArticle, getPreferredNews, deleteArticle, getFlaggedArticles } = require("../controllers/news.controller");

router.get("/", getNews);
router.get("/headlines", getHeadlines);
router.get("/incrementviewcount", incrementViewCount);
router.post("/bookmark", bookmarkNews);
router.post("/reportarticle", reportArticle);
router.get("/preferred", getPreferredNews);
router.delete("/deletearticle", deleteArticle);
router.get("/flaggedarticles", getFlaggedArticles);

module.exports = router;