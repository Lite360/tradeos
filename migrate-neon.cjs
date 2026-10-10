const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function runMigration() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_SJGitRN3VC7d@ep-small-shape-b73kbp1m-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require';
  
  console.log('Connecting to Neon PostgreSQL cluster...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected successfully to Neon DB.');

    const schemaPath = path.join(__dirname, 'supabase-schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing database migrations from supabase-schema.sql...');
    await client.query(sql);
    console.log('Schema migration completed successfully! All TradeOS tables & indexes created.');

    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\nVerified Public Tables Created in Neon DB:');
    res.rows.forEach(r => console.log(' - ' + r.table_name));

  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
