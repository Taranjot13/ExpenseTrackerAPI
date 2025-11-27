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
    notification.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 400px;
        padding: 1rem 1.5rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 1rem;
        animation: slideIn 0.3s ease-out;
        border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#06b6d4'};
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        .toast i {
            font-size: 1.5rem;
            color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#06b6d4'};
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 300);
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
