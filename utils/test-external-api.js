/**
 * CLI tool to test external API consumption
 * Demonstrates: External API calls, HTTP client usage, async/await, error handling
 * 
 * Usage:
 *   node utils/test-external-api.js --currency
 *   node utils/test-external-api.js --quote
 *   node utils/test-external-api.js --weather --city=Mumbai
 *   node utils/test-external-api.js --convert --amount=1000 --from=USD --to=INR
 */

require('dotenv').config();
const {
  fetchExchangeRates,
  convertCurrency,
  fetchRandomQuote,
  fetchWeather
} = require('./externalApi');

// Parse command-line arguments
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const equalIndex = arg.indexOf('=');
      if (equalIndex !== -1) {
        const key = arg.slice(2, equalIndex);
        const value = arg.slice(equalIndex + 1);
        args[key] = value;
      } else {
        args[arg.slice(2)] = true;
      }
    }
  }
  return args;
}

// Display help message
function showHelp() {
  console.log(`
External API Test Tool
======================

Usage:
  node utils/test-external-api.js [options]

Options:
  --currency              Fetch exchange rates (default: USD)
  --base=CURRENCY        Set base currency for exchange rates
  
  --convert              Convert currency
  --amount=NUMBER        Amount to convert
  --from=CURRENCY        Source currency (default: USD)
  --to=CURRENCY          Target currency (default: INR)
  
  --quote                Fetch inspirational quote
  
  --weather              Fetch weather data
  --city=CITY            City name (default: Delhi)
  
  --all                  Run all API tests

Examples:
  node utils/test-external-api.js --currency --base=EUR
  node utils/test-external-api.js --convert --amount=1000 --from=USD --to=INR
  node utils/test-external-api.js --quote
  node utils/test-external-api.js --weather --city=Mumbai
  node utils/test-external-api.js --all
`);
}

// Test exchange rates API
async function testExchangeRates(base = 'USD') {
  console.log('\n=== Testing Exchange Rates API ===');
  try {
    const result = await fetchExchangeRates(base);
    console.log(`Base Currency: ${result.base}`);
    console.log(`Date: ${result.date}`);
    console.log('Sample Rates:');
    console.log(`  USD: ${result.rates.USD}`);
    console.log(`  EUR: ${result.rates.EUR}`);
    console.log(`  GBP: ${result.rates.GBP}`);
    console.log(`  INR: ${result.rates.INR}`);
    console.log(`  JPY: ${result.rates.JPY}`);
    console.log('Status: SUCCESS');
  } catch (error) {
    console.error('Status: FAILED');
    console.error('Error:', error.message);
  }
}

// Test currency conversion API
async function testCurrencyConversion(amount = 1000, from = 'USD', to = 'INR') {
  console.log('\n=== Testing Currency Conversion API ===');
  try {
    const result = await convertCurrency(amount, from, to);
    console.log(`Original: ${result.original.amount} ${result.original.currency}`);
    console.log(`Converted: ${result.converted.amount.toFixed(2)} ${result.converted.currency}`);
    console.log(`Exchange Rate: ${result.rate}`);
    console.log('Status: SUCCESS');
  } catch (error) {
    console.error('Status: FAILED');
    console.error('Error:', error.message);
  }
}

// Test quote API
async function testQuoteAPI() {
  console.log('\n=== Testing Quote API ===');
  try {
    const result = await fetchRandomQuote();
    console.log(`Quote: "${result.quote}"`);
    console.log(`Author: ${result.author}`);
    console.log(`Tags: ${result.tags.join(', ')}`);
    console.log('Status: SUCCESS');
  } catch (error) {
    console.error('Status: FAILED');
    console.error('Error:', error.message);
  }
}

// Test weather API
async function testWeatherAPI(city = 'Delhi') {
  console.log('\n=== Testing Weather API ===');
  try {
    const result = await fetchWeather(city);
    console.log(`Location: ${result.location}`);
    console.log(`Temperature: ${result.temperature}`);
    console.log(`Feels Like: ${result.feelsLike}`);
    console.log(`Humidity: ${result.humidity}`);
    console.log(`Description: ${result.description}`);
    console.log(`Wind Speed: ${result.windSpeed}`);
    console.log('Status: SUCCESS');
  } catch (error) {
    console.error('Status: FAILED');
    console.error('Error:', error.message);
  }
}

// Main function
async function main() {
  const args = parseArgs(process.argv);

  console.log('External API Test Tool');
  console.log('======================\n');

  // Show help if no arguments
  if (Object.keys(args).length === 0) {
    showHelp();
    return;
  }

  try {
    // Run all tests
    if (args.all) {
      await testExchangeRates(args.base || 'USD');
      await testCurrencyConversion(1000, 'USD', 'INR');
      await testQuoteAPI();
      await testWeatherAPI('Delhi');
      console.log('\n=== All Tests Completed ===\n');
      return;
    }

    // Run individual tests
    if (args.currency) {
      await testExchangeRates(args.base || 'USD');
    }

    if (args.convert) {
      const amount = parseFloat(args.amount) || 1000;
      const from = args.from || 'USD';
      const to = args.to || 'INR';
      await testCurrencyConversion(amount, from, to);
    }

    if (args.quote) {
      await testQuoteAPI();
    }

    if (args.weather) {
      await testWeatherAPI(args.city || 'Delhi');
    }

    console.log('\n=== Test Completed ===\n');

  } catch (error) {
    console.error('\nUnexpected Error:', error.message);
    process.exit(1);
  }
}

// Run main function
main().catch(error => {
  console.error('Fatal Error:', error);
  process.exit(1);
});
