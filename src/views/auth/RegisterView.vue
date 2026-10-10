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
          <router-link 
            to="/login" 
            class="auth-tab flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all text-slate-500 hover:text-slate-800"
          >
            <LogIn class="w-3.5 h-3.5" />
            <span>Sign In</span>
          </router-link>
          <button 
            type="button" 
            class="auth-tab flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all text-emerald-700 bg-white shadow-xs"
          >
            <UserPlus class="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        <!-- Error notification banner -->
        <div v-if="authStore.error" class="auth-error flex items-center gap-2.5 p-3.5 mb-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
          <span>{{ authStore.error }}</span>
        </div>

        <!-- Form Headings -->
        <div class="panel-head mb-6">
          <h2 class="text-2xl font-heading font-bold text-slate-900 mb-1">Create your account</h2>
          <p class="text-xs text-slate-500">Join thousands of Nigerian businesses operating with TradeOS</p>
        </div>

        <!-- Register Form -->
        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- Full Name Field -->
          <div class="field">
            <label class="field-label block text-[11px] uppercase tracking-wider font-semibold text-slate-600 mb-1.5">
              Full Name
            </label>
            <div class="field-wrap relative">
              <User class="field-icon w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                v-model="fullName" 
                type="text" 
                required 
                placeholder="e.g. Babatunde Okolie" 
                class="field-input w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          <!-- Email Field -->
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
                placeholder="owner@mystore.ng" 
                class="field-input w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          <!-- Phone Number Field (InvoicePoint addition for Nigerian SMS receipts) -->
          <div class="field">
            <label class="field-label block text-[11px] uppercase tracking-wider font-semibold text-slate-600 mb-1.5">
              Phone Number (Optional)
            </label>
            <div class="field-wrap relative">
              <Phone class="field-icon w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                v-model="phoneNumber" 
                type="tel" 
                placeholder="+234 800 000 0000" 
                class="field-input w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          <!-- Dual password grid row (InvoicePoint auth-row: password + confirm) -->
          <div class="auth-row grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  minlength="6"
                  placeholder="Min 6 chars" 
                  class="field-input w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button 
                  type="button" 
                  @click="showPassword = !showPassword"
                  class="field-toggle absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  <EyeOff v-if="showPassword" class="w-3.5 h-3.5" />
                  <Eye v-else class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div class="field">
              <label class="field-label block text-[11px] uppercase tracking-wider font-semibold text-slate-600 mb-1.5">
                Confirm
              </label>
              <div class="field-wrap relative">
                <Lock class="field-icon w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input 
                  v-model="confirmPassword" 
                  :type="showPassword ? 'text' : 'password'" 
                  required 
                  minlength="6"
                  placeholder="Confirm" 
                  class="field-input w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            :disabled="authStore.isLoading" 
            class="auth-submit w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Loader2 v-if="authStore.isLoading" class="w-4 h-4 animate-spin" />
            <UserPlus v-else class="w-4 h-4" />
            <span>{{ authStore.isLoading ? 'Creating account...' : 'Create Account' }}</span>
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

        <!-- Google OAuth Sign Up Button -->
        <button 
          @click="handleGoogleSignUp" 
          type="button"
          class="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors shadow-xs"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Sign up with Google</span>
        </button>

        <!-- Terms Footnote (InvoicePoint format) -->
        <p class="auth-terms text-center text-slate-400 text-[11px] mt-4 leading-relaxed">
          By creating an account, you agree to our 
          <router-link to="/terms" class="text-emerald-600 font-semibold hover:underline">Terms of Service</router-link> 
          and 
          <router-link to="/privacy" class="text-emerald-600 font-semibold hover:underline">Privacy Policy</router-link>.
        </p>

        <!-- Sign in Footnote -->
        <p class="text-center text-xs text-slate-500 mt-6 pt-4 border-t border-slate-100">
          Already have an account? 
          <router-link to="/login" class="text-emerald-600 font-bold hover:underline">
            Sign In
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
          Zero Setup Costs. Full Authority.
        </h2>
        <p class="text-emerald-100 text-sm leading-relaxed mb-9 opacity-90">
          Create your free workspace in 60 seconds and start issuing invoices, ring up sales at the counter, and track debtors.
        </p>

        <!-- 3 Feature Cards (InvoicePoint glass pill features) -->
        <div class="auth-features space-y-3.5 text-left">
          <div class="auth-feature bg-white/15 backdrop-blur-md rounded-xl p-3.5 flex items-center gap-3.5 border border-white/15">
            <div class="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <ShieldCheck class="w-4 h-4 text-white" />
            </div>
            <div>
              <strong class="block text-xs font-bold text-white">Cloud Synced & Secure</strong>
              <span class="text-[11px] text-emerald-100">Never lose records if your device is damaged</span>
            </div>
          </div>

          <div class="auth-feature bg-white/15 backdrop-blur-md rounded-xl p-3.5 flex items-center gap-3.5 border border-white/15">
            <div class="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <Users class="w-4 h-4 text-white" />
            </div>
            <div>
              <strong class="block text-xs font-bold text-white">Staff Roles & Permissions</strong>
              <span class="text-[11px] text-emerald-100">Cashiers, managers, and accountants isolated</span>
            </div>
          </div>

          <div class="auth-feature bg-white/15 backdrop-blur-md rounded-xl p-3.5 flex items-center gap-3.5 border border-white/15">
            <div class="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles class="w-4 h-4 text-white" />
            </div>
            <div>
              <strong class="block text-xs font-bold text-white">Free Starter Plan</strong>
              <span class="text-[11px] text-emerald-100">No credit card or commitment required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { 
  LogIn, UserPlus, AlertCircle, User, Mail, 
  Phone, Lock, Eye, EyeOff, Loader2, Store, 
  ShieldCheck, Users, Sparkles 
} from 'lucide-vue-next';

const fullName = ref('');
const email = ref('');
const phoneNumber = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const authStore = useAuthStore();
const router = useRouter();

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    authStore.error = 'Passwords do not match';
    return;
  }
  if (password.value.length < 6) {
    authStore.error = 'Password must be at least 6 characters';
    return;
  }

  try {
    await authStore.registerWithEmail(email.value, fullName.value, password.value);
    router.push('/onboarding');
  } catch {}
};

const handleGoogleSignUp = async () => {
  try {
    await authStore.loginWithGoogle();
    router.push('/onboarding');
  } catch {}
};
</script>
