const router = require('express').Router();
const { getQuizResult,fetchQuiz, submitQuiz,checkQuizStatus } = require('../controllers/quiz.controller');
router.post('/status', checkQuizStatus);
router.post('/fetch', fetchQuiz); 
router.post('/submit', submitQuiz);
router.post('/result', getQuizResult);


module.exports = router;