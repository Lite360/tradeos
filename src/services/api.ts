// TradeOS API Service Client
// Authoritatively synchronizes and stores user details and businesses in Neon PostgreSQL

import type { UserProfile, Business } from '@/types';

class ApiService {
  public activeBusinessId: string | null = null;
  public activeBranchId: string | null = null;

  public setWorkspaceContext(businessId: string | null, branchId: string | null) {
    this.activeBusinessId = businessId;
    this.activeBranchId = branchId;
  }

  public async getUserByEmail(email: string): Promise<{ user: UserProfile; businesses: Business[] }> {
    const res = await fetch(`/api/sync-user?email=${encodeURIComponent(email)}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'User not found. Please register first.');
    }
    return res.json();
  }

  // Auth & Sync API - Persists directly to Neon PostgreSQL via /api/sync-user
  // This method MUST succeed for a real authenticated session. No silent fallbacks.
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

    const res = await fetch('/api/sync-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Failed to sync user profile to database');
    }

    const data = await res.json();
    return {
      user: data.user,
      businesses: data.businesses || []
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
    const res = await fetch('/api/create-business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Failed to create business workspace');
    }

    return await res.json();
  }
}

export const api = new ApiService();
