import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookmark, FaTimes } from "react-icons/fa"; // FaBookmark is now used
import "./bookmark.css"; // Optional: Create a CSS file for styling

function Bookmarks() {
  const navigate = useNavigate();
  const [bookmarkedNews, setBookmarkedNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarkedNews = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const user = JSON.parse(localStorage.getItem("user")); // eslint-disable-line no-unused-vars
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news/getbookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: user.username,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch bookmarked news");
        }

        const data = await response.json();
        setBookmarkedNews(data);
      } catch (error) {
        console.error("Error fetching bookmarked news", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarkedNews();
  }, [navigate]);

  const handleRemoveBookmark = async (article) => {
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
          url: article.url,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove bookmark");
      }

      // Remove the article from the local state
      setBookmarkedNews((prev) => prev.filter((newsArticle) => newsArticle.url !== article.url));
      alert("Bookmark removed successfully!");
    } catch (error) {
      console.error("Error removing bookmark", error);
      alert("Failed to remove bookmark");
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

      // Open the article URL in a new tab
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error logging read more event", error);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading bookmarks...</div>;
  }

  return (
    <div className="bookmarks-page">
      <h1>
        <FaBookmark className="bookmark-icon" /> Bookmarked News
      </h1>
      <div className="bookmarks-list">
        {bookmarkedNews.length > 0 ? (
          bookmarkedNews.map((article, index) => (
            <div key={index} className="bookmark-item">
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <p className="news-source">
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
              <div className="bookmark-actions">
                <button
                  className="remove-bookmark-btn"
                  onClick={() => handleRemoveBookmark(article)}
                >
                  <FaTimes className="action-icon" /> Remove Bookmark
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">No bookmarked articles found.</div>
        )}
      </div>
    </div>
  );
}

export default Bookmarks;