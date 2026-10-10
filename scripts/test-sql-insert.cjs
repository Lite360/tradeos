const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_SJGitRN3VC7d@ep-small-shape-b73kbp1m-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const testId = 'a0000000-0000-0000-0000-000000000001';
    const email = 'test@example.com';
    const fullName = 'Test User';
    
    console.log('Testing Profile Upsert...');
    const result = await pool.query(
      `
      INSERT INTO public.profiles (id, email, full_name, phone_number, avatar_url, is_platform_admin, is_super_admin, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (id) DO UPDATE 
      SET 
        full_name = EXCLUDED.full_name,
        phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at = NOW()
      RETURNING *;
      `,
      [testId, email, fullName, null, null, false, false]
    );
    console.log('Profile result:', result.rows[0]);

    console.log('Testing Business Insert...');
    const bizRes = await pool.query(
      `
      INSERT INTO public.businesses (
        owner_user_id, name, legal_name, category, currency_code, country_code,
        phone_number, address, subscription_plan_id, subscription_status,
        invoice_prefix, receipt_prefix
      )
      VALUES ($1, $2, $3, $4, 'NGN', 'NG', $5, $6, 'plan_free', 'active', 'INV-', 'REC-')
      RETURNING *;
      `,
      [testId, 'Test Shop', 'Test Shop Ltd', 'provision', '0800000000', 'Lagos']
    );
    console.log('Business result:', bizRes.rows[0]);

  } catch (err) {
    console.error('SQL Error details:', err);
  } finally {
    await pool.end();
  }
}

run();
