/**
 * Database Configuration
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Debug log (password masked)
console.log('DB Config:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '***' : 'NOT SET',
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Create connection pool
// ✅ SSL required for Aiven cloud MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,

  // ✅ Aiven requires SSL — rejectUnauthorized false for self-signed cert
  ssl: {
    rejectUnauthorized: false,
  },
});

// ✅ Verify DB connection on startup so errors appear immediately in logs
pool.getConnection()
  .then((conn) => {
    console.log('✅ Database connected successfully');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Database connection FAILED:', err.message);
  });

/**
 * Execute query
 */
const executeQuery = async (query, values = []) => {
  try {
    // ✅ Use .query instead of .execute for better compatibility with LIMIT ? and other edge cases
    const [results] = await pool.query(query, values);
    return results;
  } catch (error) {
    console.error('Database Error:', error.message);
    console.error('Query:', query);
    console.error('Values:', values);
    throw error;
  }
};

const getOne = async (query, values = []) => {
  const results = await executeQuery(query, values);
  return results.length > 0 ? results[0] : null;
};

const getAll = async (query, values = []) => {
  return await executeQuery(query, values);
};

module.exports = {
  pool,
  executeQuery,
  getOne,
  getAll,
};