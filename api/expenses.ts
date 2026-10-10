import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

function parseRequestBody(req: VercelRequest): any {
  try {
    let body = req.body;
    if (typeof body === 'string') {
      return JSON.parse(body);
    }
    return body || {};
  } catch (e) {
    return {};
  }
}

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  'postgresql://neondb_owner:npg_SJGitRN3VC7d@ep-small-shape-b73kbp1m-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  try {
    const body = parseRequestBody(req);
    const {
      businessId, branchId, recordedByUserId,
      category, amount, paymentMethod, description, expenseDate
    } = body || {};

    if (!businessId || !category || !amount) {
      await pool.end().catch(() => {});
      return res.status(400).json({ error: 'businessId, category and amount are required' });
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    let resolvedBranchId = (branchId && isUuid.test(branchId)) ? branchId : null;
    if (!resolvedBranchId) {
      const branchRes = await pool.query(`SELECT id FROM public.branches WHERE business_id = $1 ORDER BY is_main DESC LIMIT 1`, [businessId]);
      if (branchRes.rows.length > 0) {
        resolvedBranchId = branchRes.rows[0].id;
      } else {
        const newBranch = await pool.query(
          `INSERT INTO public.branches (business_id, name, code, is_main, is_active) VALUES ($1, 'Main Branch', 'MAIN', true, true) RETURNING id`,
          [businessId]
        );
        resolvedBranchId = newBranch.rows[0].id;
      }
    }

    const resolvedUserId = (recordedByUserId && isUuid.test(recordedByUserId)) ? recordedByUserId : null;
    const resolvedDate = expenseDate || new Date().toISOString().split('T')[0];

    const result = await pool.query(
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
    await pool.end().catch(() => {});
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
    await pool.end().catch(() => {});
    console.error('API /expenses error:', err);
    return res.status(500).json({ error: err.message });
  }
}
