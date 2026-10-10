import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './_db';

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

  try {
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) {}
      }
      const { id, email, fullName, phoneNumber, avatarUrl } = body || {};
      if (!id || !email) {
        return res.status(400).json({ error: 'id and email are required' });
      }

      const isPlatformAdmin = email.endsWith('@tradeos.ng') || email === 'admin@tradeos.ng';
      const isSuperAdmin = email === 'admin@tradeos.ng' || email === 'superadmin@tradeos.ng';
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      // 1. Check if profile already exists by email
      const existingRes = await query(`SELECT * FROM public.profiles WHERE email = $1 LIMIT 1`, [email]);
      let profile: any;

      if (existingRes.rows.length > 0) {
        // Update existing profile
        const updateRes = await query(
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
          [fullName || email.split('@')[0], phoneNumber || null, avatarUrl || null, email]
        );
        profile = updateRes.rows[0];
      } else {
        // Insert new profile
        const insertId = isUuid.test(id) ? id : undefined;
        let insertRes;
        if (insertId) {
          insertRes = await query(
            `
            INSERT INTO public.profiles (id, email, full_name, phone_number, avatar_url, is_platform_admin, is_super_admin, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            RETURNING *;
            `,
            [insertId, email, fullName || email.split('@')[0], phoneNumber || null, avatarUrl || null, isPlatformAdmin, isSuperAdmin]
          );
        } else {
          insertRes = await query(
            `
            INSERT INTO public.profiles (email, full_name, phone_number, avatar_url, is_platform_admin, is_super_admin, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING *;
            `,
            [email, fullName || email.split('@')[0], phoneNumber || null, avatarUrl || null, isPlatformAdmin, isSuperAdmin]
          );
        }
        profile = insertRes.rows[0];
      }

      // Fetch user's businesses from Neon DB by owner_user_id OR matching profile
      const bizResult = await query(
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
        [id, profile.id]
      );

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
        businesses: bizResult.rows.map(b => ({
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
        return res.status(400).json({ error: 'userId or email is required' });
      }

      let result;
      if (email) {
        result = await query('SELECT * FROM public.profiles WHERE email = $1', [email]);
      } else {
        result = await query('SELECT * FROM public.profiles WHERE id = $1', [userId]);
      }
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User profile not found in database' });
      }

      const profile = result.rows[0];
      const bizResult = await query(
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
        businesses: bizResult.rows.map(b => ({
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

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('API /sync-user error:', err);
    return res.status(500).json({ error: err.message });
  }
}
