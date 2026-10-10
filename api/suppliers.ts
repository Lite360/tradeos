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
      const {
        businessId,
        companyName, name,
        contactPerson,
        phone, phoneNumber,
        email, address,
        outstandingLiability
      } = body || {};

      const supplierName = companyName || name;
      if (!supplierName) {
        await pool.end().catch(() => {});
        return res.status(400).json({ error: 'Supplier name is required' });
      }
      if (!businessId) {
        await pool.end().catch(() => {});
        return res.status(400).json({ error: 'businessId is required' });
      }

      const resolvedPhone = phone || phoneNumber || null;
      const result = await pool.query(
        `INSERT INTO public.suppliers (business_id, name, contact_person, phone_number, email, address, outstanding_balance)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          businessId, supplierName, contactPerson || null,
          resolvedPhone, email || null, address || null,
          parseFloat(outstandingLiability) || 0
        ]
      );

      const s = result.rows[0];
      await pool.end().catch(() => {});
      return res.status(200).json({
        id: s.id,
        businessId: s.business_id,
        companyName: s.name,
        name: s.name,
        contactPerson: s.contact_person,
        phone: s.phone_number,
        email: s.email,
        address: s.address,
        outstandingLiability: parseFloat(s.outstanding_balance),
        createdAt: s.created_at
      });
    }

    if (req.method === 'PUT' && action === 'payment') {
      const { id, amount } = body || {};
      if (!id || !amount) {
        await pool.end().catch(() => {});
        return res.status(400).json({ error: 'id and amount are required' });
      }
      const result = await pool.query(
        `UPDATE public.suppliers SET outstanding_balance = GREATEST(0, outstanding_balance - $1) WHERE id = $2 RETURNING *`,
        [parseFloat(amount), id]
      );
      if (result.rows.length === 0) {
        await pool.end().catch(() => {});
        return res.status(404).json({ error: 'Supplier not found' });
      }
      await pool.end().catch(() => {});
      return res.status(200).json({
        success: true,
        outstandingLiability: parseFloat(result.rows[0].outstanding_balance)
      });
    }

    await pool.end().catch(() => {});
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    await pool.end().catch(() => {});
    console.error('API /suppliers error:', err);
    return res.status(500).json({ error: err.message });
  }
}
