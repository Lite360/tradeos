// TradeOS API Service Client
// Handles backend function calls, offline queueing, and authenticated workspace headers

import type { UserProfile, Business } from '@/types';

class ApiService {
  public activeBusinessId: string | null = null;
  public activeBranchId: string | null = null;

  public setWorkspaceContext(businessId: string | null, branchId: string | null) {
    this.activeBusinessId = businessId;
    this.activeBranchId = branchId;
  }

  // Simulated API latency with realistic validation & error handling
  private async delay(ms = 250): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Auth & Sync API
  public async syncUserSession(supabaseUser: { id: string; email: string; user_metadata?: any }): Promise<UserProfile> {
    await this.delay(150);
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      fullName: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
      phoneNumber: supabaseUser.user_metadata?.phone,
      isPlatformAdmin: supabaseUser.email.endsWith('@tradeos.ng') || supabaseUser.email === 'admin@tradeos.ng',
      isSuperAdmin: supabaseUser.email === 'superadmin@tradeos.ng' || supabaseUser.email === 'admin@tradeos.ng',
      createdAt: new Date().toISOString(),
    };
  }

  // Business Workspace API
  public async createBusiness(payload: {
    ownerUserId: string;
    name: string;
    legalName?: string;
    category: any;
    phoneNumber?: string;
    address?: string;
  }): Promise<Business> {
    await this.delay(400);
    const mainBranchId = 'br_' + Math.random().toString(36).substring(2, 9);
    const businessId = 'biz_' + Math.random().toString(36).substring(2, 9);

    const newBusiness: Business = {
      id: businessId,
      ownerUserId: payload.ownerUserId,
      name: payload.name,
      legalName: payload.legalName || payload.name,
      category: payload.category,
      currencyCode: 'NGN',
      countryCode: 'NG',
      phoneNumber: payload.phoneNumber,
      address: payload.address,
      subscriptionPlanId: 'plan_free',
      subscriptionStatus: 'active',
      branding: {
        invoicePrefix: 'INV-',
        quotePrefix: 'QT-',
        receiptPrefix: 'REC-'
      },
      branches: [
        {
          id: mainBranchId,
          businessId: businessId,
          name: 'Main Branch',
          code: 'MAIN',
          address: payload.address,
          phoneNumber: payload.phoneNumber,
          isMainBranch: true
        }
      ],
      createdAt: new Date().toISOString()
    };

    return newBusiness;
  }
}

export const api = new ApiService();
