const { Pool } = require('pg');

let pool = null;

const connectPostgres = async () => {
  // Skip PostgreSQL if not configured
  if (!process.env.POSTGRES_HOST) {
    console.log('[Skip] PostgreSQL not configured - relational features disabled');
    return;
  }

  try {
    pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB || 'expense_tracker',
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('[Error] PostgreSQL Pool Error:', err);
    });

    pool.on('connect', () => {
      console.log('[Connected] PostgreSQL Client Connected');
    });

    // Test the connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as now');
    console.log('[Success] PostgreSQL Connected:', result.rows[0].now);
    client.release();

    // Initialize database schema
    await initializeSchema();

  } catch (error) {
    console.error('[Error] PostgreSQL connection failed:', error.message);
    console.log('[Skip] Continuing without PostgreSQL...');
    pool = null;
  }
};

const initializeSchema = async () => {
  if (!pool) return;

  try {
    const client = await pool.connect();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        mongo_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        currency VARCHAR(10) DEFAULT 'USD',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        mongo_id VARCHAR(255) UNIQUE NOT NULL,
        user_mongo_id VARCHAR(255) REFERENCES users(mongo_id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        color VARCHAR(20),
        icon VARCHAR(10),
        budget NUMERIC(12, 2),
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create expenses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        mongo_id VARCHAR(255) UNIQUE NOT NULL,
        user_mongo_id VARCHAR(255) REFERENCES users(mongo_id) ON DELETE CASCADE,
        category_mongo_id VARCHAR(255) REFERENCES categories(mongo_id),
        amount NUMERIC(12, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        description TEXT,
        date DATE NOT NULL,
        payment_method VARCHAR(50),
        tags TEXT[],
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_mongo_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_mongo_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_mongo_id);
    `);

    console.log('[Success] PostgreSQL schema initialized');
    client.release();

  } catch (error) {
    console.error('[Error] PostgreSQL schema initialization failed:', error.message);
  }
};

// Query helper function
const query = async (text, params) => {
  if (!pool) {
    throw new Error('PostgreSQL is not connected');
  }
  
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Get a client from the pool
const getClient = async () => {
  if (!pool) {
    throw new Error('PostgreSQL is not connected');
  }
  return await pool.connect();
};

// Close the pool
const closePool = async () => {
  if (pool) {
    await pool.end();
    console.log('[Closed] PostgreSQL connection pool closed');
  }
};

// Check if PostgreSQL is available
const isAvailable = () => {
  return pool !== null;
};

module.exports = {
  connectPostgres,
  query,
  getClient,
  closePool,
  isAvailable,
  pool: () => pool
};
