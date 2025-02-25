import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import "./resetpasword.css"

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Password validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);

    console.log("hi",JSON.stringify({
      token,
      newPassword: formData.newPassword,
    }))

    console.log("Token from URL:", token);
    
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
              minLength="6"
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