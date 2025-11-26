// API Configuration
const API_URL = 'http://localhost:5000';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('login-tab').addEventListener('click', () => switchTab('login'));
    document.getElementById('signup-tab').addEventListener('click', () => switchTab('signup'));
    setupEnterKeyListeners();
    
    const passwordInput = document.getElementById('signup-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
    }
});

function switchTab(tab) {
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (tab === 'login') {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.style.display = 'flex';
        signupForm.style.display = 'none';
    } else {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.style.display = 'flex';
        loginForm.style.display = 'none';
    }
    clearMessages();
}

function setupEnterKeyListeners() {
    document.querySelectorAll('#login-form input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    });
    
    document.querySelectorAll('#signup-form input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSignUp();
        });
    });
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

function checkPasswordStrength() {
    const password = document.getElementById('signup-password').value;
    const strengthBar = document.getElementById('strength-bar-fill');
    const strengthText = document.getElementById('strength-text');
    
    if (!password) {
        strengthBar.className = 'strength-bar-fill';
        strengthText.textContent = '';
        return;
    }
    
    let strength = 0;
    if (password.length >= 12) strength += 2;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    strengthBar.className = 'strength-bar-fill';
    strengthText.className = 'strength-text';
    
    if (strength <= 3) {
        strengthBar.classList.add('weak');
        strengthText.classList.add('weak');
        strengthText.textContent = 'Weak password';
    } else if (strength <= 5) {
        strengthBar.classList.add('medium');
        strengthText.classList.add('medium');
        strengthText.textContent = 'Medium password';
    } else {
        strengthBar.classList.add('strong');
        strengthText.classList.add('strong');
        strengthText.textContent = 'Strong password';
    }
}

function isPasswordStrong(password) {
    if (password.length < 12) {
        return { valid: false, message: 'Password must be at least 12 characters' };
    }
    
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
        return { valid: false, message: 'Password must include uppercase, lowercase, numbers, and special characters' };
    }
    
    const commonPatterns = ['123', 'abc', 'password', 'qwerty', '111', '000'];
    const lowerPassword = password.toLowerCase();
    
    for (const pattern of commonPatterns) {
        if (lowerPassword.includes(pattern)) {
            return { valid: false, message: 'Password contains common patterns. Please use a more unique password' };
        }
    }
    
    return { valid: true };
}

async function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    if (!username || !password) {
        showError(errorDiv, 'Please enter username and password');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('currentUser', JSON.stringify({
                username: data.username,
                email: data.email
            }));
            window.location.href = 'index.html';
        } else {
            showError(errorDiv, data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(errorDiv, 'Unable to connect to server. Please try again.');
    }
}

async function handleSignUp() {
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    const errorDiv = document.getElementById('signup-error');
    const successDiv = document.getElementById('signup-success');
    
    clearMessages();
    
    if (!username || !email || !password || !confirmPassword) {
        showError(errorDiv, 'All fields are required');
        return;
    }
    
    if (username.length < 3 || username.length > 20) {
        showError(errorDiv, 'Username must be 3-20 characters');
        return;
    }
    
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
        showError(errorDiv, 'Username can only contain letters and numbers');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError(errorDiv, 'Please enter a valid email address');
        return;
    }
    
    const passwordCheck = isPasswordStrong(password);
    if (!passwordCheck.valid) {
        showError(errorDiv, passwordCheck.message);
        return;
    }
    
    if (password !== confirmPassword) {
        showError(errorDiv, 'Passwords do not match');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess(successDiv, 'Account created successfully! Redirecting to login...');
            
            document.getElementById('signup-username').value = '';
            document.getElementById('signup-email').value = '';
            document.getElementById('signup-password').value = '';
            document.getElementById('signup-confirm').value = '';
            document.getElementById('strength-bar-fill').className = 'strength-bar-fill';
            document.getElementById('strength-text').textContent = '';
            
            setTimeout(() => {
                switchTab('login');
            }, 2000);
        } else {
            showError(errorDiv, data.error || 'Sign up failed');
        }
    } catch (error) {
        console.error('Sign up error:', error);
        showError(errorDiv, 'Unable to connect to server. Please try again.');
    }
}

function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
}

function showSuccess(element, message) {
    element.textContent = message;
    element.classList.add('show');
}

function clearMessages() {
    document.querySelectorAll('.error-message, .success-message').forEach(msg => {
        msg.textContent = '';
        msg.classList.remove('show');
    });
}