import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NewsFilter from "./filter";
import "./dashboard.css";
import "./filter.css";
import { 
  FaBookmark, 
  FaFlag, 
  FaSearch, 
  FaTimes, 
  FaAngleLeft, 
  FaAngleRight,
  FaShareAlt,
  FaLinkedin,
  FaWhatsapp,
  FaTwitter,
  FaEnvelope
} from "react-icons/fa";

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [news, setNews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeShareIndex, setActiveShareIndex] = useState(null);
  const cardsPerPage = 9;
  const navigate = useNavigate();

  const handleReadMore = async (url) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news/incrementviewcount`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) throw new Error("Failed to log read more event");
    } catch (error) {
      console.error("Error logging read more event", error);
    }
  };

  const fetchHeadlines = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news/headlines`);
      const data = await response.json();
      setNews(data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching news", error);
    }
  };

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      navigate('/');
      return;
    }

    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUserData(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error fetching user data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    fetchHeadlines();
  }, [navigate]);

  // Click outside handler to close share menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeShareIndex !== null && !event.target.closest('.share-menu-dashboard') && 
          !event.target.closest('.share-btn-dashboard')) {
        setActiveShareIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeShareIndex]);

  const handleBookmark = async (article) => {
    if (!userData) return console.error("User data is not available");
    try {
      await fetch(`${process.env.REACT_APP_SERVER_URL}/news/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ username: userData.username, url: article.url }),
      });
      alert("Article bookmarked successfully!");
    } catch (error) {
      console.error("Error bookmarking article", error);
      alert("Failed to bookmark article");
    }
  };

  const handleFlag = async (article) => {
    if (!userData) return console.error("User data is not available");
    try {
      await fetch(`${process.env.REACT_APP_SERVER_URL}/news/reportarticle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ username: userData.username, url: article.url }),
      });
      setNews((prevNews) => prevNews.filter((item) => item.url !== article.url));
      alert("Article flagged for review and removed!");
    } catch (error) {
      console.error("Error flagging article", error);
      alert("Failed to flag article");
    }
  };

  const handleShareToggle = (index) => {
    setActiveShareIndex(activeShareIndex === index ? null : index);
  };

  const handleShare = (article, platform) => {
    const shareUrl = encodeURIComponent(article.url);
    const shareTitle = encodeURIComponent(article.title);
    let shareLink = '';

    switch (platform) {
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${shareTitle}%20${shareUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${shareTitle}&body=Check%20out%20this%20article:%20${shareUrl}`;
        break;
      default:
        console.error('Invalid sharing platform');
        return;
    }

    // Track share event
    try {
      fetch(`${process.env.REACT_APP_SERVER_URL}/news/trackshare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ 
          username: userData?.username, 
          url: article.url,
          platform: platform 
        }),
      });
    } catch (error) {
      console.error("Error logging share event", error);
    }

    // Open share link in new window
    window.open(shareLink, '_blank');
    setActiveShareIndex(null);
  };

  const fetchFilteredAndSearchedNews = async (searchTerm, filters) => {
    try {
      const requestBody = searchTerm ? { search: searchTerm } : {};
      if (filters) Object.assign(requestBody, filters);
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) throw new Error("Failed to fetch news");
      const data = await response.json();
      setNews(data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching news with combined criteria", error);
      alert("Failed to fetch news");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      clearSearch();
      return;
    }
    setIsSearching(true);
    fetchFilteredAndSearchedNews(searchQuery, isFiltering && activeFilters ? activeFilters : null);
  };

  const clearSearch = async () => {
    setSearchQuery("");
    setIsSearching(false);
    if (isFiltering && activeFilters) {
      fetchFilteredAndSearchedNews(null, activeFilters);
    } else {
      fetchHeadlines();
    }
  };

  const handleSearchInputChange = (e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    
    if (newValue === "") {
      setIsSearching(false);
      if (isFiltering && activeFilters) {
        fetchFilteredAndSearchedNews(null, activeFilters);
      } else {
        fetchHeadlines();
      }
    }
  };

  const handleApplyFilter = async (filters) => {
    setIsFiltering(true);
    setActiveFilters(filters);
    fetchFilteredAndSearchedNews(isSearching && searchQuery ? searchQuery : null, filters);
  };

  const handleClearFilters = async () => {
    setIsFiltering(false);
    setActiveFilters(null);
    if (searchQuery.trim()) {
      fetchFilteredAndSearchedNews(searchQuery, null);
    } else {
      fetchHeadlines();
    }
  };

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = news.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(news.length / cardsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow + 2) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <button
            key={i}
            className={`pagination-btn-dashboard ${currentPage === i ? "active" : ""}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        );
      }
    } else {
      items.push(
        <button
          key={1}
          className={`pagination-btn-dashboard ${currentPage === 1 ? "active" : ""}`}
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );

      if (currentPage > 3) {
        items.push(<span key="start-ellipsis" className="pagination-ellipsis">...</span>);
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <button
            key={i}
            className={`pagination-btn-dashboard ${currentPage === i ? "active" : ""}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(<span key="end-ellipsis" className="pagination-ellipsis">...</span>);
      }

      items.push(
        <button
          key={totalPages}
          className={`pagination-btn-dashboard ${currentPage === totalPages ? "active" : ""}`}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return items;
  };

  if (isLoading) {
    return <div className="loading-dashboard">Loading your news...</div>;
  }

  return (
    <div className="content-wrapper-dashboard">
      <header className="content-header-dashboard">
        <h1>Daily Dispatch</h1>
        <div className="search-and-filter-container-dashboard">
          <form onSubmit={handleSearch} className="search-form-dashboard">
            <div className="search-input-container-dashboard">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Explore the headlines..."
                className="search-input-dashboard"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn-dashboard"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            <button type="submit" className="search-btn-dashboard">
              <FaSearch /> Search
            </button>
          </form>
          <NewsFilter
            onApplyFilter={handleApplyFilter}
            onClearFilter={handleClearFilters}
            currentPreferences={{ category: userData?.preferredCategory || "" }}
          />
        </div>
      </header>

      <section className="news-section-dashboard">
        <h2 className="news-title-dashboard">
          {isSearching && isFiltering
            ? "Search & Filter Results"
            : isSearching
            ? "Search Results"
            : isFiltering
            ? "Filtered News"
            : "Today's Headlines"}
        </h2>
        <div className="news-list-dashboard">
          {currentCards.length > 0 ? (
            currentCards.map((article, index) => (
              <article
                key={index}
                className="news-item-dashboard"
                style={{ "--animation-index": index }}
              >
                <h3>{article.title}</h3>
                <p>{article.description}</p>
                <p className="news-source-dashboard">
                  <span>{article.source || "Unknown"}</span> |{" "}
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleReadMore(article.url)}
                  >
                    Read More
                  </a>
                </p>
                <div className="news-actions-dashboard">
                  <button
                    className="news-action-btn-dashboard"
                    onClick={() => handleBookmark(article)}
                  >
                    <FaBookmark className="action-icon-dashboard" /> Bookmark
                  </button>
                  <button
                    className="news-action-btn-dashboard"
                    onClick={() => handleFlag(article)}
                  >
                    <FaFlag className="action-icon-dashboard" /> Flag
                  </button>
                  <div className="share-container-dashboard">
                    <button
                      className="news-action-btn-dashboard share-btn-dashboard"
                      onClick={() => handleShareToggle(index)}
                    >
                      <FaShareAlt className="action-icon-dashboard" /> Share
                    </button>
                    {activeShareIndex === index && (
                      <div className="share-menu-dashboard">
                        <button 
                          className="share-option-dashboard" 
                          onClick={() => handleShare(article, 'linkedin')}
                          aria-label="Share on LinkedIn"
                        >
                          <FaLinkedin className="share-icon-dashboard linkedin" /> LinkedIn
                        </button>
                        <button 
                          className="share-option-dashboard" 
                          onClick={() => handleShare(article, 'whatsapp')}
                          aria-label="Share on WhatsApp"
                        >
                          <FaWhatsapp className="share-icon-dashboard whatsapp" /> WhatsApp
                        </button>
                        <button 
                          className="share-option-dashboard" 
                          onClick={() => handleShare(article, 'twitter')}
                          aria-label="Share on Twitter"
                        >
                          <FaTwitter className="share-icon-dashboard twitter" /> Twitter
                        </button>
                        <button 
                          className="share-option-dashboard" 
                          onClick={() => handleShare(article, 'email')}
                          aria-label="Share via Email"
                        >
                          <FaEnvelope className="share-icon-dashboard email" /> Email
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="no-results-dashboard">
              {isSearching && isFiltering
                ? "No stories match your search and filters."
                : isSearching
                ? "No stories found for your search."
                : isFiltering
                ? "No stories match your filters."
                : "No headlines available right now."}
            </div>
          )}
        </div>

        {news.length > cardsPerPage && (
          <div className="pagination-dashboard">
            <button
              className="pagination-btn-dashboard"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FaAngleLeft />
            </button>
            {getPaginationItems()}
            <button
              className="pagination-btn-dashboard"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FaAngleRight />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;