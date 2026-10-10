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

    const {
      businessId, branchId, recordedByUserId,
      category, amount, paymentMethod, description, expenseDate
    } = body || {};

    if (!businessId || !category || !amount) {
      return res.status(400).json({ error: 'businessId, category and amount are required' });
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Resolve branch_id
    let resolvedBranchId = (branchId && isUuid.test(branchId)) ? branchId : null;
    if (!resolvedBranchId) {
      const branchRes = await query(`SELECT id FROM public.branches WHERE business_id = $1 ORDER BY is_main DESC LIMIT 1`, [businessId]);
      if (branchRes.rows.length > 0) {
        resolvedBranchId = branchRes.rows[0].id;
      } else {
        const newBranch = await query(
          `INSERT INTO public.branches (business_id, name, code, is_main, is_active) VALUES ($1, 'Main Branch', 'MAIN', true, true) RETURNING id`,
          [businessId]
        );
        resolvedBranchId = newBranch.rows[0].id;
      }
    }

    // Resolve recorded_by user (must be a profile UUID)
    const resolvedUserId = (recordedByUserId && isUuid.test(recordedByUserId)) ? recordedByUserId : null;

    const resolvedDate = expenseDate || new Date().toISOString().split('T')[0];

    const result = await query(
      `INSERT INTO public.expenses (
        business_id, branch_id, recorded_by_user_id, category,
        amount, payment_method, description, date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        businessId, resolvedBranchId, resolvedUserId,
        category, parseFloat(amount) || 0,
        paymentMethod || 'cash',
        description || category,
        resolvedDate
      ]
    );

    const e = result.rows[0];
    return res.status(200).json({
      id: e.id,
      businessId: e.business_id,
      branchId: e.branch_id,
      category: e.category,
      description: e.description,
      amount: parseFloat(e.amount),
      paymentMethod: e.payment_method,
      expenseDate: e.date,
      createdAt: e.created_at
    });
  } catch (err: any) {
    console.error('API /expenses error:', err);
    return res.status(500).json({ error: err.message });
  }
}
