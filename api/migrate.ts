import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Add stock_movements table
    await query(`
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

    await query(`
      CREATE INDEX IF NOT EXISTS idx_stock_movements_product 
      ON public.stock_movements(product_id, created_at DESC);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_stock_movements_business 
      ON public.stock_movements(business_id, created_at DESC);
    `);

    // Add amount_paid column to invoices if missing
    await query(`
      DO $$ BEGIN
        ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(15, 2) DEFAULT 0.00;
        ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS customer_email TEXT;
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
    `);

    return res.status(200).json({ success: true, message: 'Migration completed successfully' });
  } catch (err: any) {
    console.error('Migration error:', err);
    return res.status(500).json({ error: err.message });
  }
}
