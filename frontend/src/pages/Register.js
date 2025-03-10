import { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faTimes } from "@fortawesome/free-solid-svg-icons";
import "./Register.css";

function Register({ onClose }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    preferredCategory: [], // Array for multiple selections
    country: "",
    language: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const categoryOptions = ["Sports", "Business", "Technology", "Entertainment", "Health", "Science", "Politics"];
  const countryOptions = ["India", "USA", "UK", "Canada", "Australia", "Japan", "Germany"];
  const languageOptions = ["English", "Hindi", "Spanish", "French", "German", "Japanese", "Chinese"];

  const validatePassword = (password) => {
    const validations = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    };

    const failedValidations = [];
    if (!validations.length) failedValidations.push("at least 8 characters");
    if (!validations.uppercase) failedValidations.push("at least one uppercase letter");
    if (!validations.lowercase) failedValidations.push("at least one lowercase letter");
    if (!validations.number) failedValidations.push("at least one number");
    if (!validations.special) failedValidations.push("at least one special character");

    return {
      isValid: Object.values(validations).every(value => value === true),
      failedValidations
    };
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleCategorySelection = (category) => {
    if (formData.preferredCategory.includes(category)) {
      // Remove category if already selected
      setFormData({
        ...formData,
        preferredCategory: formData.preferredCategory.filter((item) => item !== category)
      });
    } else {
      // Add category if not already selected
      setFormData({
        ...formData,
        preferredCategory: [...formData.preferredCategory, category]
      });
    }
  };

  const closeAlert = () => {
    setShowAlert(false);
    setAlertMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.preferredCategory.length === 0) {
      setAlertMessage("Please select at least one category.");
      setShowAlert(true);
      return;
    }
  
    const { isValid, failedValidations } = validatePassword(formData.password);
  
    if (!isValid) {
      const message = `Your password must include ${failedValidations.join(", ")}.`;
      setAlertMessage(message);
      setShowAlert(true);
      return;
    }
  
    setIsLoading(true);
    setError("");
  
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/auth/register`,
        JSON.stringify(formData),
        { headers: { "Content-Type": "application/json" } }
      );
  
      console.log("Registration successful:", response.data);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Registration failed. Please try again.";
  
      if (errorMessage.includes("Username already exists")) {
        setError(errorMessage);
      } else if (errorMessage.includes("Email already exists")) {
        setError("An account with this email already exists. Please log in or use a different email.");
      } else {
        setError(errorMessage);
      }
  
      console.error("Error:", error.response ? error.response.data : error.message);
    } finally {
      setIsLoading(false);
    }
  };  

  return (
    <div className="signup-modal">
      <div className="signup-container">
        {/* Close Button - Icon */}
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <h2>SIGN UP</h2>
        <p><center>Create your account</center></p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Registration successful! Closing...</div>}

        {/* Password Requirements Alert */}
        {showAlert && (
          <div className="password-alert-overlay">
            <div className="password-alert">
              <h3>Requirements</h3>
              <p>{alertMessage}</p>
              <button onClick={closeAlert}>OK</button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <div className="formgroup">
              <input type="text" placeholder="Username" name="username" value={formData.username} onChange={handleChange} required />
            </div>
            <div className="formgroup">
              <input type="email" placeholder="Email Id" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="formgroup pasword-group">
              <div className="pasword-input">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                />
                <span className="eye-iicon" onClick={() => setShowPassword(!showPassword)}>
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </span>
              </div>
            </div>
            <div className="formgroup">
              <div className="custom-dropdown">
                <div 
                  className="dropdown-selector" 
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                >
                  {formData.preferredCategory.length === 0 
                    ? "Select your preferred categories" 
                    : `${formData.preferredCategory.length} categories selected`}
                </div>
                {categoryDropdownOpen && (
                  <div className="dropdown-menu">
                    {categoryOptions.map((category) => (
                      <div 
                        key={category} 
                        className={`dropdown-item ${formData.preferredCategory.includes(category) ? 'selected' : ''}`} 
                        onClick={() => toggleCategorySelection(category)}
                      >
                        <span className="checkbox">
                          {formData.preferredCategory.includes(category) && '✓'}
                        </span>
                        {category}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="formgroup">
              <select name="country" value={formData.country} onChange={handleChange} required>
                <option value="" disabled>Select your country</option>
                {countryOptions.map((country) => <option key={country} value={country}>{country}</option>)}
              </select>
            </div>
            <div className="formgroup">
              <select name="language" value={formData.language} onChange={handleChange} required>
                <option value="" disabled>Select your preferred language</option>
                {languageOptions.map((language) => <option key={language} value={language}>{language}</option>)}
              </select>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isLoading || success} 
            className="signup-button"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;