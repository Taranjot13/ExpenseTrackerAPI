const axios = require('axios');

/**
 * Fetch current exchange rates from external API
 * @param {string} baseCurrency - Base currency code (e.g., 'USD', 'EUR')
 * @returns {Promise<Object>} Exchange rates object
 */
const fetchExchangeRates = async (baseCurrency = 'USD') => {
  try {
    const response = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
    );
    
    return {
      success: true,
      base: response.data.base,
      date: response.data.date,
      rates: response.data.rates
    };
  } catch (error) {
    console.error('External API Error:', error.message);
    throw new Error(`Failed to fetch exchange rates: ${error.message}`);
  }
};

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} from - Source currency code
 * @param {string} to - Target currency code
 * @returns {Promise<Object>} Conversion result
 */
const convertCurrency = async (amount, from = 'USD', to = 'INR') => {
  try {
    const { rates } = await fetchExchangeRates(from);
    
    if (!rates[to]) {
      throw new Error(`Currency ${to} not found`);
    }
    
    const convertedAmount = amount * rates[to];
    
    return {
      success: true,
      original: {
        amount,
        currency: from
      },
      converted: {
        amount: convertedAmount,
        currency: to
      },
      rate: rates[to]
    };
  } catch (error) {
    console.error('Currency Conversion Error:', error.message);
    throw error;
  }
};

/**
 * Fetch random quote from external API
 * @returns {Promise<Object>} Inspirational quote
 */
const fetchRandomQuote = async () => {
  try {
    const response = await axios.get('https://api.quotable.io/random');
    
    return {
      success: true,
      quote: response.data.content,
      author: response.data.author,
      tags: response.data.tags
    };
  } catch (error) {
    console.error('Quote API Error:', error.message);
    throw new Error(`Failed to fetch quote: ${error.message}`);
  }
};

/**
 * Fetch weather data from external API
 * @param {string} city - City name
 * @returns {Promise<Object>} Weather data
 */
const fetchWeather = async (city = 'Delhi') => {
  try {
    // Using wttr.in API (no API key required)
    const response = await axios.get(
      `https://wttr.in/${city}?format=j1`
    );
    
    const current = response.data.current_condition[0];
    
    return {
      success: true,
      location: city,
      temperature: `${current.temp_C}°C`,
      feelsLike: `${current.FeelsLikeC}°C`,
      humidity: `${current.humidity}%`,
      description: current.weatherDesc[0].value,
      windSpeed: `${current.windspeedKmph} km/h`
    };
  } catch (error) {
    console.error('Weather API Error:', error.message);
    throw new Error(`Failed to fetch weather: ${error.message}`);
  }
};

module.exports = {
  fetchExchangeRates,
  convertCurrency,
  fetchRandomQuote,
  fetchWeather
};
