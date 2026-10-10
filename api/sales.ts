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

  const client = await pool.connect();
  try {
    const body = parseRequestBody(req);
    const {
      businessId, branchId, cashierUserId, customerId, receiptNumber,
      subtotal, discountAmount, taxAmount, totalAmount, amountPaid,
      balanceDue, paymentMethod, paymentStatus, notes, items
    } = body || {};

    if (!businessId) {
      return res.status(400).json({ error: 'businessId is required' });
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

    let resolvedCustomerId = (customerId && isUuid.test(customerId)) ? customerId : null;
    if (resolvedCustomerId) {
      const custCheck = await client.query(`SELECT id FROM public.customers WHERE id = $1`, [resolvedCustomerId]);
      if (custCheck.rows.length === 0) resolvedCustomerId = null;
    }

    const resolvedReceiptNumber = receiptNumber || `REC-${Date.now().toString().slice(-8)}`;
    const resolvedTotal = parseFloat(totalAmount) || 0;
    const resolvedPaid = parseFloat(amountPaid) || 0;
    const resolvedBalance = parseFloat(balanceDue) ?? Math.max(0, resolvedTotal - resolvedPaid);

    await client.query('BEGIN');

    const saleRes = await client.query(
      `INSERT INTO public.sales (
        business_id, branch_id, cashier_staff_id, customer_id, receipt_number,
        subtotal, discount_amount, tax_amount, total_amount, amount_paid,
        change_returned, payment_method, payment_status, notes
      ) VALUES ($1, $2, NULL, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        businessId, resolvedBranchId, resolvedCustomerId, resolvedReceiptNumber,
        parseFloat(subtotal) || 0,
        parseFloat(discountAmount) || 0,
        parseFloat(taxAmount) || 0,
        resolvedTotal,
        resolvedPaid,
        Math.max(0, resolvedPaid - resolvedTotal),
        paymentMethod || 'cash',
        paymentStatus || 'paid',
        notes || null
      ]
    );
    const saleId = saleRes.rows[0].id;

    for (const item of (items || [])) {
      const resolvedProdId = (item.productId && isUuid.test(item.productId)) ? item.productId : null;

      await client.query(
        `INSERT INTO public.sale_items (
          sale_id, product_id, product_name_snapshot, sku_snapshot,
          quantity, unit_price, cost_price, line_total
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          saleId,
          resolvedProdId,
          item.productNameSnapshot || item.name || 'Product',
          item.skuSnapshot || item.sku || 'N/A',
          parseFloat(item.quantity) || 1,
          parseFloat(item.unitPrice) || 0,
          parseFloat(item.unitCostSnapshot) || parseFloat(item.costPrice) || 0,
          parseFloat(item.lineTotal) || 0
        ]
      );

      if (!item.isService && resolvedProdId) {
        const prodRes = await client.query(`SELECT quantity_on_hand FROM public.products WHERE id = $1`, [resolvedProdId]);
        if (prodRes.rows.length > 0) {
          const currentQty = parseFloat(prodRes.rows[0].quantity_on_hand);
          const newQty = Math.max(0, currentQty - parseFloat(item.quantity));
          await client.query(`UPDATE public.products SET quantity_on_hand = $1, updated_at = NOW() WHERE id = $2`, [newQty, resolvedProdId]);
          await client.query(
            `INSERT INTO public.stock_movements (
              business_id, branch_id, product_id, product_name, movement_type,
              quantity_change, quantity_after, unit_cost, reference_number, reason
            ) VALUES ($1, $2, $3, $4, 'sale', $5, $6, $7, $8, $9)`,
            [
              businessId, resolvedBranchId, resolvedProdId,
              item.productNameSnapshot || 'Product',
              -parseFloat(item.quantity), newQty,
              parseFloat(item.unitCostSnapshot) || 0,
              resolvedReceiptNumber,
              `POS Sale ${resolvedReceiptNumber}`
            ]
          );
        }
      }
    }

    if (resolvedCustomerId && resolvedBalance > 0) {
      await client.query(
        `UPDATE public.customers SET outstanding_debt = outstanding_debt + $1 WHERE id = $2`,
        [resolvedBalance, resolvedCustomerId]
      );
    }

    await client.query('COMMIT');
    return res.status(200).json({ success: true, saleId });
  } catch (err: any) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('API /sales error:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
    await pool.end().catch(() => {});
  }
}
