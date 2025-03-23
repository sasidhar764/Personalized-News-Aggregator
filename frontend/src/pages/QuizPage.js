import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './QuizPage.css';
import { useNavigate } from 'react-router-dom';

const QuizPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.username) {
      navigate('/login');
      return;
    }

    const loadQuiz = async () => {
      try {
        const res = await axios.post(`${process.env.REACT_APP_SERVER_URL}/quiz/fetch`, { username: user.username });
        setQuestions(res.data.questions);
      } catch (err) {
        console.error("Failed to load quiz:", err);
        setError("Could not load quiz. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [navigate]);

  const handleOptionChange = (questionId, option) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    try {
      const unansweredQuestions = questions.filter(q => !selectedAnswers[q._id]);
      if (unansweredQuestions.length > 0) {
        alert("Please answer all questions before submitting.");
        console.warn("Unanswered questions detected:", unansweredQuestions);
        return;
      }

      const answersArray = questions.map(q => selectedAnswers[q._id]);
      console.log("Submitting quiz for username:", user.username, "Answers:", answersArray);

      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/quiz/submit`, {
        username: user.username,
        answers: answersArray,
        questions,
      });

      if (response.data.message === "You have already submitted the quiz for this week.") {
        alert(`You have already submitted the quiz for this week. Your score: ${response.data.score}/${response.data.total}`);
      } else {
        console.info(`Quiz submitted successfully. Score: ${response.data.score}/${response.data.total}`);
        navigate('/result', { state: { score: response.data.score, total: response.data.total } });
      }
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      let errorMessage = "Failed to submit quiz. Please try again.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    }
  };

  if (loading) return <p>Loading quiz...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="quiz-container">
      <h2 className="quiz-title">Weekly Quiz</h2>
      {questions.length === 0 ? (
        <p>No quiz questions available.</p>
      ) : (
        questions.map((q, index) => (
          <div 
            key={q._id} 
            className={`question-container ${index % 2 === 0 ? 'even' : 'odd'}`}
          >
            <p className="question-text">{index + 1}. {q.question}</p>
            <div className="options-grid">
              {q.options.map((option, i) => (
                <label 
                  key={i} 
                  className={`option-label ${
                    selectedAnswers[q._id] === option ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${q._id}`}
                    value={option}
                    checked={selectedAnswers[q._id] === option}
                    onChange={() => handleOptionChange(q._id, option)}
                    className="option-input"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))
      )}
      {questions.length > 0 && (
        <button onClick={handleSubmit} className="submit-button">
          Submit Quiz
        </button>
      )}
    </div>
  );
};

export default QuizPage;