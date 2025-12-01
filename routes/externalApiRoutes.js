const express = require('express');
const router = express.Router();
const {
  fetchExchangeRates,
  convertCurrency,
  fetchRandomQuote,
  fetchWeather
} = require('../utils/externalApi');

/**
 * @route   GET /api/external/exchange-rates
 * @desc    Fetch current exchange rates
 * @access  Public
 * @query   base - Base currency (default: USD)
 */
router.get('/exchange-rates', async (req, res, next) => {
  try {
    const { base = 'USD' } = req.query;
    const data = await fetchExchangeRates(base);
    
    res.status(200).json({
      success: true,
      message: 'Exchange rates fetched successfully',
      data
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/external/convert
 * @desc    Convert currency amount
 * @access  Public
 * @query   amount, from, to
 */
router.get('/convert', async (req, res, next) => {
  try {
    const { amount, from = 'USD', to = 'INR' } = req.query;
    
    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount'
      });
    }
    
    const data = await convertCurrency(parseFloat(amount), from.toUpperCase(), to.toUpperCase());
    
    res.status(200).json({
      success: true,
      message: 'Currency converted successfully',
      data
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/external/quote
 * @desc    Fetch random inspirational quote
 * @access  Public
 */
router.get('/quote', async (req, res, next) => {
  try {
    const data = await fetchRandomQuote();
    
    res.status(200).json({
      success: true,
      message: 'Quote fetched successfully',
      data
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/external/weather
 * @desc    Fetch weather data
 * @access  Public
 * @query   city - City name (default: Delhi)
 */
router.get('/weather', async (req, res, next) => {
  try {
    const { city = 'Delhi' } = req.query;
    const data = await fetchWeather(city);
    
    res.status(200).json({
      success: true,
      message: 'Weather data fetched successfully',
      data
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
