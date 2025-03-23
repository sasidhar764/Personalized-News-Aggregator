import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './ResultPage.css';

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, total } = location.state || {};
  const [result, setResult] = useState({ score, total });
  const [loading, setLoading] = useState(!score || !total);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.username) {
      navigate('/login');
      return;
    }

    if (!score || !total) {
      const fetchResult = async () => {
        try {
          const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/quiz/result`, {
            username: user.username,
          });
          setResult({
            score: response.data.score,
            total: response.data.total,
          });
        } catch (err) {
          console.error("Failed to fetch result:", err);
          setError("Could not load your quiz result.");
        } finally {
          setLoading(false);
        }
      };
      fetchResult();
    } else {
      setLoading(false);
    }
  }, [navigate, score, total]);

  if (loading) return <p>Loading results...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (result.score === undefined || result.total === undefined) {
    return (
      <div className="result-container">
        <p>Invalid access to result page. Please take the quiz first.</p>
        <button onClick={() => navigate('/quiz')} className="retry-button">
          Go to Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="result-container">
      <h2 className="result-title">Quiz Results</h2>
      <p className="result-score">
        You scored {result.score} out of {result.total}!
      </p>
      <button onClick={() => navigate('/')} className="home-button">
        Go to Home
      </button>
    </div>
  );
};

export default ResultPage;