// auth.js - Minimal Auth Stubs (Authentication Removed)
// All functions return true or empty values since login is not required

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'auth_user';

/**
 * Check if user is logged in
 * @returns {boolean} Always true - no auth required
 */
function isLoggedIn() {
    return true;
}

/**
 * Get auth headers for API calls
 * @returns {Object} Empty object - no auth required
 */
function getAuthHeaders() {
    return {};
}

/**
 * Require authentication check
 * @returns {boolean} Always true - no auth required
 */
function requireAuth(redirectUrl = null) {
    return true;
}

/**
 * Get current user info
 * @returns {Object} Default user object
 */
function getCurrentUser() {
    return { username: 'Guest', exp: null };
}

/**
 * Logout function - no-op since no login
 */
function logout() {
    window.location.href = 'index.html';
}

/**
 * Update navigation auth status
 */
function updateNavAuth() {
    // No auth UI needed
}

// Auto-update nav on page load
document.addEventListener('DOMContentLoaded', updateNavAuth);

console.log('Auth module loaded (no authentication required)');
