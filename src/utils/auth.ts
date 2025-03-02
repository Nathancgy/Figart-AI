import Cookies from 'js-cookie';
import { getCacheControlHeaders } from './config';

// Debug log to check if this file is being loaded
// console.log('Auth module loaded');

// Hardcoded API URL as a fallback
const HARDCODED_API_URL = 'http://192.168.8.115:8000';

// API URL configuration - use the same base URL as the frontend
const getApiUrl = (): string => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // For same-origin development, use the current origin
    const currentOrigin = window.location.origin;
    
    // If we're already on the API domain (e.g., running on the same server)
    if (currentOrigin.includes('8000')) {
      return currentOrigin;
    }
    
    // If we're on localhost:3000, try to use localhost:8000 for the API
    if (currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1')) {
      return currentOrigin.replace('3000', '8000');
    }
    
    // For other environments, use the hardcoded URL
    return HARDCODED_API_URL;
  }
  
  // Server-side rendering or non-browser environment
  return HARDCODED_API_URL;
};

const TOKEN_COOKIE_NAME = 'auth_token';

export const setAuthToken = (token: string) => {
  Cookies.set(TOKEN_COOKIE_NAME, token, { expires: 7 }); // Token expires in 7 days
};

export const getAuthToken = () => {
  return Cookies.get(TOKEN_COOKIE_NAME);
};

export const removeAuthToken = () => {
  Cookies.remove(TOKEN_COOKIE_NAME);
};

/**
 * Logs out the user by removing the auth token
 * @param redirect Whether to redirect to the login page (default: true)
 */
export const logout = (redirect: boolean = true) => {
  // console.log('Logout function called');
  removeAuthToken();
  
  // Clear any user data from localStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('user');
  }
  
  // Show a notification to the user
  if (typeof window !== 'undefined') {
    // Only redirect if in browser environment and redirect is true
    if (redirect) {
      window.location.href = '/login';
    }
  }
};

export const login = async (username: string, password: string) => {
  // console.log('Login function called');
  const cacheHeaders = getCacheControlHeaders();
  
  // Get the API URL and log it
  const apiUrl = getApiUrl();
  // console.log('API URL in login function:', apiUrl);
  
  const response = await fetch(`${apiUrl}/users/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...cacheHeaders,
    },
    credentials: 'include',
    mode: 'cors',
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid username or password');
    }
    throw new Error(data?.detail || 'Login failed');
  }

  if (!data?.token) {
    throw new Error('No token received');
  }

  setAuthToken(data.token);
  return data;
};

export const signup = async (username: string, password: string) => {
  const cacheHeaders = getCacheControlHeaders();
  
  const response = await fetch(`${getApiUrl()}/users/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...cacheHeaders,
    },
    credentials: 'include',
    mode: 'cors',
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('Username already exists');
    }
    throw new Error(data?.detail || 'Registration failed');
  }

  if (!data?.token) {
    throw new Error('No token received');
  }

  setAuthToken(data.token);
  return data;
};

// Utility function for making authenticated API requests
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // console.log('%c apiRequest called with endpoint:', 'background: #ff6600; color: white; font-size: 14px; padding: 3px;', endpoint);
  
  const token = getAuthToken();
  const cacheHeaders = getCacheControlHeaders();
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...cacheHeaders,
    ...options.headers,
  };

  const apiUrl = getApiUrl();
  // console.log('%c API URL in apiRequest:', 'background: #66ff00; color: black; font-size: 14px; padding: 3px;', apiUrl);
  
  const fullUrl = `${apiUrl}${endpoint}`;
  // console.log('%c Full request URL:', 'background: #0066ff; color: white; font-size: 14px; padding: 3px;', fullUrl);

  // Determine if this is a cross-origin request
  let isCrossOrigin = false;
  if (typeof window !== 'undefined') {
    isCrossOrigin = new URL(fullUrl).origin !== window.location.origin;
  }
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      // Use 'include' for cross-origin requests, otherwise 'same-origin'
      credentials: isCrossOrigin ? 'include' : 'same-origin',
      mode: 'cors',
    });

    // console.log('%c API response status:', 'background: #ff0066; color: white; font-size: 14px; padding: 3px;', response.status, response.ok ? 'OK' : 'Failed');

    // Check for unauthorized response (401)
    if (response.status === 401) {
      console.error('Unauthorized access. Logging out...');
      // Log out the user immediately
      logout(true);
      throw new Error('Session expired. Please log in again.');
    }

    const data = await response.json().catch(() => {
      console.error('Failed to parse JSON response');
      return null;
    });

    if (!response.ok) {
      const errorMessage = data?.detail || 'API request failed';
      console.error('API request failed:', errorMessage);
      throw new Error(errorMessage);
    }

    // console.log('%c API request successful:', 'background: #00ff66; color: black; font-size: 14px; padding: 3px;', data);
    return data;
  } catch (error) {
    // If the error is related to unauthorized access, it's already handled above
    // For other errors, just rethrow them
    throw error;
  }
}; 