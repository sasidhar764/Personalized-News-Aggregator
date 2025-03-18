import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

function FlaggedArticles() {
  const navigate = useNavigate();
  const [flaggedArticles, setFlaggedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchFlaggedArticles();
  }, [navigate]);

  const fetchFlaggedArticles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news/flaggedarticles`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch flagged articles");
      }
      
      const data = await response.json();
      setFlaggedArticles(data || []);
    } catch (error) {
      console.error("Error fetching flagged articles:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteArticle = async (articleUrl) => {
    try {
      // Encode the URL to make it safe for use in a request
      // const encodedUrl = encodeURIComponent(articleUrl);
      console.log("articleurl",articleUrl)
      
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news/deletearticle`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ url: articleUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete article");
      }

      // Remove the deleted article from the state
      setFlaggedArticles(flaggedArticles.filter(article => article.url !== articleUrl));
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Failed to delete article: " + error.message);
    }
  };
    
  const handleKeepArticle = async (articleUrl) => {
    console.log("url",articleUrl)
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news/removeflags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ url: articleUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to unflag article");
      }

      // Remove the unflagged article from the state
      setFlaggedArticles(flaggedArticles.filter(article => article.url !== articleUrl));
    } catch (error) {
      console.error("Error unflagging article:", error);
      alert("Failed to unflag article: " + error.message);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading flagged articles...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="flagged-articles-container">
      <header className="content-header">
        <h1>Flagged Articles</h1>
      </header>

      {flaggedArticles.length === 0 ? (
        <div className="no-articles">
          <p>No flagged articles found.</p>
        </div>
      ) : (
        <div className="flagged-articles-list">
          {flaggedArticles.map((article, index) => (
            <div key={index} className="flagged-article-item">
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <p className="news-source">
                Source: {article.source || "Unknown"} |
                <a href={article.url} target="_blank" rel="noopener noreferrer"> Read more</a>
              </p>
              <div className="flagged-reason">
                <strong>Reason for flagging:</strong> {article.flagReason || "Not specified"}
              </div>
              <div className="action-buttons">
                <button 
                  className="keep-button" 
                  onClick={() => handleKeepArticle(article.url)}
                >
                  Keep (False Flag)
                </button>
                <button 
                  className="delete-button" 
                  onClick={() => handleDeleteArticle(article.url)}
                >
                  Delete Article
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FlaggedArticles;