// ============================================================================
// SHARED UTILITIES - Common functions used across the application
// ============================================================================

/**
 * Show alert message
 * @param {string} message - Message to display
 * @param {string} type - Alert type: 'info', 'success', 'error'
 */
function showAlert(message, type = 'info') {
    let alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alertContainer';
        alertContainer.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 1000;
            max-width: 400px;
        `;
        document.body.appendChild(alertContainer);
    }

    const alert = document.createElement('div');
    alert.style.cssText = `
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 8px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    alert.textContent = message;

    alertContainer.appendChild(alert);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        alert.remove();
    }, 4000);

    console.log(`[${type.toUpperCase()}] ${message}`);
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

/**
 * Format time for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted time
 */
function formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

console.log('✅ Utilities loaded');
