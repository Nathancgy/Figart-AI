/**
 * Login page logic for FigArt AI
 */

document.addEventListener('DOMContentLoaded', function() {
    // Redirect if already logged in
    if (isAuthenticated()) {
        window.location.href = 'community.html';
        return;
    }
    
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const buttonText = loginButton.querySelector('.btn-text');
    const buttonLoader = loginButton.querySelector('.btn-loader');
    const authError = document.getElementById('authError');
    
    // Form submission handler
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!loginForm.checkValidity()) {
            loginForm.reportValidity();
            return;
        }
        
        // Get form values
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        // Show loading state
        buttonText.classList.add('hidden');
        buttonLoader.classList.remove('hidden');
        loginButton.disabled = true;
        authError.classList.add('hidden');
        
        try {
            // Attempt login
            const result = await login(username, password);
            
            if (result.success) {
                // Redirect to community page on success
                window.location.href = 'community.html';
            } else {
                // Show error message
                authError.textContent = result.error;
                authError.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Login error:', error);
            authError.textContent = '登录时发生错误，请稍后再试';
            authError.classList.remove('hidden');
        } finally {
            // Reset button state
            buttonText.classList.remove('hidden');
            buttonLoader.classList.add('hidden');
            loginButton.disabled = false;
        }
    });
    
    // Focus the username input when the page loads
    usernameInput.focus();
}); 