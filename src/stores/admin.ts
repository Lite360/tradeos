import { defineStore } from 'pinia';
import type { SubscriptionPlan, AuditLog } from '@/types';

export interface PlatformTenant {
  id: string;
  name: string;
  category: string;
  ownerEmail: string;
  subscriptionPlanId: string;
  subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'suspended';
  branchesCount: number;
  staffCount: number;
  productsCount: number;
  salesVolumeNgn: number;
  isVerified: boolean;
  createdAt: string;
}

interface AdminState {
  plans: SubscriptionPlan[];
  auditLogs: AuditLog[];
  tenants: PlatformTenant[];
  platformStats: {
    totalBusinesses: number;
    activeSubscriptions: number;
    monthlyRecurringRevenueNgn: number;
    annualRunRateNgn: number;
    databaseHealth: 'Healthy' | 'Degraded' | 'Incident';
    authServiceHealth: 'Healthy' | 'Degraded' | 'Incident';
    paymentGatewayHealth: 'Healthy' | 'Degraded' | 'Incident';
  };
  isLoading: boolean;
}

export const useAdminStore = defineStore('admin', {
  state: (): AdminState => ({
    plans: [
      {
        id: 'plan_free',
        code: 'free',
        name: 'Free Starter',
        description: 'Essential business operating system for 1 workspace & single branch.',
        priceNgn: 0,
        billingInterval: 'monthly',
        maxBusinesses: 1,
        maxBranchesPerBusiness: 1,
        maxStaffPerBusiness: 2,
        maxProductsPerBusiness: 100,
        hasAdvancedReports: false,
        hasApiAccess: false,
        isActive: true,
      },
      {
        id: 'plan_pro',
        code: 'pro',
        name: 'Pro Growth',
        description: 'Multi-branch operations, expanded staff, advanced stock valuation & payment reminders.',
        priceNgn: 15000,
        billingInterval: 'monthly',
        maxBusinesses: 3,
        maxBranchesPerBusiness: 5,
        maxStaffPerBusiness: 10,
        maxProductsPerBusiness: 5000,
        hasAdvancedReports: true,
        hasApiAccess: false,
        isActive: true,
      },
      {
        id: 'plan_enterprise',
        code: 'enterprise',
        name: 'Business Group',
        description: 'Unlimited branches, staff, API access, webhooks, and priority dedicated support.',
        priceNgn: 45000,
        billingInterval: 'monthly',
        maxBusinesses: 10,
        maxBranchesPerBusiness: 25,
        maxStaffPerBusiness: 50,
        maxProductsPerBusiness: 50000,
        hasAdvancedReports: true,
        hasApiAccess: true,
        isActive: true,
      }
    ],
    auditLogs: [
      {
        id: 'log_init_01',
        actorUserId: 'usr_superadmin',
        actorName: 'Platform Super Admin',
        action: 'SUPERADMIN_INITIALIZED',
        entityType: 'PLATFORM_SECURITY',
        entityId: 'sec_tradeos_ng',
        metadata: { status: 'secure_isolated' },
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 'log_plan_02',
        actorUserId: 'usr_superadmin',
        actorName: 'Platform Super Admin',
        action: 'PRICING_RULE_APPLIED',
        entityType: 'SUBSCRIPTION_PLANS',
        entityId: 'plan_pro',
        metadata: { newPrice: 15000, currency: 'NGN' },
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ],
    tenants: [
      {
        id: 'biz_demo_01',
        name: 'Prime Heritage Supermarket',
        category: 'Supermarket',
        ownerEmail: 'manager@primeheritage.ng',
        subscriptionPlanId: 'plan_pro',
        subscriptionStatus: 'active',
        branchesCount: 2,
        staffCount: 6,
        productsCount: 420,
        salesVolumeNgn: 1450000,
        isVerified: true,
        createdAt: '2026-09-15T09:30:00Z'
      },
      {
        id: 'biz_demo_02',
        name: 'Apex Health Pharmacy & Diagnostics',
        category: 'Pharmacy',
        ownerEmail: 'pharma@apexcare.ng',
        subscriptionPlanId: 'plan_enterprise',
        subscriptionStatus: 'active',
        branchesCount: 4,
        staffCount: 12,
        productsCount: 1850,
        salesVolumeNgn: 3820000,
        isVerified: true,
        createdAt: '2026-09-22T14:15:00Z'
      },
      {
        id: 'biz_demo_03',
        name: 'Urban Threads Boutique',
        category: 'Boutique',
        ownerEmail: 'style@urbanthreads.com',
        subscriptionPlanId: 'plan_free',
        subscriptionStatus: 'active',
        branchesCount: 1,
        staffCount: 2,
        productsCount: 78,
        salesVolumeNgn: 340000,
        isVerified: false,
        createdAt: '2026-10-02T11:00:00Z'
      }
    ],
    platformStats: {
      totalBusinesses: 3,
      activeSubscriptions: 2,
      monthlyRecurringRevenueNgn: 60000,
      annualRunRateNgn: 720000,
      databaseHealth: 'Healthy',
      authServiceHealth: 'Healthy',
      paymentGatewayHealth: 'Healthy'
    },
    isLoading: false
  }),

  actions: {
    updatePlan(planId: string, updates: Partial<SubscriptionPlan>) {
      const idx = this.plans.findIndex(p => p.id === planId);
      if (idx !== -1) {
        this.plans[idx] = { ...this.plans[idx], ...updates };
        this.logAdminAction('PLAN_MODIFIED', 'SUBSCRIPTION_PLAN', planId, updates);
      }
    },

    toggleTenantVerification(tenantId: string) {
      const tenant = this.tenants.find(t => t.id === tenantId);
      if (tenant) {
        tenant.isVerified = !tenant.isVerified;
        this.logAdminAction(
          tenant.isVerified ? 'TENANT_VERIFIED' : 'TENANT_UNVERIFIED',
          'BUSINESS_TENANT',
          tenantId,
          { name: tenant.name, status: tenant.isVerified }
        );
      }
    },

    setTenantStatus(tenantId: string, status: PlatformTenant['subscriptionStatus']) {
      const tenant = this.tenants.find(t => t.id === tenantId);
      if (tenant) {
        tenant.subscriptionStatus = status;
        this.logAdminAction(
          'TENANT_STATUS_CHANGED',
          'BUSINESS_TENANT',
          tenantId,
          { name: tenant.name, status }
        );
      }
    },

    logAdminAction(action: string, entityType: string, entityId: string, metadata = {}) {
      const log: AuditLog = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        actorUserId: 'usr_superadmin',
        actorName: 'Platform Super Admin',
        action,
        entityType,
        entityId,
        metadata,
        createdAt: new Date().toISOString()
      };
      this.auditLogs.unshift(log);
    }
  }
});
