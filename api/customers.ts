import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { action } = req.query;

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) {}
      }
      const { businessId, name, phone, email, address } = body || {};
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const result = await query(
        `INSERT INTO public.customers (business_id, name, phone_number, email, address, outstanding_debt) 
         VALUES ($1, $2, $3, $4, $5, 0) RETURNING *`,
        [businessId || null, name, phone || null, email || null, address || null]
      );
      
      const c = result.rows[0];
      return res.status(200).json({ 
        id: c.id, businessId: c.business_id, name: c.name, phone: c.phone_number, 
        email: c.email, address: c.address, outstandingDebt: parseFloat(c.outstanding_debt), 
        createdAt: c.created_at 
      });
    }

    if (req.method === 'PUT' && action === 'payment') {
      const { id, amount } = req.body;
      const result = await query(
        `UPDATE public.customers SET outstanding_debt = GREATEST(0, outstanding_debt - $1) WHERE id = $2 RETURNING *`,
        [amount, id]
      );
      return res.status(200).json({ success: true, outstandingDebt: parseFloat(result.rows[0].outstanding_debt) });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('API /customers error:', err);
    return res.status(500).json({ error: err.message });
  }
}
