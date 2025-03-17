import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CategoryPreferences from "../components/dashboard/updateuser";
import "./dashboard.css";

import { FaHome, FaUser, FaNewspaper, FaSignOutAlt, FaShieldAlt, FaBars } from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [news, setNews] = useState([]);
  const [navOpen, setNavOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

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
  }, [navigate]);

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

  const toggleNav = () => {
    setNavOpen(!navOpen);
  };

  if (isLoading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-layout">
      {/* Side Navigation Bar */}
      <div className={`side-nav ${navOpen ? 'open' : 'closed'}`}>
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
          {navOpen && <span className="user-name">
            {userData?.username ? userData.username.charAt(0).toUpperCase() + userData.username.slice(1) : "User"}
          </span>}
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
      <div className={`main-content ${navOpen ? 'nav-open' : 'nav-closed'}`}>
        <div className="content-wrapper">
          <header className="content-header">
            <h1>News Dashboard</h1>
          </header>

          <div className="news-section">
            <h2 className="news-title">Headlines</h2>
            <div className="news-list">
              {news.map((article, index) => (
                <div key={index} className="news-item">
                  <h3>{article.title}</h3>
                  <p>{article.description}</p>
                  <p className="news-source">
                    Source: {article.source || "Unknown"} | 
                    <a href={article.url} target="_blank" rel="noopener noreferrer"> Read more</a>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}

export default Dashboard;