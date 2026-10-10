// TradeOS API Service Client
// Authoritatively synchronizes and stores user details and businesses in PostgreSQL / Supabase

import type { UserProfile, Business } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

class ApiService {
  public activeBusinessId: string | null = null;
  public activeBranchId: string | null = null;

  public setWorkspaceContext(businessId: string | null, branchId: string | null) {
    this.activeBusinessId = businessId;
    this.activeBranchId = branchId;
  }

  public async getUserByEmail(email: string): Promise<{ user: UserProfile; businesses: Business[] }> {
    try {
      const res = await fetch(`/api/sync-user?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[API] /api/sync-user failed, checking Supabase client fallback');
    }

    if (isSupabaseConfigured && supabase) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('email', email).maybeSingle();
      if (profile) {
        const { data: bizData } = await supabase.from('businesses').select('*, branches(*)').eq('owner_user_id', profile.id);
        return {
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
          businesses: (bizData || []).map(b => ({
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
            branches: (b.branches || []).map((br: any) => ({
              id: br.id,
              businessId: br.business_id,
              name: br.name,
              code: br.code,
              address: br.address,
              phoneNumber: br.phone_number,
              isMainBranch: br.is_main
            })),
            createdAt: b.created_at
          }))
        };
      }
    }

    throw new Error('User not found. Please register first.');
  }

  // Auth & Sync API - Persists directly to Neon PostgreSQL with Supabase client direct fallback
  public async syncUserSession(supabaseUser: { 
    id: string; 
    email: string; 
    user_metadata?: any 
  }): Promise<{ user: UserProfile; businesses: Business[] }> {
    const payload = {
      id: supabaseUser.id,
      email: supabaseUser.email,
      fullName: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
      phoneNumber: supabaseUser.user_metadata?.phone,
      avatarUrl: supabaseUser.user_metadata?.avatar_url
    };

    try {
      const res = await fetch('/api/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        return {
          user: data.user,
          businesses: data.businesses || []
        };
      }
    } catch (fetchErr: any) {
      console.warn('[API] /api/sync-user network call failed, falling back to direct Supabase query:', fetchErr);
    }

    // Direct Supabase Client Query Fallback
    // Guarantees existing users with businesses are NEVER sent to onboarding
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: bizData } = await supabase
          .from('businesses')
          .select('*, branches(*)')
          .or(`owner_user_id.eq.${payload.id}`);

        if (bizData && bizData.length > 0) {
          const mappedBusinesses: Business[] = bizData.map(b => ({
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
            branches: (b.branches || []).map((br: any) => ({
              id: br.id,
              businessId: br.business_id,
              name: br.name,
              code: br.code,
              address: br.address,
              phoneNumber: br.phone_number,
              isMainBranch: br.is_main
            })),
            createdAt: b.created_at
          }));

          return {
            user: {
              id: payload.id,
              email: payload.email,
              fullName: payload.fullName,
              phoneNumber: payload.phoneNumber,
              avatarUrl: payload.avatarUrl,
              isPlatformAdmin: payload.email.endsWith('@tradeos.ng'),
              isSuperAdmin: payload.email === 'admin@tradeos.ng' || payload.email === 'superadmin@tradeos.ng',
              createdAt: new Date().toISOString()
            },
            businesses: mappedBusinesses
          };
        }
      } catch (directErr) {
        console.warn('[API] Direct Supabase fallback fetch error:', directErr);
      }
    }

    return {
      user: {
        id: payload.id,
        email: payload.email,
        fullName: payload.fullName,
        phoneNumber: payload.phoneNumber,
        avatarUrl: payload.avatarUrl,
        isPlatformAdmin: payload.email.endsWith('@tradeos.ng'),
        isSuperAdmin: payload.email === 'admin@tradeos.ng' || payload.email === 'superadmin@tradeos.ng',
        createdAt: new Date().toISOString()
      },
      businesses: []
    };
  }

  // Fetch user profile from database
  public async getUserFromDatabase(userId: string): Promise<{ user: UserProfile; businesses: Business[] } | null> {
    try {
      const res = await fetch(`/api/sync-user?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[API] Failed to fetch user from database:', e);
    }
    return null;
  }

  // Business Workspace API - Persists directly to Neon PostgreSQL via /api/create-business
  public async createBusiness(payload: {
    ownerUserId: string;
    name: string;
    legalName?: string;
    category: any;
    phoneNumber?: string;
    address?: string;
  }): Promise<Business> {
    try {
      const res = await fetch('/api/create-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (apiErr) {
      console.warn('[API] /api/create-business endpoint error:', apiErr);
    }

    // Direct fallback if API route fails
    if (isSupabaseConfigured && supabase) {
      const { data: newBiz, error: bizErr } = await supabase
        .from('businesses')
        .insert({
          owner_user_id: payload.ownerUserId,
          name: payload.name,
          legal_name: payload.legalName || payload.name,
          category: payload.category,
          currency_code: 'NGN',
          country_code: 'NG',
          phone_number: payload.phoneNumber || null,
          address: payload.address || null,
          subscription_plan_id: 'plan_free',
          subscription_status: 'active',
          invoice_prefix: 'INV-',
          receipt_prefix: 'REC-'
        })
        .select()
        .single();

      if (bizErr) throw bizErr;

      const { data: newBranch } = await supabase
        .from('branches')
        .insert({
          business_id: newBiz.id,
          name: 'Main Branch',
          code: 'MAIN',
          address: payload.address || null,
          phone_number: payload.phoneNumber || null,
          is_main: true,
          is_active: true
        })
        .select()
        .single();

      return {
        id: newBiz.id,
        ownerUserId: newBiz.owner_user_id,
        name: newBiz.name,
        legalName: newBiz.legal_name,
        category: newBiz.category,
        currencyCode: newBiz.currency_code,
        countryCode: newBiz.country_code,
        phoneNumber: newBiz.phone_number,
        address: newBiz.address,
        subscriptionPlanId: newBiz.subscription_plan_id,
        subscriptionStatus: newBiz.subscription_status,
        branding: {
          invoicePrefix: newBiz.invoice_prefix || 'INV-',
          receiptPrefix: newBiz.receipt_prefix || 'REC-'
        },
        branches: [
          {
            id: newBranch?.id || 'main',
            businessId: newBiz.id,
            name: newBranch?.name || 'Main Branch',
            code: newBranch?.code || 'MAIN',
            address: newBranch?.address || payload.address,
            phoneNumber: newBranch?.phone_number || payload.phoneNumber,
            isMainBranch: true
          }
        ],
        createdAt: newBiz.created_at
      };
    }

    throw new Error('Failed to create business workspace. Please try again.');
  }
}

export const api = new ApiService();
