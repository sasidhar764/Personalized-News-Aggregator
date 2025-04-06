import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './ResultPage.css';

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState({
    score: location.state?.score || null,
    total: location.state?.total || null,
    results: location.state?.results || [],
  });

  const [loading, setLoading] = useState(result.score === null || result.total === null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.username) {
      navigate('/login');
      return;
    }

    if (loading) {
      const fetchResult = async () => {
        try {
          const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/quiz/result`, {
            username: user.username,
          });

          setResult({
            score: response.data.score,
            total: response.data.total,
            results: response.data.results || [],
          });
        } catch (err) {
          console.error("Failed to fetch result:", err);
          setError("Could not load your quiz result.");
        } finally {
          setLoading(false);
        }
      };

      fetchResult();
    }
  }, [loading, navigate]);

  if (loading) return <p className="loading-message">Loading results...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="result-container">
      <h2 className="result-title"> Quiz Results</h2>
      <p className="result-score">You scored {result.score} out of {result.total}!</p>

      <h3 style={{ fontWeight: '700', fontSize: '1.5rem', marginBottom: '1rem' }}> Detailed Results</h3>

      <div className="detailed-results">
        {result.results.map((r, index) => (
          <div
            key={index}
            className={`result-question-card ${r.isCorrect ? 'correct' : ''}`}
          >
            <p className="question-text">Q{index + 1}: {r.question}</p>
            <p className="your-answer"><strong>Your Answer:</strong> {r.selected || 'No answer selected'}</p>
            {!r.isCorrect && (
              <p className="correct-answer"><strong>Correct Answer:</strong> {r.correctAnswer}</p>
            )}
          </div>
        ))}
      </div>

      <button onClick={() => navigate('/')} className="home-button">
         Go to Home
      </button>
    </div>
  );
};

export default ResultPage;
