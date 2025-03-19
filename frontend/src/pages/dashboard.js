import React, { useState, useEffect } from "react";
import NewsFilter from "./filter";
import "./dashboard.css";
import "./filter.css";
import {
  FaBookmark,
  FaFlag,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [news, setNews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);

  // Define handleReadMore function
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

  // Define fetchHeadlines as a standalone function so it can be called elsewhere
  const fetchHeadlines = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news/headlines`);
      const data = await response.json();
      setNews(data || []);
    } catch (error) {
      console.error("Error fetching news", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUserData(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error fetching user data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    fetchHeadlines(); // Use the standalone function here
  }, []);

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
      setNews((prevNews) => prevNews.filter((newsArticle) => newsArticle.url !== article.url));

      alert("Article flagged for review and removed from display!");
    } catch (error) {
      console.error("Error flagging article", error);
      alert("Failed to flag article");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }

    setIsSearching(true);
    setIsFiltering(false);
    setActiveFilters(null);
    console.log("hi",searchQuery)

    try {
      const requestBody = { search: searchQuery };
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to search for news");
      }

      const data = await response.json();
      setNews(data || []);
    } catch (error) {
      console.error("Error searching news", error);
      alert("Failed to search for news");
    }
  };

  const clearSearch = async () => {
    setSearchQuery("");
    setIsSearching(false);

    if (isFiltering && activeFilters) {
      // If filters are active, reapply them
      handleApplyFilter(activeFilters);
    } else {
      // Otherwise fetch headlines
      fetchHeadlines();
    }
  };

  const handleApplyFilter = async (filters) => {
    setIsFiltering(true);
    setIsSearching(false);
    setSearchQuery("");
    setActiveFilters(filters);

    try {
      const requestBody = { ...filters };
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to filter news");
      }

      const data = await response.json();
      setNews(data || []);
    } catch (error) {
      console.error("Error applying filters", error);
      alert("Failed to filter news");
    }
  };

  const handleClearFilters = async () => {
    setIsFiltering(false);
    setActiveFilters(null);

    if (searchQuery.trim()) {
      // If there's a search query, reapply just the search
      handleSearch({ preventDefault: () => {} });
    } else {
      // Otherwise fetch headlines
      fetchHeadlines();
    }
  };

  if (isLoading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="content-wrapper">
      <header className="content-header">
        <h1>News Dashboard</h1>

        {/* Search and Filter Section */}
        <div className="search-and-filter-container">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news..."
                className="search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            <button type="submit" className="search-btn">
              <FaSearch /> Search
            </button>
          </form>

          {/* News Filter Component */}
          <NewsFilter
            onApplyFilter={handleApplyFilter}
            onClearFilter={handleClearFilters}
            currentPreferences={{
              category: userData?.preferredCategory || "",
            }}
          />
        </div>
      </header>

      <div className="news-section">
        <h2 className="news-title">
          {isSearching && isFiltering
            ? "Search & Filter Results"
            : isSearching
            ? "Search Results"
            : isFiltering
            ? "Filtered News"
            : "Headlines"}
        </h2>
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
                    onClick={() => handleReadMore(article.url)}
                  >
                    {" "}
                    Read more
                  </a>
                </p>
                <div className="news-actions">
                  <button className="news-action-btn" onClick={() => handleBookmark(article)}>
                    <FaBookmark className="action-icon" /> Bookmark
                  </button>
                  <button className="news-action-btn" onClick={() => handleFlag(article)}>
                    <FaFlag className="action-icon" /> Flag
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              {isSearching && isFiltering
                ? "No articles found matching your search and filters. Try different criteria."
                : isSearching
                ? "No articles found matching your search. Try different keywords."
                : isFiltering
                ? "No articles found with the selected filters. Try different filter options."
                : "No headlines available at the moment."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;