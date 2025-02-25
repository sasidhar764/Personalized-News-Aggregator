import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import "./resetpasword.css";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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

  const closeAlert = () => {
    setShowAlert(false);
    setAlertMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Check if passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password complexity
    const { isValid, failedValidations } = validatePassword(formData.newPassword);
    
    if (!isValid) {
      const message = `Your password must include ${failedValidations.join(", ")}.`;
      setAlertMessage(message);
      setShowAlert(true);
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
        }),
      });
      
      if (response.ok) {
        setSuccess(true);
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please try again later.');
      console.error('Error resetting password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Your Password</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">
          Password reset successfully! Redirecting to home page...
        </div>
      )}
      
      {/* Password Requirements Alert */}
      {showAlert && (
        <div className="password-alert-overlay">
          <div className="password-alert">
            <h3>Password Requirements</h3>
            <p>{alertMessage}</p>
            <button onClick={closeAlert}>OK</button>
          </div>
        </div>
      )}
      
      {!success && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="reset-button"
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
}

export default ResetPassword;