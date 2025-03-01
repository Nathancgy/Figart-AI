import Cookies from 'js-cookie';
import { API_URL } from './config';

// const API_URL = 'http://localhost:8000';
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

export const login = async (username: string, password: string) => {
  const response = await fetch(`${API_URL()}/users/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
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
  const response = await fetch(`${API_URL()}/users/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
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
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL()}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
    mode: 'cors',
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || 'API request failed');
  }

  return data;
}; 