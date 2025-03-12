const express = require("express");
const router = express.Router();
const { getNews, getHeadlines, incrementViewCount, bookmarkNews } = require("../controllers/news.controller");

router.get("/", getNews);
router.get("/headlines", getHeadlines);
router.get("/incrementviewcount", incrementViewCount);
router.post("/bookmark", bookmarkNews);

module.exports = router;