// This file contains the controller functions for handling category-related API requests.

const Category = require('../models/Category');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).send('Error fetching categories');
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(500).send('Error deleting category');
    }
};
