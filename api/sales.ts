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
      businessId, branchId, cashierUserId, customerId, receiptNumber,
      subtotal, discountAmount, taxAmount, totalAmount, amountPaid,
      paymentMethod, paymentStatus, notes, items 
    } = req.body;

    // Begin transaction
    await query('BEGIN');

    // Insert Sale
    const saleRes = await query(
      `INSERT INTO public.sales (
        business_id, branch_id, cashier_staff_id, customer_id, receipt_number,
        subtotal, discount_amount, tax_amount, total_amount, amount_paid,
        change_returned, payment_method, payment_status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [businessId, branchId, cashierUserId || null, customerId || null, receiptNumber, subtotal, discountAmount, taxAmount, totalAmount, amountPaid, 0, paymentMethod, paymentStatus, notes]
    );
    const saleId = saleRes.rows[0].id;

    // Insert Items and Update Stock
    for (const item of items) {
      await query(
        `INSERT INTO public.sale_items (
          sale_id, product_id, product_name_snapshot, sku_snapshot, quantity, unit_price, cost_price, line_total
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [saleId, item.productId, item.productNameSnapshot, item.skuSnapshot || 'N/A', item.quantity, item.unitPrice, item.unitCostSnapshot, item.lineTotal]
      );

      // Update Stock if not service
      if (!item.isService && item.productId) {
        const prodRes = await query(`SELECT quantity_on_hand FROM public.products WHERE id = $1`, [item.productId]);
        if (prodRes.rows.length > 0) {
          const currentQty = parseFloat(prodRes.rows[0].quantity_on_hand);
          const newQty = Math.max(0, currentQty - item.quantity);
          
          await query(`UPDATE public.products SET quantity_on_hand = $1 WHERE id = $2`, [newQty, item.productId]);
          
          await query(
            `INSERT INTO public.stock_movements (
              business_id, branch_id, product_id, product_name, movement_type, 
              quantity_change, quantity_after, unit_cost, reference_number, reason
            ) VALUES ($1, $2, $3, $4, 'sale', $5, $6, $7, $8, $9)`,
            [businessId, branchId, item.productId, item.productNameSnapshot, -item.quantity, newQty, item.unitCostSnapshot, receiptNumber, `POS Sale ${receiptNumber}`]
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
