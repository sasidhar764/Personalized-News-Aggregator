import React, { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import "./sharedlayout.css";
import {
  FaHome,
  FaUser,
  FaSignOutAlt,
  FaShieldAlt,
  FaBars,
  FaFlag,
  FaBookmark,
  FaStar,
  FaQuestionCircle,
  FaComment,
} from "react-icons/fa";
import ChatBot from "./chatbot";

function SharedLayout() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

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
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const toggleNav = () => {
    setNavOpen(!navOpen);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-layout">
      {/* Side Navigation Bar */}
      <div className={`side-nav ${navOpen ? "open" : "closed"}`}>
        <div className="nav-header">
          {navOpen && <h2 className="nav-logo">NEWSPHERE</h2>}
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
                ? userData.username.charAt(0).toUpperCase() +
                  userData.username.slice(1)
                : "User"}
            </span>
          )}
        </div>

        <div className="nav-items">
          <div
            className={`nav-item ${
              window.location.pathname === "/dashboard" ? "active" : ""
            }`}
            onClick={() => navigate("/dashboard")}
          >
            <FaHome className="nav-icon" />
            {navOpen && <span className="nav-label">Dashboard</span>}
          </div>
          <div
            className={`nav-item ${
              window.location.pathname === "/personalized-news" ? "active" : ""
            }`}
            onClick={() => navigate("/personalized-news")}
          >
            <FaStar className="nav-icon" />
            {navOpen && <span className="nav-label">Personalized News</span>}
          </div>
          <div
            className={`nav-item ${
              window.location.pathname === "/bookmarks" ? "active" : ""
            }`}
            onClick={() => navigate("/bookmarks")}
          >
            <FaBookmark className="nav-icon" />
            {navOpen && <span className="nav-label">Bookmarks</span>}
          </div>
          <div
            className={`nav-item ${
              window.location.pathname === "/quiz" ? "active" : ""
            }`}
            onClick={() => navigate("/quiz")}
          >
            <FaQuestionCircle className="nav-icon" />
            {navOpen && <span className="nav-label">Quiz</span>}
          </div>
          <div
            className={`nav-item ${
              window.location.pathname === "/feedback" ? "active" : ""
            }`}
            onClick={() => navigate("/feedback")}
          >
            <FaComment className="nav-icon" />
            {navOpen && <span className="nav-label">Feedback</span>}
          </div>
          {userData?.role === "admin" && (
            <div
              className={`nav-item ${
                window.location.pathname === "/flagged-articles" ? "active" : ""
              }`}
              onClick={() => navigate("/flagged-articles")}
            >
              <FaFlag className="nav-icon" />
              {navOpen && <span className="nav-label">Flagged Articles</span>}
            </div>
          )}
          {userData?.role === "admin" && (
            <div
              className={`nav-item ${
                window.location.pathname === "/adminfeedback" ? "active" : ""
              }`}
              onClick={() => navigate("/adminfeedback")}
            >
              {navOpen && <span className="nav-label">Feedback Review</span>}
            </div>
          )}
          {userData?.role === "admin" && (
            <div
              className={`nav-item ${
                window.location.pathname === "/admin" ? "active" : ""
              }`}
              onClick={() => navigate("/admin")}
            >
              <FaShieldAlt className="nav-icon" />
              {navOpen && <span className="nav-label">User Management</span>}
            </div>
          )}
          <div
            className={`nav-item ${
              window.location.pathname === "/settings" ? "active" : ""
            }`}
            onClick={() => navigate("/settings")}
          >
            <FaUser className="nav-icon" />
            {navOpen && <span className="nav-label">Settings</span>}
          </div>
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
        <Outlet />
      </div>

      {/* ChatBot Toggle Button */}
      <div className="chatbot-toggle" onClick={toggleChat}>
        <span>💬</span>
      </div>

      {/* ChatBot Popup */}
      {isChatOpen && (
        <div className="chatbot-popup">
          <ChatBot />
        </div>
      )}
    </div>
  );
}

export default SharedLayout;