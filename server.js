
require('dotenv').config();
const express = require('express');
const { init: initWebSocket } = require('./config/websocket');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import configurations
const { connectMongoDB } = require('./config/mongodb');
const { connectPostgres } = require('./config/postgres');
const { connectRedis } = require('./config/redis');
const { createSecureServer, getServerInfo } = require('./config/https');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const { setUser } = require('./controllers/viewController');

// Import routes
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const postgresRoutes = require('./routes/postgresRoutes');
const externalApiRoutes = require('./routes/externalApiRoutes');
const viewRoutes = require('./routes/viewRoutes');

// Initialize Express app
const app = express();
// Create HTTP or HTTPS server based on SSL availability
const server = createSecureServer(app);

// Initialize WebSocket
const io = initWebSocket(server);

// Make io accessible to routes
app.set('io', io);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to databases
const initDependencies = async () => {
  // For always-on local usage, MongoDB will retry in the background unless MONGODB_REQUIRED=true.
  await connectMongoDB();
  await connectPostgres();
  await connectRedis(); // Connect to Redis for caching
};

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable for development; configure properly in production
})); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser()); // Parse cookies
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Set user for all views
app.use(setUser);

// Rate limiting for API routes only
app.use('/api/', rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes (must come before view routes!)
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/postgres', postgresRoutes);
app.use('/api/external', externalApiRoutes);

// View Routes (Frontend pages) - MUST BE LAST because it has wildcard
app.use('/', viewRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  (async () => {
    try {
      await initDependencies();

      server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
          console.error(`[Server] Port ${PORT} is already in use. Stop the other process (or change PORT) and try again.`);
          console.error('[Server] Tip: run "npm run dev:clean" to kill the process using the port.');
          process.exit(1);
        }
        console.error('[Server] Failed to start server:', err);
        process.exit(1);
      });

      server.listen(PORT, () => {
        const serverInfo = getServerInfo(server);
        console.log(`[Server] ${serverInfo.protocol.toUpperCase()} server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
        console.log(`[Server] HTTPS: ${serverInfo.httpsEnabled ? 'Enabled' : 'Disabled'}`);
        console.log(`[WebSocket] WebSocket server is ready`);

        if (!serverInfo.httpsEnabled && process.env.NODE_ENV === 'production') {
          console.warn('[Security Warning] HTTPS is not enabled in production mode!');
          console.warn('[Security Warning] Run "npm run generate:ssl" to create SSL certificates.');
        }
      });
    } catch (err) {
      console.error('[Startup] Failed to initialize dependencies:', err);
      // Only exit when startup is explicitly strict (e.g., MONGODB_REQUIRED=true).
      process.exit(1);
    }
  })();

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('[Process] Unhandled Rejection:', err);
    // Do NOT exit; keep the server running to avoid blank site.
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('[Process] Uncaught Exception:', err);
    // Do NOT exit; keep the server running to avoid blank site.
  });
}

module.exports = { app, io };
