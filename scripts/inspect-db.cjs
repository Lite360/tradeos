const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_SJGitRN3VC7d@ep-small-shape-b73kbp1m-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const profiles = await pool.query('SELECT * FROM public.profiles');
    console.log('=== PROFILES ===', profiles.rows);

    const businesses = await pool.query('SELECT * FROM public.businesses');
    console.log('=== BUSINESSES ===', businesses.rows);

    const branches = await pool.query('SELECT * FROM public.branches');
    console.log('=== BRANCHES ===', branches.rows);

    const products = await pool.query('SELECT * FROM public.products');
    console.log('=== PRODUCTS ===', products.rows);

    const customers = await pool.query('SELECT * FROM public.customers');
    console.log('=== CUSTOMERS ===', customers.rows);

    const invoices = await pool.query('SELECT * FROM public.invoices');
    console.log('=== INVOICES ===', invoices.rows);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await pool.end();
  }
}

check();
