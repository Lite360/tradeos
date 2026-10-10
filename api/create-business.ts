import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ownerUserId, name, legalName, category, phoneNumber, address } = req.body;
    if (!ownerUserId || !name || !category) {
      return res.status(400).json({ error: 'ownerUserId, name, and category are required' });
    }

    // 1. Create Business
    const bizRes = await query(
      `
      INSERT INTO public.businesses (
        owner_user_id, name, legal_name, category, currency_code, country_code,
        phone_number, address, subscription_plan_id, subscription_status,
        invoice_prefix, receipt_prefix
      )
      VALUES ($1, $2, $3, $4, 'NGN', 'NG', $5, $6, 'plan_free', 'active', 'INV-', 'REC-')
      RETURNING *;
      `,
      [ownerUserId, name, legalName || name, category, phoneNumber || null, address || null]
    );

    const business = bizRes.rows[0];

    // 2. Create Default Main Branch
    const branchRes = await query(
      `
      INSERT INTO public.branches (business_id, name, code, address, phone_number, is_main, is_active)
      VALUES ($1, 'Main Branch', 'MAIN', $2, $3, true, true)
      RETURNING *;
      `,
      [business.id, address || null, phoneNumber || null]
    );

    const branch = branchRes.rows[0];

    return res.status(200).json({
      id: business.id,
      ownerUserId: business.owner_user_id,
      name: business.name,
      legalName: business.legal_name,
      category: business.category,
      currencyCode: business.currency_code,
      countryCode: business.country_code,
      phoneNumber: business.phone_number,
      address: business.address,
      subscriptionPlanId: business.subscription_plan_id,
      subscriptionStatus: business.subscription_status,
      branding: {
        invoicePrefix: business.invoice_prefix || 'INV-',
        receiptPrefix: business.receipt_prefix || 'REC-'
      },
      branches: [
        {
          id: branch.id,
          businessId: branch.business_id,
          name: branch.name,
          code: branch.code,
          address: branch.address,
          phoneNumber: branch.phone_number,
          isMainBranch: branch.is_main
        }
      ],
      createdAt: business.created_at
    });
  } catch (err: any) {
    console.error('API /create-business error:', err);
    return res.status(500).json({ error: err.message });
  }
}
