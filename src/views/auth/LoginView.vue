<template>
  <div class="auth-page min-h-screen flex bg-[#fbfbfc] font-sans selection:bg-emerald-500 selection:text-white">
    <!-- Left Column: Auth Form Area -->
    <div class="auth-left flex-1 flex flex-col justify-center items-center py-12 px-6 sm:px-12">
      <div class="auth-form-box w-full max-w-[420px]">
        <!-- Brand Logo -->
        <router-link to="/" class="auth-logo inline-flex items-center gap-2.5 mb-7 text-decoration-none group">
          <div class="auth-logo-mark w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-heading font-extrabold text-base shadow-sm group-hover:scale-105 transition-transform">
            TO
          </div>
          <span class="auth-logo-brand text-slate-900 text-xl font-heading font-bold">TradeOS</span>
        </router-link>

        <!-- Tabs Switcher (InvoicePoint signature segmented switcher) -->
        <div class="auth-tabs bg-slate-100 p-1 rounded-xl flex gap-1 mb-6 border border-slate-200/70">
          <button 
            type="button" 
            class="auth-tab flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all text-emerald-700 bg-white shadow-xs"
          >
            <LogIn class="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <router-link 
            to="/register" 
            class="auth-tab flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all text-slate-500 hover:text-slate-800"
          >
            <UserPlus class="w-3.5 h-3.5" />
            <span>Create Account</span>
          </router-link>
        </div>

        <!-- Error notification banner -->
        <div v-if="authStore.error" class="auth-error flex items-center gap-2.5 p-3.5 mb-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
          <span>{{ authStore.error }}</span>
        </div>

        <!-- Form Headings -->
        <div class="panel-head mb-6">
          <h2 class="text-2xl font-heading font-bold text-slate-900 mb-1">Welcome back</h2>
          <p class="text-xs text-slate-500">Enter your credentials to access your business workspace</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleEmailLogin" class="space-y-4">
          <!-- Email field with icon -->
          <div class="field">
            <label class="field-label block text-[11px] uppercase tracking-wider font-semibold text-slate-600 mb-1.5">
              Email Address
            </label>
            <div class="field-wrap relative">
              <Mail class="field-icon w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                v-model="email" 
                type="email" 
                required 
                placeholder="owner@business.ng" 
                class="field-input w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          <!-- Password field with toggle -->
          <div class="field">
            <label class="field-label block text-[11px] uppercase tracking-wider font-semibold text-slate-600 mb-1.5">
              Password
            </label>
            <div class="field-wrap relative">
              <Lock class="field-icon w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                required 
                placeholder="••••••••" 
                class="field-input w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="field-toggle absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Meta (Forgot password) -->
          <div class="auth-meta flex justify-end">
            <a href="mailto:support@tradeos.ng?subject=Reset%20Password" class="auth-forgot text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
              Forgot password?
            </a>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            :disabled="authStore.isLoading" 
            class="auth-submit w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Loader2 v-if="authStore.isLoading" class="w-4 h-4 animate-spin" />
            <LogIn v-else class="w-4 h-4" />
            <span>{{ authStore.isLoading ? 'Signing in...' : 'Sign In' }}</span>
          </button>
        </form>

        <!-- Social Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-200"></div>
          </div>
          <div class="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
            <span class="bg-[#fbfbfc] px-2">Or continue with</span>
          </div>
        </div>

        <!-- Google OAuth Button -->
        <button 
          @click="handleGoogleLogin" 
          type="button"
          class="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors shadow-xs"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <!-- Terms Footnote -->
        <p class="auth-terms text-center text-slate-400 text-xs mt-6">
          Need a new workspace? 
          <router-link to="/register" class="text-emerald-600 font-bold hover:underline">
            Register Free
          </router-link>
        </p>
      </div>
    </div>

    <!-- Right Column: InvoicePoint Gradient Feature Panel (Desktop only) -->
    <div class="auth-right hidden lg:flex flex-1 relative bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 justify-center items-center p-12 overflow-hidden text-white">
      <!-- Decorative Backdrop Circles (InvoicePoint :before / :after) -->
      <div class="absolute -top-24 -right-24 w-[480px] h-[480px] bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      <div class="absolute -bottom-20 -left-20 w-[360px] h-[360px] bg-white/[0.07] rounded-full blur-2xl pointer-events-none"></div>

      <!-- Content Box -->
      <div class="auth-right-content relative z-10 text-center max-w-[400px]">
        <!-- Glass Icon Badge -->
        <div class="auth-right-icon w-18 h-18 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-3xl mx-auto mb-6 shadow-inner border border-white/20">
          <Store class="w-8 h-8 text-white" />
        </div>

        <h2 class="text-3xl font-heading font-extrabold mb-3 leading-snug">
          Complete Business OS Made Simple
        </h2>
        <p class="text-emerald-100 text-sm leading-relaxed mb-9 opacity-90">
          Record retail counter sales, decrement stock in real time, issue thermal receipts, and keep authoritative debts ledgers.
        </p>

        <!-- 3 Feature Cards (InvoicePoint glass pill features) -->
        <div class="auth-features space-y-3.5 text-left">
          <div class="auth-feature bg-white/15 backdrop-blur-md rounded-xl p-3.5 flex items-center gap-3.5 border border-white/15">
            <div class="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <Zap class="w-4 h-4 text-white" />
            </div>
            <div>
              <strong class="block text-xs font-bold text-white">Lightning Fast POS</strong>
              <span class="text-[11px] text-emerald-100">Sell at the counter in under 10 seconds</span>
            </div>
          </div>

          <div class="auth-feature bg-white/15 backdrop-blur-md rounded-xl p-3.5 flex items-center gap-3.5 border border-white/15">
            <div class="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <PackageCheck class="w-4 h-4 text-white" />
            </div>
            <div>
              <strong class="block text-xs font-bold text-white">Multi-Unit Stock Control</strong>
              <span class="text-[11px] text-emerald-100">Carton to piece conversion & reorder alerts</span>
            </div>
          </div>

          <div class="auth-feature bg-white/15 backdrop-blur-md rounded-xl p-3.5 flex items-center gap-3.5 border border-white/15">
            <div class="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <Receipt class="w-4 h-4 text-white" />
            </div>
            <div>
              <strong class="block text-xs font-bold text-white">Accrual & Cashbook Clarity</strong>
              <span class="text-[11px] text-emerald-100">Track profit and customer debt balances</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useBusinessStore } from '@/stores/business';
import { 
  LogIn, UserPlus, AlertCircle, Mail, Lock, 
  Eye, EyeOff, Loader2, Store, Zap, 
  PackageCheck, Receipt 
} from 'lucide-vue-next';

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const authStore = useAuthStore();
const businessStore = useBusinessStore();
const router = useRouter();
const route = useRoute();

const handleEmailLogin = async () => {
  try {
    await authStore.loginWithEmail(email.value, password.value);
    businessStore.initializeWorkspaceData();
    const redirect = route.query.redirect as string || '/dashboard';
    router.push(redirect);
  } catch {}
};

const handleGoogleLogin = async () => {
  try {
    await authStore.loginWithGoogle();
    businessStore.initializeWorkspaceData();
    router.push('/dashboard');
  } catch {}
};
</script>
