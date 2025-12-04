// View Routes - Frontend pages
const express = require('express');
const router = express.Router();
const path = require('path');

// Serve the single-page application for all routes
router.get('*', (req, res) => {
  // Don't serve index.ejs for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  res.render('index', { 
    title: 'Expense Tracker - Modern Dashboard'
  });
});

module.exports = router;
