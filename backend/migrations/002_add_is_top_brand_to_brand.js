const sql = require('../config/supabase');

async function addIsTopBrandColumn() {
  try {
    // Add is_top_brand column to brand table
    await sql`
      ALTER TABLE brand 
      ADD COLUMN IF NOT EXISTS is_top_brand BOOLEAN DEFAULT FALSE
    `;
    
    console.log('✅ Added is_top_brand column to brand table');
  } catch (error) {
    console.error('❌ Error adding is_top_brand column:', error);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  addIsTopBrandColumn().then(() => {
    process.exit(0);
  });
}

module.exports = addIsTopBrandColumn;