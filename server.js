// This file is the main entry point for the Expense Tracker API server.
// Project name: EXPENSE TRACKER API
const express = require('express'); // Import Express framework
const path = require('path'); // Import path module for handling file paths
const mongoose = require('mongoose'); // Import Mongoose for MongoDB interaction
const session = require('express-session'); // Import express-session for session management
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for JWT authentication
const multer = require('multer'); // Import multer for file uploads
const logRequest = require('./middlewares/logger'); // Custom logger module (CommonJS)
const customErrorHandler = require('./middlewares/errorHandler'); // Custom error handler module (CommonJS)
const app = express(); // Create an Express application
const port = 3019; // Define the port for the server

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Upload folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Unique file names
    }
});

const upload = multer({ storage: storage });

// Parse URL-encoded and JSON data
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded data
app.use(express.json()); // Middleware to parse JSON data

// Session management middleware
app.use(session({
    secret: 'your-secret-key', // Replace with a strong secret in production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Set EJS as the view engine
app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', path.join(__dirname, 'views')); // Set the views directory
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from public/

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/expenses", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB')) // Log successful connection
    .catch(err => console.error('MongoDB connection error:', err)); // Log connection error

// Import models
const Expense = require('./models/Expense');
const Category = require('./models/Category');
const Budget = require('./models/Budget');

// Use custom logger middleware (modular CommonJS)
app.use(logRequest);

// Serve the main form
app.get("/", async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.render("index", { expenses });
    } catch (err) {
        res.status(500).send('Error fetching expenses');
    }
});

// Endpoint to post a new expense
app.post("/post", async (req, res) => {
    try {
        const { title, amount, category, date, recurring } = req.body; // Get expense data from request body
        const expense = new Expense({ title, amount, category, date, recurring }); // Create a new expense
        await expense.save(); // Save the expense to the database
        res.redirect('/'); // Redirect to the main page
    } catch (err) {
        console.error(err);
        res.status(500).send("Error saving expense"); // Send error response
    }
});

// Expense API routes
const expenseRoutes = require('./routes/expenseRoutes');
app.use('/expenses', expenseRoutes);

// Budget API routes
const budgetRoutes = require('./routes/budgetRoutes');
app.use('/budget', budgetRoutes);

const csvWriter = require('csv-writer').createObjectCsvWriter; // Import CSV writer

// Export expenses as CSV
app.get('/export', async (req, res) => {
    const { format } = req.query; // Get the desired export format from query parameters
    try {
        const expenses = await Expense.find(); // Fetch all expenses
        const csvData = expenses.map(expense => ({ // Prepare data for CSV
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            date: expense.date.toISOString().split('T')[0] // Format date
        }));
        if (format === 'csv') {
            const writer = csvWriter({
                path: 'expenses.csv', // Path to save CSV file
                header: [
                    { id: 'title', title: 'Title' },
                    { id: 'amount', title: 'Amount' },
                    { id: 'category', title: 'Category' },
                    { id: 'date', title: 'Date' }
                ]
            });
            await writer.writeRecords(csvData); // Write records to CSV
            res.download('expenses.csv'); // Download the CSV file
        } else {
            // Handle other formats (e.g., PDF, Excel) here
            res.status(400).send('Unsupported export format'); // Send error for unsupported formats
        }
    } catch (err) {
        res.status(500).send('Error exporting expenses'); // Send error response
    }
});

// Category API routes
const categoryRoutes = require('./routes/categoryRoutes');
app.use('/categories', categoryRoutes);

// Error handling middleware
app.use(customErrorHandler);

// Example of blocking vs non-blocking code
app.get('/blocking-nonblocking', async (req, res) => {
    console.log('Blocking vs Non-Blocking Example');
    // Blocking code example
    const startBlocking = Date.now();
    for (let i = 0; i < 1e8; i++) {} // Simulate blocking operation
    const endBlocking = Date.now();
    console.log(`Blocking operation took: ${endBlocking - startBlocking} ms`);
    // Non-blocking code example
    const startNonBlocking = Date.now();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate non-blocking operation
    const endNonBlocking = Date.now();
    console.log(`Non-blocking operation took: ${endNonBlocking - startNonBlocking} ms`);
    res.send('Blocking and Non-Blocking operations completed.');
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`); // Log server start message
});
