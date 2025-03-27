import React, { useState, useEffect } from "react";
import "./feedbackpage.css";
import { FaCheckCircle } from "@react-icons/all-files/fa/FaCheckCircle"; // Import FaCheckCircle

const FeedbackPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    category: "",
    message: "",
    phoneNumber: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Fetch user data from localStorage and autofill username and email
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setFormData((prevData) => ({
          ...prevData,
          username: user.username || "",
          email: user.email || "",
        }));
      } catch (err) {
        console.error("Error parsing user data from localStorage:", err);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/feedback/submitfeedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        // Show the custom modal
        setShowModal(true);
      } else {
        setError(result.error || "Failed to submit feedback.");
      }
    } catch (err) {
      setError("An error occurred while submitting feedback.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    // Reset form fields after closing the modal
    setFormData({
      username: formData.username, // Keep username unchanged
      category: "",
      message: "",
      phoneNumber: "",
      email: formData.email, // Keep email unchanged
    });
  };

  return (
    <div className="feedback-wrapper_fbp">
      <div className="feedback-container_fbp">
        <div className="feedback-header_fbp">
          <h2>Submit Feedback</h2>
        </div>
        <form onSubmit={handleSubmit} className="feedback-form_fbp">
          <div className="form-section_fbp">
            {error && <div className="alert_fbp alert-error_fbp">{error}</div>}
            <div className="form-group_fbp">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                readOnly
              />
            </div>

            <div className="form-group_fbp">
              <label htmlFor="category">Category:</label>
              <div style={{ position: "relative" }}>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select a category</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Suggestion">Feature Suggestion</option>
                  <option value="Content Issue">Content Issue</option>
                  <option value="User Experience">User Experience</option>
                  <option value="Performance Issue">Performance Issue</option>
                  <option value="Other">Other</option>
                </select>
                <span className="custom-arrow_fbp"></span>
              </div>
            </div>

            <div className="form-group_fbp">
              <label htmlFor="message">Feedback Message:</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                required
              ></textarea>
            </div>

            <div className="form-group_fbp">
              <label htmlFor="phoneNumber">Phone Number (optional):</label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+919876543210"
              />
            </div>

            <div className="form-group_fbp">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-actions_fbp">
            <div className="button-group_fbp">
              <button type="submit" className="submit-button_fbp">
                Submit Feedback
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Custom Modal for Success Message */}
      {showModal && (
        <div className="modal-backdrop_fbp" onClick={closeModal}>
          <div className="modal_fbp" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body_fbp">
              <FaCheckCircle className="modal-icon_fbp" />
              <p>Feedback submitted successfully!</p>
            </div>
            <div className="modal-footer_fbp">
              <button className="modal-ok-btn_fbp" onClick={closeModal}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;