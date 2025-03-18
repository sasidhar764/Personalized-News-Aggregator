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
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user")); // Get user data from local storage

  useEffect(() => {
    const fetchPersonalizedNews = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        // Get the username from local storage
        const user = JSON.parse(localStorage.getItem("user"));
        const username = user?.username;

        if (!username) {
          console.error("Username not found in local storage");
          return;
        }

        // Fetch personalized news using the username
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/news/preferred`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ username }), // Send username in the request body
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

      // Remove the flagged article from the news array
      // setNews((prevNews) => prevNews.filter((newsArticle) => newsArticle.url !== article.url));

      alert("Article flagged for review and removed from display!");
    } catch (error) {
      console.error("Error flagging article", error);
      alert("Failed to flag article");
    }
  };

  if (isLoading) {
    return <div className="loading">Loading personalized news...</div>;
  }

  return (
    <div className="personalized-news-container">
      <h1>Personalized News</h1>
      <div className="news-list">
        {news.length > 0 ? (
          news.map((article, index) => (
            <div key={index} className="news-item">
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <p className="news-source">
                Source: {article.source || "Unknown"} |
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleReadMore(article.url)} // Call handleReadMore here
                >
                  {" "}
                  Read more
                </a>
              </p>
              <div className="news-actions">
                <button onClick={() => handleBookmark(article)}>Bookmark</button>
                <button onClick={() => handleFlag(article)}>Flag</button>
              </div>
            </div>
          ))
        ) : (
          <p>No personalized news available.</p>
        )}
      </div>
    </div>
  );
}

export default PersonalizedNews;