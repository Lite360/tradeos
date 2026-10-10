import { defineStore } from 'pinia';
import type { UserProfile, Business, Branch, BusinessRole, SubscriptionPlan } from '@/types';
import { api } from '@/services/api';
import { supabase, isSupabaseConfigured } from '@/services/supabase';

interface AuthState {
  user: UserProfile | null;
  businesses: Business[];
  activeBusinessId: string | null;
  activeBranchId: string | null;
  subscriptionPlans: SubscriptionPlan[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    businesses: [],
    activeBusinessId: null,
    activeBranchId: null,
    subscriptionPlans: [
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
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }),

  getters: {
    activeBusiness(state): Business | null {
      if (!state.activeBusinessId) return null;
      return state.businesses.find(b => b.id === state.activeBusinessId) || null;
    },

    activeBranch(state): Branch | null {
      const biz = this.activeBusiness;
      if (!biz || !biz.branches || biz.branches.length === 0) return null;
      if (!state.activeBranchId) return biz.branches[0];
      return biz.branches.find(b => b.id === state.activeBranchId) || biz.branches[0];
    },

    currentRole(state): BusinessRole {
      const biz = this.activeBusiness;
      if (!biz || !state.user) return 'cashier';
      if (biz.ownerUserId === state.user.id) return 'owner';
      return 'owner';
    },

    canManageSettings(): boolean {
      return this.currentRole === 'owner';
    },

    canManageFinancials(): boolean {
      return ['owner', 'manager', 'finance'].includes(this.currentRole);
    },

    canAdjustStock(): boolean {
      return ['owner', 'manager', 'inventory'].includes(this.currentRole);
    },

    canRecordSales(): boolean {
      return ['owner', 'manager', 'finance', 'cashier'].includes(this.currentRole);
    },

    isSuperAdmin(state): boolean {
      return state.user?.isSuperAdmin || false;
    }
  },

  actions: {
    async initializeFromSession() {
      // 1. If Supabase is configured, check live auth session
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const profile = await api.syncUserSession({
              id: session.user.id,
              email: session.user.email || '',
              user_metadata: session.user.user_metadata
            });
            this.setUser(profile);
          }
        } catch (e) {
          console.warn('[SupabaseAuth] Session check failed, falling back to local storage', e);
        }
      }

      // 2. Load cached business state
      const savedUser = localStorage.getItem('tradeos_user');
      const savedBusinesses = localStorage.getItem('tradeos_businesses');
      const savedActiveBiz = localStorage.getItem('tradeos_active_biz');
      const savedActiveBranch = localStorage.getItem('tradeos_active_branch');

      if (!this.user && savedUser) {
        try {
          this.user = JSON.parse(savedUser);
          this.isAuthenticated = true;
        } catch {
          this.logout();
        }
      }

      if (savedBusinesses) {
        try {
          this.businesses = JSON.parse(savedBusinesses);
        } catch {
          this.businesses = [];
        }
      }

      if (savedActiveBiz && this.businesses.some(b => b.id === savedActiveBiz)) {
        this.activeBusinessId = savedActiveBiz;
      } else if (this.businesses.length > 0) {
        this.activeBusinessId = this.businesses[0].id;
      }

      if (savedActiveBranch) {
        this.activeBranchId = savedActiveBranch;
      } else if (this.activeBusiness?.branches?.[0]) {
        this.activeBranchId = this.activeBusiness.branches[0].id;
      }

      api.setWorkspaceContext(this.activeBusinessId, this.activeBranchId);
    },

    setUser(user: UserProfile) {
      this.user = user;
      this.isAuthenticated = true;
      localStorage.setItem('tradeos_user', JSON.stringify(user));
    },

    async registerWithEmail(email: string, fullName: string, password = 'Password123!') {
      this.isLoading = true;
      this.error = null;
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } }
          });
          if (error) throw error;
          if (data.user) {
            const profile = await api.syncUserSession({
              id: data.user.id,
              email: data.user.email || email,
              user_metadata: { full_name: fullName }
            });
            this.setUser(profile);
            return profile;
          }
        }

        // Local fallback if Supabase credentials are not populated
        const user: UserProfile = {
          id: 'usr_' + Math.random().toString(36).substring(2, 9),
          email,
          fullName,
          isPlatformAdmin: email.includes('admin'),
          isSuperAdmin: email === 'superadmin@tradeos.ng' || email === 'admin@tradeos.ng',
          createdAt: new Date().toISOString()
        };
        this.setUser(user);
        return user;
      } catch (err: any) {
        this.error = err.message || 'Registration failed';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async loginWithEmail(email: string, password = 'Password123!') {
      this.isLoading = true;
      this.error = null;
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (error) throw error;
          if (data.user) {
            const profile = await api.syncUserSession({
              id: data.user.id,
              email: data.user.email || email,
              user_metadata: data.user.user_metadata
            });
            this.setUser(profile);
            return profile;
          }
        }

        const user: UserProfile = {
          id: 'usr_' + Math.random().toString(36).substring(2, 9),
          email,
          fullName: email.split('@')[0],
          isPlatformAdmin: email.includes('admin'),
          isSuperAdmin: email === 'superadmin@tradeos.ng' || email === 'admin@tradeos.ng',
          createdAt: new Date().toISOString()
        };
        this.setUser(user);
        return user;
      } catch (err: any) {
        this.error = err.message || 'Login failed';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async loginWithGoogle() {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + '/dashboard'
          }
        });
        if (error) throw error;
        return;
      }
      return this.loginWithEmail('owner@business.ng');
    },

    async createBusiness(payload: { name: string; category: any; phoneNumber?: string; address?: string }) {
      if (!this.user) throw new Error('Authentication required');
      this.isLoading = true;
      try {
        const newBiz = await api.createBusiness({
          ownerUserId: this.user.id,
          ...payload
        });
        this.businesses.push(newBiz);
        this.setActiveBusiness(newBiz.id);
        localStorage.setItem('tradeos_businesses', JSON.stringify(this.businesses));
        return newBiz;
      } finally {
        this.isLoading = false;
      }
    },

    setActiveBusiness(businessId: string) {
      const biz = this.businesses.find(b => b.id === businessId);
      if (biz) {
        this.activeBusinessId = biz.id;
        this.activeBranchId = biz.branches?.[0]?.id || null;
        localStorage.setItem('tradeos_active_biz', biz.id);
        if (this.activeBranchId) {
          localStorage.setItem('tradeos_active_branch', this.activeBranchId);
        }
        api.setWorkspaceContext(this.activeBusinessId, this.activeBranchId);
      }
    },

    setActiveBranch(branchId: string) {
      if (this.activeBusiness?.branches.some(b => b.id === branchId)) {
        this.activeBranchId = branchId;
        localStorage.setItem('tradeos_active_branch', branchId);
        api.setWorkspaceContext(this.activeBusinessId, this.activeBranchId);
      }
    },

    logout() {
      this.user = null;
      this.isAuthenticated = false;
      this.businesses = [];
      this.activeBusinessId = null;
      this.activeBranchId = null;
      localStorage.removeItem('tradeos_user');
      localStorage.removeItem('tradeos_businesses');
      localStorage.removeItem('tradeos_active_biz');
      localStorage.removeItem('tradeos_active_branch');
      api.setWorkspaceContext(null, null);
    }
  }
});
