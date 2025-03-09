/**
 * Configuration for the FigArt AI frontend
 */

// API base URL - configured to work with Nginx reverse proxy to uWSGI
const API_BASE_URL = '/api';

// Function to get the full URL for a photo
function getPhotoUrl(photoUuid) {
    return `${API_BASE_URL}/photos/${photoUuid}`;
}

// Function to format a date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    
    // Handle invalid dates
    if (isNaN(date.getTime())) {
        return 'Unknown date';
    }
    
    // Calculate time difference
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    // Format based on time difference
    if (diffSecs < 60) {
        return '刚刚';
    } else if (diffMins < 60) {
        return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
        return `${diffHours}小时前`;
    } else if (diffDays < 7) {
        return `${diffDays}天前`;
    } else {
        // For older dates, use a full date format
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Check if a token is expired
function isTokenExpired(token) {
    if (!token) return true;
    
    try {
        // Get payload part of JWT
        const payload = token.split('.')[1];
        // Decode base64
        const decoded = JSON.parse(atob(payload));
        // Check expiration
        const exp = decoded.exp * 1000; // Convert to milliseconds
        return Date.now() >= exp;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true; // Assume expired on error
    }
}

// Utility to handle API errors
function handleApiError(error) {
    console.error('API Error:', error);
    
    if (error.status === 401) {
        // Unauthorized - clear auth and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        window.location.href = '/login.html';
        return 'Session expired. Please log in again.';
    }
    
    if (error.message) {
        return error.message;
    }
    
    return 'An unexpected error occurred. Please try again later.';
} 