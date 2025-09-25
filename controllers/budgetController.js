// This file contains the controller functions for handling budget-related API requests.

const Budget = require('../models/Budget');

exports.createBudget = async (req, res) => {
    try {
        const { userId, budget, month } = req.body;
        const newBudget = new Budget({ userId, budget, month });
        await newBudget.save();
        res.status(201).json(newBudget);
    } catch (err) {
        res.status(500).send('Error creating budget');
    }
};

exports.getBudget = async (req, res) => {
    try {
        const budget = await Budget.findOne({ userId: req.params.userId });
        res.json(budget);
    } catch (err) {
        res.status(500).send('Error fetching budget');
    }
};

exports.updateBudget = async (req, res) => {
    try {
        const { budget } = req.body;
        await Budget.findOneAndUpdate({ userId: req.params.userId }, { budget });
        res.status(204).send();
    } catch (err) {
        res.status(500).send('Error updating budget');
    }
};

exports.deleteBudget = async (req, res) => {
    try {
        await Budget.findOneAndDelete({ userId: req.params.userId });
        res.status(204).send();
    } catch (err) {
        res.status(500).send('Error deleting budget');
    }
};
