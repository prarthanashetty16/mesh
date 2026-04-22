/**
 * Database Seeding Script
 * Populates the database with sample data for testing
 */

const { executeQuery, getOne } = require('../config/database');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // ============= SEED AREAS =============
    console.log('📍 Seeding Areas...');
    const areas = [
      { pincode: '560001', locality: 'Downtown', city: 'Bangalore', state: 'Karnataka' },
      { pincode: '560002', locality: 'Whitefield', city: 'Bangalore', state: 'Karnataka' },
      { pincode: '560003', locality: 'Indiranagar', city: 'Bangalore', state: 'Karnataka' },
      { pincode: '560004', locality: 'Koramangala', city: 'Bangalore', state: 'Karnataka' },
      { pincode: '400001', locality: 'Marine Drive', city: 'Mumbai', state: 'Maharashtra' },
      { pincode: '400002', locality: 'Bandra', city: 'Mumbai', state: 'Maharashtra' },
      { pincode: '110001', locality: 'Connaught Place', city: 'Delhi', state: 'Delhi' },
      { pincode: '110002', locality: 'Dwarka', city: 'Delhi', state: 'Delhi' },
    ];

    for (const area of areas) {
      await executeQuery(
        'INSERT INTO Area (pincode, locality, city, state) VALUES (?, ?, ?, ?)',
        [area.pincode, area.locality, area.city, area.state]
      );
    }
    console.log('✅ Areas seeded\n');

    // ============= SEED USERS =============
    console.log('👥 Seeding Users...');
    const hashedPassword1 = await bcrypt.hash('password123', 10);
    const hashedPassword2 = await bcrypt.hash('password456', 10);
    const hashedPassword3 = await bcrypt.hash('password789', 10);

    const users = [
      {
        name: 'Prarthana Shetty',
        email: 'prarthana@example.com',
        password: hashedPassword1,
        phone: '9876543210',
        address_line: '123 Main Street',
        landmark: 'Near Park',
        area_id: 1,
        latitude: 12.9716,
        longitude: 77.5946,
        wallet_balance: 5000,
      },
      {
        name: 'Srishti V',
        email: 'srishti@example.com',
        password: hashedPassword2,
        phone: '9876543211',
        address_line: '456 Oak Avenue',
        landmark: 'Near Mall',
        area_id: 2,
        latitude: 12.9698,
        longitude: 77.5906,
        wallet_balance: 3000,
      },
      {
        name: 'Rahul Kumar',
        email: 'rahul@example.com',
        password: hashedPassword3,
        phone: '9876543212',
        address_line: '789 Pine Road',
        landmark: 'Near School',
        area_id: 3,
        latitude: 12.9606,
        longitude: 77.6412,
        wallet_balance: 2000,
      },
      {
        name: 'Anjali Singh',
        email: 'anjali@example.com',
        password: hashedPassword1,
        phone: '9876543213',
        address_line: '321 Elm Street',
        landmark: 'Near Hospital',
        area_id: 4,
        latitude: 12.9352,
        longitude: 77.6245,
        wallet_balance: 4000,
      },
    ];

    for (const user of users) {
      await executeQuery(
        `INSERT INTO Users (name, email, password, phone, address_line, landmark, area_id, latitude, longitude, wallet_balance)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.name,
          user.email,
          user.password,
          user.phone,
          user.address_line,
          user.landmark,
          user.area_id,
          user.latitude,
          user.longitude,
          user.wallet_balance,
        ]
      );
    }
    console.log('✅ Users seeded\n');

    // ============= SEED TASKS =============
    console.log('📋 Seeding Tasks...');
    const tasks = [
      {
        title: 'Home Cleaning',
        description: 'Need thorough cleaning for 2-bedroom apartment',
        price: 500,
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        created_by: 1,
        assigned_to: null,
        area_id: 1,
        latitude: 12.9716,
        longitude: 77.5946,
        status: 'OPEN',
      },
      {
        title: 'Plumbing Repair',
        description: 'Fix leaking tap and install new faucet',
        price: 800,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        created_by: 2,
        assigned_to: null,
        area_id: 2,
        latitude: 12.9698,
        longitude: 77.5906,
        status: 'OPEN',
      },
      {
        title: 'Painting Work',
        description: 'Paint bedroom walls with new color',
        price: 1200,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        created_by: 3,
        assigned_to: null,
        area_id: 3,
        latitude: 12.9606,
        longitude: 77.6412,
        status: 'OPEN',
      },
      {
        title: 'Gardening Service',
        description: 'Maintain garden, trim plants, and landscaping',
        price: 400,
        deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        created_by: 1,
        assigned_to: 2,
        area_id: 1,
        latitude: 12.9716,
        longitude: 77.5946,
        status: 'ASSIGNED',
      },
      {
        title: 'Electrical Installation',
        description: 'Install new lights and ceiling fan',
        price: 600,
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        created_by: 4,
        assigned_to: 3,
        area_id: 4,
        latitude: 12.9352,
        longitude: 77.6245,
        status: 'COMPLETED',
      },
    ];

    for (const task of tasks) {
      await executeQuery(
        `INSERT INTO Tasks (title, description, price, deadline, created_by, assigned_to, area_id, latitude, longitude, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          task.title,
          task.description,
          task.price,
          task.deadline,
          task.created_by,
          task.assigned_to,
          task.area_id,
          task.latitude,
          task.longitude,
          task.status,
        ]
      );
    }
    console.log('✅ Tasks seeded\n');

    // ============= SEED APPLICATIONS =============
    console.log('📝 Seeding Applications...');
    const applications = [
      { task_id: 1, applicant_id: 2, status: 'PENDING' },
      { task_id: 1, applicant_id: 3, status: 'PENDING' },
      { task_id: 2, applicant_id: 1, status: 'PENDING' },
      { task_id: 3, applicant_id: 4, status: 'PENDING' },
      { task_id: 4, applicant_id: 2, status: 'ACCEPTED' },
    ];

    for (const app of applications) {
      await executeQuery(
        'INSERT INTO Applications (task_id, applicant_id, status, applied_at) VALUES (?, ?, ?, NOW())',
        [app.task_id, app.applicant_id, app.status]
      );
    }
    console.log('✅ Applications seeded\n');

    // ============= SEED TRANSACTIONS =============
    console.log('💰 Seeding Transactions...');
    const transactions = [
      { task_id: 5, payer_id: 4, payee_id: 3, amount: 600, status: 'COMPLETED' },
    ];

    for (const transaction of transactions) {
      await executeQuery(
        'INSERT INTO Transactions (task_id, payer_id, payee_id, amount, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [transaction.task_id, transaction.payer_id, transaction.payee_id, transaction.amount, transaction.status]
      );
    }
    console.log('✅ Transactions seeded\n');

    // ============= SEED REVIEWS =============
    console.log('⭐ Seeding Reviews...');
    const reviews = [
      {
        task_id: 5,
        reviewer_id: 4,
        reviewed_user_id: 3,
        rating: 5,
        comment: 'Excellent work! Very professional and punctual.',
      },
      {
        task_id: 5,
        reviewer_id: 3,
        reviewed_user_id: 4,
        rating: 4,
        comment: 'Good client, clear instructions provided.',
      },
    ];

    for (const review of reviews) {
      await executeQuery(
        'INSERT INTO Reviews (task_id, reviewer_id, reviewed_user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [review.task_id, review.reviewer_id, review.reviewed_user_id, review.rating, review.comment]
      );
    }
    console.log('✅ Reviews seeded\n');

    console.log('✨ Database seeding completed successfully!\n');
    console.log('📊 Sample Data Summary:');
    console.log('   - 8 Areas');
    console.log('   - 4 Users');
    console.log('   - 5 Tasks');
    console.log('   - 5 Applications');
    console.log('   - 1 Transaction');
    console.log('   - 2 Reviews');
    console.log('\n🔐 Test Credentials:');
    console.log('   Email: prarthana@example.com | Password: password123');
    console.log('   Email: srishti@example.com | Password: password456');
    console.log('   Email: rahul@example.com | Password: password789');
    console.log('   Email: anjali@example.com | Password: password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
