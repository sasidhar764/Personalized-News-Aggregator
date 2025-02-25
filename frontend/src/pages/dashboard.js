import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CategoryPreferences from "../components/dashboard/updateuser";
import "./dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

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

    fetchUserData();
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

  if (isLoading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
      <h1 className="dashboard-title">
        Welcome, {userData?.username ? userData.username.charAt(0).toUpperCase() + userData.username.slice(1) : "User"} !
      </h1>

        <div className="nav-buttons">
          <button className="category-button" onClick={() => setShowCategoryModal(true)}>
            Update Category Preferences
          </button>
          {userData.role === "admin" && (
            <button className="admin-button" onClick={handleAdminRedirect}>
              Admin Dashboard
            </button>
          )}
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {showCategoryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Update Profile</h2>
            <CategoryPreferences
              currentCategory={userData?.preferredCategory}
              userDetails={userData}
              onUpdateSuccess={handleCategoryUpdate}
              onClose={() => setShowCategoryModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

