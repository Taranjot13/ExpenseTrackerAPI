// This file contains the custom logger middleware for logging incoming requests.

module.exports = function logRequest(req, res, next) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
};
