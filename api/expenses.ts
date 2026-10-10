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
    const { businessId, branchId, recordedByUserId, category, amount, paymentMethod, description, expenseDate } = req.body;
    
    const result = await query(
      `INSERT INTO public.expenses (
        business_id, branch_id, recorded_by_user_id, category, amount, payment_method, description, date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [businessId, branchId, recordedByUserId, category, amount, paymentMethod, description, expenseDate]
    );

    const e = result.rows[0];
    return res.status(200).json({
      id: e.id, businessId: e.business_id, branchId: e.branch_id, category: e.category, 
      amount: parseFloat(e.amount), paymentMethod: e.payment_method, description: e.description, 
      expenseDate: e.date, createdAt: e.created_at
    });
  } catch (err: any) {
    console.error('API /expenses error:', err);
    return res.status(500).json({ error: err.message });
  }
}
