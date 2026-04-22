/**
 * Database Configuration
 * Using mysql2 driver for connection pooling
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'task_platform',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});

/**
 * Execute query with connection from pool
 * @param {string} query - SQL query
 * @param {array} values - Query parameters
 * @returns {Promise} Query result
 */
const executeQuery = async (query, values = []) => {
  try {
    const [results] = await pool.execute(query, values);
    return results;
  } catch (error) {
    console.error('Database Error:', error.message);
    throw error;
  }
};

/**
 * Get single row from database
 * @param {string} query - SQL query
 * @param {array} values - Query parameters
 * @returns {Promise} First row or null
 */
const getOne = async (query, values = []) => {
  const results = await executeQuery(query, values);
  return results.length > 0 ? results[0] : null;
};

/**
 * Get all rows from database
 * @param {string} query - SQL query
 * @param {array} values - Query parameters
 * @returns {Promise} Array of results
 */
const getAll = async (query, values = []) => {
  return await executeQuery(query, values);
};

module.exports = {
  pool,
  executeQuery,
  getOne,
  getAll,
};
