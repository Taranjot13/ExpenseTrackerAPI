// API Configuration
const API_BASE_URL = window.location.origin;
const API_ENDPOINTS = {
    auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        logout: '/api/auth/logout',
        me: '/api/auth/me'
    },
    expenses: {
        getAll: '/api/expenses',
        create: '/api/expenses',
        update: (id) => `/api/expenses/${id}`,
        delete: (id) => `/api/expenses/${id}`
    },
    categories: {
        getAll: '/api/categories',
        create: '/api/categories',
        update: (id) => `/api/categories/${id}`,
        delete: (id) => `/api/categories/${id}`
    },
    analytics: {
        summary: '/api/analytics/summary',
        recent: '/api/analytics/recent',
        topCategories: '/api/analytics/top-categories',
        budgetComparison: '/api/analytics/budget-comparison',
        byDate: '/api/analytics/by-date'
    }
};

// State Management
const AppState = {
    user: null,
    expenses: [],
    categories: [],
    currentPage: 'dashboard',
    isAuthenticated: false,
    dbStatus: {
        mongodb: false,
        redis: false,
        postgres: false
    }
};

// Utility Functions
const showToast = (message, type = 'success') => {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const getToken = () => {
    return localStorage.getItem('token');
};

const setToken = (token) => {
    localStorage.setItem('token', token);
};

const removeToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
};

// API Helper Functions
const apiRequest = async (url, options = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            const errorDetails = Array.isArray(data.errors) ? data.errors : null;
            const message = data.message || 'Something went wrong';
            if (errorDetails && errorDetails.length) {
                // Prefer showing actionable validation details.
                throw new Error(`${message}: ${errorDetails.join(' • ')}`);
            }
            throw new Error(message);
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Authentication Functions
const login = async (email, password) => {
    try {
        const data = await apiRequest(API_ENDPOINTS.auth.login, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        // Backend returns token in data.data.accessToken
        const token = data.data?.accessToken || data.accessToken || data.token;
        const user = data.data?.user || data.user;
        
        setToken(token);
        AppState.user = user;
        AppState.isAuthenticated = true;
        
        // Store user info for session persistence
        localStorage.setItem('userId', user._id || user.id);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.firstName || user.name || 'User');
        
        return data;
    } catch (error) {
        throw error;
    }
};

const register = async (name, email, password) => {
    try {
        const trimmedName = (name || '').trim();
        const nameParts = trimmedName ? trimmedName.split(/\s+/) : [];
        const firstName = nameParts[0] || trimmedName;
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        // IMPORTANT: Joi treats empty strings as invalid unless explicitly allowed.
        // Only send optional fields when they have a real value.
        const payload = {
            username: email.split('@')[0],
            email,
            password,
            ...(firstName ? { firstName } : {})
        };
        if (lastName) payload.lastName = lastName;

        const data = await apiRequest(API_ENDPOINTS.auth.register, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        // Backend returns token in data.data.accessToken
        const token = data.data?.accessToken || data.accessToken || data.token;
        const user = data.data?.user || data.user;
        
        setToken(token);
        AppState.user = user;
        AppState.isAuthenticated = true;
        
        // Store user info for session persistence
        localStorage.setItem('userId', user._id || user.id);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.name || user.firstName);
        
        return data;
    } catch (error) {
        throw error;
    }
};

const logout = () => {
    removeToken();
    AppState.user = null;
    AppState.isAuthenticated = false;
    AppState.expenses = [];
    AppState.categories = [];
    document.getElementById('appContainer')?.classList.add('auth-mode');
    showAuthModal();
    showToast('Logged out successfully', 'success');
};

const getCurrentUser = async () => {
    try {
        const data = await apiRequest(API_ENDPOINTS.auth.me);
        // Backend returns the user directly in data.data
        AppState.user = data.data || data.user;
        AppState.isAuthenticated = true;

        const user = AppState.user;
        if (user) {
            localStorage.setItem('userId', user._id || user.id);
            localStorage.setItem('userEmail', user.email || '');
            localStorage.setItem('userName', user.firstName || user.name || 'User');
        }

        return AppState.user;
    } catch (error) {
        removeToken();
        AppState.isAuthenticated = false;
        showAuthModal();
        throw error;
    }
};

// Expense Functions
const fetchExpenses = async ({ page = 1, limit = 100, search = '' } = {}) => {
    if (!AppState.isAuthenticated) {
        return [];
    }
    try {
        const query = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) query.set('search', search);

        const data = await apiRequest(`${API_ENDPOINTS.expenses.getAll}?${query.toString()}`);
        AppState.expenses = data.data || data.expenses || [];
        return AppState.expenses;
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return [];
    }
};

const createExpense = async (expenseData) => {
    try {
        const data = await apiRequest(API_ENDPOINTS.expenses.create, {
            method: 'POST',
            body: JSON.stringify(expenseData)
        });
        await fetchExpenses();
        return data;
    } catch (error) {
        throw error;
    }
};

const deleteExpense = async (id) => {
    try {
        await apiRequest(API_ENDPOINTS.expenses.delete(id), {
            method: 'DELETE'
        });
        await fetchExpenses();
    } catch (error) {
        throw error;
    }
};

// Category Functions
const fetchCategories = async ({ includeStats = false } = {}) => {
    if (!AppState.isAuthenticated) {
        return [];
    }
    try {
        const url = includeStats ? `${API_ENDPOINTS.categories.getAll}?includeStats=true` : API_ENDPOINTS.categories.getAll;
        const data = await apiRequest(url);
        AppState.categories = data.data || data.categories || [];
        return AppState.categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

const createCategory = async (categoryData) => {
    try {
        const data = await apiRequest(API_ENDPOINTS.categories.create, {
            method: 'POST',
            body: JSON.stringify(categoryData)
        });
        await fetchCategories();
        return data;
    } catch (error) {
        throw error;
    }
};

const deleteCategory = async (id) => {
    try {
        await apiRequest(API_ENDPOINTS.categories.delete(id), {
            method: 'DELETE'
        });
        await fetchCategories();
    } catch (error) {
        throw error;
    }
};

// Analytics Functions
const fetchAnalyticsSummary = async () => {
    try {
        const data = await apiRequest(API_ENDPOINTS.analytics.summary);
        return data.data || data;
    } catch (error) {
        console.error('Error fetching analytics summary:', error);
        return null;
    }
};

const fetchRecentExpenses = async (limit = 5) => {
    try {
        const data = await apiRequest(`${API_ENDPOINTS.analytics.recent}?limit=${encodeURIComponent(limit)}`);
        return data.data || [];
    } catch (error) {
        console.error('Error fetching recent expenses:', error);
        return [];
    }
};

// Database Status Check
const checkDatabaseStatus = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const ok = response.ok;

        // Health endpoint doesn't expose per-db health; treat server up as "online".
        AppState.dbStatus.mongodb = ok;
        AppState.dbStatus.redis = ok;
        AppState.dbStatus.postgres = ok;

        updateStatusIndicator('mongoStatus', ok);
        updateStatusIndicator('redisStatus', ok);
        updateStatusIndicator('postgresStatus', ok);
    } catch (error) {
        AppState.dbStatus.mongodb = false;
        AppState.dbStatus.redis = false;
        AppState.dbStatus.postgres = false;

        updateStatusIndicator('mongoStatus', false);
        updateStatusIndicator('redisStatus', false);
        updateStatusIndicator('postgresStatus', false);

        console.error('Error checking server health:', error);
    }
};

const updateStatusIndicator = (elementId, isActive) => {
    const element = document.getElementById(elementId);
    if (element) {
        if (isActive) {
            element.classList.add('active');
            element.classList.remove('error');
        } else {
            element.classList.add('error');
            element.classList.remove('active');
        }
    }
};

// UI Rendering Functions
const renderDashboard = async () => {
    const summary = await fetchAnalyticsSummary();
    const categories = await fetchCategories({ includeStats: true });
    const recent = await fetchRecentExpenses(5);

    const overview = summary?.overview || {};

    // Monthly total from analytics monthlyTrend (if present)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const monthlyTrend = Array.isArray(summary?.monthlyTrend) ? summary.monthlyTrend : [];
    const thisMonth = monthlyTrend.find((t) => t?._id?.year === currentYear && t?._id?.month === currentMonth);

    document.getElementById('totalExpenses').textContent = formatCurrency(overview.totalAmount || 0);
    document.getElementById('monthExpenses').textContent = formatCurrency(thisMonth?.total || 0);
    document.getElementById('totalTransactions').textContent = String(overview.totalExpenses || 0);
    document.getElementById('totalCategories').textContent = String(categories.length || 0);

    renderRecentExpenses(recent);
};

const renderRecentExpenses = (expenses) => {
    const container = document.getElementById('recentExpensesList');
    
    if (expenses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <h3>No expenses yet</h3>
                <p>Start tracking your expenses by adding your first one!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = expenses.map(expense => `
        <div class="expense-item">
            <div class="expense-info">
                <div class="expense-icon">
                    <i class="fas fa-receipt"></i>
                </div>
                <div class="expense-details">
                    <h4>${expense.description || 'No description'}</h4>
                    <span class="expense-meta">
                        ${expense.category?.name || 'Uncategorized'} • ${formatDate(expense.date)}
                    </span>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 16px;">
                <span class="expense-amount">${formatCurrency(expense.amount)}</span>
                <div class="expense-actions">
                    <button class="btn-icon danger" onclick="handleDeleteExpense('${expense._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
};

const renderExpensesList = async () => {
    const search = document.getElementById('searchExpenses')?.value?.trim() || '';
    const expenses = await fetchExpenses({ search });
    const container = document.getElementById('expensesList');

    if (expenses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <h3>No expenses found</h3>
                <p>Start by adding your first expense!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${expenses.map(expense => `
                    <tr>
                        <td>${formatDate(expense.date)}</td>
                        <td>${expense.description || 'No description'}</td>
                        <td>${expense.category?.name || 'Uncategorized'}</td>
                        <td><strong>${formatCurrency(expense.amount)}</strong></td>
                        <td>
                            <button class="btn-icon danger" onclick="handleDeleteExpense('${expense._id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
};

const renderCategoriesList = async () => {
    const categories = await fetchCategories({ includeStats: true });
    const container = document.getElementById('categoriesList');

    if (categories.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tags"></i>
                <h3>No categories yet</h3>
                <p>Create your first category to organize expenses!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = categories.map(category => {
        const totalSpent = category.totalSpent || 0;
        const expenseCount = category.expenseCount || 0;
        const budget = category.budget || 0;
        const utilization = category.budgetUtilization;
        const over = category.isOverBudget;

        return `
            <div class="category-card">
                <h4>${category.name}</h4>
                <p>${category.description || 'No description'}</p>
                <div class="category-stats">
                    ${expenseCount} expenses • ${formatCurrency(totalSpent)}
                </div>
                ${budget > 0 ? `
                    <div class="budget-row">
                        <div class="budget-label">Budget</div>
                        <div class="budget-value ${over ? 'danger' : ''}">${formatCurrency(budget)}</div>
                    </div>
                    <div class="budget-bar" role="progressbar" aria-valuenow="${Math.round(utilization || 0)}" aria-valuemin="0" aria-valuemax="100">
                        <div class="budget-bar__fill ${over ? 'danger' : ''}" style="width:${Math.min(100, Math.max(0, utilization || 0))}%;"></div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
};

const renderAnalytics = async () => {
    const summary = await fetchAnalyticsSummary();
    const container = document.getElementById('categoryChart');

    const byCategory = Array.isArray(summary?.byCategory) ? summary.byCategory : [];
    if (byCategory.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-pie"></i>
                <h3>No data available</h3>
                <p>Add some expenses to see analytics!</p>
            </div>
        `;
        return;
    }

    const categoryData = byCategory
        .map((c) => ({ name: c.name || 'Uncategorized', amount: c.total || 0 }))
        .filter((c) => c.amount > 0);

    // Render simple text-based chart
    container.innerHTML = `
        <div style="padding: 20px;">
            ${categoryData.map(cat => `
                <div style="margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-weight: 600;">${cat.name}</span>
                        <span style="color: var(--primary-color); font-weight: 700;">${formatCurrency(cat.amount)}</span>
                    </div>
                    <div style="background: var(--border-color); height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="background: var(--primary-color); height: 100%; width: ${(cat.amount / Math.max(...categoryData.map(c => c.amount))) * 100}%;"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
};

const renderProfile = () => {
    if (AppState.user) {
        document.getElementById('profileName').value = AppState.user.firstName || AppState.user.name || '';
        document.getElementById('profileEmail').value = AppState.user.email || '';
        document.getElementById('profileCreatedAt').value = AppState.user.createdAt 
            ? formatDate(AppState.user.createdAt) 
            : 'N/A';
    }
};

// Modal Functions
const showModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
};

const hideModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
};

const showAuthModal = () => {
    showModal('authModal');
    document.getElementById('appContainer')?.classList.add('auth-mode');
};

const hideAuthModal = () => {
    hideModal('authModal');
    document.getElementById('appContainer')?.classList.remove('auth-mode');
};

// Page Navigation
const navigateToPage = (pageName) => {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pageName) {
            item.classList.add('active');
        }
    });

    // Update pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(`${pageName}Page`);
    if (targetPage) {
        targetPage.classList.add('active');
        AppState.currentPage = pageName;

        // Load page data
        switch (pageName) {
            case 'dashboard':
                renderDashboard();
                break;
            case 'expenses':
                renderExpensesList();
                break;
            case 'categories':
                renderCategoriesList();
                break;
            case 'analytics':
                renderAnalytics();
                break;
            case 'profile':
                renderProfile();
                break;
        }
    }
};

// Event Handlers
const handleDeleteExpense = async (id) => {
    if (confirm('Are you sure you want to delete this expense?')) {
        try {
            await deleteExpense(id);
            showToast('Expense deleted successfully', 'success');
            if (AppState.currentPage === 'dashboard') {
                renderDashboard();
            } else {
                renderExpensesList();
            }
        } catch (error) {
            showToast(error.message || 'Failed to delete expense', 'error');
        }
    }
};

// Initialize App
const initializeApp = async () => {
    // Always start in auth mode
    document.getElementById('appContainer')?.classList.add('auth-mode');
    
    // Check if user is authenticated
    const token = getToken();
    if (token) {
        try {
            await getCurrentUser();
            hideAuthModal();
            await checkDatabaseStatus();
            await fetchCategories();
            await renderDashboard();
            
            // Update user display
            if (AppState.user) {
                document.getElementById('userName').textContent = AppState.user.firstName || AppState.user.name || 'User';
            }
        } catch (error) {
            console.error('Authentication error:', error);
            // Clear invalid token and show login
            removeToken();
            showAuthModal();
        }
    } else {
        showAuthModal();
    }

    // Setup event listeners
    setupEventListeners();
};

const setupEventListeners = () => {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            if (page) {
                navigateToPage(page);
            }
        });
    });

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', logout);

    // Menu Toggle (Mobile)
    document.getElementById('menuToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
    });

    // Auth Forms
    document.getElementById('loginFormElement')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !email.includes('@')) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        if (!password) {
            showToast('Please enter your password', 'error');
            return;
        }

        try {
            const result = await login(email, password);
            console.log('Login successful:', result);
            hideAuthModal();
            await checkDatabaseStatus();
            await fetchCategories();
            await renderDashboard();
            const displayName = AppState.user?.firstName || AppState.user?.name || 'User';
            document.getElementById('userName').textContent = displayName;
            showToast('Login successful!', 'success');
        } catch (error) {
            console.error('Login error:', error);
            showToast(error.message || 'Login failed', 'error');
        }
    });

    // Clear session button
    document.getElementById('clearSessionBtn')?.addEventListener('click', () => {
        localStorage.clear();
        showToast('Session cleared! Try logging in again.', 'success');
        document.getElementById('loginFormElement').reset();
    });

    document.getElementById('registerFormElement')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        if (!name || !name.trim()) {
            showToast('Please enter your name', 'error');
            return;
        }

        if (!email || !email.includes('@')) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        if (!password || password.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            const result = await register(name, email, password);
            console.log('Registration successful:', result);
            hideAuthModal();
            await checkDatabaseStatus();
            await fetchCategories();
            await renderDashboard();
            const displayName = AppState.user?.firstName || AppState.user?.name || name || 'User';
            document.getElementById('userName').textContent = displayName;
            showToast('Registration successful!', 'success');
        } catch (error) {
            console.error('Registration error:', error);
            showToast(error.message || 'Registration failed', 'error');
        }
    });

    // Auth form toggle
    document.getElementById('showRegister')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').classList.remove('active');
        document.getElementById('registerForm').classList.add('active');
    });

    document.getElementById('showLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerForm').classList.remove('active');
        document.getElementById('loginForm').classList.add('active');
    });

    // Add Expense Modal
    const expenseModal = document.getElementById('expenseModal');
    const openExpenseModal = () => {
        // Populate categories dropdown
        const categorySelect = document.getElementById('expenseCategory');
        categorySelect.innerHTML = '<option value="">Select category</option>' +
            AppState.categories.map(cat => `<option value="${cat._id}">${cat.name}</option>`).join('');
        
        // Set default date to today
        document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
        
        showModal('expenseModal');
    };

    document.getElementById('addExpenseBtn')?.addEventListener('click', openExpenseModal);
    document.getElementById('addExpenseBtn2')?.addEventListener('click', openExpenseModal);
    
    document.getElementById('closeExpenseModal')?.addEventListener('click', () => {
        hideModal('expenseModal');
        document.getElementById('expenseForm').reset();
    });
    
    document.getElementById('cancelExpense')?.addEventListener('click', () => {
        hideModal('expenseModal');
        document.getElementById('expenseForm').reset();
    });

    document.getElementById('expenseForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const expenseData = {
            amount: parseFloat(document.getElementById('expenseAmount').value),
            description: document.getElementById('expenseDescription').value,
            category: document.getElementById('expenseCategory').value,
            date: document.getElementById('expenseDate').value
        };

        if (!Number.isFinite(expenseData.amount)) {
            showToast('Please enter a valid amount', 'error');
            return;
        }

        if (!expenseData.description || !expenseData.description.trim()) {
            showToast('Please enter a description', 'error');
            return;
        }

        if (!expenseData.category) {
            showToast('Please select a category', 'error');
            return;
        }

        try {
            await createExpense(expenseData);
            hideModal('expenseModal');
            document.getElementById('expenseForm').reset();
            showToast('Expense added successfully!', 'success');
            
            if (AppState.currentPage === 'dashboard') {
                await renderDashboard();
            } else if (AppState.currentPage === 'expenses') {
                await renderExpensesList();
            }
        } catch (error) {
            showToast(error.message || 'Failed to add expense', 'error');
        }
    });

    // Add Category Modal
    document.getElementById('addCategoryBtn')?.addEventListener('click', () => {
        showModal('categoryModal');
    });
    
    document.getElementById('closeCategoryModal')?.addEventListener('click', () => {
        hideModal('categoryModal');
        document.getElementById('categoryForm').reset();
    });
    
    document.getElementById('cancelCategory')?.addEventListener('click', () => {
        hideModal('categoryModal');
        document.getElementById('categoryForm').reset();
    });

    document.getElementById('categoryForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const categoryData = {
            name: document.getElementById('categoryName').value,
            description: document.getElementById('categoryDescription').value
        };

        try {
            await createCategory(categoryData);
            hideModal('categoryModal');
            document.getElementById('categoryForm').reset();
            showToast('Category added successfully!', 'success');
            
            if (AppState.currentPage === 'categories') {
                await renderCategoriesList();
            }
        } catch (error) {
            showToast(error.message || 'Failed to add category', 'error');
        }
    });

    // Refresh Dashboard
    document.getElementById('refreshDashboard')?.addEventListener('click', async () => {
        await renderDashboard();
        showToast('Dashboard refreshed', 'success');
    });

    // Search Expenses
    let searchTimeout;
    document.getElementById('searchExpenses')?.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const searchTerm = e.target.value;
        
        searchTimeout = setTimeout(() => {
            // Re-render using server-side search
            renderExpensesList();
        }, 300);
    });

    // Analytics Timeframe
    document.getElementById('analyticsTimeframe')?.addEventListener('change', () => {
        renderAnalytics();
    });

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
};

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Expose handleDeleteExpense to global scope for onclick handlers
window.handleDeleteExpense = handleDeleteExpense;

// Check database status periodically
setInterval(checkDatabaseStatus, 30000); // Check every 30 seconds
