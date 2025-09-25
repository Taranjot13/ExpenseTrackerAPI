// Custom error handler module using CommonJS
module.exports = function (err, req, res, next) {
    console.error('Custom Error Handler:', err.stack);
    res.status(500).send('Internal Server Error (Custom Handler)');
};
