// Custom logger module using CommonJS
module.exports = function logRequest(req, res, next) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
};
