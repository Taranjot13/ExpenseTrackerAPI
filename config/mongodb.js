const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    // Skip auto-connect in test environment (tests handle their own connection)
    if (process.env.NODE_ENV === 'test' && mongoose.connection.readyState !== 0) {
      console.log('[Test] Using existing MongoDB connection');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`[Success] MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('[Error] MongoDB connection failed:', error.message);
    // Don't exit in test mode
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

module.exports = { connectMongoDB };
