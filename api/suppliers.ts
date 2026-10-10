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

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    if (req.method === 'POST') {
      // Accept various field name conventions from the frontend
      const {
        businessId,
        companyName, name,          // either works
        contactPerson,
        phone, phoneNumber,          // either works
        email, address,
        outstandingLiability
      } = body || {};

      const supplierName = companyName || name;
      if (!supplierName) {
        return res.status(400).json({ error: 'Supplier name is required' });
      }
      if (!businessId) {
        return res.status(400).json({ error: 'businessId is required' });
      }

      const resolvedPhone = phone || phoneNumber || null;
      const result = await query(
        `INSERT INTO public.suppliers (business_id, name, contact_person, phone_number, email, address, outstanding_balance)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          businessId, supplierName, contactPerson || null,
          resolvedPhone, email || null, address || null,
          parseFloat(outstandingLiability) || 0
        ]
      );

      const s = result.rows[0];
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
        return res.status(400).json({ error: 'id and amount are required' });
      }
      const result = await query(
        `UPDATE public.suppliers SET outstanding_balance = GREATEST(0, outstanding_balance - $1) WHERE id = $2 RETURNING *`,
        [parseFloat(amount), id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Supplier not found' });
      }
      return res.status(200).json({
        success: true,
        outstandingLiability: parseFloat(result.rows[0].outstanding_balance)
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('API /suppliers error:', err);
    return res.status(500).json({ error: err.message });
  }
}
