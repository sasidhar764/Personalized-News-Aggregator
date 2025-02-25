const express = require('express')
const router = express.Router()
const {getNews, getHeadlines} = require('../controllers/news.controller')

router.get('/', getNews)
router.get('/headlines', getHeadlines)

module.exports = router