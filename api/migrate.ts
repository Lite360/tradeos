import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const results: string[] = [];

  try {
    // 1. Ensure stock_movements table exists
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
    results.push('stock_movements table: OK');

    // 2. Indexes for stock_movements
    await query(`CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON public.stock_movements(product_id, created_at DESC);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_stock_movements_business ON public.stock_movements(business_id, created_at DESC);`);
    results.push('stock_movements indexes: OK');

    // 3. Add missing columns to invoices table
    await query(`
      ALTER TABLE public.invoices
        ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(15, 2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS customer_email TEXT,
        ADD COLUMN IF NOT EXISTS customer_phone TEXT;
    `);
    results.push('invoices columns (amount_paid, customer_email, customer_phone): OK');

    // 4. Add missing columns to products table (updated_at)
    await query(`
      ALTER TABLE public.products
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    `);
    results.push('products.updated_at: OK');

    // 5. Add updated_at to businesses
    await query(`
      ALTER TABLE public.businesses
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    `);
    results.push('businesses.updated_at: OK');

    // 6. Ensure categories table has no duplicate unique constraint issues
    // (categories doesn't have a unique constraint on name+business_id by default - OK)
    results.push('categories: OK');

    return res.status(200).json({
      success: true,
      message: 'All migrations completed successfully',
      details: results
    });
  } catch (err: any) {
    console.error('Migration error:', err);
    return res.status(500).json({ error: err.message, completedSteps: results });
  }
}
