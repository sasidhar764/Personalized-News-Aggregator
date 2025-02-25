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
    <div className="login-overlay">
      <div className="login-modal">
        {/* Close button */}
        <button className="close-button" onClick={onClose}>X</button>

        {/* Login Heading */}
        <h2>LOGIN</h2>
        <p className="welcome-text">Welcome to Newsphere!</p>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
        <div className="form-group">
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
          />
        </div>

          <div className="form-group password-group">
            <div className="password-input">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="Password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
              <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>

            {/* Forgot Password (Text Link) */}
            <p className="forgot-password" onClick={onForgotPassword}>
              Forgot password?
            </p>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log in"}
          </button>
        </form>

        {/* Display error message */}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default Login;