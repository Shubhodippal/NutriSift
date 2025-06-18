import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileDetails.css';
import HamburgerMenu from '../components/HamburgerMenu';

function ProfileDetails() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formTouched, setFormTouched] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  
  const [profile, setProfile] = useState({
    name: '',
    weight: '',
    height: '',
    gender: '',
    dob: '',
    dietPref: '',  // Changed from diet_pref
    bodyGoal: '',  // Changed from body_goal
    allergies: '',
    city: '',
    country: '',
    address: '',
    pincode: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  const dietPreferences = [
    'Vegetarian',
    'Vegan',
    'Pescatarian',
    'Keto',
    'Paleo',
    'Mediterranean',
    'Omnivore/No restriction',
    'Gluten-free',
    'Dairy-free'
  ];
  
  const bodyGoals = [
    'Weight loss',
    'Muscle gain',
    'Maintenance',
    'General health',
    'Athletic performance',
    'Improved energy',
    'Better sleep'
  ];
  
    const getUserEmailFromToken = (token) => {
        try {
            // Basic JWT parsing (payload is the second part)
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            return payload.sub || payload.email; // Adjust based on your token structure
        } catch (error) {
            console.error('Error parsing token:', error);
            return null;
        }
    }


  // Fetch existing profile data if available
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        setIsLoading(true);
        
        // Get the user's email from the token or user data
        const userEmail = getUserEmailFromToken(token);
        if (!userEmail) {
          setMessage({
            text: 'Unable to identify user. Please log in again.',
            type: 'error'
          });
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/profile/${userEmail}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            [process.env.REACT_APP_API_KEY_HEADER]: process.env.REACT_APP_API_KEY
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Format date for input field (YYYY-MM-DD)
          if (data.dob) {
            data.dob = new Date(data.dob).toISOString().split('T')[0];
          }
          setProfile(data);
          setProfileExists(true);
          // Start in view mode for existing profiles
          setIsEditMode(false);
        } else if (response.status === 404) {
          // 404 means profile not found - new user
          setProfileExists(false);
          // Start in edit mode for new profiles
          setIsEditMode(true);
        } else {
          console.error('Failed to fetch profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [navigate]);
  
  // Calculate BMI when height or weight changes
  useEffect(() => {
    if (profile.height && profile.weight) {
      // BMI = weight(kg) / (height(m))²
      const heightInMeters = profile.height / 100; // Convert cm to meters
      const bmi = (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
      setProfile(prev => ({ ...prev, bmi }));
    }
  }, [profile.height, profile.weight]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    setFormTouched(true);
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    
    if (!profile.name) errors.name = 'Name is required';
    
    if (profile.weight) {
      if (isNaN(profile.weight) || profile.weight <= 0 || profile.weight > 500) {
        errors.weight = 'Please enter a valid weight (1-500 kg)';
      }
    } else {
      errors.weight = 'Weight is required';
    }
    
    if (profile.height) {
      if (isNaN(profile.height) || profile.height <= 0 || profile.height > 300) {
        errors.height = 'Please enter a valid height (1-300 cm)';
      }
    } else {
      errors.height = 'Height is required';
    }
    
    if (!profile.gender) errors.gender = 'Gender is required';
    if (!profile.dob) errors.dob = 'Date of birth is required';
    if (!profile.dietPref) errors.dietPref = 'Diet preference is required';
    if (!profile.bodyGoal) errors.bodyGoal = 'Body goal is required';
    if (!profile.allergies) errors.allergies = 'Please list any allergies or dietary restrictions';

    // Add validation for location fields
    if (!profile.city) errors.city = 'City is required';
    if (!profile.country) errors.country = 'Country is required'; 
    if (!profile.address) errors.address = 'Address is required';
    if (!profile.pincode) errors.pincode = 'Pincode/ZIP is required';
    else if (!/^\d{5,10}$/.test(profile.pincode)) {
      errors.pincode = 'Please enter a valid pincode (5-10 digits)';
    }
    
    // Check if DOB is not in the future and user is at least 5 years old
    if (profile.dob) {
      const dobDate = new Date(profile.dob);
      const today = new Date();
      const minAge = new Date();
      minAge.setFullYear(today.getFullYear() - 5);
      
      if (dobDate > today) {
        errors.dob = 'Date of birth cannot be in the future';
      } else if (dobDate > minAge) {
        errors.dob = 'You must be at least 5 years old';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ 
        text: 'Please fix the errors in the form before submitting', 
        type: 'error' 
      });
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Get user email from token
      const userEmail = getUserEmailFromToken(token);
      if (!userEmail) {
        setMessage({
          text: 'Unable to identify user. Please log in again.',
          type: 'error'
        });
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      setIsLoading(true);
      
      // Add email to profile data
      const profileData = {
        ...profile,
        mail: userEmail
      };
      
      // Check if we're creating a new profile or updating existing one
      const method = profileExists ? 'PUT' : 'POST';
      const endpoint = profileExists 
        ? `${process.env.REACT_APP_API_BASE_URL}/users/profile/${userEmail}`
        : `${process.env.REACT_APP_API_BASE_URL}/users/profile`;
      
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          [process.env.REACT_APP_API_KEY_HEADER]: process.env.REACT_APP_API_KEY
        },
        body: JSON.stringify(profileData)
      });
      
      // If the response is ok, show success message and redirect
      if (response.ok) {
        // If we just created a profile, update our state
        if (!profileExists) {
          setProfileExists(true);
        }
        
        let countdown = 5; // Increase to 5 seconds for better visibility
        
        // Set success message
        setMessage({
          text: `${profileExists ? 'Profile updated' : 'Profile created'} successfully! Redirecting in ${countdown}...`,
          type: 'success'
        });
        
        setFormTouched(false);
        
        // Exit edit mode if we were updating
        if (profileExists) {
          setIsEditMode(false);
        }
        
        // Scroll to the message
        setTimeout(() => {
          const messageElement = document.querySelector('.profile-message');
          if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        
        // Create countdown effect
        const countdownInterval = setInterval(() => {
          countdown--;
          
          if (countdown <= 0) {
            clearInterval(countdownInterval);
            navigate('/dashboard');
          } else {
            setMessage({
              text: `${profileExists ? 'Profile updated' : 'Profile created'} successfully! Redirecting in ${countdown}...`,
              type: 'success'
            });
          }
        }, 1000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage({
          text: errorData.message || 'Failed to save profile. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({
        text: 'Error connecting to the server. Please try again later.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get BMI category
  const getBmiCategory = (bmi) => {
    if (!bmi) return '';
    
    const numBmi = parseFloat(bmi);
    if (numBmi < 18.5) return 'Underweight';
    if (numBmi < 25) return 'Normal weight';
    if (numBmi < 30) return 'Overweight';
    return 'Obesity';
  };
  
  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [message]);
  
  // Function for our custom button in the hamburger menu
  const handleExportProfile = () => {
    try {
      // Create a formatted string of profile data
      const profileData = JSON.stringify(profile, null, 2);
      
      // Create a blob and download link
      const blob = new Blob([profileData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link and trigger click
      const a = document.createElement('a');
      a.href = url;
      a.download = `profile-${profile.name || 'data'}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({
        text: 'Profile exported successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error exporting profile:', error);
      setMessage({
        text: 'Failed to export profile data.',
        type: 'error'
      });
    }
  };
  
  // Check if all required fields are filled
  const areAllRequiredFieldsFilled = () => {
    return (
      !!profile.name &&
      !!profile.weight &&
      !!profile.height &&
      !!profile.gender &&
      !!profile.dob &&
      !!profile.dietPref &&
      !!profile.bodyGoal &&
      !!profile.allergies &&
      // Include location fields
      !!profile.city &&
      !!profile.country &&
      !!profile.address &&
      !!profile.pincode
    );
  };
  
  // Add a function to toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);
    // Clear any previous error messages when toggling modes
    setMessage({ text: '', type: '' });
  };
  
  return (
    <div className="profile-page">
      <nav className="navbar-pro">
        <div className="navbar-pro__logo">
          <span className="navbar-pro__logo-icon">👩‍🍳</span>
          <span className="navbar-pro__brand">NutriSift</span>
        </div>
        <HamburgerMenu 
          isLoggedIn={true}
        />
      </nav>
      
      <div className="profile-container">
        <h1 className="profile-title">Complete Your Profile</h1>
        
        <div className="profile-content">
          <p className="profile-subtitle">
            Help us personalize your experience by providing your details
          </p>
          
          {message.text && (
            <div className={`profile-message ${message.type}`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h2>Personal Information</h2>
              
              <div className="form-group">
                <label>
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className={formErrors.name ? 'error' : ''}
                  placeholder="Your full name"
                  required
                />
                {formErrors.name && <div className="error-text">{formErrors.name}</div>}
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label>
                    Weight (kg) 
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={profile.weight}
                    onChange={handleChange}
                    step="0.1"
                    min="1"
                    max="500"
                    className={formErrors.weight ? 'error' : ''}
                    placeholder="Weight in kg"
                  />
                  {formErrors.weight && <div className="error-text">{formErrors.weight}</div>}
                </div>
                
                <div className="form-group half">
                  <label>
                    Height (cm) 
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={profile.height}
                    onChange={handleChange}
                    step="0.1"
                    min="1"
                    max="300"
                    className={formErrors.height ? 'error' : ''}
                    placeholder="Height in cm"
                  />
                  {formErrors.height && <div className="error-text">{formErrors.height}</div>}
                </div>
              </div>
              
              {profile.bmi && (
                <div className="bmi-display">
                  <span className="bmi-value">BMI: {profile.bmi}</span>
                  <span className="bmi-category">({getBmiCategory(profile.bmi)})</span>
                </div>
              )}
              
              <div className="form-group">
                <label>
                  Gender 
                </label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={profile.gender === "Male"}
                      onChange={handleChange}
                    />
                    Male
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={profile.gender === "Female"}
                      onChange={handleChange}
                    />
                    Female
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="Other"
                      checked={profile.gender === "Other"}
                      onChange={handleChange}
                    />
                    Other
                  </label>
                </div>
                {formErrors.gender && <div className="error-text">{formErrors.gender}</div>}
              </div>
              
              <div className="form-group">
                <label>
                  Date of Birth 
                </label>
                <input
                  type="date"
                  name="dob"
                  value={profile.dob}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={formErrors.dob ? 'error' : ''}
                />
                {formErrors.dob && <div className="error-text">{formErrors.dob}</div>}
              </div>
            </div>
            
            <div className="form-section">
              <h2>Diet & Health</h2>
              
              <div className="form-group">
                <label>
                  Diet Preference 
                </label>
                <select
                  name="dietPref"
                  value={profile.dietPref}
                  onChange={handleChange}
                  className={formErrors.dietPref ? 'error' : ''}
                >
                  <option value="">Select diet preference</option>
                  {dietPreferences.map(diet => (
                    <option key={diet} value={diet}>{diet}</option>
                  ))}
                </select>
                {formErrors.dietPref && <div className="error-text">{formErrors.dietPref}</div>}
              </div>
              
              <div className="form-group">
                <label>
                  Body Goal 
                </label>
                <select
                  name="bodyGoal"
                  value={profile.bodyGoal}
                  onChange={handleChange}
                  className={formErrors.bodyGoal ? 'error' : ''}
                >
                  <option value="">Select body goal</option>
                  {bodyGoals.map(goal => (
                    <option key={goal} value={goal}>{goal}</option>
                  ))}
                </select>
                {formErrors.bodyGoal && <div className="error-text">{formErrors.bodyGoal}</div>}
              </div>
              
              <div className="form-group">
                <label>
                  Allergies or Restrictions 
                </label>
                <textarea
                  name="allergies"
                  value={profile.allergies}
                  onChange={handleChange}
                  placeholder="List any allergies or dietary restrictions (e.g., nuts, shellfish, lactose)"
                  rows="3"
                  required
                />
                {!profile.allergies && formTouched && <div className="error-text">This field is required</div>}
              </div>
            </div>
            
            <div className="form-section">
              <h2>Location</h2>
              
              <div className="form-row">
                <div className="form-group half">
                  <label>
                    City 
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={profile.city}
                    onChange={handleChange}
                    placeholder="Your city"
                    className={formErrors.city ? 'error' : ''}
                    required
                  />
                  {formErrors.city && <div className="error-text">{formErrors.city}</div>}
                </div>
                
                <div className="form-group half">
                  <label>
                    Country 
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={profile.country}
                    onChange={handleChange}
                    placeholder="Your country"
                    className={formErrors.country ? 'error' : ''}
                    required
                  />
                  {formErrors.country && <div className="error-text">{formErrors.country}</div>}
                </div>
              </div>
              
              <div className="form-group">
                <label>
                  Address 
                </label>
                <textarea
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  placeholder="Your address"
                  rows="2"
                  className={formErrors.address ? 'error' : ''}
                  required
                />
                {formErrors.address && <div className="error-text">{formErrors.address}</div>}
              </div>
              
              <div className="form-group">
                <label>
                  Pincode / ZIP 
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={profile.pincode}
                  onChange={handleChange}
                  className={formErrors.pincode ? 'error' : ''}
                  placeholder="Postal/ZIP code"
                  required
                />
                {formErrors.pincode && <div className="error-text">{formErrors.pincode}</div>}
              </div>
            </div>
            
            {!areAllRequiredFieldsFilled() && formTouched && (
              <div className="incomplete-form-message">
                Please fill in all fields to save your profile
              </div>
            )}
            
            <div className="form-buttons">
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => navigate('/dashboard')}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="save-button"
                disabled={isLoading || !areAllRequiredFieldsFilled()}
              >
                {isLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileDetails;