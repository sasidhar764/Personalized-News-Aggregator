import React, { useState, useEffect, useRef } from "react";
import "./settings.css";

const Settings = ({ onUpdateSuccess, onClose }) => {
  const categoryDropdownRef = useRef(null);
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    username: storedUser?.username || "",
    email: storedUser?.email || "",
    password: "",
    preferredCategory: storedUser?.preferredCategory
      ? Array.isArray(storedUser.preferredCategory)
        ? storedUser.preferredCategory
        : [storedUser.preferredCategory]
      : [],
    country: storedUser?.country || "",
    language: storedUser?.language || "",
    summary: storedUser?.summary || false,
  });

  const [originalData, setOriginalData] = useState({
    username: storedUser?.username || "",
    email: storedUser?.email || "",
    preferredCategory: storedUser?.preferredCategory
      ? Array.isArray(storedUser.preferredCategory)
        ? [...storedUser.preferredCategory]
        : [storedUser.preferredCategory]
      : [],
    country: storedUser?.country || "",
    language: storedUser?.language || "",
    summary: storedUser?.summary || false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const categoryOptions = [
    "Sports",
    "Business",
    "Technology",
    "Entertainment",
    "Health",
    "Science",
    "Politics",
  ];
  const countryOptions = ["India", "USA", "UK", "Canada", "Australia", "Japan", "Germany"];
  const languageOptions = ["English", "Hindi", "Spanish", "French", "German", "Japanese", "Chinese"];

  useEffect(() => {
    if (error) {
      const errorTimeout = setTimeout(() => setError(""), 2000);
      return () => clearTimeout(errorTimeout);
    }
    if (success) {
      const successTimeout = setTimeout(() => setSuccess(""), 2000);
      return () => clearTimeout(successTimeout);
    }
  }, [error, success]);

  const hasChanges = () => {
    const hasPasswordChange = formData.password.trim() !== "";
    const categoriesEqual =
      formData.preferredCategory.length === originalData.preferredCategory.length &&
      formData.preferredCategory.every((cat) => originalData.preferredCategory.includes(cat));

    return (
      hasPasswordChange ||
      formData.username !== originalData.username ||
      formData.email !== originalData.email ||
      !categoriesEqual ||
      formData.country !== originalData.country ||
      formData.language !== originalData.language ||
      formData.summary !== originalData.summary
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleCategorySelection = (category, e) => {
    e.stopPropagation();
    setFormData((prev) => {
      if (prev.preferredCategory.includes(category)) {
        return {
          ...prev,
          preferredCategory: prev.preferredCategory.filter((item) => item !== category),
        };
      } else {
        return {
          ...prev,
          preferredCategory: [...prev.preferredCategory, category],
        };
      }
    });
  };

  const toggleCategoryDropdown = () => {
    setCategoryDropdownOpen(!categoryDropdownOpen);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    }
    if (categoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [categoryDropdownOpen]);

  const handleEmailUpdate = async (enable) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news/togglesummary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          username: storedUser.username,
          enable: enable,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update email preferences");
      }

      const updatedUser = { ...storedUser, summary: enable };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setFormData((prev) => ({ ...prev, summary: enable }));
      alert(`Email updates ${enable ? "enabled" : "disabled"} successfully!`);
    } catch (error) {
      console.error("Error updating email preferences", error);
      alert("Failed to update email preferences");
    }
  };

  const handleLogoutAndRedirect = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    alert("Your profile has been updated successfully. Please log in again with your new credentials.");
    window.location.href = "/";
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!hasChanges()) {
      setError("No changes detected. Please modify something before updating.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found");
      setIsLoading(false);
      return;
    }

    const isOnlyEmailUpdate =
      formData.summary !== originalData.summary &&
      formData.username === originalData.username &&
      formData.email === originalData.email &&
      formData.password === "" &&
      formData.preferredCategory.length === originalData.preferredCategory.length &&
      formData.preferredCategory.every((cat) => originalData.preferredCategory.includes(cat)) &&
      formData.country === originalData.country &&
      formData.language === originalData.language;

    const updatedData = {
      username: formData.username,
      email: formData.email || null,
      password: formData.password || null,
      preferredCategory: formData.preferredCategory.length > 0 ? formData.preferredCategory : null,
      country: formData.country || null,
      language: formData.language || null,
      token: token,
    };

    try {
      let profileUpdated = false;

      if (!isOnlyEmailUpdate) {
        const profileResponse = await fetch(`${process.env.REACT_APP_SERVER_URL}/auth/update-user`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });

        const profileResponseData = await profileResponse.json();

        if (!profileResponse.ok) {
          throw new Error(profileResponseData.error || profileResponseData.message || "Failed to update profile");
        }

        profileUpdated = true;
      }

      if (formData.summary !== originalData.summary) {
        await handleEmailUpdate(formData.summary);
      }

      setOriginalData({
        username: formData.username,
        email: formData.email,
        preferredCategory: [...formData.preferredCategory],
        country: formData.country,
        language: formData.language,
        summary: formData.summary,
      });

      if (isOnlyEmailUpdate) {
        setSuccess("Email preferences updated successfully!");
        const updatedUser = { ...storedUser, summary: formData.summary };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        if (onUpdateSuccess) {
          onUpdateSuccess(updatedUser);
          setTimeout(() => onClose(), 1500);
        }
      } else if (profileUpdated) {
        setSuccess("Profile updated successfully! You will be logged out in a moment.");
        setTimeout(() => {
          handleLogoutAndRedirect();
        }, 2000);
      }
    } catch (err) {
      console.error("Update Error:", err);
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // New function to handle cancel action
  const handleCancel = () => {
    // Reset formData to originalData to discard changes
    setFormData({
      username: originalData.username,
      email: originalData.email,
      password: "", // Password should be reset as it’s not stored in originalData
      preferredCategory: [...originalData.preferredCategory], // Ensure a new array copy
      country: originalData.country,
      language: originalData.language,
      summary: originalData.summary,
    });
    // Close the dropdown if open
    setCategoryDropdownOpen(false);
    // Call the onClose prop to close the form/modal
    onClose();
  };

  return (
    <div className="settings-wrapper_s">
      <div className="settings-container_s">
        <div className="settings-header_s">
          <h2>Account Settings</h2>
        </div>
        
        <form onSubmit={handleUpdate} className="settings-form_s">
          <div className="form-section_s">
            <h3>Profile Information</h3>
            <div className="form-grid-3_s">
              <div className="form-group_s">
                <label>Username</label>
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
  
              <div className="form-group_s">
                <label>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
  
              <div className="form-group_s">
                <label>Password</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  placeholder="Enter new password to change"
                />
              </div>
            </div>
          </div>
  
          <div className="form-section_s">
            <h3>Preferences</h3>
            <div className="form-group_s">
              <label>Preferred Categories</label>
              <div className="category-dropdown_s" ref={categoryDropdownRef}>
                <button type="button" onClick={toggleCategoryDropdown}>
                  {formData.preferredCategory.length > 0 
                    ? formData.preferredCategory.join(", ") 
                    : "Select your interests"}
                  <span className="dropdown-arrow_s">▼</span>
                </button>
                {categoryDropdownOpen && (
                  <div className="dropdown-menu_s">
                    <div className="dropdown-menu-inner_s">
                      {categoryOptions.map((category) => (
                        <label 
                          key={category} 
                          className={formData.preferredCategory.includes(category) ? "selected_s" : ""}
                        >
                          <input
                            type="checkbox"
                            checked={formData.preferredCategory.includes(category)}
                            onChange={(e) => toggleCategorySelection(category, e)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {category}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
  
            <div className="form-grid-3_s">
              <div className="form-group_s">
                <label>Country</label>
                <select 
                  name="country" 
                  value={formData.country} 
                  onChange={handleInputChange} 
                  required
                >
                  <option value="">Select Country</option>
                  {countryOptions.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
  
              <div className="form-group_s">
                <label>Language</label>
                <select 
                  name="language" 
                  value={formData.language} 
                  onChange={handleInputChange} 
                  required
                >
                  <option value="">Select Language</option>
                  {languageOptions.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
              </div>
  
              <div className="form-group_s toggle-group_s">
                <label>Email Notifications</label>
                <label className="switch_s">
                  <input 
                    type="checkbox" 
                    checked={formData.summary} 
                    onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.checked }))} 
                  />
                  <span className="slider_s"></span>
                </label>
              </div>
            </div>
          </div>
  
          <div className="form-actions_s">
            {error && <div className="alert_s alert-error_s">{error}</div>}
            {success && <div className="alert_s alert-success_s">{success}</div>}
            
            <div className="button-group_s">
              <button 
                type="submit" 
                className="submit-btn_s" 
                disabled={isLoading || !hasChanges()}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
              <button 
                type="button" 
                className="cancel-btn_s" 
                onClick={handleCancel} // Updated to use handleCancel
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;