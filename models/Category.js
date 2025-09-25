// This file defines the Mongoose schema and model for the Category collection.

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true }
});

module.exports = mongoose.model('Category', categorySchema);
