import { Pool } from 'pg';
import { neon } from '@neondatabase/serverless';

const connectionString = 'postgresql://neondb_owner:npg_SJGitRN3VC7d@ep-small-shape-b73kbp1m-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function testPg() {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  try {
    const res = await pool.query('SELECT * FROM profiles WHERE email = $1', ['admin@tradeos.ng']);
    console.log('PG Success:', res.rows.length);
  } catch (err) {
    console.error('PG Error:', err);
  } finally {
    await pool.end();
  }
}

async function testNeon() {
  const sql = neon(connectionString);
  try {
    const res = await sql`SELECT * FROM profiles WHERE email = ${'admin@tradeos.ng'}`;
    console.log('Neon template Success:', res.length);
  } catch (err) {
    console.error('Neon template Error:', err);
  }
}

async function main() {
  console.log('--- Testing PG ---');
  await testPg();
  console.log('--- Testing Neon ---');
  await testNeon();
}

main();
