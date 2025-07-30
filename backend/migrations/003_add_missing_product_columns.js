const sql = require('../config/supabase');

async function addMissingProductColumns() {
  try {
    // Add missing columns to product table
    await sql`
      ALTER TABLE product 
      ADD COLUMN IF NOT EXISTS maximum_discount BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS main_category_id INTEGER,
      ADD COLUMN IF NOT EXISTS sub_category_id INTEGER,
      ADD COLUMN IF NOT EXISTS disease_id INTEGER
    `;
    
    console.log('✅ Added missing columns to product table');
  } catch (error) {
    console.error('❌ Error adding missing product columns:', error);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  addMissingProductColumns().then(() => {
    process.exit(0);
  });
}

module.exports = addMissingProductColumns;