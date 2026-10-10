import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

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

  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    'postgresql://neondb_owner:npg_SJGitRN3VC7d@ep-small-shape-b73kbp1m-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require';

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }
    const { ownerUserId, name, legalName, category, phoneNumber, address } = body || {};
    if (!ownerUserId || !name || !category) {
      await pool.end().catch(() => {});
      return res.status(400).json({ error: 'ownerUserId, name, and category are required' });
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let resolvedOwnerId = ownerUserId;
    if (!isUuid.test(resolvedOwnerId)) {
      const existingProf = await pool.query(`SELECT id FROM public.profiles LIMIT 1`);
      if (existingProf.rows.length > 0) {
        resolvedOwnerId = existingProf.rows[0].id;
      } else {
        const newProf = await pool.query(
          `INSERT INTO public.profiles (email, full_name, updated_at) VALUES ($1, $2, NOW()) RETURNING id`,
          [`owner_${Date.now()}@tradeos.app`, 'Workspace Owner']
        );
        resolvedOwnerId = newProf.rows[0].id;
      }
    } else {
      const profCheck = await pool.query(`SELECT id FROM public.profiles WHERE id = $1`, [resolvedOwnerId]);
      if (profCheck.rows.length === 0) {
        await pool.query(
          `INSERT INTO public.profiles (id, email, full_name, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (email) DO NOTHING`,
          [resolvedOwnerId, `user_${resolvedOwnerId.slice(0, 8)}@tradeos.app`, 'Workspace Owner']
        );
      }
    }

    // 1. Create Business
    const bizRes = await pool.query(
      `
      INSERT INTO public.businesses (
        owner_user_id, name, legal_name, category, currency_code, country_code,
        phone_number, address, subscription_plan_id, subscription_status,
        invoice_prefix, receipt_prefix
      )
      VALUES ($1, $2, $3, $4, 'NGN', 'NG', $5, $6, 'plan_free', 'active', 'INV-', 'REC-')
      RETURNING *;
      `,
      [resolvedOwnerId, name, legalName || name, category, phoneNumber || null, address || null]
    );

    const business = bizRes.rows[0];

    // 2. Create Default Main Branch
    const branchRes = await pool.query(
      `
      INSERT INTO public.branches (business_id, name, code, address, phone_number, is_main, is_active)
      VALUES ($1, 'Main Branch', 'MAIN', $2, $3, true, true)
      RETURNING *;
      `,
      [business.id, address || null, phoneNumber || null]
    );

    const branch = branchRes.rows[0];

    await pool.end().catch(() => {});

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
    await pool.end().catch(() => {});
    console.error('API /create-business error:', err);
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
}
