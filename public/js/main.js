// Main JavaScript file - handles common functionality and WebSocket

// Get token from cookie
function getToken() {
    const name = 'token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
}

// API call helper
async function apiCall(endpoint, options = {}) {
    const token = getToken();
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const response = await fetch(`/api${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
    }

    return data;
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transition = 'opacity 0.5s';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// WebSocket connection
let socket;
const token = getToken();

if (token) {
    socket = io({
        auth: { token }
    });

    socket.on('connect', () => {
        console.log('WebSocket connected');
        
        // Join user room
        const userId = getUserIdFromToken(token);
        if (userId) {
            socket.emit('join', userId);
        }
    });

    socket.on('expense:created', (data) => {
        showNotification('New expense added!', 'success');
        if (typeof refreshExpenses === 'function') {
            refreshExpenses();
        }
    });

    socket.on('expense:updated', (data) => {
        showNotification('Expense updated!', 'success');
        if (typeof refreshExpenses === 'function') {
            refreshExpenses();
        }
    });

    socket.on('expense:deleted', (data) => {
        showNotification('Expense deleted!', 'success');
        if (typeof refreshExpenses === 'function') {
            refreshExpenses();
        }
    });

    socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
    });
}

// Decode JWT to get user ID
function getUserIdFromToken(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

// Auto-dismiss alerts after 5 seconds
document.addEventListener('DOMContentLoaded', () => {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.transition = 'opacity 0.5s';
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 500);
        }, 5000);
    });
});
