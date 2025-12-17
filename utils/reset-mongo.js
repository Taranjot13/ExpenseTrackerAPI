require('dotenv').config();
const mongoose = require('mongoose');

const getDbNameFromUri = (uri) => {
  try {
    // Works for mongodb:// and mongodb+srv://
    const parsed = new URL(uri);
    const pathname = parsed.pathname || '';
    const dbName = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    return dbName || '(unknown)';
  } catch {
    return '(unknown)';
  }
};

const main = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('[Reset Mongo] MONGODB_URI is not set in .env');
    process.exit(1);
  }

  const dbName = getDbNameFromUri(mongoUri);

  const confirmed = process.argv.includes('--yes') || process.env.FORCE_RESET_MONGO === 'true';
  if (!confirmed) {
    console.error('[Reset Mongo] Refusing to run without explicit confirmation.');
    console.error(`[Reset Mongo] Target: ${mongoUri}`);
    console.error(`[Reset Mongo] DB Name: ${dbName}`);
    console.error('[Reset Mongo] Re-run with: node utils/reset-mongo.js --yes');
    process.exit(2);
  }

  console.log('[Reset Mongo] Connecting...');
  await mongoose.connect(mongoUri);

  console.log(`[Reset Mongo] Connected. Dropping database: ${dbName}`);
  await mongoose.connection.db.dropDatabase();

  console.log('[Reset Mongo] ✅ Database dropped successfully.');

  await mongoose.disconnect();
};

main().catch(async (err) => {
  console.error('[Reset Mongo] Error:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
