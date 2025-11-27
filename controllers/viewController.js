// Frontend Controller - handles rendering of views

const jwt = require('jsonwebtoken');

// Middleware to check authentication for views
exports.requireAuth = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

// Middleware to pass user to all views
exports.setUser = (req, res, next) => {
    const token = req.cookies.token;
    
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.locals.user = decoded;
        } catch (error) {
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }
    
    res.locals.messages = req.flash ? {
        success: req.flash('success'),
        error: req.flash('error')
    } : {};
    
    next();
};

// Home page
exports.getHome = (req, res) => {
    res.render('index', {
        title: 'Home - Expense Tracker'
    });
};

// Login page
exports.getLogin = (req, res) => {
    if (req.cookies.token) {
        return res.redirect('/dashboard');
    }
    res.render('login', {
        title: 'Login - Expense Tracker'
    });
};

// Register page
exports.getRegister = (req, res) => {
    if (req.cookies.token) {
        return res.redirect('/dashboard');
    }
    res.render('register', {
        title: 'Register - Expense Tracker'
    });
};

// Dashboard
exports.getDashboard = (req, res) => {
    res.render('dashboard', {
        title: 'Dashboard - Expense Tracker'
    });
};

// Expenses list
exports.getExpenses = (req, res) => {
    res.render('expenses', {
        title: 'Expenses - Expense Tracker'
    });
};

// New expense form
exports.getNewExpense = (req, res) => {
    res.render('expense-form', {
        title: 'Add Expense - Expense Tracker'
    });
};

// Edit expense form
exports.getEditExpense = (req, res) => {
    res.render('expense-form', {
        title: 'Edit Expense - Expense Tracker',
        expenseId: req.params.id
    });
};

// Categories
exports.getCategories = (req, res) => {
    res.render('categories', {
        title: 'Categories - Expense Tracker'
    });
};

// Analytics
exports.getAnalytics = (req, res) => {
    res.render('analytics', {
        title: 'Analytics - Expense Tracker'
    });
};

// Logout
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
};
