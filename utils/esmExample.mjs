/**
 * ESM (ECMAScript Module) Example
 * This file demonstrates ES6 module syntax as required by syllabus
 * Usage: node --experimental-modules utils/esmExample.mjs
 */

/**
 * Format number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (USD, EUR, INR, etc.)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
export const formatDate = (date = new Date()) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {string} Percentage with symbol
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(2)}%`;
};

/**
 * Generate random ID
 * @returns {string} Random alphanumeric ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Default export - utility object
const utils = {
  formatCurrency,
  formatDate,
  calculatePercentage,
  generateId,
  truncateText,
  sleep
};

export default utils;

// Self-executing example (always runs when file is executed)
console.log('\nESM Module Examples:');
console.log('===================');
console.log('Currency:', formatCurrency(12500.50, 'INR'));
console.log('Date:', formatDate(new Date()));
console.log('Percentage:', calculatePercentage(75, 200));
console.log('Random ID:', generateId());
console.log('Truncate:', truncateText('This is a very long text that needs to be truncated', 20));
console.log('\nAll ESM functions tested successfully!\n');
