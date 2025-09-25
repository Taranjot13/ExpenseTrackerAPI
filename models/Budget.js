// This file defines the Mongoose schema and model for the Budget collection.

const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    budget: { type: Number, required: true },
    month: { type: String, required: true }
});

module.exports = mongoose.model('Budget', budgetSchema);
