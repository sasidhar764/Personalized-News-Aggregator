const express = require("express");
const router = express.Router();
const { getNews, getHeadlines, incrementViewCount } = require("../controllers/news.controller");

router.get("/", getNews);
router.get("/headlines", getHeadlines);
router.get("/incrementviewcount", incrementViewCount);

module.exports = router;