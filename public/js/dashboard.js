// Dashboard JavaScript

let categoryChart;

// Load dashboard data
async function loadDashboard() {
    try {
        // Load summary statistics
        const summaryResponse = await apiCall('/analytics/summary');
        if (summaryResponse.success) {
            updateStats(summaryResponse.data);
        }

        // Load recent expenses
        await loadRecentExpenses();

        // Load category chart
        await loadCategoryChart();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification(error.message, 'error');
    }
}

// Update statistics
function updateStats(data) {
    const totalExpenses = data.totalExpenses || 0;
    const monthExpenses = data.periodSummary?.currentMonth || 0;
    const weekExpenses = data.periodSummary?.currentWeek || 0;
    const totalCount = data.totalCount || 0;

    document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('monthExpenses').textContent = formatCurrency(monthExpenses);
    document.getElementById('weekExpenses').textContent = formatCurrency(weekExpenses);
    document.getElementById('totalCount').textContent = totalCount;
}

// Load recent expenses
async function loadRecentExpenses() {
    try {
        const response = await apiCall('/expenses?limit=5&sort=-date');
        const container = document.getElementById('recentExpenses');

        if (response.success && response.data.expenses.length > 0) {
            container.innerHTML = response.data.expenses.map(expense => `
                <div class="expense-item" style="margin-bottom: 1rem;">
                    <div class="expense-info">
                        <div class="expense-description">${expense.description}</div>
                        <div class="expense-meta">
                            <span><i class="fas fa-calendar"></i> ${formatDate(expense.date)}</span>
                            <span class="expense-category" style="background: ${expense.category?.color || '#3498db'}20; color: ${expense.category?.color || '#3498db'}">
                                <i class="fas fa-tag"></i> ${expense.category?.name || 'Uncategorized'}
                            </span>
                        </div>
                    </div>
                    <div class="expense-amount">${formatCurrency(expense.amount)}</div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p style="text-align: center; color: var(--text-light);">No expenses yet. Add your first expense!</p>';
        }
    } catch (error) {
        console.error('Error loading recent expenses:', error);
        document.getElementById('recentExpenses').innerHTML = '<p style="text-align: center; color: var(--danger-color);">Error loading expenses</p>';
    }
}

// Load category chart
async function loadCategoryChart() {
    try {
        const response = await apiCall('/analytics/by-category');
        const ctx = document.getElementById('categoryChart');

        if (response.success && response.data.length > 0) {
            const labels = response.data.map(item => item.category?.name || 'Uncategorized');
            const data = response.data.map(item => item.total);
            const colors = response.data.map(item => item.category?.color || '#3498db');

            if (categoryChart) {
                categoryChart.destroy();
            }

            categoryChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: colors,
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.label + ': ' + formatCurrency(context.parsed);
                                }
                            }
                        }
                    }
                }
            });
        } else {
            ctx.parentElement.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">No data available</p>';
        }
    } catch (error) {
        console.error('Error loading category chart:', error);
    }
}

// Refresh function for WebSocket updates
function refreshExpenses() {
    loadDashboard();
}

// Load dashboard on page load
document.addEventListener('DOMContentLoaded', loadDashboard);
