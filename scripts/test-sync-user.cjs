const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_SJGitRN3VC7d@ep-small-shape-b73kbp1m-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const email = 'omori@example.com';
    const id = '11111111-2222-3333-4444-555555555555';
    
    console.log('Testing sync-user query with ON CONFLICT (email)...');
    try {
      const res = await pool.query(
        `
        INSERT INTO public.profiles (id, email, full_name, phone_number, avatar_url, is_platform_admin, is_super_admin, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (email) DO UPDATE 
        SET 
          id = EXCLUDED.id,
          full_name = EXCLUDED.full_name,
          phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
          avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
          updated_at = NOW()
        RETURNING *;
        `,
        [id, email, 'Omori', null, null, false, false]
      );
      console.log('Success 1:', res.rows[0]);
    } catch (e1) {
      console.error('Error 1:', e1.message);
    }

    // Now try to insert again with same email but DIFFERENT id (this tests primary key update if businesses exist)
    const newId = '99999999-8888-7777-6666-555555555555';
    try {
      const res2 = await pool.query(
        `
        INSERT INTO public.profiles (id, email, full_name, phone_number, avatar_url, is_platform_admin, is_super_admin, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (email) DO UPDATE 
        SET 
          id = EXCLUDED.id,
          full_name = EXCLUDED.full_name,
          phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
          avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
          updated_at = NOW()
        RETURNING *;
        `,
        [newId, email, 'Omori Updated', null, null, false, false]
      );
      console.log('Success 2:', res2.rows[0]);
    } catch (e2) {
      console.error('Error 2 (expected if PK update restricted):', e2.message);
    }

  } finally {
    await pool.end();
  }
}

run();
