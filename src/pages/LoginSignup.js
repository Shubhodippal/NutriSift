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
    answer: '',
    newPassword: '',
    securityQuestionFetched: false,
    answerVerified: false
  });
  const [isVisible, setIsVisible] = useState(false);
  const [animateSuccess, setAnimateSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false); // <-- Password visibility state
  const [passwordValid, setPasswordValid] = useState(false);
  const [showPasswordPolicy, setShowPasswordPolicy] = useState(false);
  const [formMode, setFormMode] = useState('login'); // 'login', 'signup', or 'forgotPassword'
  const [formSuccess, setFormSuccess] = useState('');
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
  
  // Then update the handleToggle function to handle all modes
  const handleToggle = () => {
    if (formMode === 'login') {
      setFormMode('signup');
    } else {
      setFormMode('login');
    }
    
    setFormError('');
    setFormData({ 
      email: '', 
      password: '', 
      name: '', 
      phone: '', 
      securityQuestion: '', 
      answer: '',
      newPassword: ''
    });
  };

  // Add a function to handle forgot password clicks
  const handleForgotPassword = () => {
    setFormMode('forgotPassword');
    setFormError('');
    setFormData(prev => ({ ...prev, password: '' }));
  };

  // Add a function to go back to login
  const handleBackToLogin = () => {
    setFormMode('login');
    setFormError('');
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
    
    // Validate password or newPassword when they change
    if (name === 'password' || name === 'newPassword') {
      const validation = validatePassword(value);
      
      if (name === 'newPassword' && formMode === 'forgotPassword') {
        setPasswordValid(validation.valid);
        // Show password policy for new password in forgot password flow
        if (value.length > 0) {
          setShowPasswordPolicy(true);
        } else {
          setShowPasswordPolicy(false);
        }
      } else if (name === 'password' && formMode === 'signup') {
        setPasswordValid(validation.valid);
        // Show password policy for regular password in signup flow
        if (value.length > 0) {
          setShowPasswordPolicy(true);
        } else {
          setShowPasswordPolicy(false);
        }
      }
    }
  };

  // Function to find account by email
  const handleFindAccount = async () => {
    if (!formData.email) {
      setFormError('Please enter your email address');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8080/users/security-question?email=${encodeURIComponent(formData.email)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ 
          ...prev, 
          securityQuestion: data.securityQuestion,
          securityQuestionFetched: true 
        }));
      } else {
        setFormError('No account found with this email address.');
      }
    } catch (error) {
      console.error('Error:', error);
      setFormError('Error connecting to the server. Please try again.');
    }
  };

  // Function to verify security question answer
  const handleVerifyAnswer = async () => {
    if (!formData.answer) {
      setFormError('Please enter your answer');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8080/users/verify-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email,
          answer: formData.answer 
        })
      });
      
      if (response.ok) {
        setFormData(prev => ({ ...prev, answerVerified: true }));
        setShowPasswordPolicy(true);
      } else {
        setFormError('The answer is incorrect. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setFormError('Error connecting to the server. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formMode === 'forgotPassword') {
      // For password reset
      const validation = validatePassword(formData.newPassword);
      if (!validation.valid) {
        setShowPasswordPolicy(true);
        setFormError('Please ensure your password meets all requirements.');
        return;
      }
      
      try {
        const response = await fetch('http://localhost:8080/users/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: formData.email,
            newPassword: formData.newPassword 
          })
        });
        
        // Play success sound
        if (audioRef.current) {
          audioRef.current.play().catch(err => {
            console.log("Audio couldn't play:", err);
          });
        }

        // Show success animation
        setAnimateSuccess(true);
        
        // Reset form to login mode after animation
        setTimeout(() => {
          // Keep the email for convenience
          const currentEmail = formData.email;
          
          // Reset form mode
          setFormMode('login');
          
          // Reset form with the same email
          setFormData({
            email: currentEmail,
            password: '',
            name: '',
            phone: '',
            securityQuestion: '',
            answer: '',
            newPassword: '',
            securityQuestionFetched: false,
            answerVerified: false
          });
          
          // Show success message instead of error
          setFormSuccess('Password reset successful! Please log in with your new password.');
        }, 800);
      } catch (error) {
        console.error('Error:', error);
        setFormError('Error connecting to the server. Please try again.');
      }
      return;
    }
    
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
      ? 'https://backend.shubhodip.in/users/login' 
      : 'https://backend.shubhodip.in/users';
    
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
          // Extract user ID and email from the response
          const userId = extractUserId(data);
          const userEmail = extractUserEmail(data);
          
          if (userId) {
            // Save user ID and email to localStorage
            localStorage.setItem('userId', userId);
            localStorage.setItem('userEmail', userEmail || formData.email); // Use form email as fallback
            
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
        } else if (response.status === 401 || response.status === 403) {
          // Authentication errors - invalid credentials
          setFormError('Invalid email or password. Please try again.');
        } else if (response.status === 404) {
          // User not found
          setFormError('Account not found. Please check your email or create a new account.');
        } else {
          try {
            const errorData = await response.json();
            setFormError(errorData.message || 'Something went wrong. Please try again.');
          } catch (e) {
            const errorText = await response.text();
            // Handle different error text messages
            if (errorText === "Email already exists.") {
              setFormError('An account with this email already exists. Please log in instead.');
            } else if (errorText.includes("Invalid") || errorText.includes("incorrect") || 
                      errorText.includes("wrong password") || errorText.includes("password doesn't match")) {
              setFormError('Invalid email or password. Please try again.');
            } else if (errorText.includes("not found") || errorText.includes("doesn't exist")) {
              setFormError('Account not found. Please check your email or create a new account.');
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

  // New helper function to extract user email
  const extractUserEmail = (data) => {
    if (typeof data === 'object' && data !== null) {
      return data.email || data.userEmail || data.mail;
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

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    let successTimer;
    
    if (formSuccess) {
      successTimer = setTimeout(() => {
        setFormSuccess('');
      }, 5000); // Success will disappear after 5 seconds
    }
    
    // Clean up the timer if component unmounts or message changes
    return () => {
      if (successTimer) clearTimeout(successTimer);
    };
  }, [formSuccess]);

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
            <h2>
              {formMode === 'login' ? 'Welcome Back' : 
               formMode === 'signup' ? 'Create Account' : 
               'Reset Password'}
            </h2>
            <p>
              {formMode === 'login' ? 'Sign in to continue to NutriSift' : 
               formMode === 'signup' ? 'Join NutriSift and discover recipes' : 
               'Recover access to your account'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            {/* Signup fields */}
            {formMode === 'signup' && (
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
            
            {/* Password field - shown only in login and signup */}
            {formMode !== 'forgotPassword' && (
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
            )}
            
            {/* Forgot password specific fields */}
            {formMode === 'forgotPassword' && (
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
                      disabled={!formData.securityQuestionFetched}
                    >
                      <option value="" disabled>
                        {formData.securityQuestionFetched 
                          ? "Select your security question" 
                          : "Enter email and click 'Find Account'"}
                      </option>
                      {formData.securityQuestionFetched && (
                        <option value={formData.securityQuestion}>
                          {formData.securityQuestion}
                        </option>
                      )}
                    </select>
                  </div>
                </div>
                
                {formData.securityQuestionFetched && (
                  <>
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
                    
                    {formData.answerVerified && (
                      <div className="form-group">
                        <label>New Password</label>
                        <div className="input-wrapper">
                          <span className="input-icon">🔒</span>
                          <input 
                            type={passwordVisible ? "text" : "password"}
                            name="newPassword" 
                            value={formData.newPassword} 
                            onChange={handleChange} 
                            placeholder="Enter new password"
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
                    )}
                  </>
                )}
              </>
            )}
            
            {/* Display success message */}
            {formSuccess && (
              <div className="form-success">
                <span className="success-icon">✅</span>
                <span className="success-message">{formSuccess}</span>
              </div>
            )}

            {/* Display error message (keep this) */}
            {formError && (
              <div className="form-error">
                <span className="error-icon">⚠️</span>
                <span className="error-message">{formError}</span>
              </div>
            )}

            {/* Password policy - shown in signup and when creating new password */}
            {(formMode === 'signup' || (formMode === 'forgotPassword' && formData.answerVerified)) && 
             showPasswordPolicy && (
              <div className="password-policy">
                <p className="policy-header">Password must contain:</p>
                <ul>
                  <li className={validatePassword(formMode === 'forgotPassword' ? formData.newPassword : formData.password).minLength ? 'valid' : 'invalid'}>
                    At least 8 characters
                  </li>
                  <li className={validatePassword(formMode === 'forgotPassword' ? formData.newPassword : formData.password).hasUpperCase ? 'valid' : 'invalid'}>
                    At least one uppercase letter (A-Z)
                  </li>
                  <li className={validatePassword(formMode === 'forgotPassword' ? formData.newPassword : formData.password).hasLowerCase ? 'valid' : 'invalid'}>
                    At least one lowercase letter (a-z)
                  </li>
                  <li className={validatePassword(formMode === 'forgotPassword' ? formData.newPassword : formData.password).hasDigit ? 'valid' : 'invalid'}>
                    At least one digit (0-9)
                  </li>
                  <li className={validatePassword(formMode === 'forgotPassword' ? formData.newPassword : formData.password).hasSpecial ? 'valid' : 'invalid'}>
                    At least one special character (!@#$%^&*...)
                  </li>
                </ul>
              </div>
            )}

            {/* Form Buttons */}
            {formMode === 'forgotPassword' ? (
              <div className="forgot-password-buttons">
                {!formData.securityQuestionFetched ? (
                  <button 
                    type="button" 
                    className="submit-button"
                    onClick={handleFindAccount}
                  >
                    Find Account
                  </button>
                ) : !formData.answerVerified ? (
                  <button 
                    type="button" 
                    className="submit-button"
                    onClick={handleVerifyAnswer}
                  >
                    Verify Answer
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={!passwordValid}
                  >
                    Reset Password
                  </button>
                )}
                
                <button 
                  type="button" 
                  className="back-to-login-button"
                  onClick={handleBackToLogin}
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <button 
                type="submit" 
                className="submit-button"
                disabled={formMode === 'signup' && !passwordValid}
              >
                {formMode === 'login' ? 'Login' : 'Sign Up'}
              </button>
            )}
          </form>
          
          <div className="login-footer">
            {formMode === 'login' && (
              <p onClick={handleForgotPassword} className="forgot-password-link">
                Forgot your password?
              </p>
            )}
            
            <p onClick={handleToggle} className="toggle-link">
              {formMode === 'login' 
                ? "Don't have an account? Sign up" 
                : formMode === 'signup'
                  ? 'Already have an account? Log in'
                  : null}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginSignup;
