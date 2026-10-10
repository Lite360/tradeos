const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_SJGitRN3VC7d@ep-small-shape-b73kbp1m-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const ownerUserId = '87a415ff-0000-4000-a000-000000000001';
    console.log('Inserting Profile...');
    await pool.query(
      `
      INSERT INTO public.profiles (id, email, full_name, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (id) DO NOTHING;
      `,
      [ownerUserId, `${ownerUserId}@tradeos.app`, 'Workspace Owner']
    );

    console.log('Inserting Business...');
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
      [ownerUserId, 'De-Great Supermarket', 'De-Great Ltd', 'provision', '08031234567', 'Lagos']
    );
    console.log('Business Created:', bizRes.rows[0]);

    console.log('Inserting Branch...');
    const branchRes = await pool.query(
      `
      INSERT INTO public.branches (business_id, name, code, address, phone_number, is_main, is_active)
      VALUES ($1, 'Main Branch', 'MAIN', $2, $3, true, true)
      RETURNING *;
      `,
      [bizRes.rows[0].id, 'Lagos', '08031234567']
    );
    console.log('Branch Created:', branchRes.rows[0]);

    console.log('Inserting Customer...');
    const custRes = await pool.query(
      `INSERT INTO public.customers (business_id, name, phone_number, email, address, outstanding_debt) 
       VALUES ($1, $2, $3, $4, $5, 0) RETURNING *`,
      [bizRes.rows[0].id, 'Alhaji Musa', '08011112222', 'musa@example.com', 'Kano']
    );
    console.log('Customer Created:', custRes.rows[0]);

    console.log('Inserting Product...');
    const prodRes = await pool.query(
      `INSERT INTO public.products (
        business_id, branch_id, category_id, name, sku, barcode, description, 
        cost_price, selling_price, quantity_on_hand, reorder_level, unit_of_measure, is_service
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [bizRes.rows[0].id, branchRes.rows[0].id, null, 'Golden Penny Sugar 500g', 'SKU-001', '123456', 'Granulated Sugar', 800, 1000, 50, 5, 'pcs', false]
    );
    console.log('Product Created:', prodRes.rows[0]);

  } catch (err) {
    console.error('Error during full test:', err);
  } finally {
    await pool.end();
  }
}

run();
