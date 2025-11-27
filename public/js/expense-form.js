// Expense Form JavaScript

// Load categories
async function loadCategories() {
    try {
        const response = await apiCall('/categories');
        const select = document.getElementById('category');

        if (response.success) {
            const options = response.data.map(cat => `
                <option value="${cat._id}" ${expenseData && expenseData.category?._id === cat._id ? 'selected' : ''}>
                    ${cat.name}
                </option>
            `).join('');

            select.innerHTML = '<option value="">Select a category</option>' + options;
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        showNotification('Error loading categories', 'error');
    }
}

// Handle form submission
document.getElementById('expenseForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        description: document.getElementById('description').value.trim(),
        amount: parseFloat(document.getElementById('amount').value),
        date: document.getElementById('date').value,
        category: document.getElementById('category').value,
        notes: document.getElementById('notes').value.trim()
    };

    // Validation
    if (!formData.description) {
        showNotification('Please enter a description', 'error');
        return;
    }

    if (!formData.amount || formData.amount <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }

    if (!formData.category) {
        showNotification('Please select a category', 'error');
        return;
    }

    try {
        let response;
        if (typeof expenseData !== 'undefined' && expenseData) {
            // Update existing expense
            response = await apiCall(`/expenses/${expenseData._id}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
        } else {
            // Create new expense
            response = await apiCall('/expenses', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
        }

        if (response.success) {
            showNotification(
                expenseData ? 'Expense updated successfully!' : 'Expense added successfully!',
                'success'
            );
            setTimeout(() => {
                window.location.href = '/expenses';
            }, 1000);
        }
    } catch (error) {
        console.error('Error saving expense:', error);
        showNotification(error.message, 'error');
    }
});

// Handle delete button
document.getElementById('deleteBtn')?.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }

    try {
        const response = await apiCall(`/expenses/${expenseData._id}`, {
            method: 'DELETE'
        });

        if (response.success) {
            showNotification('Expense deleted successfully!', 'success');
            setTimeout(() => {
                window.location.href = '/expenses';
            }, 1000);
        }
    } catch (error) {
        console.error('Error deleting expense:', error);
        showNotification(error.message, 'error');
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', loadCategories);
