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
  res.setHeader('Access-Control-Allow-Methods', 'POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  try {
    const { action } = req.query;
    const body = parseRequestBody(req);

    if (req.method === 'POST') {
      const { businessId, name, phone, phoneNumber, email, address, creditLimit } = body || {};
      if (!name) {
        await pool.end().catch(() => {});
        return res.status(400).json({ error: 'Name is required' });
      }
      if (!businessId) {
        await pool.end().catch(() => {});
        return res.status(400).json({ error: 'businessId is required' });
      }

      const resolvedPhone = phone || phoneNumber || null;
      const result = await pool.query(
        `INSERT INTO public.customers (business_id, name, phone_number, email, address, credit_limit, outstanding_debt)
         VALUES ($1, $2, $3, $4, $5, $6, 0) RETURNING *`,
        [businessId, name, resolvedPhone, email || null, address || null, parseFloat(creditLimit) || 0]
      );

      const c = result.rows[0];
      await pool.end().catch(() => {});
      return res.status(200).json({
        id: c.id,
        businessId: c.business_id,
        name: c.name,
        phone: c.phone_number,
        email: c.email,
        address: c.address,
        creditLimit: parseFloat(c.credit_limit),
        outstandingDebt: parseFloat(c.outstanding_debt),
        createdAt: c.created_at
      });
    }

    if (req.method === 'PUT' && action === 'payment') {
      const { id, amount } = body || {};
      if (!id || !amount) {
        await pool.end().catch(() => {});
        return res.status(400).json({ error: 'id and amount are required' });
      }
      const result = await pool.query(
        `UPDATE public.customers SET outstanding_debt = GREATEST(0, outstanding_debt - $1) WHERE id = $2 RETURNING *`,
        [parseFloat(amount), id]
      );
      if (result.rows.length === 0) {
        await pool.end().catch(() => {});
        return res.status(404).json({ error: 'Customer not found' });
      }
      await pool.end().catch(() => {});
      return res.status(200).json({
        success: true,
        outstandingDebt: parseFloat(result.rows[0].outstanding_debt)
      });
    }

    await pool.end().catch(() => {});
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    await pool.end().catch(() => {});
    console.error('API /customers error:', err);
    return res.status(500).json({ error: err.message });
  }
}
