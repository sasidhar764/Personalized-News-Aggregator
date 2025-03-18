const express = require("express");
const router = express.Router();
const { getNews, getHeadlines, incrementViewCount, bookmarkNews, reportArticle, getPreferredNews, deleteArticle, getFlaggedArticles, removeFlags } = require("../controllers/news.controller");

router.get("/", getNews);
router.get("/headlines", getHeadlines);
router.get("/incrementviewcount", incrementViewCount);
router.post("/bookmark", bookmarkNews);
router.post("/reportarticle", reportArticle);
router.post("/preferred", getPreferredNews);
router.delete("/deletearticle", deleteArticle);
router.get("/flaggedarticles", getFlaggedArticles);
router.post("/removeflags", removeFlags);

module.exports = router;