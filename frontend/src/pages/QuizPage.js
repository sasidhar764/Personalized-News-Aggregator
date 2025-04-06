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

  // ...existing code...

useEffect(() => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.username) {
    navigate('/login');
    return;
  }

  const checkQuizStatus = async () => {
    try {
      const checkResponse = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/quiz/status`,
        { username: user.username },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        }
      );

      // If user has completed quiz for current week
      if (checkResponse.data.hasCompletedWeekly) {
        navigate('/result', {
          state: {
            weeklyScore: checkResponse.data.weeklyScore,
            total: checkResponse.data.totalQuestions,
            weekNumber: checkResponse.data.weekNumber
          },
          replace: true
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to check quiz status:", err);
      setError("Error checking quiz status. Please try again.");
      setLoading(false);
      return false;
    }
  };

  const loadQuiz = async () => {
    const hasCompleted = await checkQuizStatus();
    if (hasCompleted) return;

    try {
      // Only fetch new quiz if user hasn't completed this week's quiz
      const res = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/quiz/fetch`, 
        { username: user.username },
        {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        }
      );

      if (!res.data.questions || res.data.questions.length === 0) {
        throw new Error("No quiz questions available");
      }
      
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


  const handleSubmit = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const unanswered = questions.filter(q => !selectedAnswers[q._id]);
    if (unanswered.length > 0) {
      alert("Please answer all questions before submitting.");
      return;
    }

    try {
      const answersArray = questions.map(q => selectedAnswers[q._id]);

      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/quiz/submit`, {
        username: user.username,
        answers: answersArray,
      });

      navigate('/result', {
        state: {
          score: response.data.score,
          total: response.data.total,
          results: response.data.results
        }
      });
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      setError("Failed to submit quiz. Please try again.");
    }
  };

  const handleOptionChange = (questionId, option) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: option }));
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
