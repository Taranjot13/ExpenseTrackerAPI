const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const { connectMongoDB } = require('../config/mongodb');
const User = require('../models/User');
const Expense = require('../models/Expense');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const [key, value] = argv[i].split('=');
    if (key && key.startsWith('--')) {
      args[key.slice(2)] = value;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const { email, month } = args;

  if (!email) {
    console.error('Usage: node utils/cli-report.js --email=user@example.com [--month=YYYY-MM]');
    process.exit(1);
  }

  await connectMongoDB();

  const user = await User.findOne({ email });
  if (!user) {
    console.error(`User not found: ${email}`);
    await mongoose.connection.close();
    process.exit(1);
  }

  const query = { user: user._id };

  if (month) {
    const [yearStr, monthStr] = month.split('-');
    const year = Number(yearStr);
    const m = Number(monthStr);
    if (!year || !m || m < 1 || m > 12) {
      console.error('Invalid --month, expected YYYY-MM');
      await mongoose.connection.close();
      process.exit(1);
    }
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 1);
    query.date = { $gte: start, $lt: end };
  }

  const expenses = await Expense.find(query).populate('category', 'name');

  const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const byCategory = {};
  for (const e of expenses) {
    const catName = e.category ? e.category.name : 'Uncategorized';
    byCategory[catName] = (byCategory[catName] || 0) + (e.amount || 0);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    user: { id: user._id.toString(), email: user.email },
    filter: { month: month || null },
    totals: {
      count: expenses.length,
      amount: totalAmount
    },
    byCategory
  };

  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  const fileName = `report-${user._id}-${month || 'all'}.json`;
  const filePath = path.join(reportsDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`Report generated: ${filePath}`);

  await mongoose.connection.close();
}

main().catch(async (err) => {
  console.error('Error generating report:', err);
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(1);
});
