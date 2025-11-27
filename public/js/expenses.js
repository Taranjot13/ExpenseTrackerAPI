// Expenses Page JavaScript

let currentPage = 1;
let currentFilters = {};

// Load expenses
async function loadExpenses(page = 1) {
    try {
        const queryParams = new URLSearchParams({
            page: page,
            limit: 10,
            ...currentFilters
        });

        const response = await apiCall(`/expenses?${queryParams}`);
        const container = document.getElementById('expensesList');

        if (response.success && response.data.expenses.length > 0) {
            container.innerHTML = response.data.expenses.map(expense => `
                <div class="expense-item">
                    <div class="expense-info">
                        <div class="expense-description">${expense.description}</div>
                        <div class="expense-meta">
                            <span><i class="fas fa-calendar"></i> ${formatDate(expense.date)}</span>
                            <span class="expense-category" style="background: ${expense.category?.color || '#3498db'}20; color: ${expense.category?.color || '#3498db'}">
                                <i class="fas fa-tag"></i> ${expense.category?.name || 'Uncategorized'}
                            </span>
                            ${expense.notes ? `<span><i class="fas fa-sticky-note"></i> Has notes</span>` : ''}
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div class="expense-amount">${formatCurrency(expense.amount)}</div>
                        <div class="expense-actions">
                            <a href="/expenses/edit/${expense._id}" class="btn btn-sm btn-primary">
                                <i class="fas fa-edit"></i>
                            </a>
                            <button onclick="deleteExpense('${expense._id}')" class="btn btn-sm btn-danger">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            renderPagination(response.data.pagination);
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <i class="fas fa-inbox" style="font-size: 4rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-light);">No expenses found. Add your first expense!</p>
                    <a href="/expenses/new" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-plus"></i> Add Expense
                    </a>
                </div>
            `;
            document.getElementById('pagination').innerHTML = '';
        }
    } catch (error) {
        console.error('Error loading expenses:', error);
        showNotification(error.message, 'error');
    }
}

// Render pagination
function renderPagination(pagination) {
    const container = document.getElementById('pagination');
    
    if (!pagination || pagination.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';

    // Previous button
    html += `
        <button onclick="changePage(${pagination.currentPage - 1})" 
                ${pagination.currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    // Page numbers
    for (let i = 1; i <= pagination.totalPages; i++) {
        if (i === 1 || i === pagination.totalPages || 
            (i >= pagination.currentPage - 1 && i <= pagination.currentPage + 1)) {
            html += `
                <button onclick="changePage(${i})" 
                        ${i === pagination.currentPage ? 'class="active"' : ''}>
                    ${i}
                </button>
            `;
        } else if (i === pagination.currentPage - 2 || i === pagination.currentPage + 2) {
            html += '<span style="padding: 0.5rem;">...</span>';
        }
    }

    // Next button
    html += `
        <button onclick="changePage(${pagination.currentPage + 1})" 
                ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    container.innerHTML = html;
}

// Change page
function changePage(page) {
    currentPage = page;
    loadExpenses(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Delete expense
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }

    try {
        const response = await apiCall(`/expenses/${id}`, {
            method: 'DELETE'
        });

        if (response.success) {
            showNotification('Expense deleted successfully!', 'success');
            loadExpenses(currentPage);
        }
    } catch (error) {
        console.error('Error deleting expense:', error);
        showNotification(error.message, 'error');
    }
}

// Load categories for filter
async function loadCategories() {
    try {
        const response = await apiCall('/categories');
        const select = document.getElementById('filterCategory');

        if (response.success) {
            select.innerHTML = '<option value="">All Categories</option>' +
                response.data.map(cat => `
                    <option value="${cat._id}">${cat.name}</option>
                `).join('');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Apply filters
document.getElementById('applyFilters')?.addEventListener('click', () => {
    currentFilters = {};

    const category = document.getElementById('filterCategory').value;
    const startDate = document.getElementById('filterStartDate').value;
    const endDate = document.getElementById('filterEndDate').value;
    const sort = document.getElementById('filterSort').value;

    if (category) currentFilters.category = category;
    if (startDate) currentFilters.startDate = startDate;
    if (endDate) currentFilters.endDate = endDate;
    if (sort) currentFilters.sort = sort;

    currentPage = 1;
    loadExpenses(1);
});

// Clear filters
document.getElementById('clearFilters')?.addEventListener('click', () => {
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('filterSort').value = '-date';
    
    currentFilters = {};
    currentPage = 1;
    loadExpenses(1);
});

// Refresh function for WebSocket
function refreshExpenses() {
    loadExpenses(currentPage);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadExpenses();
});
