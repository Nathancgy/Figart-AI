import { API_URL, API_ENDPOINTS } from './config';
import { logout } from './auth';

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
  const token = localStorage.getItem('token');
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(`${API_URL()}${endpoint}`, config);
    
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
    
    // Parse successful response
    if (response.status !== 204) { // No content
      return await response.json();
    }
    
    return {} as T;
  } catch (error) {
    // Rethrow ApiErrors (including 401s)
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Convert other errors to ApiError
    console.error('API request failed:', error);
    throw new ApiError('Network error or server unavailable', 0);
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