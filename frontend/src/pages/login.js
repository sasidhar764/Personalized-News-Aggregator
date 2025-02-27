import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

function Login({ onClose, onForgotPassword }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) navigate("/dashboard");
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/login`,
        JSON.stringify(formData),
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      const { token, user } = response.data;
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user || { email: formData.email }));

      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-overlay_1">
      <div className="login-modal_1">
        {/* Close button */}
        <button className="close-button_1" onClick={onClose}>X</button>

        {/* Login Heading */}
        <h2 className="login-heading_1">LOGIN</h2>
        <p className="welcome-text_1">Welcome to Newsphere!</p>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
        <div className="form-group_1">
          <label htmlFor="username"></label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username" 
            value={formData.username}
            onChange={handleChange}
            required
            autoComplete="username"
            className="large-input_1"
          />
        </div>

          <div className="form-group_1 password-group_1">
            <div className="password-input_1">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="Password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                className="large-input_1"
              />
              <span className="eye-icon_1" onClick={() => setShowPassword(!showPassword)}>
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>

            {/* Forgot Password (Text Link) */}
            <p className="forgot-password_1" onClick={onForgotPassword}>
              Forgot password?
            </p>
          </div>

          <button type="submit" className="login-button_1" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log in"}
          </button>
        </form>

        {/* Display error message */}
        {error && <p className="error-message_1">{error}</p>}
      </div>
    </div>
  );
}

export default Login;