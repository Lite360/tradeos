import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {}
      }
      const { id, email, fullName, phoneNumber, avatarUrl } = body || {};
      if (!id || !email) {
        await pool.end().catch(() => {});
        return res.status(400).json({ error: 'id and email are required' });
      }

      const isPlatformAdmin = email.endsWith('@tradeos.ng') || email === 'admin@tradeos.ng';
      const isSuperAdmin = email === 'admin@tradeos.ng' || email === 'superadmin@tradeos.ng';
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      // 1. Check if profile already exists by email
      let profile: any;
      try {
        const existingRes = await pool.query(`SELECT * FROM public.profiles WHERE email = $1 LIMIT 1`, [email]);

        if (existingRes.rows && existingRes.rows.length > 0) {
          const updateRes = await pool.query(
            `
            UPDATE public.profiles 
            SET 
              full_name = COALESCE($1, full_name),
              phone_number = COALESCE($2, phone_number),
              avatar_url = COALESCE($3, avatar_url),
              updated_at = NOW()
            WHERE email = $4
            RETURNING *;
            `,
            [
              fullName || email.split('@')[0],
              phoneNumber || null,
              avatarUrl || null,
              email
            ]
          );
          profile = updateRes.rows[0];
        } else {
          const insertId = isUuid.test(id) ? id : undefined;
          let insertRes;
          if (insertId) {
            insertRes = await pool.query(
              `
              INSERT INTO public.profiles (id, email, full_name, phone_number, avatar_url, is_platform_admin, is_super_admin, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
              RETURNING *;
              `,
              [
                insertId,
                email,
                fullName || email.split('@')[0],
                phoneNumber || null,
                avatarUrl || null,
                isPlatformAdmin,
                isSuperAdmin
              ]
            );
          } else {
            insertRes = await pool.query(
              `
              INSERT INTO public.profiles (email, full_name, phone_number, avatar_url, is_platform_admin, is_super_admin, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, NOW())
              RETURNING *;
              `,
              [
                email,
                fullName || email.split('@')[0],
                phoneNumber || null,
                avatarUrl || null,
                isPlatformAdmin,
                isSuperAdmin
              ]
            );
          }
          profile = insertRes.rows[0];
        }
      } catch (dbErr: any) {
        console.error('Error querying/inserting profile:', dbErr);
        profile = {
          id: id,
          email: email,
          full_name: fullName || email.split('@')[0],
          phone_number: phoneNumber || null,
          avatar_url: avatarUrl || null,
          is_platform_admin: isPlatformAdmin,
          is_super_admin: isSuperAdmin,
          created_at: new Date().toISOString()
        };
      }

      // Fetch user's businesses from Neon DB by owner_user_id OR matching profile ID
      let bizRows: any[] = [];
      try {
        const queryId1 = id;
        const queryId2 = profile?.id || id;
        const bizResult = await pool.query(
          `
          SELECT b.*, 
            COALESCE(
              json_agg(
                json_build_object(
                  'id', br.id,
                  'businessId', br.business_id,
                  'name', br.name,
                  'code', br.code,
                  'address', br.address,
                  'phoneNumber', br.phone_number,
                  'isMainBranch', br.is_main
                )
              ) FILTER (WHERE br.id IS NOT NULL), '[]'
            ) as branches
          FROM public.businesses b
          LEFT JOIN public.branches br ON br.business_id = b.id
          WHERE b.owner_user_id = $1 OR b.owner_user_id = $2
          GROUP BY b.id;
          `,
          [queryId1, queryId2]
        );
        bizRows = bizResult.rows || [];
      } catch (bizErr: any) {
        console.error('Error fetching businesses:', bizErr);
      }

      await pool.end().catch(() => {});

      return res.status(200).json({
        user: {
          id: profile?.id || id,
          email: profile?.email || email,
          fullName: profile?.full_name || fullName,
          phoneNumber: profile?.phone_number || phoneNumber,
          avatarUrl: profile?.avatar_url || avatarUrl,
          isPlatformAdmin: profile?.is_platform_admin || isPlatformAdmin,
          isSuperAdmin: profile?.is_super_admin || isSuperAdmin,
          createdAt: profile?.created_at || new Date().toISOString()
        },
        businesses: bizRows.map(b => ({
          id: b.id,
          ownerUserId: b.owner_user_id,
          name: b.name,
          legalName: b.legal_name,
          category: b.category,
          currencyCode: b.currency_code,
          countryCode: b.country_code,
          phoneNumber: b.phone_number,
          address: b.address,
          subscriptionPlanId: b.subscription_plan_id,
          subscriptionStatus: b.subscription_status,
          branding: {
            invoicePrefix: b.invoice_prefix || 'INV-',
            receiptPrefix: b.receipt_prefix || 'REC-'
          },
          branches: b.branches || [],
          createdAt: b.created_at
        }))
      });
    }

    if (req.method === 'GET') {
      const { userId, email } = req.query;
      if (!userId && !email) {
        await pool.end().catch(() => {});
        return res.status(400).json({ error: 'userId or email is required' });
      }

      let result;
      if (email) {
        result = await pool.query('SELECT * FROM public.profiles WHERE email = $1', [email]);
      } else {
        result = await pool.query('SELECT * FROM public.profiles WHERE id = $1', [userId]);
      }

      if (!result.rows || result.rows.length === 0) {
        await pool.end().catch(() => {});
        return res.status(404).json({ error: 'User profile not found in database' });
      }

      const profile = result.rows[0];
      const bizResult = await pool.query(
        `
        SELECT b.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'id', br.id,
                'businessId', br.business_id,
                'name', br.name,
                'code', br.code,
                'address', br.address,
                'phoneNumber', br.phone_number,
                'isMainBranch', br.is_main
              )
            ) FILTER (WHERE br.id IS NOT NULL), '[]'
          ) as branches
        FROM public.businesses b
        LEFT JOIN public.branches br ON br.business_id = b.id
        WHERE b.owner_user_id = $1 OR b.owner_user_id = $2
        GROUP BY b.id;
        `,
        [userId || profile.id, profile.id]
      );

      await pool.end().catch(() => {});

      return res.status(200).json({
        user: {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          phoneNumber: profile.phone_number,
          avatarUrl: profile.avatar_url,
          isPlatformAdmin: profile.is_platform_admin,
          isSuperAdmin: profile.is_super_admin,
          createdAt: profile.created_at
        },
        businesses: (bizResult.rows || []).map(b => ({
          id: b.id,
          ownerUserId: b.owner_user_id,
          name: b.name,
          legalName: b.legal_name,
          category: b.category,
          currencyCode: b.currency_code,
          countryCode: b.country_code,
          phoneNumber: b.phone_number,
          address: b.address,
          subscriptionPlanId: b.subscription_plan_id,
          subscriptionStatus: b.subscription_status,
          branding: {
            invoicePrefix: b.invoice_prefix || 'INV-',
            receiptPrefix: b.receipt_prefix || 'REC-'
          },
          branches: b.branches || [],
          createdAt: b.created_at
        }))
      });
    }

    await pool.end().catch(() => {});
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    await pool.end().catch(() => {});
    console.error('API /sync-user uncaught error:', err);
    return res.status(500).json({
      error: err.message || 'Internal Server Error',
      stack: err.stack
    });
  }
}
