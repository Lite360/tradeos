import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/views/onboarding/CreateBusinessView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/dashboard/DashboardOverviewView.vue'),
      meta: { requiresAuth: true, requiresBusiness: true }
    },
    {
      path: '/pos',
      name: 'pos',
      component: () => import('@/views/pos/PosView.vue'),
      meta: { requiresAuth: true, requiresBusiness: true }
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: () => import('@/views/inventory/ProductCatalogView.vue'),
      meta: { requiresAuth: true, requiresBusiness: true }
    },
    {
      path: '/invoices',
      name: 'invoices',
      component: () => import('@/views/invoices/InvoiceListView.vue'),
      meta: { requiresAuth: true, requiresBusiness: true }
    },
    {
      path: '/invoices/create',
      name: 'invoice-create',
      component: () => import('@/views/invoices/InvoiceCreateView.vue'),
      meta: { requiresAuth: true, requiresBusiness: true }
    },
    {
      path: '/debtors',
      name: 'debtors',
      component: () => import('@/views/debtors/CustomerDebtorsView.vue'),
      meta: { requiresAuth: true, requiresBusiness: true }
    },
    {
      path: '/creditors',
      name: 'creditors',
      component: () => import('@/views/creditors/SupplierCreditorsView.vue'),
      meta: { requiresAuth: true, requiresBusiness: true }
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: () => import('@/views/expenses/ExpenseCashbookView.vue'),
      meta: { requiresAuth: true, requiresBusiness: true }
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('@/views/reports/FinancialReportsView.vue'),
      meta: { requiresAuth: true, requiresBusiness: true }
    },
    {
      path: '/staff',
      name: 'staff',
      component: () => import('@/views/staff/StaffBranchView.vue'),
      meta: { requiresAuth: true, requiresBusiness: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/settings/BusinessSettingsView.vue'),
      meta: { requiresAuth: true, requiresBusiness: true }
    },
    {
      path: '/subscription',
      name: 'subscription',
      component: () => import('@/views/subscription/SubscriptionView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'super-admin',
      component: () => import('@/views/admin/SuperAdminPortalView.vue'),
      meta: { requiresAuth: true, requiresSuperAdmin: true }
    },
    {
      path: '/store',
      name: 'storefront',
      component: () => import('@/views/storefront/PublicStorefrontView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('@/views/legal/TermsView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/views/legal/PrivacyView.vue'),
      meta: { requiresAuth: false }
    }
  ]
});

// Track whether we have already initialized from the DB session this page load.
// This prevents redundant API calls on every in-app navigation.
let sessionInitialized = false;

// Auth & Business Workspace Navigation Guards
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  // On cold start (page refresh / direct URL hit), initialize from Supabase + Neon DB.
  // Skip if we already did this during the current page session.
  if (!sessionInitialized) {
    await authStore.initializeFromSession();
    sessionInitialized = true;
  }

  // Redirect unauthenticated users to login
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  // Redirect non-super-admins away from admin panel
  if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
    return next({ name: 'dashboard' });
  }

  // Redirect authenticated users without a business to onboarding
  if (to.meta.requiresBusiness && authStore.businesses.length === 0) {
    return next({ name: 'onboarding' });
  }

  // Redirect authenticated users who already have a business away from onboarding
  if (to.name === 'onboarding' && authStore.isAuthenticated && authStore.businesses.length > 0) {
    return next({ name: 'dashboard' });
  }

  next();
});

// Reset the flag on each full page load (not needed for SPA navigations)
// The flag is module-level so it resets automatically on page refresh.

export default router;
