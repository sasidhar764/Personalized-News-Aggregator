import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./personalize.css";

// handleReadMore function to increment view count
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
  } catch (error) {
    console.error("Error logging read more event", error);
  }
};

function PersonalizedNews() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchPersonalizedNews = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const user = JSON.parse(localStorage.getItem("user"));
        const username = user?.username;

        if (!username) {
          console.error("Username not found in local storage");
          return;
        }

        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/news/preferred`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ username }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch personalized news");
        }

        const data = await response.json();
        setNews(data || []);
      } catch (error) {
        console.error("Error fetching personalized news", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonalizedNews();
  }, [navigate]);

  const handleBookmark = async (article) => {
    if (!userData) {
      console.error("User data is not available");
      return;
    }
    try {
      await fetch(`${process.env.REACT_APP_SERVER_URL}/news/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          username: userData.username,
          url: article.url,
        }),
      });
      alert("Article bookmarked successfully!");
    } catch (error) {
      console.error("Error bookmarking article", error);
      alert("Failed to bookmark article");
    }
  };

  const handleFlag = async (article) => {
    if (!userData) {
      console.error("User data is not available");
      return;
    }

    try {
      await fetch(`${process.env.REACT_APP_SERVER_URL}/news/reportarticle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          username: userData.username,
          url: article.url,
        }),
      });

      alert("Article flagged for review and removed from display!");
    } catch (error) {
      console.error("Error flagging article", error);
      alert("Failed to flag article");
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNews = news.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(news.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generate pagination items with ellipsis
  const getPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5; // Show current page + 2 on each side if possible

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <button
            key={i}
            onClick={() => paginate(i)}
            className={`pagination-btn ${currentPage === i ? "active" : ""}`}
          >
            {i}
          </button>
        );
      }
    } else {
      // Always show first page
      items.push(
        <button
          key={1}
          onClick={() => paginate(1)}
          className={`pagination-btn ${currentPage === 1 ? "active" : ""}`}
        >
          1
        </button>
      );

      // Show ellipsis if needed before current page range
      if (currentPage > 3) {
        items.push(<span key="start-ellipsis" className="pagination-ellipsis">...</span>);
      }

      // Show pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <button
            key={i}
            onClick={() => paginate(i)}
            className={`pagination-btn ${currentPage === i ? "active" : ""}`}
          >
            {i}
          </button>
        );
      }

      // Show ellipsis if needed after current page range
      if (currentPage < totalPages - 2) {
        items.push(<span key="end-ellipsis" className="pagination-ellipsis">...</span>);
      }

      // Always show last page
      items.push(
        <button
          key={totalPages}
          onClick={() => paginate(totalPages)}
          className={`pagination-btn ${currentPage === totalPages ? "active" : ""}`}
        >
          {totalPages}
        </button>
      );
    }

    return items;
  };

  if (isLoading) {
    return <div className="loading-personalize">Loading personalized news...</div>;
  }

  return (
    <div className="personalized-news-container-personalize">
      <h1>Personalized News</h1>
      <div className="news-list-personalize">
        {currentNews.length > 0 ? (
          currentNews.map((article, index) => (
            <div key={index} className="news-item-personalize">
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <p className="news-source-personalize">
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
              <div className="news-actions-personalize">
                <button onClick={() => handleBookmark(article)}>Bookmark</button>
                <button onClick={() => handleFlag(article)}>Flag</button>
              </div>
            </div>
          ))
        ) : (
          <p>No personalized news available.</p>
        )}
      </div>

      {/* Pagination Controls */}
      {news.length > itemsPerPage && (
        <div className="pagination-personalize">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          {getPaginationItems()}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default PersonalizedNews;