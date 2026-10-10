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
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }
    const { businessId, branchId, recordedByUserId, category, amount, paymentMethod, description, expenseDate } = body || {};
    
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let resolvedBranchId = branchId;
    if (!resolvedBranchId || !isUuid.test(resolvedBranchId)) {
      const branchRes = await query(`SELECT id FROM public.branches WHERE business_id = $1 LIMIT 1`, [businessId]);
      if (branchRes.rows.length > 0) {
        resolvedBranchId = branchRes.rows[0].id;
      }
    }
    const resolvedUserId = (recordedByUserId && isUuid.test(recordedByUserId)) ? recordedByUserId : null;

    const result = await query(
      `INSERT INTO public.expenses (
        business_id, branch_id, recorded_by_user_id, category, amount, payment_method, description, date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [businessId, resolvedBranchId, resolvedUserId, category, amount || 0, paymentMethod || 'cash', description || null, expenseDate || new Date().toISOString().split('T')[0]]
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
