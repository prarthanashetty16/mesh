/**
 * Database Seeding Script - Comprehensive Demo Data
 */

require('dotenv').config(); // ✅ ensure env is loaded

const mysql = require('mysql2/promise');
const { executeQuery } = require('../config/database');
const bcrypt = require('bcryptjs');

// First, initialize the database
const initDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT) || 3306,
    });

    const dbName = process.env.DB_NAME;
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting comprehensive database seeding...\n');

    // Initialize database first
    console.log('🔧 Initializing database...');
    await initDatabase();
    console.log('✅ Database initialized\n');

    // Create base tables first (Areas, Users, Tasks, etc.)
    console.log('📋 Creating base tables...');
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS Area (
        area_id INT PRIMARY KEY AUTO_INCREMENT,
        pincode VARCHAR(10) NOT NULL,
        locality VARCHAR(100),
        city VARCHAR(100),
        state VARCHAR(100)
      )
    `);

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS Users (
        user_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(15),
        password VARCHAR(255) NOT NULL,
        address_line VARCHAR(255),
        landmark VARCHAR(255),
        wallet_balance DECIMAL(10,2) DEFAULT 0,
        rating DECIMAL(2,1),
        area_id INT,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        FOREIGN KEY (area_id) REFERENCES Area(area_id)
      )
    `);

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS Tasks (
        task_id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2),
        deadline DATETIME,
        status VARCHAR(50) DEFAULT 'OPEN',
        created_by INT,
        assigned_to INT,
        area_id INT,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES Users(user_id),
        FOREIGN KEY (assigned_to) REFERENCES Users(user_id),
        FOREIGN KEY (area_id) REFERENCES Area(area_id)
      )
    `);

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS Applications (
        application_id INT PRIMARY KEY AUTO_INCREMENT,
        task_id INT,
        applicant_id INT,
        status VARCHAR(50) DEFAULT 'PENDING',
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
        FOREIGN KEY (applicant_id) REFERENCES Users(user_id)
      )
    `);

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS Transactions (
        transaction_id INT PRIMARY KEY AUTO_INCREMENT,
        task_id INT UNIQUE,
        payer_id INT,
        payee_id INT,
        amount DECIMAL(10,2),
        status VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
        FOREIGN KEY (payer_id) REFERENCES Users(user_id),
        FOREIGN KEY (payee_id) REFERENCES Users(user_id)
      )
    `);

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS Reviews (
        review_id INT PRIMARY KEY AUTO_INCREMENT,
        task_id INT,
        reviewer_id INT,
        reviewed_user_id INT,
        rating INT CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
        FOREIGN KEY (reviewer_id) REFERENCES Users(user_id),
        FOREIGN KEY (reviewed_user_id) REFERENCES Users(user_id)
      )
    `);

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS Notifications (
        notification_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        task_id INT,
        message TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(user_id),
        FOREIGN KEY (task_id) REFERENCES Tasks(task_id)
      )
    `);

    console.log('✅ Base tables created\n');

    // ============= CREATE ACTIVITY TABLE IF NOT EXISTS =============
    console.log('📝 Creating Activity table...');
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS \`Activity\` (
        activity_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        action VARCHAR(50) NOT NULL,
        resource_type VARCHAR(50),
        resource_id INT,
        description VARCHAR(500),
        ip_address VARCHAR(45),
        metadata JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at),
        INDEX idx_resource_type (resource_type)
      )
    `);
    console.log('✅ Activity table ready\n');

    // ============= SEED AREAS =============
    console.log('📍 Seeding Areas...');
    const areas = [
      ['560001', 'Downtown', 'Bangalore', 'Karnataka'],
      ['560002', 'Whitefield', 'Bangalore', 'Karnataka'],
      ['560003', 'Indiranagar', 'Bangalore', 'Karnataka'],
      ['560004', 'Koramangala', 'Bangalore', 'Karnataka'],
      ['560005', 'Hebbal', 'Bangalore', 'Karnataka'],
      ['560006', 'Electronic City', 'Bangalore', 'Karnataka'],
      ['400001', 'Marine Drive', 'Mumbai', 'Maharashtra'],
      ['400002', 'Bandra', 'Mumbai', 'Maharashtra'],
      ['110001', 'Connaught Place', 'Delhi', 'Delhi'],
      ['110002', 'Dwarka', 'Delhi', 'Delhi'],
    ];

    for (const area of areas) {
      await executeQuery(
        `INSERT IGNORE INTO Area (pincode, locality, city, state) VALUES (?, ?, ?, ?)`,
        area
      );
    }
    console.log('✅ Areas seeded\n');

    // ============= SEED USERS =============
    console.log('👥 Seeding Users...');
    const passwordHash = await bcrypt.hash('password123', 10);

    const users = [
      // Task creators with higher wallet balance
      ['Prarthana Shetty', 'prarthana@example.com', passwordHash, '9876543210', '123 Main Street', 'Near Park', 1, 12.9716, 77.5946, 10000],
      ['Srishti V', 'srishti@example.com', passwordHash, '9876543211', '456 Oak Avenue', 'Near Mall', 2, 12.9698, 77.5906, 8000],
      ['Rahul Kumar', 'rahul@example.com', passwordHash, '9876543212', '789 Pine Road', 'Near School', 3, 12.9606, 77.6412, 6000],
      ['Anjali Singh', 'anjali@example.com', passwordHash, '9876543213', '321 Elm Street', 'Near Hospital', 4, 12.9352, 77.6245, 9000],
      
      // Task performers
      ['Amit Patel', 'amit@example.com', passwordHash, '9876543214', '654 Maple Lane', 'Near Gym', 1, 12.9735, 77.5955, 4500],
      ['Neha Gupta', 'neha@example.com', passwordHash, '9876543215', '987 Birch Street', 'Near Temple', 2, 12.9700, 77.5920, 5800],
      ['Rohan Sharma', 'rohan@example.com', passwordHash, '9876543216', '147 Cedar Road', 'Near Park', 3, 12.9610, 77.6420, 3200],
      ['Deepak Singh', 'deepak@example.com', passwordHash, '9876543217', '258 Spruce Ave', 'Near Station', 4, 12.9360, 77.6250, 6500],
      ['Maya Verma', 'maya@example.com', passwordHash, '9876543218', '369 Walnut Ln', 'Near Market', 5, 12.9800, 77.6000, 4000],
      ['Vikram Nair', 'vikram@example.com', passwordHash, '9876543219', '741 Ash Street', 'Near Library', 6, 12.9850, 77.6100, 5200],
    ];

    for (const user of users) {
      await executeQuery(
        `INSERT IGNORE INTO Users 
        (name, email, password, phone, address_line, landmark, area_id, latitude, longitude, wallet_balance, rating)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [...user, Math.floor(Math.random() * 2) + 4.0] // Add random rating 4.0-4.9
      );
    }
    console.log('✅ Users seeded\n');

    // ============= SEED TASKS =============
    console.log('📋 Seeding Tasks...');
    const currentTime = new Date();
    
    const tasks = [
      // OPEN tasks
      ['Home Cleaning', 'Need thorough home cleaning including kitchen, bedroom, and bathroom. Experienced cleaner preferred.', 500, new Date(currentTime.getTime() + 2*86400000), 1, null, 1, 12.9716, 77.5946, 'OPEN'],
      ['Plumbing Repair', 'Fix leaking tap in kitchen. Need reliable plumber. ASAP preferred.', 800, new Date(currentTime.getTime() + 1*86400000), 2, null, 2, 12.9698, 77.5906, 'OPEN'],
      ['Painting Work', 'Paint bedroom walls - color: light blue. Two walls need repainting.', 1200, new Date(currentTime.getTime() + 5*86400000), 3, null, 3, 12.9606, 77.6412, 'OPEN'],
      ['Gardening Service', 'Maintain and trim plants in garden. Weekly maintenance preferred.', 400, new Date(currentTime.getTime() + 4*86400000), 1, null, 1, 12.9716, 77.5946, 'OPEN'],
      ['AC Repair', 'Air conditioner not cooling properly. Needs inspection and repair.', 1000, new Date(currentTime.getTime() + 1*86400000), 4, null, 4, 12.9352, 77.6245, 'OPEN'],
      ['Grocery Shopping', 'Need help with grocery shopping and delivery from supermarket.', 300, new Date(currentTime.getTime() + 3600000), 2, null, 2, 12.9698, 77.5906, 'OPEN'],
      ['Pet Grooming', 'Need dog grooming - bathing and basic haircut. Golden Retriever.', 600, new Date(currentTime.getTime() + 6*86400000), 3, null, 3, 12.9606, 77.6412, 'OPEN'],
      
      // ASSIGNED tasks
      ['Electrical Installation', 'Install decorative lights and ceiling fan. Some existing wiring.', 900, new Date(currentTime.getTime() + 3*86400000), 4, 8, 4, 12.9352, 77.6245, 'ASSIGNED'],
      ['Furniture Assembly', 'Assemble IKEA bed and wardrobe. Parts ready at home.', 700, new Date(currentTime.getTime() + 2*86400000), 1, 5, 1, 12.9716, 77.5946, 'ASSIGNED'],
      ['Vehicle Washing', 'Wash and detail car - full exterior and interior cleaning.', 450, new Date(currentTime.getTime() + 1*86400000), 2, 6, 2, 12.9698, 77.5906, 'ASSIGNED'],
      
      // COMPLETED tasks (past deadline)
      ['House Shifting Help', 'Help with packing and loading furniture. 2-3 people needed.', 1500, new Date(currentTime.getTime() - 5*86400000), 3, 7, 3, 12.9606, 77.6412, 'COMPLETED'],
      ['Website Design', 'Design and setup basic portfolio website. Business profile.', 2500, new Date(currentTime.getTime() - 3*86400000), 4, 9, 4, 12.9352, 77.6245, 'COMPLETED'],
      ['Photography Service', 'Event photography for birthday party. 3-4 hours needed.', 1800, new Date(currentTime.getTime() - 7*86400000), 1, 10, 1, 12.9716, 77.5946, 'COMPLETED'],
      ['Tuition Support', 'Math tuition for 10th grade student. 6 months commitment.', 2000, new Date(currentTime.getTime() - 4*86400000), 2, 5, 2, 12.9698, 77.5906, 'COMPLETED'],
    ];

    for (const task of tasks) {
      await executeQuery(
        `INSERT IGNORE INTO Tasks 
        (title, description, price, deadline, created_by, assigned_to, area_id, latitude, longitude, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        task
      );
    }
    console.log('✅ Tasks seeded\n');

    // ============= SEED APPLICATIONS =============
    console.log('📝 Seeding Applications...');
    const applications = [
      // PENDING applications
      [1, 5, 'PENDING'],
      [1, 6, 'PENDING'],
      [2, 7, 'PENDING'],
      [3, 8, 'PENDING'],
      [4, 5, 'PENDING'],
      [6, 7, 'PENDING'],
      [7, 6, 'PENDING'],
      
      // ACCEPTED applications
      [8, 8, 'ACCEPTED'],
      [9, 5, 'ACCEPTED'],
      [10, 6, 'ACCEPTED'],
      
      // REJECTED applications
      [1, 7, 'REJECTED'],
      [2, 5, 'REJECTED'],
    ];

    for (const app of applications) {
      await executeQuery(
        `INSERT IGNORE INTO Applications (task_id, applicant_id, status, applied_at)
         VALUES (?, ?, ?, NOW())`,
        app
      );
    }
    console.log('✅ Applications seeded\n');

    // ============= SEED REVIEWS =============
    console.log('⭐ Seeding Reviews...');
    const reviews = [
      [11, 3, 7, 5, 'Excellent work! Very professional and clean. Highly recommend!'],
      [12, 4, 9, 5, 'Outstanding website design. Delivered on time with great support.'],
      [13, 1, 10, 4, 'Good photography work. Could have been more creative with angles.'],
      [14, 2, 5, 5, 'Great tuition! My son improved significantly in math.'],
      [11, 7, 3, 4, 'Good job overall. Very punctual and hardworking.'],
      [12, 9, 4, 5, 'Professional work. Very satisfied with the quality.'],
    ];

    for (const review of reviews) {
      await executeQuery(
        `INSERT IGNORE INTO Reviews (task_id, reviewer_id, reviewed_user_id, rating, comment, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        review
      );
    }
    console.log('✅ Reviews seeded\n');

    // ============= SEED TRANSACTIONS =============
    console.log('💰 Seeding Transactions...');
    const transactions = [
      [11, 3, 7, 1500, 'COMPLETED'],
      [12, 4, 9, 2500, 'COMPLETED'],
      [13, 1, 10, 1800, 'COMPLETED'],
      [14, 2, 5, 2000, 'COMPLETED'],
    ];

    for (const transaction of transactions) {
      await executeQuery(
        `INSERT IGNORE INTO Transactions (task_id, payer_id, payee_id, amount, status, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        transaction
      );
    }
    console.log('✅ Transactions seeded\n');

    // ============= SEED NOTIFICATIONS =============
    console.log('🔔 Seeding Notifications...');
    const notifications = [
      [1, 1, 'New application received for your task "Home Cleaning"', false],
      [2, 2, 'New application received for your task "Plumbing Repair"', false],
      [5, 5, 'You were accepted for task "Furniture Assembly"', false],
      [6, 6, 'You were accepted for task "Vehicle Washing"', false],
      [7, 8, 'Your application for "Painting Work" was rejected', false],
      [1, 3, 'Task "House Shifting Help" marked as completed', true],
    ];

    for (const notification of notifications) {
      await executeQuery(
        `INSERT IGNORE INTO Notifications (user_id, task_id, message, is_read, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        notification
      );
    }
    console.log('✅ Notifications seeded\n');

    console.log('✨ Comprehensive seeding completed successfully!');
    console.log('\n📊 Demo Accounts:');
    console.log('   Email: prarthana@example.com (Task Creator, Balance: ₹10,000)');
    console.log('   Email: amit@example.com (Worker/Performer, Balance: ₹4,500)');
    console.log('   Password: password123 (all accounts)\n');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();