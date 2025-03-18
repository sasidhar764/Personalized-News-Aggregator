import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CategoryPreferences from "../components/dashboard/updateuser";
import NewsFilter from "./filter";
import "./dashboard.css";
import "./filter.css";
import {
  FaHome,
  FaUser,
  FaNewspaper,
  FaSignOutAlt,
  FaShieldAlt,
  FaBars,
  FaFlag,
  FaBookmark,
  FaStar,
  FaSearch,
  FaTimes,
  FaEnvelope,
} from "react-icons/fa";

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

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [news, setNews] = useState([]);
  const [navOpen, setNavOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);

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

    const fetchNews = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news/headlines`);
        const data = await response.json();
        console.log("News API Response:", data);
        setNews(data || []);
      } catch (error) {
        console.error("Error fetching news", error);
      }
    };

    fetchUserData();
    fetchNews();
  }, []);

  const handleCategoryUpdate = (newCategory) => {
    setUserData((prev) => ({
      ...prev,
      preferredCategory: newCategory,
    }));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleAdminRedirect = () => {
    navigate("/admin");
  };

  const handleFlaggedArticlesRedirect = () => {
    navigate("/flagged-articles");
  };

  const handlePersonalizedNewsRedirect = () => {
    navigate("/personalized-news");
  };

  const toggleNav = () => {
    setNavOpen(!navOpen);
  };

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

    try {
      const requestBody = { search: searchQuery };
      console.log("Sending search request with query:", requestBody);

      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data)) {
        setNews(data);
      } else {
        setNews([]);
      }
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

  const fetchHeadlines = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news/headlines`);
      const data = await response.json();
      setNews(data || []);
    } catch (error) {
      console.error("Error fetching news", error);
    }
  };

  const handleApplyFilter = async (filters) => {
    setIsFiltering(true);
    setIsSearching(false);
    setSearchQuery("");
    setActiveFilters(filters);

    try {
      const requestBody = {
        ...filters,
      };

      // If there's a search query, include it
      if (searchQuery.trim()) {
        requestBody.search = searchQuery;
        setIsSearching(true);
      }

      console.log("Applying filters:", requestBody);

      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data)) {
        setNews(data);
      } else {
        setNews([]);
      }
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

  const handleEmailUpdate = async (enable) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news/togglesummary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          username: userData.username,
          enable: enable,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update email preferences");
      }

      // Update local storage with the new summary flag
      const updatedUser = { ...userData, summary: enable };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUserData(updatedUser);

      alert(`Email updates ${enable ? "enabled" : "disabled"} successfully!`);
      setShowEmailModal(false); // Close the modal
    } catch (error) {
      console.error("Error updating email preferences", error);
      alert("Failed to update email preferences");
    }
  };

  const openEmailModal = () => {
    setShowEmailModal(true);
  };

  if (isLoading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-layout">
      {/* Side Navigation Bar */}
      <div className={`side-nav ${navOpen ? "open" : "closed"}`}>
        <div className="nav-header">
          {navOpen && <h2 className="nav-logo">NewsApp</h2>}
          <button className="nav-toggle" onClick={toggleNav}>
            <FaBars />
          </button>
        </div>

        <div className="nav-user-info">
          <div className="user-avatar">
            <FaUser />
          </div>
          {navOpen && (
            <span className="user-name">
              {userData?.username
                ? userData.username.charAt(0).toUpperCase() + userData.username.slice(1)
                : "User"}
            </span>
          )}
        </div>

        <div className="nav-items">
          <div className="nav-item active">
            <FaHome className="nav-icon" />
            {navOpen && <span className="nav-label">Dashboard</span>}
          </div>
          <div className="nav-item" onClick={() => setShowCategoryModal(true)}>
            <FaNewspaper className="nav-icon" />
            {navOpen && <span className="nav-label">Preferences</span>}
          </div>
          <div className="nav-item" onClick={handlePersonalizedNewsRedirect}>
            <FaStar className="nav-icon" />
            {navOpen && <span className="nav-label">Personalized News</span>}
          </div>
          <div className="nav-item" onClick={() => navigate("/bookmarks")}>
            <FaBookmark className="nav-icon" />
            {navOpen && <span className="nav-label">Bookmarks</span>}
          </div>
          <div className="nav-item" onClick={openEmailModal}>
            <FaEnvelope className="nav-icon" />
            {navOpen && <span className="nav-label">Email Updates</span>}
          </div>
          {userData.role === "admin" && (
            <div className="nav-item" onClick={handleFlaggedArticlesRedirect}>
              <FaFlag className="nav-icon" />
              {navOpen && <span className="nav-label">Flagged Articles</span>}
            </div>
          )}
          {userData.role === "admin" && (
            <div className="nav-item" onClick={handleAdminRedirect}>
              <FaShieldAlt className="nav-icon" />
              {navOpen && <span className="nav-label">Admin</span>}
            </div>
          )}
        </div>

        <div className="nav-footer">
          <div className="logout-item" onClick={handleLogout}>
            <FaSignOutAlt className="nav-icon" />
            {navOpen && <span className="nav-label">Logout</span>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${navOpen ? "nav-open" : "nav-closed"}`}>
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
      </div>

      {/* Category Preferences Modal */}
      {showCategoryModal && (
        <div className="modal-overlay">
          <CategoryPreferences
            currentCategory={userData?.preferredCategory}
            userDetails={userData}
            onUpdateSuccess={handleCategoryUpdate}
            onClose={() => setShowCategoryModal(false)}
          />
        </div>
      )}

      {/* Email Updates Modal */}
      {showEmailModal && (
        <div className="modal-overlay">
          <div className="email-modal">
            <h2>Email Updates</h2>
            {userData?.summary === false ? (
              <p>Would you like to enable email updates?</p>
            ) : (
              <p>Would you like to disable email updates?</p>
            )}
            <div className="email-modal-buttons">
              <button
                className="email-modal-btn"
                onClick={() => handleEmailUpdate(!userData?.summary)}
              >
                {userData?.summary === false ? "Enable" : "Disable"}
              </button>
              <button className="email-modal-btn" onClick={() => setShowEmailModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;