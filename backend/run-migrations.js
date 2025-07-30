const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Run SQL schema files
    const schemaDir = path.join(__dirname, 'schema');
    if (fs.existsSync(schemaDir)) {
      const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.sql'));
      for (const file of files) {
        const sql = fs.readFileSync(path.join(schemaDir, file), 'utf8');
        console.log(`Running schema: ${file}`);
        await client.query(sql);
      }
    }
    
    // Run JS migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.js'))
        .sort(); // Run in order
      
      for (const file of files) {
        console.log(`Running migration: ${file}`);
        const migration = require(path.join(migrationsDir, file));
        if (typeof migration === 'function') {
          await migration();
        }
      }
    }
    
    await client.end();
    console.log('All migrations applied successfully!');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

runMigrations();