import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.stock_movements (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
        branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
        product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
        product_name TEXT NOT NULL,
        movement_type TEXT NOT NULL,
        quantity_change NUMERIC(15, 2) NOT NULL,
        quantity_after NUMERIC(15, 2) NOT NULL,
        unit_cost NUMERIC(15, 2),
        reference_number TEXT,
        reason TEXT,
        created_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
        created_by_name TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON public.stock_movements(product_id, created_at DESC);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_stock_movements_business ON public.stock_movements(business_id, created_at DESC);`);
    await pool.query(`
      DO $$ BEGIN
        ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(15, 2) DEFAULT 0.00;
        ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS customer_email TEXT;
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
    `);
    console.log("Migration successful");
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
