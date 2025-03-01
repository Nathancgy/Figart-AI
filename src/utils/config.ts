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
  // Default to the frontend base URL
  const baseUrl = getFrontendBaseUrl();
  
  // If we're in a browser environment, use the current hostname with port 8000
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:8000`;
  }
  
  // For server-side rendering, use an environment variable or fallback
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

// Photo URL helper function
export const getPhotoUrl = (photoUuid: string): string => {
  return `${API_URL()}/photos/${photoUuid}`;
};

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: '/users/login/',
  REGISTER: '/users/register/',
  POSTS: '/posts/',
  POSTS_CREATE: '/posts/create/',
  LIKED_POSTS: '/users/liked-posts/',
}; 