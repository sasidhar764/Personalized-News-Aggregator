import { useState } from "react";
import axios from "axios";
import "./forgotpassword.css";

function ForgotPassword({ onClose }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      await axios.post(`${process.env.REACT_APP_SERVER_URL}/auth/forgot-password`, { email });
      setMessage("Password reset link sent! Check your email.");
    } catch (error) {
      setMessage("Error sending reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-pw-overlay">
      <div className="reset-pw-modal">
        {/* Close button */}
        <button className="reset-close-btn" onClick={onClose}>X</button>
        
        {/* Heading */}
        <h2 className="reset-heading">Forgot Password?</h2>
        <p className="reset-instruction">Enter your email to reset your password.</p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="reset-form-group">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="reset-email-input"
            />
          </div>
          <button type="submit" className="reset-submit-btn" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/* Message display */}
        {message && <p className={message.includes("Error") ? "reset-error" : "reset-success"}>{message}</p>}
      </div>
    </div>
  );
}

export default ForgotPassword;