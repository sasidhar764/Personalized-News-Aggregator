import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./flaggedarticles.css";

function FlaggedArticles() {
  const navigate = useNavigate();
  const [flaggedArticles, setFlaggedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
      console.log("articleurl", articleUrl);
      
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

      setFlaggedArticles(flaggedArticles.filter(article => article.url !== articleUrl));
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Failed to delete article: " + error.message);
    }
  };
    
  const handleKeepArticle = async (articleUrl) => {
    console.log("url", articleUrl);
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

      setFlaggedArticles(flaggedArticles.filter(article => article.url !== articleUrl));
    } catch (error) {
      console.error("Error unflagging article:", error);
      alert("Failed to unflag article: " + error.message);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(flaggedArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArticles = flaggedArticles.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return <div className="loading-flagged">Loading flagged articles...</div>;
  }

  if (error) {
    return <div className="error-flagged">Error: {error}</div>;
  }

  return (
    <div className="flagged-articles-container-flagged">
      <header className="content-header-flagged">
        <h1>Flagged Articles</h1>
      </header>

      {flaggedArticles.length === 0 ? (
        <div className="no-articles-flagged">
          <p>No flagged articles found.</p>
        </div>
      ) : (
        <>
          <div className="flagged-articles-list-flagged">
            {currentArticles.map((article, index) => (
              <div key={index} className="flagged-article-item-flagged">
                <div className="content-wrapper">
                  <h3>{article.title}</h3>
                  <p>{article.description}</p>
                  <p className="news-source-flagged">
                    Source: {article.source || "Unknown"} |
                    <a href={article.url} target="_blank" rel="noopener noreferrer"> Read more</a>
                  </p>
                  {article.flagReason && article.flagReason !== "Not specified" && (
                    <div className="flagged-reason-flagged">
                      <strong>Reason for flagging:</strong> {article.flagReason}
                    </div>
                  )}
                </div>
                <div className="action-buttons-flagged">
                  <button
                    className="keep-button-flagged"
                    onClick={() => handleKeepArticle(article.url)}
                  >
                    Keep
                  </button>
                  <button
                    className="delete-button-flagged"
                    onClick={() => handleDeleteArticle(article.url)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-flagged">
              <button
                className="pagination-nav-button-flagged"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                PREV
              </button>
              <div className="pagination-numbers-flagged">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    className={`pagination-button-flagged ${currentPage === index + 1 ? "active" : ""}`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <button
                className="pagination-nav-button-flagged"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                NEXT
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FlaggedArticles;