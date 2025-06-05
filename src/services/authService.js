import axios from 'axios';

// Replace with your actual API URL
const API_URL = 'https://api.example.com/auth';

// Store the token in localStorage
const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

// Get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Register a new user
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }
    
    const data = await response.json();
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  } catch (error) {
    throw error.message ? error : { message: 'Registration failed' };
  }
};

// Login an existing user
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }
    
    const data = await response.json();
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  } catch (error) {
    throw error.message ? error : { message: 'Login failed' };
  }
};

// Logout user
export const logout = () => {
  setAuthToken(null);
};

// Check if user is logged in on app load
export const loadUser = async () => {
  // Get token from localStorage
  const token = localStorage.getItem('authToken');
  
  if (token) {
    try {
      const response = await fetch(`${API_URL}/user`, {
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      return await response.json();
    } catch (error) {
      setAuthToken(null);
      throw error;
    }
  }
  return null;
};