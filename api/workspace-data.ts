import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  'postgresql://neondb_owner:npg_SJGitRN3VC7d@ep-small-shape-b73kbp1m-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  try {
    const { businessId } = req.query;
    if (!businessId) {
      await pool.end().catch(() => {});
      return res.status(400).json({ error: 'businessId is required' });
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!isUuid.test(businessId as string)) {
      await pool.end().catch(() => {});
      return res.status(200).json({
        categories: [],
        products: [],
        sales: [],
        customers: [],
        suppliers: [],
        invoices: [],
        expenses: [],
        stockMovements: []
      });
    }

    const [
      categoriesRes,
      productsRes,
      salesRes,
      customersRes,
      suppliersRes,
      invoicesRes,
      expensesRes,
      movementsRes
    ] = await Promise.all([
      pool.query(`SELECT * FROM public.categories WHERE business_id = $1 ORDER BY name`, [businessId]),
      pool.query(`SELECT * FROM public.products WHERE business_id = $1 AND is_active = true ORDER BY name`, [businessId]),
      pool.query(`
        SELECT s.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'id', si.id,
                'productId', si.product_id,
                'productNameSnapshot', si.product_name_snapshot,
                'unitCostSnapshot', si.cost_price,
                'unitPrice', si.unit_price,
                'quantity', si.quantity,
                'lineTotal', si.line_total
              )
            ) FILTER (WHERE si.id IS NOT NULL), '[]'
          ) as items
        FROM public.sales s
        LEFT JOIN public.sale_items si ON si.sale_id = s.id
        WHERE s.business_id = $1
        GROUP BY s.id
        ORDER BY s.created_at DESC LIMIT 100
      `, [businessId]),
      pool.query(`SELECT * FROM public.customers WHERE business_id = $1 ORDER BY name`, [businessId]),
      pool.query(`SELECT * FROM public.suppliers WHERE business_id = $1 ORDER BY name`, [businessId]),
      pool.query(`
        SELECT i.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'id', ii.id,
                'productId', ii.product_id,
                'description', ii.description,
                'quantity', ii.quantity,
                'unitPrice', ii.unit_price,
                'lineTotal', ii.line_total
              )
            ) FILTER (WHERE ii.id IS NOT NULL), '[]'
          ) as items
        FROM public.invoices i
        LEFT JOIN public.invoice_items ii ON ii.invoice_id = i.id
        WHERE i.business_id = $1
        GROUP BY i.id
        ORDER BY i.created_at DESC LIMIT 100
      `, [businessId]),
      pool.query(`SELECT * FROM public.expenses WHERE business_id = $1 ORDER BY date DESC LIMIT 100`, [businessId]),
      pool.query(`SELECT * FROM public.stock_movements WHERE business_id = $1 ORDER BY created_at DESC LIMIT 100`, [businessId])
    ]);

    await pool.end().catch(() => {});

    const mapProduct = (p: any) => ({
      id: p.id,
      businessId: p.business_id,
      categoryId: p.category_id,
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      description: p.description,
      costPrice: parseFloat(p.cost_price),
      sellingPrice: parseFloat(p.selling_price),
      quantityOnHand: parseFloat(p.quantity_on_hand),
      reorderLevel: parseFloat(p.reorder_level),
      unitOfMeasure: p.unit_of_measure,
      isService: p.is_service,
      createdAt: p.created_at
    });

    const mapSale = (s: any) => ({
      id: s.id,
      businessId: s.business_id,
      branchId: s.branch_id,
      cashierUserId: s.cashier_staff_id,
      customerId: s.customer_id,
      receiptNumber: s.receipt_number,
      subtotal: parseFloat(s.subtotal),
      discountAmount: parseFloat(s.discount_amount),
      taxAmount: parseFloat(s.tax_amount),
      totalAmount: parseFloat(s.total_amount),
      amountPaid: parseFloat(s.amount_paid),
      balanceDue: parseFloat(s.total_amount) - parseFloat(s.amount_paid),
      paymentStatus: s.payment_status,
      paymentMethod: s.payment_method,
      items: (s.items || []).map((i: any) => ({
        id: i.id,
        productId: i.productId,
        productNameSnapshot: i.productNameSnapshot,
        unitCostSnapshot: parseFloat(i.unitCostSnapshot),
        unitPrice: parseFloat(i.unitPrice),
        quantity: parseFloat(i.quantity),
        lineSubtotal: parseFloat(i.lineTotal),
        lineDiscount: 0,
        lineTotal: parseFloat(i.lineTotal)
      })),
      createdAt: s.created_at
    });

    const mapInvoice = (i: any) => ({
      id: i.id,
      businessId: i.business_id,
      branchId: i.branch_id,
      customerId: i.customer_id,
      customerName: i.customer_name,
      customerEmail: i.customer_email,
      customerPhone: i.customer_phone,
      invoiceNumber: i.invoice_number,
      issueDate: i.issue_date,
      dueDate: i.due_date,
      subtotal: parseFloat(i.subtotal),
      taxAmount: 0,
      discountAmount: parseFloat(i.discount_amount),
      totalAmount: parseFloat(i.total_amount),
      amountPaid: parseFloat(i.amount_paid || 0),
      status: i.status,
      notes: i.notes,
      items: (i.items || []).map((item: any) => ({
        id: item.id,
        productId: item.productId,
        description: item.description,
        unitPrice: parseFloat(item.unitPrice),
        quantity: parseFloat(item.quantity),
        lineTotal: parseFloat(item.lineTotal)
      })),
      brandingSnapshot: {},
      createdAt: i.created_at
    });

    return res.status(200).json({
      categories: categoriesRes.rows.map(c => ({ id: c.id, businessId: c.business_id, name: c.name, description: c.description })),
      products: productsRes.rows.map(mapProduct),
      sales: salesRes.rows.map(mapSale),
      customers: customersRes.rows.map(c => ({ id: c.id, businessId: c.business_id, name: c.name, phone: c.phone_number, email: c.email, address: c.address, outstandingDebt: parseFloat(c.outstanding_debt), creditLimit: parseFloat(c.credit_limit), createdAt: c.created_at })),
      suppliers: suppliersRes.rows.map(s => ({ id: s.id, businessId: s.business_id, companyName: s.name, contactPerson: s.contact_person, phone: s.phone_number, email: s.email, address: s.address, outstandingLiability: parseFloat(s.outstanding_balance), createdAt: s.created_at })),
      invoices: invoicesRes.rows.map(mapInvoice),
      expenses: expensesRes.rows.map(e => ({ id: e.id, businessId: e.business_id, branchId: e.branch_id, category: e.category, description: e.description, amount: parseFloat(e.amount), paymentMethod: e.payment_method, expenseDate: e.date, createdAt: e.created_at })),
      stockMovements: movementsRes.rows.map(m => ({ id: m.id, businessId: m.business_id, branchId: m.branch_id, productId: m.product_id, productName: m.product_name, movementType: m.movement_type, quantityChange: parseFloat(m.quantity_change), quantityAfter: parseFloat(m.quantity_after), unitCost: parseFloat(m.unit_cost || 0), referenceNumber: m.reference_number, reason: m.reason, createdByUserId: m.created_by_user_id, createdByName: m.created_by_name, createdAt: m.created_at }))
    });
  } catch (err: any) {
    await pool.end().catch(() => {});
    console.error('API /workspace-data error:', err);
    return res.status(500).json({ error: err.message });
  }
}
