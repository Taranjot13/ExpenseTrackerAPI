// This file contains the client-side JavaScript for the Expense Tracker application.
// Project name: EXPENSE TRACKER API

document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const searchForm = document.getElementById('search-form');
    const expenseList = document.getElementById('expense-list');
    const exportCsvButton = document.getElementById('export-csv');

    let currentExpenseId = null; // To track the expense being updated

    // Function to fetch and display expenses
    const fetchExpenses = async (query = '') => {
        const response = await fetch(`/expenses${query}`);
        const expenses = await response.json();
        expenseList.innerHTML = ''; // Clear the current list
        expenses.forEach(expense => {
            const li = document.createElement('li');
            li.textContent = `${expense.title} - $${expense.amount} - ${expense.category} - ${new Date(expense.date).toLocaleDateString()}`;
            const updateButton = document.createElement('button');
            updateButton.textContent = 'Update';
            updateButton.onclick = () => {
                document.getElementById('title').value = expense.title;
                document.getElementById('amount').value = expense.amount;
                document.getElementById('category').value = expense.category;
                document.getElementById('date').value = new Date(expense.date).toISOString().split('T')[0];
                document.getElementById('recurring').checked = expense.recurring;
                currentExpenseId = expense._id; // Set the current expense ID for updating
            };
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = async () => {
                await fetch(`/expenses/${expense._id}`, { method: 'DELETE' });
                fetchExpenses(); // Refresh the list after deletion
            };
            li.appendChild(updateButton);
            li.appendChild(deleteButton);
            expenseList.appendChild(li);
        });
    };
    fetchExpenses();
    expenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const amount = document.getElementById('amount').value;
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        const recurring = document.getElementById('recurring').checked;
        if (currentExpenseId) {
            await fetch(`/expenses/${currentExpenseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, amount, category, date, recurring }),
            });
            currentExpenseId = null;
        } else {
            await fetch('/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, amount, category, date, recurring }),
            });
        }
        fetchExpenses();
        expenseForm.reset();
    });
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('search-title').value;
        const category = document.getElementById('search-category').value;
        const date = document.getElementById('search-date').value;
        const minAmount = document.getElementById('min-amount').value;
        const maxAmount = document.getElementById('max-amount').value;
        const query = `?${new URLSearchParams({ title, category, date, minAmount, maxAmount }).toString()}`;
        fetchExpenses(query);
    });
    exportCsvButton.addEventListener('click', async () => {
        const response = await fetch('/export?format=csv');
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'expenses.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            alert('Failed to export CSV');
        }
    });
});
