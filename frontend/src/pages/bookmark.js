import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookmark, FaTimes } from "react-icons/fa";
import "./bookmark.css";

function Bookmarks() {
  const navigate = useNavigate();
  const [bookmarkedNews, setBookmarkedNews] = useState([]);
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

    fetchBookmarkedNews();
  }, [navigate]);

  const fetchBookmarkedNews = async () => {
    setIsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news/getbookmarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          username: user.username,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bookmarked news");
      }

      const data = await response.json();
      setBookmarkedNews(data || []);
    } catch (error) {
      console.error("Error fetching bookmarked news:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBookmark = async (articleUrl) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          username: user.username,
          url: articleUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove bookmark");
      }

      setBookmarkedNews((prev) => prev.filter((newsArticle) => newsArticle.url !== articleUrl));
      alert("Bookmark removed successfully!");
    } catch (error) {
      console.error("Error removing bookmark:", error);
      alert("Failed to remove bookmark: " + error.message);
    }
  };

  const handleReadMore = async (url) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news/incrementviewcount`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          url: url,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to log read more event");
      }

      window.open(url, "_blank");
    } catch (error) {
      console.error("Error logging read more event:", error);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(bookmarkedNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookmarks = bookmarkedNews.slice(startIndex, endIndex);

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
    return <div className="loading-bookmark">Loading bookmarked articles...</div>;
  }

  if (error) {
    return <div className="error-bookmark">Error: {error}</div>;
  }

  return (
    <div className="bookmarks-container-bookmark">
      <header className="content-header-bookmark">
        <h1>
          <FaBookmark className="bookmark-icon-bookmark" /> Bookmarked News
        </h1>
      </header>

      {bookmarkedNews.length === 0 ? (
        <div className="no-articles-bookmark">
          <p>No bookmarked articles found.</p>
        </div>
      ) : (
        <>
          <div className="bookmarks-list-bookmark">
            {currentBookmarks.map((article, index) => (
              <div key={index} className="bookmark-item-bookmark">
                <div className="content-wrapper">
                  <h3>{article.title}</h3>
                  <p>{article.description}</p>
                  <p className="news-source-bookmark">
                    Source: {article.source || "Unknown"} |
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleReadMore(article.url)}
                    >
                      {" "}
                      Read more
                    </a>
                  </p>
                </div>
                <div className="action-buttons-bookmark">
                  <button
                    className="remove-button-bookmark"
                    onClick={() => handleRemoveBookmark(article.url)}
                    aria-label={`Remove bookmark for ${article.title}`}
                  >
                    <FaTimes className="action-icon-bookmark" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-bookmark">
              <button
                className="pagination-nav-button-bookmark"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                PREV
              </button>
              <div className="pagination-numbers-bookmark">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    className={`pagination-button-bookmark ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <button
                className="pagination-nav-button-bookmark"
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

export default Bookmarks;