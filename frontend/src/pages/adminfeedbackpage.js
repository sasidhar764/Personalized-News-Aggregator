import React, { useState, useEffect } from "react";
import "./adminfeedbackpage.css";

const AdminFeedbackPage = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch feedback data on component mount
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          setError("User not found. Please log in.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(storedUser);
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/feedback/getfeedback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: user.username }),
        });

        const result = await response.json();
        if (response.ok) {
          const statusOrder = ["Pending", "Reviewed", "Resolved", "Dismissed"];
          const sortedFeedback = result.sort((a, b) => {
            return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
          });
          setFeedbackList(sortedFeedback);
        } else {
          setError(result.error || "Failed to fetch feedback.");
        }
      } catch (err) {
        setError("An error occurred while fetching feedback.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  // Handle status update
  const handleStatusChange = async (feedbackId, newStatus) => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setError("User not found. Please log in.");
        return;
      }

      const user = JSON.parse(storedUser);
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/feedback/updatefeedback`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user.username,
          feedbackId,
          status: newStatus,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccess("Feedback status updated successfully!");
        setFeedbackList((prevList) =>
          prevList.map((feedback) =>
            feedback._id === feedbackId ? { ...feedback, status: newStatus } : feedback
          ).sort((a, b) => {
            const statusOrder = ["Pending", "Reviewed", "Resolved", "Dismissed"];
            return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
          })
        );
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.error || "Failed to update feedback status.");
      }
    } catch (err) {
      setError("An error occurred while updating feedback status.");
    }
  };

  // Group feedback by status
  const groupedFeedback = {
    Pending: feedbackList.filter((feedback) => feedback.status === "Pending"),
    Reviewed: feedbackList.filter((feedback) => feedback.status === "Reviewed"),
    Resolved: feedbackList.filter((feedback) => feedback.status === "Resolved"),
    Dismissed: feedbackList.filter((feedback) => feedback.status === "Dismissed"),
  };

  if (loading) {
    return <div className="loading_afp">Loading feedback...</div>;
  }

  return (
    <div className="admin-feedback-wrapper_afp">
      <h2 className="admin-feedback-heading_afp">User Feedbacks</h2>
      {error && <div className="alert_afp alert-error_afp">{error}</div>}
      {success && <div className="alert_afp alert-success_afp">{success}</div>}
      {feedbackList.length === 0 ? (
        <p className="no-feedback_afp">No feedback requests found.</p>
      ) : (
        <div className="admin-feedback-content_afp">
          {["Pending", "Reviewed", "Resolved", "Dismissed"].map((status) => (
            <div key={status} className={`feedback-group_afp ${status.toLowerCase()}`}>
              <h3 className={`status-heading_afp ${status.toLowerCase()}`}>{status}:</h3>
              {groupedFeedback[status].length === 0 ? (
                <p className="no-feedback_afp">No {status.toLowerCase()} feedback.</p>
              ) : (
                <ul className="feedback-list_afp">
                  {groupedFeedback[status].map((feedback) => (
                    <li key={feedback._id} className={`feedback-item_afp ${status.toLowerCase()}`}>
                      <span className="feedback-details_afp">
                        <span className="feedback-label_afp">Username:</span> {feedback.username} <br />
                        <span className="feedback-label_afp">Category:</span> {feedback.category} <br />
                        <span className="feedback-label_afp">Message:</span> {feedback.message} <br />
                        <span className="feedback-label_afp">Phone Number:</span>{" "}
                        {feedback.phoneNumber || "N/A"} <br />
                        <span className="feedback-label_afp">Email:</span> {feedback.email} <br />
                        <span className="feedback-label_afp">Submitted At:</span>{" "}
                        {new Date(feedback.submittedAt).toLocaleString()} <br />
                        <span className="feedback-label_afp">Status:</span>{" "}
                        <select
                          value={feedback.status}
                          onChange={(e) => handleStatusChange(feedback._id, e.target.value)}
                          className={`status-select_afp status-${feedback.status.toLowerCase()}_afp`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Dismissed">Dismissed</option>
                        </select>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackPage;