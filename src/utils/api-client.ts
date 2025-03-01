import { API_URL, API_ENDPOINTS, getCacheControlHeaders } from './config';
import { logout } from './auth';

// Debug log to check if this file is being loaded
console.log('API client module loaded');

// Custom error class for API errors
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Main API client function
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  console.log('apiClient called with endpoint:', endpoint);
  
  const token = localStorage.getItem('token');
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...getCacheControlHeaders(), // Add cache control headers
    ...options.headers,
  };
  
  const config = {
    ...options,
    headers,
  };
  
  // Get the API URL and log it
  const apiUrl = API_URL();
  console.log('API URL in apiClient:', apiUrl);
  
  try {
    console.log('Fetching from URL:', `${apiUrl}${endpoint}`);
    const response = await fetch(`${apiUrl}${endpoint}`, config);
    
    // Handle unauthorized errors globally
    if (response.status === 401) {
      // Log the user out but keep them on the same page
      logout(false); // Pass false to prevent redirect
      throw new ApiError('Your session has expired. Please log in again.', 401);
    }
    
    // For other error statuses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 'Something went wrong';
      throw new ApiError(errorMessage, response.status);
    }
    
    // For successful responses
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => 
    apiClient<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, data?: any, options?: RequestInit) => 
    apiClient<T>(endpoint, { 
      ...options, 
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  put: <T>(endpoint: string, data?: any, options?: RequestInit) => 
    apiClient<T>(endpoint, { 
      ...options, 
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  patch: <T>(endpoint: string, data?: any, options?: RequestInit) => 
    apiClient<T>(endpoint, { 
      ...options, 
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  delete: <T>(endpoint: string, options?: RequestInit) => 
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
}; 