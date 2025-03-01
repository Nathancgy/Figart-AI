// Application configuration settings
// console.log('Config module loaded');

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

// Cache control configuration
export const DISABLE_CACHE = true; // Set to false to enable caching

// Hardcoded API URL as a fallback - this should match your .env.local setting
const HARDCODED_API_URL = 'http://192.168.8.115:8000';

// API URL configuration - use the same base URL as the frontend
export const API_URL = (): string => {
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

// Get cache control headers based on configuration
export const getCacheControlHeaders = (): HeadersInit => {
  if (DISABLE_CACHE) {
    return {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };
  }
  
  // Default caching behavior if not disabled
  return {
    'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
  };
};

// Photo URL helper function
export const getPhotoUrl = (photoUuid: string): string => {
  if (!photoUuid) {
    console.error('Invalid photoUuid:', photoUuid);
    return '';
  }
  
  const apiUrl = API_URL();
  return `${apiUrl}/photos/${photoUuid}`;
};

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: '/users/login/',
  REGISTER: '/users/register/',
  POSTS: '/posts/',
  POSTS_CREATE: '/posts/create/',
  LIKED_POSTS: '/users/liked-posts/',
}; 