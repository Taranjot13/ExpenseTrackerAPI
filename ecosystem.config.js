module.exports = {
  apps: [
    {
      name: 'expense-tracker-api',
      script: 'server.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_restarts: 20,
      restart_delay: 2000,
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        // If you want the server to fail-fast when MongoDB is down, set:
        // MONGODB_REQUIRED: 'true'
      },
    },
  ],
};
