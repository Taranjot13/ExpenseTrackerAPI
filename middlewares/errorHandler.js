// This file contains the custom error handler middleware for the Express application.

module.exports = function (err, req, res, next) {
    console.error('Custom Error Handler:', err.stack);
    res.status(500).send('Internal Server Error (Custom Handler)');
};
