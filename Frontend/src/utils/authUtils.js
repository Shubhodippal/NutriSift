export const checkTokenExpiration = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('No token found');
    return { expired: true, refreshed: false };
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    
    if (isExpired) {
      console.log('Token expired, attempting to refresh');
      const refreshed = await refreshToken();
      return { expired: true, refreshed };
    }
    
    return { expired: false, refreshed: false };
  } catch (error) {
    console.error('Error checking token:', error);
    return { expired: true, refreshed: false };
  }
};

const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    console.log('No refresh token available');
    return false;
  }
  
  try {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [process.env.REACT_APP_API_KEY_HEADER]: process.env.REACT_APP_API_KEY
      },
      body: JSON.stringify({ refreshToken })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.removeItem('token');
      localStorage.setItem('token', data.token);
      return true;
    } else {
      console.log('Failed to refresh token - clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return false;
    }
  } catch (error) {
    console.error('Failed to refresh token', error);
    return false;
  }
};