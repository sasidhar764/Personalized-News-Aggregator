const router = require('express').Router();
const { fetchQuiz, submitQuiz } = require('../controllers/quiz.controller');

router.post('/fetch', fetchQuiz); 
router.post('/submit', submitQuiz);

module.exports = router;