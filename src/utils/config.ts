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
<<<<<<< HEAD
  // Always return the hardcoded URL for consistency
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
=======
  // Default to the frontend base URL
  const baseUrl = getFrontendBaseUrl();
  
  // If we're in a browser environment, use the current hostname with port 8000
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:8000`;
  }
  
  // For server-side rendering, use an environment variable or fallback
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
>>>>>>> parent of 71ac343 (Fixed always loading localhost in lan networks)
};

// Photo URL helper function
export const getPhotoUrl = (photoUuid: string): string => {
<<<<<<< HEAD
  if (!photoUuid) {
    console.error('Invalid photoUuid:', photoUuid);
    return '';
  }
  
  const apiUrl = API_URL();
  return `${apiUrl}/photos/${photoUuid}`;
=======
  return `${API_URL()}/photos/${photoUuid}`;
>>>>>>> parent of 71ac343 (Fixed always loading localhost in lan networks)
};

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: '/users/login/',
  REGISTER: '/users/register/',
  POSTS: '/posts/',
  POSTS_CREATE: '/posts/create/',
  LIKED_POSTS: '/users/liked-posts/',
}; 