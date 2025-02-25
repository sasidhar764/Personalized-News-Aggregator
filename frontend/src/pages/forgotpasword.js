import { useState } from "react";
import axios from "axios";
import "./forgotpasword.css";

function ForgotPassword({ onClose }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      await axios.post(`${process.env.REACT_APP_SERVER_URL}/forgot-password`, { email });
      setMessage("Password reset link sent! Check your email.");
    } catch (error) {
      setMessage("Error sending reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-overlay">
      <div className="forgot-password-modal">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Forgot Password?</h2>
        <p>Enter your email to reset your password.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default ForgotPassword;