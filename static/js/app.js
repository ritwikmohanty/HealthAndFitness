/**
 * Main application script
 * Handles common functionality across all pages
 */

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set current date across all pages
    updateCurrentDate();
    
    // Initialize tooltips
    initTooltips();
    
    // Set active nav link
    setActiveNavLink();
});

/**
 * Updates the current date display
 */
function updateCurrentDate() {
    const currentDateElement = document.getElementById('currentDate');
    if (currentDateElement) {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

/**
 * Initialize Bootstrap tooltips
 */
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Sets the active navigation link based on current page
 */
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar .nav-link');
    
    // Default to dashboard if on root path
    let activeFound = false;
    let dashboardLink = null;
    
    navLinks.forEach(link => {
        // Remove any existing active class
        link.classList.remove('active');
        
        const linkPath = link.getAttribute('href');
        
        // Save reference to dashboard link
        if (linkPath.includes('dashboard')) {
            dashboardLink = link;
        }
        
        // Check if current path matches link path
        if (linkPath && currentPath === linkPath) {
            link.classList.add('active');
            activeFound = true;
        }
    });
    
    // If no active link was found and we're on the root path
    if (!activeFound && (currentPath === '/' || currentPath === '')) {
        // Set dashboard as active if available
        if (dashboardLink) {
            dashboardLink.classList.add('active');
        }
    }
}

/**
 * Format numbers with commas for thousands
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Capitalizes the first letter of a string
 * @param {string} string - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Formats a date as MM/DD/YYYY
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
}

/**
 * Shows a bootstrap toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, danger, warning, info)
 */
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.className = `toast bg-${type} text-white`;
    toast.setAttribute('id', toastId);
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Toast content
    toast.innerHTML = `
        <div class="toast-header bg-${type} text-white">
            <strong class="me-auto">FitTracker</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Initialize and show toast
    const toastInstance = new bootstrap.Toast(toast);
    toastInstance.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

/**
 * Get current date string in YYYY-MM-DD format
 * @returns {string} Date string
 */
function getCurrentDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Generates a random ID
 * @returns {string} Random ID
 */
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}
