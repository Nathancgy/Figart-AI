// Application configuration settings

// Frontend URL helper function
export const getFrontendBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Browser environment
    const { protocol, hostname, port } = window.location;
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  }
  // Server-side rendering environment - return a default or environment variable
  return process.env.NEXT_PUBLIC_FRONTEND_URL || '';
};

// API URL configuration - use the same base URL as the frontend
export const API_URL = (): string => {
  // Log environment variables
  if (typeof window !== 'undefined') {
    console.log('Environment variables:', {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    });
  }

  // If an environment variable is set, use it (highest priority)
  if (process.env.NEXT_PUBLIC_API_URL) {
    console.log('Using API URL from environment variable:', process.env.NEXT_PUBLIC_API_URL);
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // If we're in a browser environment, use the current hostname with port 8000
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    console.log('Current hostname:', hostname);
    
    // For local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const apiUrl = `${protocol}//${hostname}:8000`;
      console.log('Using local API URL:', apiUrl);
      return apiUrl;
    }
    
    // For production/staging
    const apiUrl = `${protocol}//${hostname}:8000`;
    console.log('Using dynamic API URL based on hostname:', apiUrl);
    return apiUrl;
  }
  
  // Fallback for server-side rendering
  const fallbackUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  console.log('Using fallback API URL:', fallbackUrl);
  return fallbackUrl;
};

// Photo URL helper function
export const getPhotoUrl = (photoUuid: string): string => {
  const url = `${API_URL()}/photos/${photoUuid}`;
  console.log('Photo URL generated:', url);
  return url;
};

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: '/users/login/',
  REGISTER: '/users/register/',
  POSTS: '/posts/',
  POSTS_CREATE: '/posts/create/',
  LIKED_POSTS: '/users/liked-posts/',
}; 