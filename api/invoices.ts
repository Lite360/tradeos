import type { VercelRequest, VercelResponse } from '@vercel/node';
import { pool } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Use a single dedicated client for the transaction
  const client = await pool.connect();
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

    if (!businessId || !customerName || !dueDate) {
      return res.status(400).json({ error: 'businessId, customerName and dueDate are required' });
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Resolve valid branch_id
    let resolvedBranchId = (branchId && isUuid.test(branchId)) ? branchId : null;
    if (!resolvedBranchId) {
      const branchRes = await client.query(`SELECT id FROM public.branches WHERE business_id = $1 ORDER BY is_main DESC LIMIT 1`, [businessId]);
      if (branchRes.rows.length > 0) {
        resolvedBranchId = branchRes.rows[0].id;
      } else {
        const newBranch = await client.query(
          `INSERT INTO public.branches (business_id, name, code, is_main, is_active) VALUES ($1, 'Main Branch', 'MAIN', true, true) RETURNING id`,
          [businessId]
        );
        resolvedBranchId = newBranch.rows[0].id;
      }
    }

    // Resolve customer_id (must be a real UUID from the customers table)
    let resolvedCustomerId = (customerId && isUuid.test(customerId)) ? customerId : null;
    if (resolvedCustomerId) {
      // Verify it actually exists
      const custCheck = await client.query(`SELECT id FROM public.customers WHERE id = $1 AND business_id = $2`, [resolvedCustomerId, businessId]);
      if (custCheck.rows.length === 0) resolvedCustomerId = null;
    }
    if (!resolvedCustomerId && customerName) {
      // Upsert customer by name for this business
      const upsertCust = await client.query(
        `INSERT INTO public.customers (business_id, name, phone_number, email, outstanding_debt)
         VALUES ($1, $2, $3, $4, 0)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [businessId, customerName, customerPhone || null, customerEmail || null]
      );
      if (upsertCust.rows.length > 0) {
        resolvedCustomerId = upsertCust.rows[0].id;
      } else {
        const existCust = await client.query(
          `SELECT id FROM public.customers WHERE business_id = $1 AND name = $2 LIMIT 1`,
          [businessId, customerName]
        );
        resolvedCustomerId = existCust.rows[0]?.id || null;
      }
    }

    // Generate invoice number if not provided
    const resolvedInvoiceNumber = invoiceNumber || `INV-${Date.now().toString().slice(-8)}`;

    await client.query('BEGIN');

    const invRes = await client.query(
      `INSERT INTO public.invoices (
        business_id, branch_id, customer_id, invoice_number, customer_name,
        customer_email, customer_phone, issue_date, due_date, subtotal,
        discount_amount, total_amount, amount_paid, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, $11, 0, 'issued', $12) RETURNING *`,
      [
        businessId, resolvedBranchId, resolvedCustomerId, resolvedInvoiceNumber,
        customerName, customerEmail || null, customerPhone || null,
        issueDate || new Date().toISOString().split('T')[0],
        dueDate, subtotal || 0, totalAmount || 0, notes || null
      ]
    );

    const invoiceId = invRes.rows[0].id;

    for (const item of (items || [])) {
      const resolvedProdId = (item.productId && isUuid.test(item.productId)) ? item.productId : null;
      await client.query(
        `INSERT INTO public.invoice_items (invoice_id, product_id, description, quantity, unit_price, line_total)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          invoiceId, resolvedProdId,
          item.description || 'Service / Item',
          parseFloat(item.quantity) || 1,
          parseFloat(item.unitPrice) || 0,
          parseFloat(item.lineTotal) || (parseFloat(item.unitPrice) * parseFloat(item.quantity)) || 0
        ]
      );
    }

    // Update customer outstanding debt
    if (resolvedCustomerId && parseFloat(totalAmount) > 0) {
      await client.query(
        `UPDATE public.customers SET outstanding_debt = outstanding_debt + $1 WHERE id = $2`,
        [totalAmount, resolvedCustomerId]
      );
    }

    await client.query('COMMIT');
    return res.status(200).json({ success: true, invoiceId, invoice: invRes.rows[0] });
  } catch (err: any) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('API /invoices error:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
}
