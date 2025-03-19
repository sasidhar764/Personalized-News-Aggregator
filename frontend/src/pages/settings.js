import React, { useState, useEffect } from "react";
import "./settings.css";

const Settings = ({ onUpdateSuccess, onClose }) => {
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
    summary: storedUser?.summary || false, // Add summary status
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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle category selection
  const toggleCategorySelection = (category) => {
    if (formData.preferredCategory.includes(category)) {
      // Remove category if already selected
      setFormData({
        ...formData,
        preferredCategory: formData.preferredCategory.filter((item) => item !== category),
      });
    } else {
      // Add category if not already selected
      setFormData({
        ...formData,
        preferredCategory: [...formData.preferredCategory, category],
      });
    }
  };

  // Toggle category dropdown
  const toggleCategoryDropdown = () => {
    setCategoryDropdownOpen(!categoryDropdownOpen);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest(".category-dropdown")) {
      setCategoryDropdownOpen(false);
    }
  };

  // Add/remove event listener for clicking outside the dropdown
  useEffect(() => {
    if (categoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

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

  // Handle form submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (isLoading) return;

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
      formData.summary !== storedUser.summary &&
      formData.username === storedUser.username &&
      formData.email === storedUser.email &&
      formData.password === "" &&
      JSON.stringify(formData.preferredCategory) === JSON.stringify(storedUser.preferredCategory) &&
      formData.country === storedUser.country &&
      formData.language === storedUser.language;

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
      if (formData.summary !== storedUser.summary) {
        await handleEmailUpdate(formData.summary);
      }

      // Update localStorage with the new user data
      const updatedUser = { ...storedUser, ...updatedData, summary: formData.summary };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Set success message based on what was updated
      if (isOnlyEmailUpdate) {
        setSuccess("Email preferences updated successfully!");
      } else if (profileUpdated && formData.summary !== storedUser.summary) {
        setSuccess("Profile and email preferences updated successfully!");
      } else if (profileUpdated) {
        setSuccess("Profile updated successfully!");
      }

      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);

      if (onUpdateSuccess) {
        onUpdateSuccess(updatedUser);
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      console.error("Update Error:", err);
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <form onSubmit={handleUpdate}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder={storedUser?.username || "Enter username"}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder={storedUser?.email || "Enter email"}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Leave blank to keep current password"
          />
        </div>

        <div className="form-group">
          <label>Preferred Categories</label>
          <div className="category-dropdown">
            <button type="button" onClick={toggleCategoryDropdown}>
              {formData.preferredCategory.length > 0
                ? formData.preferredCategory.join(", ")
                : storedUser?.preferredCategory?.join(", ") || "Select categories"}
            </button>
            {categoryDropdownOpen && (
              <div className="dropdown-content">
                {categoryOptions.map((category) => (
                  <label key={category}>
                    <input
                      type="checkbox"
                      checked={formData.preferredCategory.includes(category)}
                      onChange={() => toggleCategorySelection(category)}
                    />
                    {category}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Country</label>
          <select
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            required
          >
            <option value="">{storedUser?.country || "Select a country"}</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Language</label>
          <select
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            required
          >
            <option value="">{storedUser?.language || "Select a language"}</option>
            {languageOptions.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>

        {/* Email Updates Toggle */}
        <div className="form-group email-toggle-group">
          <label>Email Updates</label>
          <div className="email-updates-toggle">
            <label className="switch">
              <input
                type="checkbox"
                checked={formData.summary}
                onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.checked }))}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update"}
        </button>
      </form>
    </div>
  );
};

export default Settings;