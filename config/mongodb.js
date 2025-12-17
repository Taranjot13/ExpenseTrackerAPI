const mongoose = require('mongoose');

let retryTimer = null;
let sigintHandlerRegistered = false;

const getMongoUri = () => {
  return (process.env.MONGODB_URI || 'mongodb://localhost:27017/expense_tracker').trim();
};

const isMongoRequired = () => {
  // For “always-on” local dev, default to NOT required.
  // You can force fail-fast behavior by setting MONGODB_REQUIRED=true.
  return process.env.MONGODB_REQUIRED === 'true';
};

const connectMongoDB = async () => {
  try {
    // Skip auto-connect in test environment (tests handle their own connection)
    if (process.env.NODE_ENV === 'test' && mongoose.connection.readyState !== 0) {
      console.log('[Test] Using existing MongoDB connection');
      return;
    }

    const mongoUri = getMongoUri();

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT_MS, 10) || 5000,
    });

    console.log(`[Success] MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      // Attempt to reconnect in the background for always-on usage.
      if (process.env.NODE_ENV !== 'test') {
        scheduleRetry();
      }
    });

    // Graceful shutdown
    if (!sigintHandlerRegistered) {
      sigintHandlerRegistered = true;
      process.on('SIGINT', async () => {
        try {
          if (retryTimer) clearTimeout(retryTimer);
          await mongoose.connection.close();
          console.log('MongoDB connection closed through app termination');
        } finally {
          process.exit(0);
        }
      });
    }

  } catch (error) {
    console.error('[Error] MongoDB connection failed:', error.message);
    if (process.env.NODE_ENV === 'test') {
      throw error;
    }

    if (isMongoRequired()) {
      // In strict environments, fail fast.
      throw error;
    }

    console.log('[MongoDB] Will keep server running and retry connection...');
    scheduleRetry();
  }
};

const scheduleRetry = () => {
  if (retryTimer) return;
  const retryMs = parseInt(process.env.MONGODB_RETRY_MS, 10) || 5000;
  retryTimer = setTimeout(async () => {
    retryTimer = null;
    // Avoid duplicate connection attempts.
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) return;
    await connectMongoDB();
  }, retryMs);
};

module.exports = { connectMongoDB };
