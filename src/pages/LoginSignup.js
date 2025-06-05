import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css';

function LoginSignup({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    securityQuestion: '',
    answer: ''
  });
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Add animation delay to make the appearance smoother
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    // Prevent scrolling on the background
    document.body.style.overflow = 'hidden';
    
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, []);

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setFormData({ 
      email: '', 
      password: '', 
      name: '', 
      phone: '', 
      securityQuestion: '', 
      answer: '' 
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Use the correct API endpoints
    const endpoint = isLogin 
      ? 'http://localhost:8080/users/login' 
      : 'http://localhost:8080/users';
    
    // Only send required fields based on login/signup
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : formData;
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Check if response is ok
      if (response.ok) {
        // Check content type to determine how to parse the response
        const contentType = response.headers.get("content-type");
        let data;
        
        if (contentType && contentType.includes("application/json")) {
          // Parse as JSON if it's JSON
          data = await response.json();
        } else {
          // Parse as text if it's not JSON
          data = await response.text();
        }
        
        if (isLogin) {
          // Extract user ID from the response
          const userId = extractUserId(data);
          if (userId) {
            // Save user ID to localStorage
            localStorage.setItem('userId', userId);
            
            // Pass user ID to parent component via onLogin callback
            if (onLogin) onLogin(userId);
          }
          
          // Animated transition to chat page
          setIsVisible(false);
          setTimeout(() => navigate('/chat'), 300);
        } else {
          // For signup, animate transition to home
          setIsVisible(false);
          setTimeout(() => navigate('/'), 300);
        }
      } else {
        // Handle error response
        try {
          const errorData = await response.json();
          alert(errorData.message || 'Something went wrong.');
        } catch (e) {
          const errorText = await response.text();
          alert(errorText || 'Something went wrong.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error connecting to the server.');
    }
  };
  
  // Function to extract user ID from login response
  const extractUserId = (data) => {
    // If data is a string like "Login successful for userid: 647bf38e-7e83-4343-93e4-8444a018c86b"
    if (typeof data === 'string' && data.includes('userid:')) {
      const match = data.match(/userid: ([0-9a-f-]+)/i);
      return match ? match[1] : null;
    }
    
    // If data is an object with userId property
    if (data && data.userId) {
      return data.userId;
    }
    
    return null;
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => navigate('/'), 300); // Navigate after animation completes
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className={`login-overlay ${isVisible ? 'visible' : ''}`} onClick={handleBackdropClick}>
      <div className="login-modal">
        <button className="close-button" onClick={handleClose}>×</button>
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-icon">👩‍🍳</span>
            <span className="logo-text">NutriSift</span>
          </div>
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Sign in to continue to NutriSift' : 'Join NutriSift and discover recipes'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {/* Form fields remain unchanged */}
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Name</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Enter your name"
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Phone</label>
                <div className="input-wrapper">
                  <span className="input-icon">📱</span>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    placeholder="Enter your phone number"
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Security Question</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔐</span>
                  <input 
                    type="text" 
                    name="securityQuestion" 
                    value={formData.securityQuestion} 
                    onChange={handleChange} 
                    placeholder="Enter a security question"
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Answer</label>
                <div className="input-wrapper">
                  <span className="input-icon">✅</span>
                  <input 
                    type="text" 
                    name="answer" 
                    value={formData.answer} 
                    onChange={handleChange} 
                    placeholder="Answer to your security question"
                    required 
                  />
                </div>
              </div>
            </>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Enter your email"
                required 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Enter your password"
                required 
              />
            </div>
          </div>
          
          <button type="submit" className="submit-button">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        
        <div className="login-footer">
          <p onClick={handleToggle} className="toggle-link">
            {isLogin 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Log in'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginSignup;
