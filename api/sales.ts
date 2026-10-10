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
      businessId, branchId, cashierUserId, customerId, receiptNumber,
      subtotal, discountAmount, taxAmount, totalAmount, amountPaid,
      paymentMethod, paymentStatus, notes, items 
    } = body || {};

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let resolvedBranchId = branchId;
    if (!resolvedBranchId || !isUuid.test(resolvedBranchId)) {
      const branchRes = await query(`SELECT id FROM public.branches WHERE business_id = $1 LIMIT 1`, [businessId]);
      if (branchRes.rows.length > 0) {
        resolvedBranchId = branchRes.rows[0].id;
      }
    }
    const resolvedCustomerId = (customerId && isUuid.test(customerId)) ? customerId : null;

    // Begin transaction
    await query('BEGIN');

    // Insert Sale
    const saleRes = await query(
      `INSERT INTO public.sales (
        business_id, branch_id, customer_id, receipt_number,
        subtotal, discount_amount, tax_amount, total_amount, amount_paid,
        change_returned, payment_method, payment_status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, $10, $11, $12) RETURNING *`,
      [businessId, resolvedBranchId, resolvedCustomerId, receiptNumber, subtotal || 0, discountAmount || 0, taxAmount || 0, totalAmount || 0, amountPaid || 0, paymentMethod || 'cash', paymentStatus || 'paid', notes || null]
    );
    const saleId = saleRes.rows[0].id;

    // Insert Items and Update Stock
    for (const item of (items || [])) {
      const resolvedProdId = (item.productId && isUuid.test(item.productId)) ? item.productId : null;
      await query(
        `INSERT INTO public.sale_items (
          sale_id, product_id, product_name_snapshot, sku_snapshot, quantity, unit_price, cost_price, line_total
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [saleId, resolvedProdId, item.productNameSnapshot || 'Product', item.skuSnapshot || 'N/A', item.quantity || 1, item.unitPrice || 0, item.unitCostSnapshot || 0, item.lineTotal || 0]
      );

      // Update Stock if not service and has valid product ID
      if (!item.isService && resolvedProdId) {
        const prodRes = await query(`SELECT quantity_on_hand FROM public.products WHERE id = $1`, [resolvedProdId]);
        if (prodRes.rows.length > 0) {
          const currentQty = parseFloat(prodRes.rows[0].quantity_on_hand);
          const newQty = Math.max(0, currentQty - item.quantity);
          
          await query(`UPDATE public.products SET quantity_on_hand = $1 WHERE id = $2`, [newQty, resolvedProdId]);
          
          await query(
            `INSERT INTO public.stock_movements (
              business_id, branch_id, product_id, product_name, movement_type, 
              quantity_change, quantity_after, unit_cost, reference_number, reason
            ) VALUES ($1, $2, $3, $4, 'sale', $5, $6, $7, $8, $9)`,
            [businessId, resolvedBranchId, resolvedProdId, item.productNameSnapshot, -item.quantity, newQty, item.unitCostSnapshot || 0, receiptNumber, `POS Sale ${receiptNumber}`]
          );
        }
      }
    }

    // Update Customer Debt if any
    const balanceDue = totalAmount - amountPaid;
    if (customerId && balanceDue > 0) {
      await query(`UPDATE public.customers SET outstanding_debt = outstanding_debt + $1 WHERE id = $2`, [balanceDue, customerId]);
    }

    await query('COMMIT');
    return res.status(200).json({ success: true, saleId });
  } catch (err: any) {
    await query('ROLLBACK');
    console.error('API /sales error:', err);
    return res.status(500).json({ error: err.message });
  }
}
