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
    const { 
      businessId, branchId, customerId, invoiceNumber, customerName, 
      customerEmail, customerPhone, issueDate, dueDate, subtotal, 
      totalAmount, notes, items 
    } = req.body;

    await query('BEGIN');

    const invRes = await query(
      `INSERT INTO public.invoices (
        business_id, branch_id, customer_id, invoice_number, customer_name,
        customer_email, customer_phone, issue_date, due_date, subtotal,
        total_amount, amount_paid, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 0, 'issued', $12) RETURNING *`,
      [businessId, branchId, customerId, invoiceNumber, customerName, customerEmail, customerPhone, issueDate, dueDate, subtotal, totalAmount, notes]
    );

    const invoiceId = invRes.rows[0].id;

    for (const item of items) {
      await query(
        `INSERT INTO public.invoice_items (
          invoice_id, product_id, description, quantity, unit_price, line_total
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [invoiceId, item.productId || null, item.description, item.quantity, item.unitPrice, item.lineTotal]
      );
    }

    if (customerId) {
      await query(`UPDATE public.customers SET outstanding_debt = outstanding_debt + $1 WHERE id = $2`, [totalAmount, customerId]);
    }

    await query('COMMIT');
    return res.status(200).json({ success: true, invoiceId, invoice: invRes.rows[0] });
  } catch (err: any) {
    await query('ROLLBACK');
    console.error('API /invoices error:', err);
    return res.status(500).json({ error: err.message });
  }
}
