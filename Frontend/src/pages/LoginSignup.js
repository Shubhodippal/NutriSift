import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './LoginSignup.css';
import successSound from '../assets/success.mp3'; 
import bcrypt from 'bcryptjs';

function LoginSignup({ onLogin }) {
  const location = useLocation();
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
    answerVerified: false,
    otp: '',
    otpSent: false,
    otpVerified: false,
    signupOtpSent: false,
    signupOtpVerified: false
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
  const [cooldownTime, setCooldownTime] = useState(0);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    setFormMode(prevMode => prevMode === 'login' ? 'signup' : 'login');
    setFormError('');
    setFormSuccess('');
    setFormData({ 
      email: '', 
      password: '', 
      name: '', 
      phone: '', 
      securityQuestion: '', 
      answer: '',
      newPassword: '',
      otp: '',
      otpSent: false,
      otpVerified: false,
      signupOtpSent: false,
      signupOtpVerified: false
    });
    setPasswordValid(false);
    setShowPasswordPolicy(false);
    setTermsAccepted(false);
  };

  const handleForgotPassword = () => {
    setFormMode('forgotPassword');
    setFormError('');
    setFormSuccess('');
    setFormData(prev => ({ 
      ...prev, 
      password: '',
      otp: '',
      otpSent: false,
      otpVerified: false
    }));
  };

  const handleBackToLogin = () => {
    setFormMode('login');
    setFormError('');
    setFormSuccess('');
    setFormData({ 
      email: '', 
      password: '', 
      name: '', 
      phone: '', 
      securityQuestion: '', 
      answer: '',
      newPassword: '',
      securityQuestionFetched: false,
      answerVerified: false,
      otp: '',
      otpSent: false,
      otpVerified: false,
      signupOtpSent: false,
      signupOtpVerified: false
    });
    setPasswordValid(false);
    setShowPasswordPolicy(false);
    setTermsAccepted(false);
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
      
      if ((name === 'newPassword' && formMode === 'forgotPassword') ||
          (name === 'password' && formMode === 'signup')) {
        setPasswordValid(validation.valid);
        setShowPasswordPolicy(value.length > 0);
      }
    }
  };

  const decodeJWT = (token) => {
    try {
      const [headerEncoded, payloadEncoded] = token.split('.');
      const payload = JSON.parse(atob(payloadEncoded));
      return payload;
    } catch (err) {
      console.error("Invalid JWT token:", err);
      return null;
    }
  };

  const sendOTP = async (type) => {
    if (type === 'signup') {
      if (!formData.email || !formData.name || !formData.phone || 
          !formData.securityQuestion || !formData.answer || !formData.password) {
        setFormError('Please fill in all required fields');
        return;
      }
      
      const validation = validatePassword(formData.password);
      if (!validation.valid) {
        setShowPasswordPolicy(true);
        setFormError('Please ensure your password meets all requirements.');
        return;
      }
      
      if (!termsAccepted) {
        setFormError("You must accept the Terms and Conditions to sign up.");
        return;
      }
    } else if (type === 'reset' && !formData.email) {
      setFormError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' ,
          [process.env.REACT_APP_API_KEY_HEADER]: process.env.REACT_APP_API_KEY},
        body: JSON.stringify({ email: formData.email, type })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.otpToken && data.status === "success") {
          localStorage.setItem('otpToken', data.otpToken);
          
          if (type === 'reset') {
            setFormData(prev => ({ ...prev, otpSent: true }));
          } else {
            setFormData(prev => ({ ...prev, signupOtpSent: true }));
          }
          
          setFormSuccess('OTP has been sent to your email');
          
          setCooldownTime(60);
          setCooldownActive(true);
        } else {
          setFormError('Invalid response from server. Please try again.');
        }
      } else {
        if (response.status === 409) {
          setFormError('An account with this email already exists. Please log in instead.');
        } else {
          const errorText = await response.text();
          setFormError(errorText || `Failed to send OTP for ${type}. Please try again.`);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setFormError('Error connecting to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = () => sendOTP('reset');
  const handleSendSignupOTP = () => sendOTP('signup');
  const verifyOTP = async (type) => {
    if (!formData.otp) {
      setFormError('Please enter the OTP sent to your email');
      return;
    }
    
    const otpToken = localStorage.getItem('otpToken');
    if (!otpToken) {
      setFormError('OTP session expired. Please request a new OTP.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const decodedToken = decodeJWT(otpToken);
      
      if (!decodedToken) {
        setFormError('Invalid OTP token. Please request a new OTP.');
        localStorage.removeItem('otpToken');
        return;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        setFormError('OTP has expired. Please request a new OTP.');
        localStorage.removeItem('otpToken');
        return;
      }
      
      if (!decodedToken.encodedOtp || decodedToken.type !== type || !decodedToken.email) {
        setFormError('Invalid OTP token format. Please request a new OTP.');
        localStorage.removeItem('otpToken');
        return;
      }
      
      const isMatch = await bcrypt.compare(formData.otp, decodedToken.encodedOtp);
      
      if (isMatch) {
        if (type === 'reset') {
          setFormData(prev => ({ ...prev, otpVerified: true }));
          handleFindAccount(); 
        } else {
          setFormData(prev => ({ ...prev, signupOtpVerified: true }));
        }
        
        setFormSuccess('OTP verified successfully!');
      } else {
        setFormError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setFormError('Error verifying OTP. Please try again.');
      localStorage.removeItem('otpToken');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = () => verifyOTP('reset');
  const handleVerifySignupOTP = () => verifyOTP('signup');
  const handleFindAccount = async () => {
    if (!formData.email) {
      setFormError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/security-question?email=${encodeURIComponent(formData.email)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' ,
          [process.env.REACT_APP_API_KEY_HEADER]: process.env.REACT_APP_API_KEY}
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAnswer = async () => {
    if (!formData.answer) {
      setFormError('Please enter your answer');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/verify-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' ,
          [process.env.REACT_APP_API_KEY_HEADER]: process.env.REACT_APP_API_KEY},
        body: JSON.stringify({ 
          email: formData.email,
          answer: formData.answer 
        })
      });
      
      if (response.ok) {
        setFormData(prev => ({ ...prev, answerVerified: true }));
        setShowPasswordPolicy(true);
        setFormSuccess('Answer verified. Please set a new password.');
      } else {
        setFormError('The answer is incorrect. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setFormError('Error connecting to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!passwordValid) {
      setFormError('Please ensure your password meets all requirements.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' ,
          [process.env.REACT_APP_API_KEY_HEADER]: process.env.REACT_APP_API_KEY},
        body: JSON.stringify({
          email: formData.email,
          answer: formData.answer,
          newPassword: formData.newPassword
        })
      });
      
      if (response.ok) {
        if (audioRef.current) {
          try {
            audioRef.current.volume = 1.0;
            await audioRef.current.play();
          } catch (err) {
            console.log("Audio couldn't play:", err);
          }
        }
        
        setFormSuccess('Password reset successful! You can now login with your new password.');
        setTimeout(() => {
          handleBackToLogin();
        }, 2000);
      } else {
        const errorText = await response.text();
        setFormError(errorText || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setFormError('Error connecting to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setFormError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        [process.env.REACT_APP_API_KEY_HEADER]: process.env.REACT_APP_API_KEY 
      },
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
          setFormError('Unexpected response from server. Please try again.');
          return;
        }

        const token = data.token;
        const decoded = decodeJWT(token);

        const ref_token = data.refreshToken;

        if (decoded?.userId) {
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', ref_token);

          if (onLogin) onLogin(decoded.userId);

          if (audioRef.current) {
            try {
              audioRef.current.volume = 1.0;
              await audioRef.current.play();
            } catch (err) {
              console.log("Audio couldn't play:", err);
            }
          }
          
          handleSuccess('/chat');
        } else {
          setFormError("Invalid token received. Please try again.");
        }
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    
    if (formData.signupOtpVerified) {
      completeSignup();
    } else if (formData.signupOtpSent) {
      handleVerifySignupOTP();
    } else {
      handleSendSignupOTP();
    }
  };

  const completeSignup = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' ,
          [process.env.REACT_APP_API_KEY_HEADER]: process.env.REACT_APP_API_KEY},
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          securityQuestion: formData.securityQuestion,
          securityAnswer: formData.answer,
          otpToken: localStorage.getItem('otpToken')
        })
      });

      if (response.ok) {
        const responseText = await response.text();
        console.log("Server response:", responseText);
        
        // Automatically log in the user after successful signup
        try {
          const loginResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              [process.env.REACT_APP_API_KEY_HEADER]: process.env.REACT_APP_API_KEY 
            },
            body: JSON.stringify({ 
              email: formData.email, 
              password: formData.password 
            })
          });

          if (loginResponse.ok) {
            const contentType = loginResponse.headers.get("content-type");
            let data;

            if (contentType && contentType.includes("application/json")) {
              data = await loginResponse.json();
            } else {
              data = await loginResponse.text();
              setFormError('Unexpected response from server during login. Please try logging in manually.');
              return;
            }

            const token = data.token;
            const decoded = decodeJWT(token);

            const ref_token = data.refreshToken;

            if (decoded?.userId) {
              localStorage.setItem('token', token);
              localStorage.setItem('refreshToken', ref_token);

              if (onLogin) onLogin(decoded.userId);

              if (audioRef.current) {
                try {
                  audioRef.current.volume = 1.0;
                  await audioRef.current.play();
                } catch (err) {
                  console.log("Audio couldn't play:", err);
                }
              }
              
              setFormSuccess('Account created and logged in successfully!');
              setAnimateSuccess(true);
              
              setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => navigate('/chat'), 400);
              }, 600);
            } else {
              setFormError("Invalid token received. Please try logging in manually.");
            }
          } else {
            setFormError('Account created but failed to log in automatically. Please log in manually.');
          }
        } catch (loginError) {
          console.error('Error during automatic login:', loginError);
          setFormError('Account created but failed to log in automatically. Please log in manually.');
        }
      } else {
        if (response.status === 409) {
          setFormError('An account with this email already exists.');
        } else {
          const errorText = await response.text();
          setFormError(errorText || 'Failed to create account. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setFormError('Error connecting to the server.');
    } finally {
      setIsLoading(false);
      localStorage.removeItem('otpToken');
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

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setFormError('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          [process.env.REACT_APP_API_KEY_HEADER]: process.env.REACT_APP_API_KEY 
        },
        body: JSON.stringify({ 
          email: 'Shubhodippal01@gmail.com', 
          password: 'Meow@20meow' 
        })
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        let data;

        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          data = await response.text();
          setFormError('Unexpected response from server. Please try again.');
          return;
        }

        const token = data.token;
        const decoded = decodeJWT(token);
        const ref_token = data.refreshToken;

        if (decoded?.userId) {
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', ref_token);

          if (onLogin) onLogin(decoded.userId);

          if (audioRef.current) {
            try {
              audioRef.current.volume = 1.0;
              await audioRef.current.play();
            } catch (err) {
              console.log("Audio couldn't play:", err);
            }
          }
          
          handleSuccess('/chat');
        } else {
          setFormError("Invalid token received. Please try again.");
        }
      } else {
        if (response.status === 401 || response.status === 403) {
          setFormError('Guest login failed. Please try regular login.');
        } else {
          setFormError('Guest login is currently unavailable. Please try again later.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setFormError('Error connecting to the server.');
    } finally {
      setIsLoading(false);
    }
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
    setAnimateSuccess(true);
    
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => navigate(destination), 400);
    }, 600);
  };

  useEffect(() => {
    let timer;
    
    if (formError) {
      timer = setTimeout(() => {
        setFormError('');
      }, 5000); 
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [formError]);

  useEffect(() => {
    let timer;
    
    if (formSuccess) {
      timer = setTimeout(() => {
        setFormSuccess('');
      }, 5000); 
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [formSuccess]);

  useEffect(() => {
    let timer;
    if (cooldownActive && cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime(prevTime => {
          if (prevTime <= 1) {
            setCooldownActive(false);
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldownActive, cooldownTime]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const LoadingSpinner = () => (
    <div className="spinner-container">
      <div className="spinner"></div>
    </div>
  );

  useEffect(() => {
    // Check for formMode parameter in URL
    const params = new URLSearchParams(location.search);
    const mode = params.get('formMode');
    
    if (mode === 'signup') {
      setFormMode('signup');
    }
  }, [location]);

  return (
    <>
      
      <div className={`login-overlay ${isVisible ? 'visible' : ''}`} onClick={handleBackdropClick}>
        <audio ref={audioRef} src={successSound} preload="auto" />
        
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
                      disabled={formData.signupOtpSent}
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
                      disabled={formData.signupOtpSent}
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
                      disabled={formData.signupOtpSent}
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
                      disabled={formData.signupOtpSent}
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
                  disabled={(formMode === 'forgotPassword' && formData.otpSent) || 
                           (formMode === 'signup' && formData.signupOtpSent)}
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
                    disabled={formMode === 'signup' && formData.signupOtpSent}
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
            
            {formMode === 'forgotPassword' && formData.otpSent && !formData.otpVerified && (
              <>
                <div className="form-group">
                  <label>Enter OTP</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔢</span>
                    <input 
                      type="text" 
                      name="otp" 
                      value={formData.otp} 
                      onChange={handleChange} 
                      placeholder="Enter OTP sent to your email"
                      required 
                    />
                  </div>
                </div>
                <div className="resend-otp-container">
                  <button 
                    type="button"
                    className="resend-otp-button"
                    onClick={handleSendOTP}
                    disabled={cooldownActive || isLoading}
                  >
                    {cooldownActive 
                      ? `Resend OTP (${cooldownTime}s)` 
                      : isLoading 
                        ? "Sending..." 
                        : "Resend OTP"}
                  </button>
                </div>
              </>
            )}
            
            {formMode === 'forgotPassword' && formData.otpVerified && (
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
                          : "Fetching security question..."}
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
                          disabled={formData.answerVerified}
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
            
            {formMode === 'signup' && formData.signupOtpSent && !formData.signupOtpVerified && (
              <>
                <div className="form-group">
                  <label>Enter OTP</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔢</span>
                    <input 
                      type="text" 
                      name="otp" 
                      value={formData.otp} 
                      onChange={handleChange} 
                      placeholder="Enter OTP sent to your email"
                      required 
                    />
                  </div>
                </div>
                <div className="resend-otp-container">
                  <button 
                    type="button"
                    className="resend-otp-button"
                    onClick={handleSendSignupOTP}
                    disabled={cooldownActive || isLoading}
                  >
                    {cooldownActive 
                      ? `Resend OTP (${cooldownTime}s)` 
                      : isLoading 
                        ? "Sending..." 
                        : "Resend OTP"}
                  </button>
                </div>
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
                    disabled={formData.signupOtpSent}
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
                {!formData.otpSent ? (
                  <button 
                    type="button" 
                    className="submit-button"
                    onClick={handleSendOTP}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner /> Sending OTP...
                      </>
                    ) : 'Send OTP'}
                  </button>
                ) : !formData.otpVerified ? (
                  <button 
                    type="button" 
                    className="submit-button"
                    onClick={handleVerifyOTP}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner /> Verifying...
                      </>
                    ) : 'Verify OTP'}
                  </button>
                ) : !formData.answerVerified ? (
                  <button 
                    type="button" 
                    className="submit-button"
                    onClick={handleVerifyAnswer}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner /> Verifying...
                      </>
                    ) : 'Verify Answer'}
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={!passwordValid || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner /> Resetting...
                      </>
                    ) : 'Reset Password'}
                  </button>
                )}
                
                <button 
                  type="button" 
                  className="back-to-login-button"
                  onClick={handleBackToLogin}
                  disabled={isLoading}
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <div className="button-container">
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={(formMode === 'signup' && (
                    (!passwordValid || !termsAccepted) || 
                    (formData.signupOtpSent && !formData.otp) ||
                    isLoading
                  )) || (formMode === 'login' && isLoading)}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner /> {formMode === 'login' ? 'Logging in...' : 
                        formData.signupOtpSent && !formData.signupOtpVerified ? 'Verifying...' : 
                        formData.signupOtpVerified ? 'Creating Account...' : 'Sending OTP...'}
                    </>
                  ) : (
                    formMode === 'login' ? 'Login' : 
                    formData.signupOtpSent && !formData.signupOtpVerified ? 'Verify OTP' : 
                    formData.signupOtpVerified ? 'Complete Signup' : 'Send OTP'
                  )}
                </button>
                
                {formMode === 'login' && (
                  <button 
                    type="button" 
                    onClick={handleGuestLogin} 
                    className="guest-login-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Guest Login'}
                  </button>
                )}
              </div>
            )}
          </form>
          
          <div className="login-footer">
            {formMode === 'login' && (
              <p onClick={handleForgotPassword} className="forgot-password-link">
                Forgot your password?
              </p>
            )}
            
            {(formMode === 'login' || formMode === 'signup') && (
              <p onClick={handleToggle} className="toggle-link">
                {formMode === 'login' 
                  ? "Don't have an account? Sign up" 
                  : 'Already have an account? Log in'}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
export default LoginSignup;