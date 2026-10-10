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
      // If Supabase is configured, check live auth session & fetch profile from Neon DB
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const dbData = await api.syncUserSession({
              id: session.user.id,
              email: session.user.email || '',
              user_metadata: session.user.user_metadata
            });
            this.user = dbData.user;
            this.isAuthenticated = true;
            if (dbData.businesses && dbData.businesses.length > 0) {
              this.businesses = dbData.businesses;
              this.activeBusinessId = dbData.businesses[0].id;
              this.activeBranchId = dbData.businesses[0].branches?.[0]?.id || null;
            }
            api.setWorkspaceContext(this.activeBusinessId, this.activeBranchId);
            return;
          }
        } catch (e) {
          console.warn('[Auth] Database session sync check failed:', e);
        }
      }

      // If no active session, ensure clean logged out state
      this.user = null;
      this.isAuthenticated = false;
      this.businesses = [];
      this.activeBusinessId = null;
      this.activeBranchId = null;
      api.setWorkspaceContext(null, null);
    },

    setUser(user: UserProfile) {
      this.user = user;
      this.isAuthenticated = true;
    },

    async registerWithEmail(email: string, fullName: string, password: string) {
      this.isLoading = true;
      this.error = null;
      try {
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        if (isSupabaseConfigured && supabase) {
          // Register with Supabase Auth
          const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName },
              emailRedirectTo: redirectUrl
            }
          });
          if (error) throw error;

          if (data.user) {
            // Persist profile to Neon DB (this MUST succeed)
            const dbData = await api.syncUserSession({
              id: data.user.id,
              email: data.user.email || email,
              user_metadata: { full_name: fullName }
            });
            this.setUser(dbData.user);
            if (dbData.businesses && dbData.businesses.length > 0) {
              this.businesses = dbData.businesses;
            }
            return dbData.user;
          }

          throw new Error('Registration did not return a user. Please try again.');
        }

        throw new Error('Authentication service is not configured. Please contact support.');
      } catch (err: any) {
        this.error = err.message || 'Registration failed';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async loginWithEmail(email: string, password: string) {
      this.isLoading = true;
      this.error = null;
      try {
        if (!password) {
          throw new Error('Password is required');
        }

        if (isSupabaseConfigured && supabase) {
          // Authenticate with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (error) throw error;

          if (data.user) {
            // Sync profile from Neon DB (this MUST succeed)
            const dbData = await api.syncUserSession({
              id: data.user.id,
              email: data.user.email || email,
              user_metadata: data.user.user_metadata
            });
            this.setUser(dbData.user);
            if (dbData.businesses && dbData.businesses.length > 0) {
              this.businesses = dbData.businesses;
              this.setActiveBusiness(dbData.businesses[0].id);
            }
            return dbData.user;
          }

          throw new Error('Login did not return a user. Please try again.');
        }

        throw new Error('Authentication service is not configured. Please contact support.');
      } catch (err: any) {
        // Provide user-friendly error messages for common Supabase errors
        let message = err.message || 'Login failed';
        if (message.includes('Invalid login credentials')) {
          message = 'Invalid email or password. If you don\'t have an account, please register first.';
        } else if (message.includes('Email not confirmed')) {
          message = 'Please check your email and confirm your account before signing in.';
        }
        this.error = message;
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
      throw new Error('Authentication service is not configured. Please contact support.');
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
        api.setWorkspaceContext(this.activeBusinessId, this.activeBranchId);
      }
    },

    setActiveBranch(branchId: string) {
      if (this.activeBusiness?.branches.some(b => b.id === branchId)) {
        this.activeBranchId = branchId;
        api.setWorkspaceContext(this.activeBusinessId, this.activeBranchId);
      }
    },

    upgradeSubscriptionPlan(planCode: string) {
      if (!this.activeBusiness) throw new Error('No active business workspace selected');
      const plan = this.subscriptionPlans.find(p => p.code === planCode);
      if (!plan) throw new Error('Invalid subscription plan');

      this.activeBusiness.subscriptionPlanId = plan.id;
      this.activeBusiness.subscriptionStatus = 'active';
      return plan;
    },

    async logout() {
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.warn('[Supabase] SignOut error:', e);
        }
      }
      this.user = null;
      this.isAuthenticated = false;
      this.businesses = [];
      this.activeBusinessId = null;
      this.activeBranchId = null;
      localStorage.clear();
      api.setWorkspaceContext(null, null);
    }
  }
});
