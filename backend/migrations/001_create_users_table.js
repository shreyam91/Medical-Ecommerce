const sql = require('../config/supabase');

async function createUsersTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        mobile VARCHAR(15) UNIQUE NOT NULL,
        otp VARCHAR(10),
        profile_completed BOOLEAN DEFAULT FALSE,
        name VARCHAR(100),
        email VARCHAR(100),
        dob DATE,
        gender VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('Users table created successfully');
  } catch (error) {
    console.error('Error creating users table:', error);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  createUsersTable().then(() => {
    process.exit(0);
  });
}

module.exports = createUsersTable;