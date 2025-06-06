import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css';
import successSound from '../assets/success.mp3'; 
import AnimatedBackground from '../components/AnimatedBackground'; // Change to AnimatedBackground

function LoginSignup({ onLogin }) {
  const audioRef = useRef(null);
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
  const [animateSuccess, setAnimateSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false); // <-- Password visibility state
  const [passwordValid, setPasswordValid] = useState(false);
  const [showPasswordPolicy, setShowPasswordPolicy] = useState(false);
  const navigate = useNavigate();
  
  // Security questions list
  const securityQuestions = [
    "What was your first pet's name?",
    "What is your mother's maiden name?",
    "What city were you born in?",
    "What is the name of your elementary school?",
    "What was your childhood nickname?",
    "What is your favorite movie?",
    "What was the make of your first car?",
    "Who was your childhood hero?"
  ];

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

  // Safe audio cleanup
  useEffect(() => {
    return () => {
      // If there's an audio element and it's playing, stop it before unmounting
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);
  
  const handleToggle = () => {
    setIsLogin(!isLogin);
    setFormError('');
    setFormData({ 
      email: '', 
      password: '', 
      name: '', 
      phone: '', 
      securityQuestion: '', 
      answer: '' 
    });
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return {
      valid: minLength && hasUpperCase && hasLowerCase && hasDigit && hasSpecial,
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasDigit,
      hasSpecial
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error message when user changes the email field
    if (name === 'email') {
      setFormError('');
    }
    
    // Validate password when it changes
    if (name === 'password') {
      const validation = validatePassword(value);
      setPasswordValid(validation.valid);
      
      // Show password policy if user started typing a password
      if (value.length > 0 && !isLogin) {
        setShowPasswordPolicy(true);
      } else {
        setShowPasswordPolicy(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For signup, validate password before submission
    if (!isLogin) {
      const validation = validatePassword(formData.password);
      if (!validation.valid) {
        setShowPasswordPolicy(true);
        setFormError('Please ensure your password meets all requirements.');
        return;
      }
    }
    
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
          
          // Use the success handler to navigate to chat
          handleSuccess('/chat');
        } else {
          // For signup, extract user ID and log in automatically
          const userId = extractUserId(data);
          if (userId) {
            // Save user ID to localStorage (automatic login)
            localStorage.setItem('userId', userId);
            
            // Pass user ID to parent component via onLogin callback
            if (onLogin) onLogin(userId);
            
            // Show a more specific success message
            setAnimateSuccess(true);
            
            // Use the success handler to navigate to chat (same as login)
            handleSuccess('/chat');
          } else {
            // If we couldn't extract a user ID, just go to home page
            handleSuccess('/');
          }
        }
      } else {
        // Handle error response
        if (response.status === 409) {
          // This is the specific error for existing email
          setFormError('An account with this email already exists. Please log in instead.');
        } else {
          try {
            const errorData = await response.json();
            setFormError(errorData.message || 'Something went wrong. Please try again.');
          } catch (e) {
            const errorText = await response.text();
            // Check if the error text is the email exists message
            if (errorText === "Email already exists.") {
              setFormError('An account with this email already exists. Please log in instead.');
            } else {
              setFormError(errorText || 'Something went wrong. Please try again.');
            }
          }
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

  // Handle success with sound and animation
  const handleSuccess = (destination) => {
    // Play the success sound
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        console.log("Audio couldn't play:", err);
      });
    }
    
    // Start success animation
    setAnimateSuccess(true);
    
    // Wait for the animation, then redirect
    setTimeout(() => {
      setIsVisible(false);
      
      // Navigate after animation completes
      setTimeout(() => navigate(destination), 400);
    }, 600);
  };

  // Auto-clear error message after 5 seconds
  useEffect(() => {
    let errorTimer;
    
    if (formError) {
      errorTimer = setTimeout(() => {
        setFormError('');
      }, 5000); // Error will disappear after 5 seconds
    }
    
    // Clean up the timer if component unmounts or error changes
    return () => {
      if (errorTimer) clearTimeout(errorTimer);
    };
  }, [formError]);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <>
      {/* Replace LoginBackground with AnimatedBackground */}
      <AnimatedBackground />
      
      <div className={`login-overlay ${isVisible ? 'visible' : ''}`} onClick={handleBackdropClick}>
        <audio ref={audioRef} src={successSound} />
        
        <div className={`login-modal ${animateSuccess ? 'success-animation' : ''}`}>
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
                  type={passwordVisible ? "text" : "password"}
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="Enter your password"
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={togglePasswordVisibility}
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                >
                  {passwordVisible ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
            </div>
            
            {/* Security question and answer moved to the end and changed to dropdown */}
            {!isLogin && (
              <>
                <div className="form-group">
                  <label>Security Question</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔐</span>
                    <select
                      name="securityQuestion"
                      value={formData.securityQuestion}
                      onChange={handleChange}
                      required
                      className="security-dropdown"
                    >
                      <option value="" disabled>Select a security question</option>
                      {securityQuestions.map((question, index) => (
                        <option key={index} value={question}>
                          {question}
                        </option>
                      ))}
                    </select>
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
            
            {/* KEEP ONLY ONE error message block - right before the submit button */}
            {formError && (
              <div className="form-error">
                <span className="error-icon">⚠️</span>
                <span className="error-message">{formError}</span>
              </div>
            )}

            {/* Add password policy message */}
            {!isLogin && showPasswordPolicy && (
              <div className="password-policy">
                <p className="policy-header">Password must contain:</p>
                <ul>
                  <li className={validatePassword(formData.password).minLength ? 'valid' : 'invalid'}>
                    At least 8 characters
                  </li>
                  <li className={validatePassword(formData.password).hasUpperCase ? 'valid' : 'invalid'}>
                    At least one uppercase letter (A-Z)
                  </li>
                  <li className={validatePassword(formData.password).hasLowerCase ? 'valid' : 'invalid'}>
                    At least one lowercase letter (a-z)
                  </li>
                  <li className={validatePassword(formData.password).hasDigit ? 'valid' : 'invalid'}>
                    At least one digit (0-9)
                  </li>
                  <li className={validatePassword(formData.password).hasSpecial ? 'valid' : 'invalid'}>
                    At least one special character (!@#$%^&*...)
                  </li>
                </ul>
              </div>
            )}

            <button 
              type="submit" 
              className="submit-button"
              disabled={!isLogin && !passwordValid}
            >
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
    </>
  );
}

export default LoginSignup;
