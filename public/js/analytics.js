// Analytics Page JavaScript

let currentPeriod = 'week';
let charts = {};

// Load analytics
async function loadAnalytics(period = 'week', startDate = null, endDate = null) {
    try {
        let endpoint = `/analytics/summary?period=${period}`;
        if (startDate && endDate) {
            endpoint += `&startDate=${startDate}&endDate=${endDate}`;
        }

        const response = await apiCall(endpoint);
        
        if (response.success) {
            updateStats(response.data);
            await loadTrendChart(period, startDate, endDate);
            await loadCategoryCharts();
            await loadBudgetChart();
            generateInsights(response.data);
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        showNotification(error.message, 'error');
    }
}

// Update statistics
function updateStats(data) {
    document.getElementById('totalSpending').textContent = formatCurrency(data.totalExpenses || 0);
    document.getElementById('avgDaily').textContent = formatCurrency(data.averagePerDay || 0);
    document.getElementById('highestExpense').textContent = formatCurrency(data.highestExpense || 0);
    document.getElementById('totalTransactions').textContent = data.totalCount || 0;
}

// Load trend chart
async function loadTrendChart(period, startDate, endDate) {
    try {
        let endpoint = `/analytics/trends?period=${period}`;
        if (startDate && endDate) {
            endpoint += `&startDate=${startDate}&endDate=${endDate}`;
        }

        const response = await apiCall(endpoint);
        const ctx = document.getElementById('trendChart');

        if (response.success && response.data.length > 0) {
            const labels = response.data.map(item => {
                const date = new Date(item.date);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
            const data = response.data.map(item => item.total);

            if (charts.trend) charts.trend.destroy();

            charts.trend = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Daily Spending',
                        data: data,
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => formatCurrency(context.parsed.y)
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: (value) => '$' + value
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading trend chart:', error);
    }
}

// Load category charts
async function loadCategoryCharts() {
    try {
        const response = await apiCall('/analytics/by-category');
        
        if (response.success && response.data.length > 0) {
            const labels = response.data.map(item => item.category?.name || 'Uncategorized');
            const data = response.data.map(item => item.total);
            const colors = response.data.map(item => item.category?.color || '#3498db');

            // Pie chart
            const pieCtx = document.getElementById('categoryPieChart');
            if (charts.pie) charts.pie.destroy();
            
            charts.pie = new Chart(pieCtx, {
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
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                label: (context) => context.label + ': ' + formatCurrency(context.parsed)
                            }
                        }
                    }
                }
            });

            // Bar chart
            const barCtx = document.getElementById('topCategoriesChart');
            if (charts.bar) charts.bar.destroy();
            
            charts.bar = new Chart(barCtx, {
                type: 'bar',
                data: {
                    labels: labels.slice(0, 5),
                    datasets: [{
                        label: 'Spending',
                        data: data.slice(0, 5),
                        backgroundColor: colors.slice(0, 5)
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => formatCurrency(context.parsed.y)
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: (value) => '$' + value
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading category charts:', error);
    }
}

// Load budget chart
async function loadBudgetChart() {
    try {
        const response = await apiCall('/categories');
        const ctx = document.getElementById('budgetChart');

        if (response.success && response.data.length > 0) {
            const categories = response.data.filter(cat => cat.budget > 0);
            
            if (categories.length > 0) {
                const labels = categories.map(cat => cat.name);
                const budgets = categories.map(cat => cat.budget);
                const spent = categories.map(cat => cat.spent || 0);

                if (charts.budget) charts.budget.destroy();

                charts.budget = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Budget',
                                data: budgets,
                                backgroundColor: 'rgba(52, 152, 219, 0.5)',
                                borderColor: '#3498db',
                                borderWidth: 2
                            },
                            {
                                label: 'Spent',
                                data: spent,
                                backgroundColor: 'rgba(231, 76, 60, 0.5)',
                                borderColor: '#e74c3c',
                                borderWidth: 2
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { position: 'top' },
                            tooltip: {
                                callbacks: {
                                    label: (context) => context.dataset.label + ': ' + formatCurrency(context.parsed.y)
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: (value) => '$' + value
                                }
                            }
                        }
                    }
                });
            } else {
                ctx.parentElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-light);">No budgets set</p>';
            }
        }
    } catch (error) {
        console.error('Error loading budget chart:', error);
    }
}

// Generate insights
function generateInsights(data) {
    const container = document.getElementById('insightsList');
    const insights = [];

    if (data.totalExpenses > 0) {
        insights.push({
            type: 'info',
            text: `You've spent ${formatCurrency(data.totalExpenses)} in total.`
        });

        if (data.averagePerDay > 0) {
            insights.push({
                type: 'info',
                text: `Your average daily spending is ${formatCurrency(data.averagePerDay)}.`
            });
        }

        if (data.highestExpense > 0) {
            insights.push({
                type: 'warning',
                text: `Your highest single expense was ${formatCurrency(data.highestExpense)}.`
            });
        }
    } else {
        insights.push({
            type: 'info',
            text: 'No expenses recorded yet. Start tracking your expenses to see insights!'
        });
    }

    container.innerHTML = insights.map(insight => `
        <div class="insight-item ${insight.type}">
            <i class="fas fa-lightbulb"></i> ${insight.text}
        </div>
    `).join('');
}

// Period selector
document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const period = this.dataset.period;
        currentPeriod = period;

        if (period === 'custom') {
            document.getElementById('customDateRange').style.display = 'block';
        } else {
            document.getElementById('customDateRange').style.display = 'none';
            loadAnalytics(period);
        }
    });
});

// Apply custom date range
document.getElementById('applyCustomRange')?.addEventListener('click', () => {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) {
        showNotification('Please select both start and end dates', 'error');
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        showNotification('Start date must be before end date', 'error');
        return;
    }

    loadAnalytics('custom', startDate, endDate);
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAnalytics('week');
});
