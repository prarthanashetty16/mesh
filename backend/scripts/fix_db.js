const { pool } = require('../config/database');

async function fixDB() {
  try {
    console.log('Fixing database schema...');
    
    // Check if columns exist before adding them (to avoid errors if run multiple times)
    const [columns] = await pool.query(`SHOW COLUMNS FROM Tasks LIKE 'area_id'`);
    
    if (columns.length === 0) {
      console.log('Adding area_id, latitude, longitude columns to Tasks...');
      await pool.query(`
        ALTER TABLE Tasks 
        ADD COLUMN area_id INT, 
        ADD COLUMN latitude DECIMAL(10,8), 
        ADD COLUMN longitude DECIMAL(11,8),
        ADD FOREIGN KEY (area_id) REFERENCES Area(area_id)
      `);
      console.log('Columns added successfully.');
    } else {
      console.log('Columns already exist.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing DB:', error);
    process.exit(1);
  }
}

fixDB();
