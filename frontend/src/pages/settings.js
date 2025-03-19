import React, { useState, useEffect, useRef } from "react";
import "./settings.css";

const Settings = ({ onUpdateSuccess, onClose }) => {
  // Create a ref for the dropdown
  const categoryDropdownRef = useRef(null);
  
  // Fetch user data from localStorage when the component mounts
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

  // Keep a copy of the original data for comparison
  const [originalData] = useState({
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

  // Function to check if there are any changes in the form
  const hasChanges = () => {
    // Check for password change separately since it's not in originalData
    const hasPasswordChange = formData.password.trim() !== "";
    
    // Compare arrays properly
    const categoriesEqual = 
      formData.preferredCategory.length === originalData.preferredCategory.length &&
      formData.preferredCategory.every(cat => originalData.preferredCategory.includes(cat));
    
    // Check all other fields
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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle category selection
  const toggleCategorySelection = (category, e) => {
    // Stop propagation to prevent dropdown from closing
    e.stopPropagation();
    
    setFormData(prev => {
      // Check if category is already selected
      if (prev.preferredCategory.includes(category)) {
        // Remove category if already selected
        return {
          ...prev,
          preferredCategory: prev.preferredCategory.filter(item => item !== category)
        };
      } else {
        // Add category if not already selected
        return {
          ...prev,
          preferredCategory: [...prev.preferredCategory, category]
        };
      }
    });
  };

  // Toggle category dropdown
  const toggleCategoryDropdown = () => {
    setCategoryDropdownOpen(!categoryDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    }

    // Add event listener only when dropdown is open
    if (categoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [categoryDropdownOpen]);

  // Handle email update (enable/disable email updates)
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

      // Update local storage with the new summary flag
      const updatedUser = { ...storedUser, summary: enable };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Update formData state to reflect the change
      setFormData((prev) => ({ ...prev, summary: enable }));

      alert(`Email updates ${enable ? "enabled" : "disabled"} successfully!`);
    } catch (error) {
      console.error("Error updating email preferences", error);
      alert("Failed to update email preferences");
    }
  };

  // Function to handle logout and redirect
  const handleLogoutAndRedirect = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    
    // Display success message
    alert("Your profile has been updated successfully. Please log in again with your new credentials.");
    
    // Redirect to home page
    window.location.href = "/";
  };

  // Handle form submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    // Check if there are any changes
    if (!hasChanges()) {
      setError("No changes detected. Please modify something before updating.");
      setTimeout(() => setError(""), 3000);
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

    // Check if only email preferences are being updated
    const isOnlyEmailUpdate = 
      formData.summary !== originalData.summary &&
      formData.username === originalData.username &&
      formData.email === originalData.email &&
      formData.password === "" &&
      formData.preferredCategory.length === originalData.preferredCategory.length &&
      formData.preferredCategory.every(cat => originalData.preferredCategory.includes(cat)) &&
      formData.country === originalData.country &&
      formData.language === originalData.language;

    // Send profile update request if profile data is changed
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

      // Update profile if any profile data is changed
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

      // Update email preferences if changed
      if (formData.summary !== originalData.summary) {
        await handleEmailUpdate(formData.summary);
      }

      // Set success message based on what was updated
      if (isOnlyEmailUpdate) {
        setSuccess("Email preferences updated successfully!");
        
        // Only update local storage but don't logout for email preference changes
        const updatedUser = { ...storedUser, summary: formData.summary };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Notify parent component of the update
        if (onUpdateSuccess) {
          onUpdateSuccess(updatedUser);
          setTimeout(() => onClose(), 1500);
        }
      } else if (profileUpdated) {
        setSuccess("Profile updated successfully! You will be logged out in a moment.");
        
        // For profile updates, logout after a short delay
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

  return (
    <div className="settings-container_s">
      <h2>Settings</h2>
      <form onSubmit={handleUpdate}>
        <div className="form-group_s">
          <label>Username</label>
          <input type="text" name="username" value={formData.username} onChange={handleInputChange} required />
        </div>

        <div className="form-group_s">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
        </div>

        <div className="form-group_s">
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Leave empty to keep your current password" />
        </div>

        <div className="form-group_s">
          <label>Preferred Categories</label>
          <div className="category-dropdown_s" ref={categoryDropdownRef}>
            <button type="button" onClick={toggleCategoryDropdown}>
              {formData.preferredCategory.length > 0 ? formData.preferredCategory.join(", ") : "Select categories"}
            </button>
            {categoryDropdownOpen && (
              <div className="dropdown-content_s">
                {categoryOptions.map((category) => (
                  <label key={category} className={formData.preferredCategory.includes(category) ? "selected" : ""}>
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
            )}
          </div>
        </div>

        <div className="form-group_s">
          <label>Country</label>
          <select name="country" value={formData.country} onChange={handleInputChange} required>
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
          <select name="language" value={formData.language} onChange={handleInputChange} required>
            <option value="">Select Language</option>
            {languageOptions.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group_s email-toggle-group_s">
          <label>Email Updates</label>
          <div className="email-updates-toggle_s">
            <label className="switch_s">
              <input type="checkbox" checked={formData.summary} onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.checked }))} />
              <span className="slider_s round_s"></span>
            </label>
          </div>
        </div>

        {error && <div className="error-message_s">{error}</div>}
        {success && <div className="success-message_s">{success}</div>}

        <button 
          type="submit" 
          className="update-button_s" 
          disabled={isLoading || !hasChanges()}
        >
          {isLoading ? "Updating..." : "Update"}
        </button>
      </form>
    </div>
  );
};

export default Settings;