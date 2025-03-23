const mongoose = require('mongoose')

const quizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  category: { type: String }, 
  language: { type: String },
  country: { type: String },
  publishedAt: { type: Date, default: Date.now }
})

const userQuizStatusSchema = new mongoose.Schema({
  username: { type: String, required: true },
  week: { type: Number, required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true }
});

const Quiz = mongoose.model('Quiz', quizSchema)
const UserQuizStatus = mongoose.model('UserQuizStatus', userQuizStatusSchema)

module.exports = { Quiz, UserQuizStatus }