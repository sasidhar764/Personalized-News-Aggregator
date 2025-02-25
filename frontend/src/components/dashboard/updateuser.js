import { useState } from "react";
import "./updateuser.css"; // Import the new CSS file

const CategoryPreferences = ({ userDetails, onUpdateSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    username: userDetails?.username || "",
    email: userDetails?.email || "",
    password: "",
    preferredCategory: userDetails?.preferredCategory || "",
    country: userDetails?.country || "",
    language: userDetails?.language || "" 
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const categoryOptions = ["Sports", "Business", "Technology", "Entertainment", "Health", "Science", "Politics"];
  const countryOptions = ["India", "USA", "UK", "Canada", "Australia", "Japan", "Germany"];
  const languageOptions = ["English", "Hindi", "Spanish", "French", "German", "Japanese", "Chinese"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

    const updatedData = {
      username: formData.username,
      email: formData.email || null,
      password: formData.password || null,
      preferredCategory: formData.preferredCategory || null,
      country: formData.country || null,
      language: formData.language || null,
      token: token
    };

    try {
      console.log("Sending update request with data:", updatedData);

      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/update-user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
      });

      const responseData = await response.json();
      console.log("Response received:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || "Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      if (onUpdateSuccess) {
        onUpdateSuccess({
          ...userDetails,
          ...Object.fromEntries(Object.entries(updatedData).filter(([_, value]) => value !== null))
        });
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
    <div className="update-profile-container">
      <form onSubmit={handleUpdate} className="update-profile-form">
        <h2 className="form-title">Update Profile</h2>

        <div className="form-group">
          <label>Username:</label>
          <input type="text" name="username" value={formData.username} onChange={handleInputChange} disabled={isLoading} required />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={isLoading} />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input type="password" name="password" value={formData.password} onChange={handleInputChange} disabled={isLoading} placeholder="Leave blank to keep current password" />
        </div>

        <div className="form-group">
          <label>Preferred Category:</label>
          <select name="preferredCategory" value={formData.preferredCategory} onChange={handleInputChange} disabled={isLoading}>
            <option value="">Select Category</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Country:</label>
          <select name="country" value={formData.country} onChange={handleInputChange} disabled={isLoading}>
            <option value="">Select Country</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Preferred Language:</label>
          <select name="language" value={formData.language} onChange={handleInputChange} disabled={isLoading}>
            <option value="">Select Language</option>
            {languageOptions.map((language) => (
              <option key={language} value={language}>{language}</option>
            ))}
          </select>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <button type="submit" className="update-button" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Profile"}
        </button>
        <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

export default CategoryPreferences;
