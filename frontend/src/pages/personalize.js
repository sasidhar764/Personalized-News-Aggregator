import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./personalize.css";

// Handle read more to increment view count
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

function PersonalizedNews() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [showShareOptions, setShowShareOptions] = useState({});
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user"));
  const shareButtonRefs = useRef({}); // To handle click-outside for share options

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

        if (!username) throw new Error("Username not found in local storage");

        console.log("Fetching personalized news for:", username);
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news/preferred`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username }),
        });

        if (!response.ok) throw new Error("Failed to fetch personalized news");

        const data = await response.json();
        console.log("Fetched personalized news:", data?.length || 0, "articles");
        setNews(data || []);
      } catch (error) {
        console.error("Error fetching personalized news:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonalizedNews();
  }, [navigate]);

  // Click outside handler to close share options
  useEffect(() => {
    const handleClickOutside = (event) => {
      let isClickInsideShareButton = false;
      Object.values(shareButtonRefs.current).forEach((ref) => {
        if (ref && ref.contains(event.target)) {
          isClickInsideShareButton = true;
        }
      });

      if (!isClickInsideShareButton) {
        setShowShareOptions({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBookmark = async (article) => {
    if (!userData) return console.error("User data is not available");
    try {
      console.log("Bookmarking article:", article.title);
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
    if (!userData) return console.error("User data is not available");
    try {
      console.log("Flagging article:", article.title);
      await fetch(`${process.env.REACT_APP_SERVER_URL}/news/reportarticle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ username: userData.username, url: article.url }),
      });
      setNews((prevNews) => prevNews.filter((item) => item.url !== article.url));
      alert("Article flagged for review and removed from display!");
    } catch (error) {
      console.error("Error flagging article:", error);
      alert("Failed to flag article");
    }
  };

  const toggleComments = (articleUrl) => {
    setExpandedComments((prev) => ({ ...prev, [articleUrl]: !prev[articleUrl] }));
    setShowShareOptions((prev) => ({ ...prev, [articleUrl]: false }));
  };

  const handleCommentChange = (articleUrl, value) => {
    setCommentInputs((prev) => ({ ...prev, [articleUrl]: value }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date error";
    }
  };

  const submitComment = async (article) => {
    if (!userData) return alert("Please login to comment");
    const comment = commentInputs[article.url]?.trim();
    if (!comment) return alert("Please enter a comment");

    try {
      const timestamp = new Date().toISOString();
      const formattedDate = formatDate(timestamp);
      const commentWithDate = `${comment} [Posted on: ${formattedDate}]`;

      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news/analyzecomments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          username: userData.username,
          url: article.url,
          comment: commentWithDate,
          timestamp,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        if (response.status === 403 && result.message === "Negative Comment") {
          alert("Your comment was flagged as negative and was not posted.");
        } else {
          throw new Error(result.error || "Failed to post comment");
        }
        return;
      }

      setNews((prevNews) =>
        prevNews.map((item) =>
          item.url === article.url
            ? {
                ...item,
                comments: [...(item.comments || []), { username: userData.username, comment: commentWithDate, timestamp }],
              }
            : item
        )
      );
      setCommentInputs((prev) => ({ ...prev, [article.url]: "" }));
      alert("Comment added successfully!");
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert(error.message || "Failed to submit comment");
    }
  };

  const deleteComment = async (article, commentUsername, commentTimestamp) => {
    if (!userData) return alert("Please login to delete comments");
    const isOwnComment = commentUsername === userData.username;
    const isAdmin = userData.role === "admin";
    if (!isOwnComment && !isAdmin) return alert("You can only delete your own comments or comments as an admin");

    const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news/deleteComment`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ username: commentUsername, url: article.url, timestamp: commentTimestamp }),
      });

      if (!response.ok) throw new Error((await response.json()).error || "Failed to delete comment");

      setNews((prevNews) =>
        prevNews.map((item) =>
          item.url === article.url
            ? { ...item, comments: (item.comments || []).filter((c) => c.timestamp !== commentTimestamp) }
            : item
        )
      );
      alert("Comment deleted successfully!");
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert(error.message || "Failed to delete comment");
    }
  };

  const toggleShareOptions = (articleUrl) => {
    setShowShareOptions((prev) => {
      const newState = {};
      // Close all other share options
      Object.keys(prev).forEach((key) => {
        newState[key] = false;
      });
      // Toggle the clicked one
      newState[articleUrl] = !prev[articleUrl];
      return newState;
    });
    setExpandedComments((prev) => ({ ...prev, [articleUrl]: false }));
  };

  const handleShare = async (article, platform) => {
    if (!userData) return alert("Please login to share articles");
    try {
      await fetch(`${process.env.REACT_APP_SERVER_URL}/news/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ username: userData.username, url: article.url, platform }),
      });
      window.open(generateShareUrl(article, platform), "_blank", "noopener,noreferrer");
      toggleShareOptions(article.url);
    } catch (error) {
      console.error("Error sharing article:", error);
      alert("Failed to share article");
    }
  };

  const generateShareUrl = (article, platform) => {
    const encodedTitle = encodeURIComponent(article.title);
    const encodedUrl = encodeURIComponent(article.url);
    const encodedText = encodeURIComponent(`${article.title} - ${article.url}`);
    switch (platform) {
      case "twitter":
        return `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
      case "whatsapp":
        return `https://wa.me/?text=${encodedText}`;
      case "linkedin":
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      case "email":
        return `mailto:?subject=${encodedTitle}&body=Check out this article: ${encodedUrl}`;
      default:
        return article.url;
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNews = news.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(news.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5;
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
      items.push(
        <button key={1} onClick={() => paginate(1)} className={`pagination-btn ${currentPage === 1 ? "active" : ""}`}>
          1
        </button>
      );
      if (currentPage > 3) items.push(<span key="start-ellipsis" className="pagination-ellipsis">...</span>);
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <button key={i} onClick={() => paginate(i)} className={`pagination-btn ${currentPage === i ? "active" : ""}`}>
            {i}
          </button>
        );
      }
      if (currentPage < totalPages - 2) items.push(<span key="end-ellipsis" className="pagination-ellipsis">...</span>);
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

  if (isLoading) return <div className="loading-personalize">Loading personalized news...</div>;

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
                Source: {article.source || "Unknown"} |{" "}
                <a href={article.url} target="_blank" rel="noopener noreferrer" onClick={() => handleReadMore(article.url)}>
                  Read more
                </a>
              </p>
              <div className="news-actions-personalize">
                <button onClick={() => handleBookmark(article)}>
                  <i className="fas fa-bookmark"></i> Bookmark
                </button>
                <button onClick={() => handleFlag(article)}>
                  <i className="fas fa-flag"></i> Flag
                </button>
                <button onClick={() => toggleComments(article.url)}>
                  <i className="fas fa-comment"></i> {expandedComments[article.url] ? "Hide Comments" : "Comments"}
                </button>
                <button
                  className={`share-btn-container ${showShareOptions[article.url] ? "show-share-options" : ""}`}
                  onClick={() => toggleShareOptions(article.url)}
                  ref={(el) => (shareButtonRefs.current[article.url] = el)}
                >
                  <i className="fas fa-share-alt"></i> Share
                  <div className="share-options">
                    <button className="share-icon twitter" title="Share on Twitter" onClick={() => handleShare(article, "twitter")}>
                      <i className="fab fa-twitter"></i>
                    </button>
                    <button className="share-icon whatsapp" title="Share on WhatsApp" onClick={() => handleShare(article, "whatsapp")}>
                      <i className="fab fa-whatsapp"></i>
                    </button>
                    <button className="share-icon linkedin" title="Share on LinkedIn" onClick={() => handleShare(article, "linkedin")}>
                      <i className="fab fa-linkedin"></i>
                    </button>
                    <button className="share-icon email" title="Share via Email" onClick={() => handleShare(article, "email")}>
                      <i className="fas fa-envelope"></i>
                    </button>
                  </div>
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No personalized news available.</p>
        )}
      </div>

      {Object.keys(expandedComments).map(
        (articleUrl) =>
          expandedComments[articleUrl] && (
            <div key={articleUrl} className="comments-overlay">
              <div className="comments-card">
                <button className="close-comments-btn" onClick={() => toggleComments(articleUrl)}>
                  <i className="fas fa-times"></i> Close
                </button>
                <div className="news-comments-section">
                  <h4>Comments for: {news.find((item) => item.url === articleUrl)?.title}</h4>
                  <div className="comments-list">
                    {news.find((item) => item.url === articleUrl)?.comments?.length > 0 ? (
                      news
                        .find((item) => item.url === articleUrl)
                        .comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .map((comment, commentIndex) => (
                          <div key={commentIndex} className="comment-item">
                            <div className="comment-header">
                              <p className="comment-username">{comment.username}</p>
                            </div>
                            <p className="comment-text">{comment.comment}</p>
                            {(comment.username === userData?.username || userData?.role === "admin") && (
                              <button
                                className="delete-comment-btn"
                                onClick={() => deleteComment(news.find((item) => item.url === articleUrl), comment.username, comment.timestamp)}
                              >
                                <i className="fas fa-trash"></i> Delete
                              </button>
                            )}
                          </div>
                        ))
                    ) : (
                      <p>No comments yet. Be the first to comment!</p>
                    )}
                  </div>
                  <div className="add-comment-section">
                    <textarea
                      placeholder="Add your comment..."
                      value={commentInputs[articleUrl] || ""}
                      onChange={(e) => handleCommentChange(articleUrl, e.target.value)}
                    />
                    <button onClick={() => submitComment(news.find((item) => item.url === articleUrl))}>
                      <i className="fas fa-paper-plane"></i> Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
      )}

      {news.length > itemsPerPage && (
        <div className="pagination-personalize">
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">
            Previous
          </button>
          {getPaginationItems()}
          <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn">
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default PersonalizedNews;