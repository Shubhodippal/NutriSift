import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginSignup.css';
import successSound from '../assets/success.mp3'; 
import AnimatedBackground from '../components/AnimatedBackground'; 

function LoginSignup({ onLogin }) {
  const audioRef = useRef(null);
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
  const [passwordVisible, setPasswordVisible] = useState(false); 
  const [passwordValid, setPasswordValid] = useState(false);
  const [showPasswordPolicy, setShowPasswordPolicy] = useState(false);
  const [formMode, setFormMode] = useState('login'); 
  const [formSuccess, setFormSuccess] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();
  
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
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    document.body.style.overflow = 'hidden';
    
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);
  
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

  const handleForgotPassword = () => {
    setFormMode('forgotPassword');
    setFormError('');
    setFormData(prev => ({ ...prev, password: '' }));
  };

  const handleBackToLogin = () => {
    setFormMode('login');
    setFormError('');
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    
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
    
    if (name === 'email') {
      setFormError('');
    }
    
    if (name === 'password' || name === 'newPassword') {
      const validation = validatePassword(value);
      
      if (name === 'newPassword' && formMode === 'forgotPassword') {
        setPasswordValid(validation.valid);
        if (value.length > 0) {
          setShowPasswordPolicy(true);
        } else {
          setShowPasswordPolicy(false);
        }
      } else if (name === 'password' && formMode === 'signup') {
        setPasswordValid(validation.valid);
        if (value.length > 0) {
          setShowPasswordPolicy(true);
        } else {
          setShowPasswordPolicy(false);
        }
      }
    }
  };

  const handleFindAccount = async () => {
    if (!formData.email) {
      setFormError('Please enter your email address');
      return;
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/security-question?email=${encodeURIComponent(formData.email)}`, {
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

  const handleVerifyAnswer = async () => {
    if (!formData.answer) {
      setFormError('Please enter your answer');
      return;
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/verify-answer`, {
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

  const handleResetPassword = async () => {
    if (!passwordValid) {
      setFormError('Please ensure your password meets all requirements.');
      return;
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          answer: formData.answer,
          newPassword: formData.newPassword
        })
      });
      
      if (response.ok) {
        setFormSuccess('Password reset successful! You can now login with your new password.');
        setTimeout(() => {
          setFormMode('login');
          setFormData(prev => ({ 
            ...prev, 
            password: '', 
            newPassword: '', 
            answer: '',
            securityQuestion: '',
            securityQuestionFetched: false,
            answerVerified: false
          }));
        }, 2000);
      } else {
        const errorText = await response.text();
        setFormError(errorText || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setFormError('Error connecting to the server. Please try again.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password 
        })
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        let data;
        
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          data = await response.text();
        }
        
        const userId = extractUserId(data);
        const userEmail = extractUserEmail(data);
        
        if (userId) {
          localStorage.setItem('userId', userId);
          localStorage.setItem('userEmail', userEmail || formData.email);
          if (onLogin) onLogin(userId);
        }
        
        handleSuccess('/chat');
      } else {
        if (response.status === 401 || response.status === 403) {
          setFormError('Invalid email or password. Please try again.');
        } else if (response.status === 404) {
          setFormError('Account not found. Please check your email or create a new account.');
        } else {
          const errorText = await response.text();
          setFormError(errorText || 'Something went wrong. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setFormError('Error connecting to the server.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      setFormError("You must accept the Terms and Conditions to sign up.");
      return;
    }
    
    const validation = validatePassword(formData.password);
    if (!validation.valid) {
      setShowPasswordPolicy(true);
      setFormError('Please ensure your password meets all requirements.');
      return;
    }
    
    if (!formData.securityQuestion || !formData.answer) {
      setFormError('Please select a security question and provide an answer.');
      return;
    }
    
    try {
      console.log("Sending signup payload:", {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        securityQuestion: formData.securityQuestion,
        securityAnswer: formData.answer 
      });
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          securityQuestion: formData.securityQuestion,
          securityAnswer: formData.answer 
        })
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        let data;
        
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          data = await response.text();
        }
        
        const userId = extractUserId(data);
        
        if (userId) {
          localStorage.setItem('userId', userId);
          localStorage.setItem('userEmail', formData.email);
          if (onLogin) onLogin(userId);
          
          setAnimateSuccess(true);
          handleSuccess('/chat');
        } else {
          handleSuccess('/');
        }
      } else {
        if (response.status === 409) {
          setFormError('An account with this email already exists. Please log in instead.');
        } else {
          const errorText = await response.text();
          setFormError(errorText || 'Something went wrong. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setFormError('Error connecting to the server.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formMode === 'login') {
      handleLogin(e);
    } else if (formMode === 'signup') {
      handleSignup(e);
    } else if (formMode === 'forgotPassword' && formData.answerVerified) {
      handleResetPassword();
    }
  };
  
  const extractUserId = (data) => {
    if (typeof data === 'string' && data.includes('userid:')) {
      const match = data.match(/userid: ([0-9a-f-]+)/i);
      return match ? match[1] : null;
    }
    
    if (data && data.userId) {
      return data.userId;
    }
    
    return null;
  };

  const extractUserEmail = (data) => {
    if (typeof data === 'object' && data !== null) {
      return data.email || data.userEmail || data.mail;
    }
    return null;
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => navigate('/'), 300); 
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSuccess = (destination) => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        console.log("Audio couldn't play:", err);
      });
    }
    
    setAnimateSuccess(true);
    
    setTimeout(() => {
      setIsVisible(false);
      
      setTimeout(() => navigate(destination), 400);
    }, 600);
  };

  useEffect(() => {
    let errorTimer;
    
    if (formError) {
      errorTimer = setTimeout(() => {
        setFormError('');
      }, 5000); 
    }
    
    return () => {
      if (errorTimer) clearTimeout(errorTimer);
    };
  }, [formError]);

  useEffect(() => {
    let successTimer;
    
    if (formSuccess) {
      successTimer = setTimeout(() => {
        setFormSuccess('');
      }, 5000); 
    }
    
    return () => {
      if (successTimer) clearTimeout(successTimer);
    };
  }, [formSuccess]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <>
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
                  <label>Security Answer</label>
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
            
            {formMode === 'signup' && (
              <div className="terms-container">
                <label className="terms-label">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={() => setTermsAccepted(!termsAccepted)}
                    className="terms-checkbox"
                  />
                  <span className="terms-text">
                    I accept the <Link to="/terms-and-conditions" target="_blank" className="terms-link">Terms and Conditions</Link>
                  </span>
                </label>
              </div>
            )}

            {formSuccess && (
              <div className="form-success">
                <span className="success-icon">✅</span>
                <span className="success-message">{formSuccess}</span>
              </div>
            )}

            {formError && (
              <div className="form-error">
                <span className="error-icon">⚠️</span>
                <span className="error-message">{formError}</span>
              </div>
            )}

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
                disabled={(formMode === 'signup' && (!passwordValid || !termsAccepted))}
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
