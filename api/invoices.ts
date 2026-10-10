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
      businessId, branchId, customerId, invoiceNumber, customerName, 
      customerEmail, customerPhone, issueDate, dueDate, subtotal, 
      totalAmount, notes, items 
    } = body || {};

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    // Resolve valid branch_id
    let resolvedBranchId = branchId;
    if (!resolvedBranchId || !isUuid.test(resolvedBranchId)) {
      const branchRes = await query(`SELECT id FROM public.branches WHERE business_id = $1 LIMIT 1`, [businessId]);
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

    // Resolve customer_id
    let resolvedCustomerId = (customerId && isUuid.test(customerId)) ? customerId : null;
    if (!resolvedCustomerId && customerName) {
      const newCust = await query(
        `INSERT INTO public.customers (business_id, name, phone_number, email, outstanding_debt) VALUES ($1, $2, $3, $4, 0) RETURNING id`,
        [businessId, customerName, customerPhone || null, customerEmail || null]
      );
      resolvedCustomerId = newCust.rows[0].id;
    }

    await query('BEGIN');

    const invRes = await query(
      `INSERT INTO public.invoices (
        business_id, branch_id, customer_id, invoice_number, customer_name,
        customer_email, customer_phone, issue_date, due_date, subtotal,
        total_amount, amount_paid, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 0, 'issued', $12) RETURNING *`,
      [businessId, resolvedBranchId, resolvedCustomerId, invoiceNumber, customerName, customerEmail, customerPhone, issueDate, dueDate, subtotal || 0, totalAmount || 0, notes || null]
    );

    const invoiceId = invRes.rows[0].id;

    for (const item of (items || [])) {
      const resolvedProdId = (item.productId && isUuid.test(item.productId)) ? item.productId : null;
      await query(
        `INSERT INTO public.invoice_items (
          invoice_id, product_id, description, quantity, unit_price, line_total
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [invoiceId, resolvedProdId, item.description || 'Item', item.quantity || 1, item.unitPrice || 0, item.lineTotal || 0]
      );
    }

    if (resolvedCustomerId && totalAmount) {
      await query(`UPDATE public.customers SET outstanding_debt = outstanding_debt + $1 WHERE id = $2`, [totalAmount, resolvedCustomerId]);
    }

    await query('COMMIT');
    return res.status(200).json({ success: true, invoiceId, invoice: invRes.rows[0] });
  } catch (err: any) {
    await query('ROLLBACK');
    console.error('API /invoices error:', err);
    return res.status(500).json({ error: err.message });
  }
}
