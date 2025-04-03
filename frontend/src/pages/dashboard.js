import React, { useState, useEffect, useRef } from "react";
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
  const [showShareOptions, setShowShareOptions] = useState({});
  const shareButtonRefs = useRef({});
  const cardsPerPage = 9;
  const navigate = useNavigate();

  // Fetch headlines initially
  const fetchHeadlines = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news/headlines`);
      const data = await response.json();
      setNews(data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  // Initial data fetch
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
        await fetchHeadlines();
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Handle click outside share options
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideShareButton = Object.values(shareButtonRefs.current).some(
        (ref) => ref && ref.contains(event.target)
      );
      if (!isClickInsideShareButton) {
        setShowShareOptions({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      console.error("Error logging read more event:", error);
    }
  };

  const handleBookmark = async (article) => {
    if (!userData) return console.error("User data not available");
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
      console.error("Error bookmarking article:", error);
      alert("Failed to bookmark article");
    }
  };

  const handleFlag = async (article) => {
    if (!userData) return console.error("User data not available");
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
      console.error("Error flagging article:", error);
      alert("Failed to flag article");
    }
  };

  const toggleShareOptions = (articleUrl) => {
    setShowShareOptions((prev) => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [articleUrl]: !prev[articleUrl],
    }));
  };

  const handleShare = async (article, platform) => {
    if (!userData) return alert("Please login to share articles");
    try {
      await fetch(`${process.env.REACT_APP_SERVER_URL}/news/trackshare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ 
          username: userData.username, 
          url: article.url, 
          platform 
        }),
      });

      const shareUrl = encodeURIComponent(article.url);
      const shareTitle = encodeURIComponent(article.title);
      const shareLinks = {
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
        whatsapp: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
        email: `mailto:?subject=${shareTitle}&body=Check%20out%20this%20article:%20${shareUrl}`,
      };

      if (shareLinks[platform]) {
        window.open(shareLinks[platform], '_blank', 'noopener,noreferrer');
        toggleShareOptions(article.url);
      }
    } catch (error) {
      console.error("Error sharing article:", error);
      alert("Failed to share article");
    }
  };

  const fetchFilteredAndSearchedNews = async (searchTerm, filters) => {
    try {
      const requestBody = { ...(searchTerm && { search: searchTerm }), ...(filters || {}) };
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
      console.error("Error fetching filtered/searched news:", error);
      alert("Failed to fetch news");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return clearSearch();
    setIsSearching(true);
    await fetchFilteredAndSearchedNews(searchQuery, isFiltering ? activeFilters : null);
  };

  const clearSearch = async () => {
    setSearchQuery("");
    setIsSearching(false);
    await (isFiltering && activeFilters 
      ? fetchFilteredAndSearchedNews(null, activeFilters) 
      : fetchHeadlines());
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!value) clearSearch();
  };

  const handleApplyFilter = async (filters) => {
    setIsFiltering(true);
    setActiveFilters(filters);
    await fetchFilteredAndSearchedNews(isSearching ? searchQuery : null, filters);
  };

  const handleClearFilters = async () => {
    setIsFiltering(false);
    setActiveFilters(null);
    await (searchQuery.trim() 
      ? fetchFilteredAndSearchedNews(searchQuery, null) 
      : fetchHeadlines());
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

      if (currentPage > 3) items.push(<span key="start-ellipsis" className="pagination-ellipsis">...</span>);

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

      if (currentPage < totalPages - 2) items.push(<span key="end-ellipsis" className="pagination-ellipsis">...</span>);

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

  if (isLoading) return <div className="loading-dashboard">Loading your news...</div>;

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
                key={article.url || index} // Use unique URL if available
                className="news-item-dashboard"
                style={{ "--animation-index": index }}
              >
                <h3>{article.title}</h3>
                <p>{article.description}</p>
                <div className="news-source-dashboard">
                  <span>{article.source || "Unknown"}</span> | 
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleReadMore(article.url)}
                  >
                    Read More
                  </a>
                </div>
                <div className="news-actions-dashboard">
                  <button
                    className="news-action-btn-dashboard"
                    onClick={() => handleBookmark(article)}
                    aria-label="Bookmark article"
                  >
                    <FaBookmark className="action-icon-dashboard" /> Bookmark
                  </button>
                  <button
                    className="news-action-btn-dashboard"
                    onClick={() => handleFlag(article)}
                    aria-label="Flag article"
                  >
                    <FaFlag className="action-icon-dashboard" /> Flag
                  </button>
                  <button
                    className={`news-action-btn-dashboard share-btn-dashboard ${showShareOptions[article.url] ? "show-share-options" : ""}`}
                    onClick={() => toggleShareOptions(article.url)}
                    ref={(el) => (shareButtonRefs.current[article.url] = el)}
                    aria-label="Share article"
                  >
                    <FaShareAlt className="action-icon-dashboard" /> Share
                    <div className="share-options">
                      <button
                        className="share-icon twitter"
                        title="Share on Twitter"
                        onClick={() => handleShare(article, "twitter")}
                      >
                        <FaTwitter />
                      </button>
                      <button
                        className="share-icon whatsapp"
                        title="Share on WhatsApp"
                        onClick={() => handleShare(article, "whatsapp")}
                      >
                        <FaWhatsapp />
                      </button>
                      <button
                        className="share-icon linkedin"
                        title="Share on LinkedIn"
                        onClick={() => handleShare(article, "linkedin")}
                      >
                        <FaLinkedin />
                      </button>
                      <button
                        className="share-icon email"
                        title="Share via Email"
                        onClick={() => handleShare(article, "email")}
                      >
                        <FaEnvelope />
                      </button>
                    </div>
                  </button>
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
              aria-label="Previous page"
            >
              <FaAngleLeft />
            </button>
            {getPaginationItems()}
            <button
              className="pagination-btn-dashboard"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
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