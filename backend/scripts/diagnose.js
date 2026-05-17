/**
 * Database Connection Diagnostic Script
 * Tests database connectivity and provides troubleshooting info
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const diagnose = async () => {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   🔍 DATABASE CONNECTION DIAGNOSTIC TOOL              ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Step 1: Display current config
  console.log('📋 Current Configuration:');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   User: ${process.env.DB_USER}`);
  console.log(`   Database: ${process.env.DB_NAME}`);
  console.log(`   Port: ${process.env.DB_PORT}`);
  console.log(`   Password: ${process.env.DB_PASSWORD ? '***' : 'EMPTY'}\n`);

  // Step 2: Test direct connection
  console.log('🔌 Attempting TCP Connection...');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT) || 3306,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    console.log('✅ Connection successful!\n');

    // Step 3: Test if database exists
    console.log('📦 Checking if database exists...');
    try {
      const [databases] = await connection.query('SHOW DATABASES;');
      const dbExists = databases.some(db => db.Database === process.env.DB_NAME);
      
      if (dbExists) {
        console.log(`✅ Database "${process.env.DB_NAME}" exists\n`);

        // Step 4: Check tables
        console.log('📊 Checking tables...');
        await connection.query(`USE ${process.env.DB_NAME};`);
        const [tables] = await connection.query('SHOW TABLES;');
        
        if (tables.length > 0) {
          console.log(`✅ Found ${tables.length} tables:`);
          tables.forEach((table, i) => {
            console.log(`   ${i + 1}. ${Object.values(table)[0]}`);
          });
        } else {
          console.log('❌ Database exists but is empty. Run seed script.');
        }
      } else {
        console.log(`❌ Database "${process.env.DB_NAME}" does NOT exist\n`);
        console.log('📝 Available databases:');
        databases.forEach(db => console.log(`   - ${db.Database}`));
        console.log('\n💡 Solution: Create database using SQL schema file');
      }
    } catch (error) {
      console.log(`⚠️  Could not check database: ${error.message}`);
    }

    await connection.end();

  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}\n`);

    if (error.message.includes('Access denied')) {
      console.log('🔑 TROUBLESHOOTING: Invalid Credentials\n');
      console.log('   Possible causes:');
      console.log('   1. Wrong password');
      console.log('   2. Wrong username');
      console.log('   3. IP address not whitelisted (for cloud databases)');
      console.log('\n   💡 For Aiven Cloud MySQL:');
      console.log('      - Go to: https://console.aiven.io');
      console.log('      - Navigate to your MySQL service');
      console.log('      - Check Security → IP Whitelist');
      console.log('      - Add your IP: 223.237.160.45');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log('🌐 TROUBLESHOOTING: Host Not Found\n');
      console.log('   Possible causes:');
      console.log('   1. Wrong hostname');
      console.log('   2. No internet connection');
      console.log('   3. DNS resolution failed');
      console.log('\n   💡 Check:');
      console.log(`      - Is "${process.env.DB_HOST}" correct?`);
      console.log('      - Can you ping the host?');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('🚫 TROUBLESHOOTING: Connection Refused\n');
      console.log('   Possible causes:');
      console.log('   1. MySQL not running locally');
      console.log('   2. Wrong port number');
      console.log('   3. Firewall blocking connection');
      console.log('\n   💡 Check:');
      console.log('      - Is MySQL service running?');
      console.log(`      - Is port ${process.env.DB_PORT} correct?`);
      console.log('      - Check firewall settings');
    }

    console.log('\n');
  }

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║             🔧 RECOMMENDED SOLUTIONS                  ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log('║                                                        ║');
  console.log('║  Option A: Fix Cloud Database (Aiven)                 ║');
  console.log('║  1. Whitelist your IP in Aiven console                ║');
  console.log('║  2. Verify credentials are correct                    ║');
  console.log('║  3. Test connection again                             ║');
  console.log('║                                                        ║');
  console.log('║  Option B: Use Local MySQL                            ║');
  console.log('║  1. Install MySQL locally                             ║');
  console.log('║  2. Update .env to use localhost                      ║');
  console.log('║  3. Create database from SQL schema                   ║');
  console.log('║  4. Run seed script                                   ║');
  console.log('║                                                        ║');
  console.log('║  Run this diagnostic again after changes              ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
};

diagnose().catch(err => {
  console.error('Diagnostic error:', err.message);
  process.exit(1);
});
