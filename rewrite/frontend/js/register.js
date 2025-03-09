/**
 * Registration page logic for FigArt AI
 */

document.addEventListener('DOMContentLoaded', function() {
    // Redirect if already logged in
    if (isAuthenticated()) {
        window.location.href = 'community.html';
        return;
    }
    
    const registerForm = document.getElementById('registerForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const agreeTermsCheckbox = document.getElementById('agreeTerms');
    const registerButton = document.getElementById('registerButton');
    const buttonText = registerButton.querySelector('.btn-text');
    const buttonLoader = registerButton.querySelector('.btn-loader');
    const authError = document.getElementById('authError');
    
    // Form submission handler
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!registerForm.checkValidity()) {
            registerForm.reportValidity();
            return;
        }
        
        // Get form values
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Check password confirmation
        if (password !== confirmPassword) {
            authError.textContent = '两次输入的密码不一致';
            authError.classList.remove('hidden');
            return;
        }
        
        // Check terms agreement
        if (!agreeTermsCheckbox.checked) {
            authError.textContent = '请阅读并同意使用条款和隐私政策';
            authError.classList.remove('hidden');
            return;
        }
        
        // Show loading state
        buttonText.classList.add('hidden');
        buttonLoader.classList.remove('hidden');
        registerButton.disabled = true;
        authError.classList.add('hidden');
        
        try {
            // Attempt registration
            const result = await register(username, password);
            
            if (result.success) {
                // Redirect to community page on success
                window.location.href = 'community.html';
            } else {
                // Show error message
                authError.textContent = result.error;
                authError.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Registration error:', error);
            authError.textContent = '注册时发生错误，请稍后再试';
            authError.classList.remove('hidden');
        } finally {
            // Reset button state
            buttonText.classList.remove('hidden');
            buttonLoader.classList.add('hidden');
            registerButton.disabled = false;
        }
    });
    
    // Real-time password confirmation validation
    confirmPasswordInput.addEventListener('input', function() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword && password !== confirmPassword) {
            confirmPasswordInput.setCustomValidity('密码不匹配');
        } else {
            confirmPasswordInput.setCustomValidity('');
        }
    });
    
    // Update validation when password changes
    passwordInput.addEventListener('input', function() {
        // Trigger confirm password validation if it has a value
        if (confirmPasswordInput.value) {
            const event = new Event('input');
            confirmPasswordInput.dispatchEvent(event);
        }
    });
    
    // Focus the username input when the page loads
    usernameInput.focus();
}); 