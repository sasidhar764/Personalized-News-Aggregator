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
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [showShareOptions, setShowShareOptions] = useState({});
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

        console.log("Fetching personalized news for:", username);
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
        console.log("Fetched personalized news:", data ? data.length : 0, "articles");
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
      console.log("Bookmarking article:", article.title);
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
      console.log("Flagging article:", article.title);
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

      // Remove the flagged article from the display
      setNews(prevNews => prevNews.filter(item => item.url !== article.url));
      
      alert("Article flagged for review and removed from display!");
    } catch (error) {
      console.error("Error flagging article", error);
      alert("Failed to flag article");
    }
  };

  const toggleComments = (articleUrl) => {
    setExpandedComments(prev => ({
      ...prev,
      [articleUrl]: !prev[articleUrl]
    }));
    // Close share options when opening comments
    setShowShareOptions(prev => ({
      ...prev,
      [articleUrl]: false
    }));
  };

  const handleCommentChange = (articleUrl, value) => {
    setCommentInputs(prev => ({
      ...prev,
      [articleUrl]: value
    }));
  };

  // Improved date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    
    try {
      // Try to parse the date
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return "Invalid date";
      }
      
      // Return formatted date with explicit options for better cross-browser compatibility
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date error";
    }
  };

  const submitComment = async (article) => {
    if (!userData) {
      alert("Please login to comment");
      return;
    }

    const comment = commentInputs[article.url];
    if (!comment || comment.trim() === "") {
      alert("Please enter a comment");
      return;
    }

    try {
      // Create timestamp
      const timestamp = new Date().toISOString();
      
      // Use formatDate function for consistency
      const formattedDate = formatDate(timestamp);
      
      // Append date to the comment content
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
          comment: commentWithDate,  // Send comment with date included
          timestamp: timestamp       // Still send timestamp for sorting/identification
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

      // Add the new comment to the article
      setNews(prevNews => prevNews.map(item => {
        if (item.url === article.url) {
          const updatedComments = [...(item.comments || []), {
            username: userData.username,
            comment: commentWithDate,  // Store comment with date included
            timestamp: timestamp       // Keep timestamp for sorting
          }];
          return { ...item, comments: updatedComments };
        }
        return item;
      }));

      setCommentInputs(prev => ({
        ...prev,
        [article.url]: ""
      }));

      alert("Comment added successfully!");
    } catch (error) {
      console.error("Error submitting comment", error);
      alert(error.message || "Failed to submit comment");
    }
  };

  const deleteComment = async (article, commentUsername, commentTimestamp) => {
    if (!userData) {
      alert("Please login to delete comments");
      return;
    }

    // Check if the user is authorized to delete this comment
    // Either it's their own comment OR they are an admin
    const isOwnComment = commentUsername === userData.username;
    const isAdmin = userData.role === 'admin';
    
    if (!isOwnComment && !isAdmin) {
      alert("You can only delete your own comments");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news/deleteComment`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          username: commentUsername, // The username of the comment owner
          url: article.url,
          timestamp: commentTimestamp // Include timestamp to identify the specific comment
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete comment");
      }

      // Remove the specific comment from the article
      setNews(prevNews => prevNews.map(item => {
        if (item.url === article.url) {
          const updatedComments = (item.comments || []).filter(
            comment => !(comment.username === commentUsername && comment.timestamp === commentTimestamp)
          );
          return { ...item, comments: updatedComments };
        }
        return item;
      }));

      alert("Comment deleted successfully!");
    } catch (error) {
      console.error("Error deleting comment", error);
      alert(error.message || "Failed to delete comment");
    }
  };

  const toggleShareOptions = (articleUrl) => {
    setShowShareOptions(prev => ({
      ...prev,
      [articleUrl]: !prev[articleUrl]
    }));
    // Close comments when opening share options
    setExpandedComments(prev => ({
      ...prev,
      [articleUrl]: false
    }));
  };

  const handleShare = async (article, platform) => {
    if (!userData) {
      alert("Please login to share articles");
      return;
    }

    try {
      // Record share analytics
      await fetch(`${process.env.REACT_APP_SERVER_URL}/news/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          username: userData.username,
          url: article.url,
          platform: platform
        }),
      });

      // Generate share links
      const shareUrl = generateShareUrl(article, platform);
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
      
      // Close share options after sharing
      toggleShareOptions(article.url);
      
    } catch (error) {
      console.error("Error sharing article", error);
      alert("Failed to share article");
    }
  };

  const generateShareUrl = (article, platform) => {
    const encodedTitle = encodeURIComponent(article.title);
    const encodedUrl = encodeURIComponent(article.url);
    const encodedText = encodeURIComponent(`${article.title} - ${article.url}`);

    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
      case 'whatsapp':
        return `https://wa.me/?text=${encodedText}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      case 'email':
        return `mailto:?subject=${encodedTitle}&body=Check out this article: ${encodedUrl}`;
      default:
        return article.url;
    }
  };

  // Pagination Logic
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
        <button
          key={1}
          onClick={() => paginate(1)}
          className={`pagination-btn ${currentPage === 1 ? "active" : ""}`}
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
            onClick={() => paginate(i)}
            className={`pagination-btn ${currentPage === i ? "active" : ""}`}
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
            <div 
              key={index} 
              className={`news-item-personalize ${showShareOptions[article.url] ? "show-share-options" : ""}`}
            >
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
                <button onClick={() => handleBookmark(article)}>
                  <i className="fas fa-bookmark"></i> Bookmark
                </button>
                <button onClick={() => handleFlag(article)}>
                  <i className="fas fa-flag"></i> Flag
                </button>
                <button onClick={() => toggleComments(article.url)}>
                  <i className="fas fa-comment"></i> {expandedComments[article.url] ? "Hide Comments" : "Comments"}
                </button>
                <button onClick={() => toggleShareOptions(article.url)}>
                  <i className="fas fa-share-alt"></i> Share
                </button>
              </div>

              {/* Share Options */}
              <div className={`share-options ${showShareOptions[article.url] ? "active" : ""}`}>
                <div className="share-buttons">
                  <button 
                    className="share-btn twitter"
                    onClick={() => handleShare(article, 'twitter')}
                  >
                    <i className="fab fa-twitter"></i> Twitter
                  </button>
                  <button 
                    className="share-btn whatsapp"
                    onClick={() => handleShare(article, 'whatsapp')}
                  >
                    <i className="fab fa-whatsapp"></i> WhatsApp
                  </button>
                  <button 
                    className="share-btn linkedin"
                    onClick={() => handleShare(article, 'linkedin')}
                  >
                    <i className="fab fa-linkedin"></i> LinkedIn
                  </button>
                  <button 
                    className="share-btn email"
                    onClick={() => handleShare(article, 'email')}
                  >
                    <i className="fas fa-envelope"></i> Email
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {expandedComments[article.url] && (
                <div className="news-comments-section">
                  <h4>Comments</h4>
                  
                  <div className="comments-list">
                    {article.comments && article.comments.length > 0 ? (
                      article.comments
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .map((comment, commentIndex) => (
                        <div key={commentIndex} className="comment-item">
                          <div className="comment-header">
                            <p className="comment-username">{comment.username}</p>
                            {/* No longer need to display date separately as it's in the comment */}
                          </div>
                          <p className="comment-text">{comment.comment}</p>
                          {/* Show delete button only for the comment owner or admin */}
                          {(comment.username === userData?.username || userData?.role === 'admin') && (
                            <button 
                              className="delete-comment-btn"
                              onClick={() => deleteComment(article, comment.username, comment.timestamp)}
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
                      value={commentInputs[article.url] || ""}
                      onChange={(e) => handleCommentChange(article.url, e.target.value)}
                    />
                    <button onClick={() => submitComment(article)}>
                      <i className="fas fa-paper-plane"></i> Post Comment
                    </button>
                  </div>
                </div>
              )}
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