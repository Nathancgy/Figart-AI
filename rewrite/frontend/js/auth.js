/**
 * Authentication module for FigArt AI
 */

// Store current auth state
let currentUser = null;
let authToken = null;

// Initialize auth from local storage
function initAuth() {
    authToken = localStorage.getItem('authToken');
    currentUser = localStorage.getItem('username');
    
    // Check if token is expired
    if (authToken && typeof isTokenExpired === 'function' && isTokenExpired(authToken)) {
        logout();
        return;
    }
    
    updateAuthUI();
}

// Update UI based on authentication state
function updateAuthUI() {
    const authLinksContainer = document.getElementById('authLinks');
    if (!authLinksContainer) return;
    
    if (currentUser) {
        authLinksContainer.innerHTML = `
            <span class="user-greeting">欢迎, ${currentUser}</span>
            <a href="#" id="logoutLink" class="nav-link">退出</a>
        `;
        
        // Add logout event listener
        document.getElementById('logoutLink').addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    } else {
        authLinksContainer.innerHTML = `
            <a href="login.html" class="nav-link">登录</a>
            <a href="register.html" class="nav-link">注册</a>
        `;
    }
}

// Login function
async function login(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw { status: response.status, message: data.detail || '登录失败' };
        }
        
        // Store auth info
        authToken = data.token;
        currentUser = username;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('username', currentUser);
        
        updateAuthUI();
        return { success: true };
        
    } catch (error) {
        console.error('Login error:', error);
        return { 
            success: false, 
            error: error.message || '登录时出错，请稍后再试'
        };
    }
}

// Register function
async function register(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw { status: response.status, message: data.detail || '注册失败' };
        }
        
        // Store auth info
        authToken = data.token;
        currentUser = username;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('username', currentUser);
        
        updateAuthUI();
        return { success: true };
        
    } catch (error) {
        console.error('Registration error:', error);
        return { 
            success: false, 
            error: error.message || '注册时出错，请稍后再试'
        };
    }
}

// Logout function
async function logout() {
    // If we have an auth token, try to call the logout API
    if (authToken) {
        try {
            await fetch(`${API_BASE_URL}/users/logout/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
        } catch (error) {
            console.error('Error during logout:', error);
            // Continue with local logout even if API call fails
        }
    }
    
    // Clear local storage and variables
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    authToken = null;
    currentUser = null;
    
    // Update UI
    updateAuthUI();
    
    // Redirect to login page if not already there
    if (!window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('register.html') &&
        !window.location.pathname.includes('index.html') &&
        window.location.pathname !== '/') {
        window.location.href = 'login.html';
    }
}

// Check if user is authenticated
function isAuthenticated() {
    return Boolean(authToken) && Boolean(currentUser);
}

// Get auth token for API requests
function getAuthToken() {
    return authToken;
}

// Get current username
function getUsername() {
    return currentUser;
}

// API request function with authorization
async function apiRequest(endpoint, options = {}) {
    // Prepare headers with auth token if available
    const headers = options.headers || {};
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        // Parse response
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }
        
        // Handle unauthorized response
        if (response.status === 401) {
            // Clear auth and redirect to login
            logout();
            throw { status: 401, message: '会话已过期，请重新登录' };
        }
        
        if (!response.ok) {
            throw { 
                status: response.status, 
                message: (data && data.detail) ? data.detail : '请求失败'
            };
        }
        
        return data;
        
    } catch (error) {
        console.error('API Request Error:', error);
        if (error.status === 401) {
            // Already handled above
            throw error;
        }
        
        throw {
            status: error.status || 500,
            message: error.message || '发生未知错误，请稍后再试'
        };
    }
}

// Initialize authentication when the DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth); 