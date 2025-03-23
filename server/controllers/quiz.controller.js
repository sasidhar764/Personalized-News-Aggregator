const User = require('../models/user.model'); 
const { Quiz, UserQuizStatus } = require('../models/quiz.model');

const fetchQuiz = async (req, res) => {
  console.log("Received username:", req.body.username); 

  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: "Username required" });

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log("Received user:", user); 
    const category = user.preferredCategory[0]; 
    const language = user.language;

    const questions = await Quiz.find({
      category,language
    }).limit(5);
    console.log("Fetched questions:", questions);

    return res.json({ questions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching quiz" });
  }
}

const submitQuiz = async (req, res) => {
  try {
    const { username, answers } = req.body;
    if (!username || !answers) return res.status(400).json({ message: "Username and answers required" });

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const currentWeek = getCurrentWeek();
    const userQuizStatus = await UserQuizStatus.findOne({ username, week: currentWeek });

    if (userQuizStatus) {
      return res.status(400).json({ 
        message: "You have already submitted the quiz for this week.",
        score: userQuizStatus.score,
        total: userQuizStatus.total
      });
    }

    const category = user.preferredCategory[0];
    const language = user.language;

    const questions = await Quiz.find({ category, language }).limit(5);
    if (questions.length === 0) return res.status(404).json({ message: "No quiz questions found" });

    let correctCount = 0;
    let results = [];

    questions.forEach((q, index) => {
      const isCorrect = answers[index] === q.correctAnswer; 
      if (isCorrect) correctCount++;
      results.push({
        question: q.question,
        selected: answers[index],
        correctAnswer: q.correctAnswer,
        isCorrect
      });
    });

    const newQuizStatus = new UserQuizStatus({
      username,
      week: currentWeek,
      score: correctCount,
      total: questions.length
    });

    await newQuizStatus.save(); // Save the document
    console.log("Quiz status saved:", newQuizStatus); // Debugging line

    console.log(correctCount, questions.length, results);

    return res.json({
      message: "Quiz submitted",
      score: correctCount,
      total: questions.length,
      results
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error submitting quiz" });
  }
};

const getCurrentWeek = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000);
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
};

module.exports = { fetchQuiz, submitQuiz };