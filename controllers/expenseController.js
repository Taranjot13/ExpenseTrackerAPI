// This file contains the controller functions for handling expense-related API requests.

const Expense = require('../models/Expense');

exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.json(expenses);
    } catch (err) {
        res.status(500).send('Error fetching expenses');
    }
};

exports.createExpense = async (req, res) => {
    try {
        const { title, amount, category, date, recurring } = req.body;
        const expense = new Expense({ title, amount, category, date, recurring });
        await expense.save();
        res.status(201).json(expense);
    } catch (err) {
        res.status(500).send('Error saving expense');
    }
};

exports.updateExpense = async (req, res) => {
    try {
        const { title, amount, category, date, recurring } = req.body;
        await Expense.findByIdAndUpdate(req.params.id, { title, amount, category, date, recurring });
        res.status(204).send();
    } catch (err) {
        res.status(500).send('Error updating expense');
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(500).send('Error deleting expense');
    }
};
