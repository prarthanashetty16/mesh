/**
 * Database Initialization Script
 * Creates the database if it doesn't exist before seeding
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const initDatabase = async () => {
  try {
    console.log('🔧 Initializing database...\n');

    // Connect without specifying a database to create it
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT) || 3306,
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME;
    console.log(`📝 Creating database '${dbName}' if it doesn't exist...`);
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' ready\n`);

    await connection.end();
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
};

initDatabase();
