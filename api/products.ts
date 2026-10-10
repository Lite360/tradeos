import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { action } = req.query;

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    // ---- POST: Add Category ----
    if (req.method === 'POST' && action === 'category') {
      const { businessId, name, description } = body || {};
      if (!businessId || !name) {
        return res.status(400).json({ error: 'businessId and name are required' });
      }
      const result = await query(
        `INSERT INTO public.categories (business_id, name, description) VALUES ($1, $2, $3) RETURNING *`,
        [businessId, name, description || null]
      );
      const cat = result.rows[0];
      return res.status(200).json({
        id: cat.id,
        businessId: cat.business_id,
        name: cat.name,
        description: cat.description,
        createdAt: cat.created_at
      });
    }

    // ---- POST: Add Product ----
    if (req.method === 'POST' && action === 'product') {
      const {
        businessId, branchId, categoryId, name, sku, barcode,
        description, costPrice, sellingPrice, quantityOnHand,
        reorderLevel, unitOfMeasure, isService
      } = body || {};

      if (!businessId || !name) {
        return res.status(400).json({ error: 'businessId and name are required' });
      }

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      // Resolve a valid branch_id in the database for this business
      let resolvedBranchId = (branchId && isUuid.test(branchId)) ? branchId : null;
      if (!resolvedBranchId) {
        const branchRes = await query(`SELECT id FROM public.branches WHERE business_id = $1 ORDER BY is_main DESC LIMIT 1`, [businessId]);
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

      // Validate categoryId
      let resolvedCategoryId = (categoryId && isUuid.test(categoryId)) ? categoryId : null;

      // Generate unique SKU if missing or empty
      const resolvedSku = (sku && sku.trim()) ? sku.trim() : `SKU-${Date.now().toString().slice(-8)}`;

      const result = await query(
        `INSERT INTO public.products (
          business_id, branch_id, category_id, name, sku, barcode, description,
          cost_price, selling_price, quantity_on_hand, reorder_level, unit_of_measure, is_service
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [
          businessId,
          resolvedBranchId,
          resolvedCategoryId,
          name,
          resolvedSku,
          barcode || null,
          description || null,
          parseFloat(costPrice) || 0,
          parseFloat(sellingPrice) || 0,
          parseFloat(quantityOnHand) || 0,
          parseFloat(reorderLevel) || 5,
          unitOfMeasure || 'pcs',
          Boolean(isService)
        ]
      );

      const newProd = result.rows[0];

      // Record initial stock movement if quantity > 0
      if (!newProd.is_service && parseFloat(newProd.quantity_on_hand) > 0) {
        await query(
          `INSERT INTO public.stock_movements (
            business_id, branch_id, product_id, product_name, movement_type,
            quantity_change, quantity_after, unit_cost, reason
          ) VALUES ($1, $2, $3, $4, 'adjustment', $5, $5, $6, 'Initial stock setup')`,
          [businessId, resolvedBranchId, newProd.id, newProd.name, newProd.quantity_on_hand, newProd.cost_price]
        );
      }

      return res.status(200).json({
        id: newProd.id,
        businessId: newProd.business_id,
        categoryId: newProd.category_id,
        name: newProd.name,
        sku: newProd.sku,
        barcode: newProd.barcode,
        description: newProd.description,
        costPrice: parseFloat(newProd.cost_price),
        sellingPrice: parseFloat(newProd.selling_price),
        quantityOnHand: parseFloat(newProd.quantity_on_hand),
        reorderLevel: parseFloat(newProd.reorder_level),
        unitOfMeasure: newProd.unit_of_measure,
        isService: newProd.is_service,
        createdAt: newProd.created_at
      });
    }

    // ---- PUT: Stock Adjustment ----
    if (req.method === 'PUT' && action === 'product') {
      const { id, quantityChange, reason } = body || {};
      if (!id) return res.status(400).json({ error: 'Product id is required' });

      const prodRes = await query(`SELECT * FROM public.products WHERE id = $1`, [id]);
      if (prodRes.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

      const prod = prodRes.rows[0];
      const newQty = Math.max(0, parseFloat(prod.quantity_on_hand) + parseFloat(quantityChange));

      await query(`UPDATE public.products SET quantity_on_hand = $1, updated_at = NOW() WHERE id = $2`, [newQty, id]);

      await query(
        `INSERT INTO public.stock_movements (
          business_id, branch_id, product_id, product_name, movement_type,
          quantity_change, quantity_after, unit_cost, reason
        ) VALUES ($1, $2, $3, $4, 'adjustment', $5, $6, $7, $8)`,
        [prod.business_id, prod.branch_id, id, prod.name, parseFloat(quantityChange), newQty, prod.cost_price, reason || 'Manual adjustment']
      );

      return res.status(200).json({ success: true, newQuantity: newQty });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('API /products error:', err);
    return res.status(500).json({ error: err.message });
  }
}
