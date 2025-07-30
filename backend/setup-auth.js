const sql = require('./config/supabase');

async function setupAuth() {
  try {
    console.log('Setting up authentication tables...');
    
    // Create users table
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
    
    console.log('✅ Users table created successfully');
    
    // Create index for faster mobile lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile)
    `;
    
    console.log('✅ Database indexes created');
    console.log('🎉 Authentication setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up authentication:', error);
  } finally {
    process.exit(0);
  }
}

setupAuth();