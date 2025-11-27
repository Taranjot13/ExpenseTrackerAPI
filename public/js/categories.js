// Categories Page JavaScript

let editingCategoryId = null;

// Load categories
async function loadCategories() {
    try {
        const response = await apiCall('/categories');
        const container = document.getElementById('categoriesGrid');

        if (response.success && response.data.length > 0) {
            container.innerHTML = response.data.map(category => {
                const spent = category.spent || 0;
                const budget = category.budget || 0;
                const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                const progressClass = percentage > 100 ? 'danger' : percentage > 80 ? 'warning' : '';

                return `
                    <div class="category-card">
                        <div class="category-header">
                            <div class="category-name">
                                <div class="category-color-badge" style="background: ${category.color || '#3498db'}"></div>
                                ${category.name}
                            </div>
                            <div class="category-actions">
                                <button onclick="editCategory('${category._id}')" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteCategory('${category._id}')" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        
                        ${budget > 0 ? `
                            <div class="category-budget">
                                <div class="budget-info">
                                    <span>Spent: ${formatCurrency(spent)}</span>
                                    <span>Budget: ${formatCurrency(budget)}</span>
                                </div>
                                <div class="budget-bar">
                                    <div class="budget-progress ${progressClass}" 
                                         style="width: ${Math.min(percentage, 100)}%"></div>
                                </div>
                                <div style="font-size: 0.85rem; color: var(--text-light); margin-top: 0.3rem;">
                                    ${formatCurrency(budget - spent)} remaining
                                </div>
                            </div>
                        ` : '<p style="color: var(--text-light); font-size: 0.9rem;">No budget set</p>'}
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fas fa-tags" style="font-size: 4rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-light);">No categories yet. Create your first category!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        showNotification(error.message, 'error');
    }
}

// Open modal
function openModal(categoryId = null) {
    const modal = document.getElementById('categoryModal');
    const form = document.getElementById('categoryForm');
    const title = document.getElementById('modalTitle');

    editingCategoryId = categoryId;

    if (categoryId) {
        title.innerHTML = '<i class="fas fa-edit"></i> Edit Category';
        loadCategoryData(categoryId);
    } else {
        title.innerHTML = '<i class="fas fa-plus"></i> Add Category';
        form.reset();
        document.getElementById('categoryColor').value = '#3498db';
    }

    modal.classList.add('active');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('categoryModal');
    modal.classList.remove('active');
    editingCategoryId = null;
}

// Load category data for editing
async function loadCategoryData(categoryId) {
    try {
        const response = await apiCall(`/categories/${categoryId}`);
        
        if (response.success) {
            const category = response.data;
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryBudget').value = category.budget || '';
            document.getElementById('categoryColor').value = category.color || '#3498db';
        }
    } catch (error) {
        console.error('Error loading category:', error);
        showNotification(error.message, 'error');
    }
}

// Edit category
function editCategory(categoryId) {
    openModal(categoryId);
}

// Delete category
async function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await apiCall(`/categories/${categoryId}`, {
            method: 'DELETE'
        });

        if (response.success) {
            showNotification('Category deleted successfully!', 'success');
            loadCategories();
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        showNotification(error.message, 'error');
    }
}

// Handle form submission
document.getElementById('categoryForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        name: document.getElementById('categoryName').value.trim(),
        budget: parseFloat(document.getElementById('categoryBudget').value) || 0,
        color: document.getElementById('categoryColor').value
    };

    if (!formData.name) {
        showNotification('Please enter a category name', 'error');
        return;
    }

    try {
        let response;
        if (editingCategoryId) {
            response = await apiCall(`/categories/${editingCategoryId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
        } else {
            response = await apiCall('/categories', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
        }

        if (response.success) {
            showNotification(
                editingCategoryId ? 'Category updated successfully!' : 'Category created successfully!',
                'success'
            );
            closeModal();
            loadCategories();
        }
    } catch (error) {
        console.error('Error saving category:', error);
        showNotification(error.message, 'error');
    }
});

// Event listeners
document.getElementById('addCategoryBtn')?.addEventListener('click', () => openModal());

document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', closeModal);
});

// Close modal when clicking outside
document.getElementById('categoryModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'categoryModal') {
        closeModal();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', loadCategories);
