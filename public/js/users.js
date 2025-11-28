// Users Page JavaScript

// Load all users
async function loadUsers() {
    try {
        const response = await apiCall('/auth/users');
        
        if (response.success) {
            const users = response.data;
            document.getElementById('totalUsers').textContent = response.count;
            
            const container = document.getElementById('usersList');
            
            if (users.length > 0) {
                container.innerHTML = `
                    <div class="users-grid">
                        ${users.map(user => `
                            <div class="user-card">
                                <div class="user-avatar">
                                    <i class="fas fa-user-circle"></i>
                                </div>
                                <div class="user-info">
                                    <h3>${user.username}</h3>
                                    <p class="user-email">
                                        <i class="fas fa-envelope"></i> ${user.email}
                                    </p>
                                    ${user.firstName || user.lastName ? `
                                        <p class="user-name">
                                            <i class="fas fa-id-card"></i> 
                                            ${user.firstName || ''} ${user.lastName || ''}
                                        </p>
                                    ` : ''}
                                    <p class="user-joined">
                                        <i class="fas fa-calendar-plus"></i> 
                                        Joined ${formatDate(user.createdAt)}
                                    </p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div style="text-align: center; padding: 3rem;">
                        <i class="fas fa-users" style="font-size: 4rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                        <p style="color: var(--text-light);">No users registered yet.</p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification(error.message, 'error');
        document.getElementById('usersList').innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                <p style="color: var(--danger-color);">Failed to load users</p>
            </div>
        `;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});
