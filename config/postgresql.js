const { Sequelize } = require('sequelize');

// Initialize Sequelize with PostgreSQL
const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

const connectPostgreSQL = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected successfully');

    // Sync models in development (use migrations in production)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('PostgreSQL models synchronized');
    }

  } catch (error) {
    console.error('PostgreSQL connection failed:', error.message);
    // Don't exit process, allow app to run with MongoDB only
  }
};

module.exports = { sequelize, connectPostgreSQL };
