import { defineStore } from 'pinia';
import type { SubscriptionPlan, AuditLog, Business } from '@/types';

interface AdminState {
  plans: SubscriptionPlan[];
  auditLogs: AuditLog[];
  registeredBusinesses: Partial<Business>[];
  platformStats: {
    totalActiveBusinesses: number;
    totalRegisteredUsers: number;
    monthlyRecurringRevenue: number;
    systemHealthStatus: 'Healthy' | 'Degraded' | 'Incident';
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
    auditLogs: [],
    registeredBusinesses: [],
    platformStats: {
      totalActiveBusinesses: 1,
      totalRegisteredUsers: 1,
      monthlyRecurringRevenue: 0,
      systemHealthStatus: 'Healthy'
    },
    isLoading: false,
  }),

  actions: {
    updatePlan(planId: string, updates: Partial<SubscriptionPlan>) {
      const idx = this.plans.findIndex(p => p.id === planId);
      if (idx !== -1) {
        this.plans[idx] = { ...this.plans[idx], ...updates };
      }
    },

    logAdminAction(action: string, entityType: string, entityId: string, metadata = {}) {
      const log: AuditLog = {
        id: 'log_' + Math.random().toString(36).substring(2, 9),
        actorUserId: 'superadmin_1',
        actorName: 'Super Admin',
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
