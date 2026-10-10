<template>
  <div class="min-h-screen bg-white font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
    <!-- Navbar (InvoicePoint style: sticky, glassmorphism blur, clean border, subtle actions) -->
    <nav class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <!-- Brand -->
        <router-link to="/" class="flex items-center gap-2.5 group">
          <div class="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-heading font-extrabold text-base shadow-sm group-hover:bg-emerald-700 transition-colors">
            TO
          </div>
          <div class="flex flex-col">
            <span class="font-heading font-extrabold text-xl text-slate-900 tracking-tight leading-none">TradeOS</span>
            <span class="text-[9px] uppercase font-bold text-slate-400 tracking-widest mt-0.5">Business OS</span>
          </div>
        </router-link>

        <!-- Center Nav Links -->
        <div class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" class="hover:text-slate-900 transition-colors">Features</a>
          <a href="#workflow" class="hover:text-slate-900 transition-colors">How It Works</a>
          <a href="#categories" class="hover:text-slate-900 transition-colors">Retail Categories</a>
          <a href="#pricing" class="hover:text-slate-900 transition-colors">Pricing</a>
          <a href="#testimonials" class="hover:text-slate-900 transition-colors">Reviews</a>
        </div>

        <!-- Auth CTAs -->
        <div class="flex items-center gap-3">
          <router-link 
            to="/login" 
            class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2 rounded-lg"
          >
            Sign In
          </router-link>
          <router-link 
            to="/register" 
            class="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Get Started Free
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Hero Section (InvoicePoint deep dark-emerald glowing gradient background + Floating Live Invoice Preview) -->
    <section class="relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white pt-20 pb-28">
      <!-- Glow orbs -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-16 left-1/4 w-96 h-96 bg-emerald-500 rounded-full opacity-10 blur-3xl"></div>
        <div class="absolute bottom-12 right-1/4 w-80 h-80 bg-teal-500 rounded-full opacity-10 blur-3xl"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-600 rounded-full opacity-[0.05] blur-3xl"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-6 text-center">
        <!-- Trust Pill -->
        <div class="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
          <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
          Trusted by 2,400+ Nigerian Retail & Wholesale Businesses
        </div>

        <!-- Main Headline -->
        <h1 class="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold leading-tight mb-6 tracking-tight max-w-5xl mx-auto">
          Run Your Business. <br class="hidden sm:inline" />
          <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
            Know Your Numbers.
          </span>
          Grow With Confidence.
        </h1>

        <!-- Subheadline -->
        <p class="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          The all-in-one business operating system for Nigerian retail. Consolidate sales, stock, invoices, customer debts, supplier bills, and cashbooks into one reliable workspace.
        </p>

        <!-- CTAs -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <router-link 
            to="/register" 
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02]"
          >
            Start Free Today
            <ArrowRight class="w-4 h-4" />
          </router-link>
          <a 
            href="#pricing" 
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold text-base px-8 py-3.5 rounded-xl border border-white/15 transition-all"
          >
            See Transparent Pricing
          </a>
        </div>

        <!-- Floating Live Invoice / Document Card Preview (InvoicePoint Hero Signature) -->
        <div class="max-w-4xl mx-auto transform hover:-translate-y-1 transition-transform duration-300">
          <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-left text-slate-800">
            <!-- Window header bar -->
            <div class="bg-slate-50 border-b border-slate-100 px-6 py-3.5 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-rose-400"></span>
                <span class="w-3 h-3 rounded-full bg-amber-400"></span>
                <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
                <span class="ml-2 text-xs font-mono text-slate-400">tradeos-pos.local/terminal</span>
              </div>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                <span class="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                LIVE COUNTER
              </span>
            </div>

            <!-- Invoice preview contents -->
            <div class="p-6 sm:p-8 space-y-6">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                    TO
                  </div>
                  <div>
                    <h3 class="font-heading font-extrabold text-base text-slate-900">Alhaji & Sons Enterprise</h3>
                    <p class="text-xs text-slate-400">Balogun Market, Lagos Island • Receipt #RCP-2026-0842</p>
                  </div>
                </div>
                <div class="text-right">
                  <span class="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
                    PAID • INSTANT SETTLEMENT
                  </span>
                </div>
              </div>

              <!-- 3 Column summary grid -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                <div>
                  <p class="text-slate-400 font-medium mb-1">Customer / Debtor</p>
                  <p class="font-bold text-slate-900 text-sm">Madam Kemi Stores</p>
                  <p class="text-slate-500">Walk-in Wholesale Customer</p>
                </div>
                <div>
                  <p class="text-slate-400 font-medium mb-1">Payment Method</p>
                  <p class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Bank Transfer (Verified)
                  </p>
                  <p class="text-slate-500">Processed by Cashier Funke</p>
                </div>
                <div class="sm:text-right">
                  <p class="text-slate-400 font-medium mb-1">Total Settled</p>
                  <p class="font-heading font-extrabold text-2xl text-emerald-600">₦485,000.00</p>
                  <span class="text-[11px] text-emerald-600 font-semibold">✓ Inventory Stock Updated Instantly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Ticker Bar (InvoicePoint Style) -->
    <section class="bg-slate-900 border-y border-slate-800 text-white py-10 px-6">
      <div class="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div v-for="s in metrics" :key="s.label" class="space-y-1">
          <p class="text-3xl sm:text-4xl font-heading font-extrabold text-emerald-400">{{ s.value }}</p>
          <p class="text-xs sm:text-sm text-slate-400 font-medium">{{ s.label }}</p>
        </div>
      </div>
    </section>

    <!-- 6 Features Grid (InvoicePoint 3x2 Grid Cards with large icons & clean typography) -->
    <section id="features" class="py-24 bg-slate-50/60 border-b border-slate-100">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <p class="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-3">Everything you need</p>
          <h2 class="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 mb-4 tracking-tight">
            Built for Nigerian Businesses
          </h2>
          <p class="text-base text-slate-500">
            From single retail shops to multi-branch operations — TradeOS has every tool you need to operate with confidence.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="feat in platformFeatures" 
            :key="feat.title" 
            class="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group"
          >
            <div class="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100/60 flex items-center justify-center text-3xl mb-6 group-hover:bg-emerald-100/80 transition-colors">
              {{ feat.icon }}
            </div>
            <h3 class="text-lg font-heading font-bold text-slate-900 mb-2">{{ feat.title }}</h3>
            <p class="text-sm text-slate-500 leading-relaxed">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 4 Step Workflow Timeline (InvoicePoint "How It Works" Stepper) -->
    <section id="workflow" class="py-24 bg-white border-b border-slate-100">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <p class="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-3">Simple workflow</p>
          <h2 class="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 mb-4 tracking-tight">
            How TradeOS Operates
          </h2>
          <p class="text-base text-slate-500">Four straightforward steps from initial setup to authoritative financial clarity.</p>
        </div>

        <div class="grid md:grid-cols-4 gap-8 relative">
          <!-- Connecting line for desktop -->
          <div class="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200"></div>

          <div 
            v-for="step in workflowSteps" 
            :key="step.step" 
            class="text-center relative flex flex-col items-center"
          >
            <!-- Circular Icon Step Icon -->
            <div class="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center text-3xl mb-6 shadow-lg shadow-emerald-600/20 relative z-10">
              {{ step.icon }}
            </div>
            <div 
              class="absolute top-0 w-7 h-7 rounded-full bg-white border-2 border-emerald-600 text-emerald-700 text-xs font-bold flex items-center justify-center z-20"
              style="top: -4px; right: calc(50% - 46px);"
            >
              {{ step.step }}
            </div>
            <h3 class="text-base font-heading font-bold text-slate-900 mb-2">{{ step.title }}</h3>
            <p class="text-xs text-slate-500 leading-relaxed max-w-xs">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Retail Categories Supported Grid -->
    <section id="categories" class="py-20 bg-slate-50 border-b border-slate-100">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <p class="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-3">Multi-Category Support</p>
          <h2 class="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 mb-3">
            Built for Nigerian Retail Primitives
          </h2>
          <p class="text-slate-500 text-sm">
            Tailored stock unit conversions, expiry batches, and barcode workflows for diverse merchant sectors.
          </p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div v-for="cat in categories" :key="cat.name" class="bg-white p-4 rounded-xl border border-slate-200/80 text-center shadow-xs hover:border-emerald-300 transition-colors">
            <div class="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
              <component :is="cat.icon" class="w-5 h-5" />
            </div>
            <h4 class="font-heading font-bold text-xs text-slate-900 mb-1">{{ cat.name }}</h4>
            <p class="text-[10px] text-slate-500">{{ cat.units }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section (InvoicePoint Card Elevation & Emerald Accents) -->
    <section id="pricing" class="py-24 bg-white border-b border-slate-100">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <p class="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-3">Transparent Plans</p>
          <h2 class="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 mb-3">
            Simple, Predictable Pricing
          </h2>
          <p class="text-slate-500 text-sm">Start free, upgrade as your business adds branches and cashiers.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            v-for="plan in authStore.subscriptionPlans" 
            :key="plan.id" 
            class="bg-white rounded-2xl p-8 border border-slate-200/90 flex flex-col justify-between transition-all hover:shadow-lg relative"
            :class="plan.code === 'pro' ? 'border-2 border-emerald-600 shadow-md ring-4 ring-emerald-50' : ''"
          >
            <!-- Most Popular Badge -->
            <div 
              v-if="plan.code === 'pro'" 
              class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-emerald-600 text-white text-[10px] font-extrabold uppercase rounded-full tracking-wider shadow-sm"
            >
              Most Popular
            </div>

            <div>
              <h3 class="font-heading font-bold text-xl text-slate-900 mb-2">{{ plan.name }}</h3>
              <p class="text-xs text-slate-500 mb-6 leading-relaxed">{{ plan.description }}</p>

              <div class="mb-6 pb-6 border-b border-slate-100">
                <span class="font-heading font-extrabold text-4xl text-slate-900">
                  {{ plan.priceNgn === 0 ? 'Free' : `₦${plan.priceNgn.toLocaleString()}` }}
                </span>
                <span v-if="plan.priceNgn > 0" class="text-xs text-slate-500 font-semibold"> / month</span>
              </div>

              <ul class="space-y-3.5 text-xs text-slate-600 mb-8">
                <li class="flex items-center gap-2.5">
                  <Check class="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Up to <strong>{{ plan.maxBusinesses }}</strong> Business Workspace(s)</span>
                </li>
                <li class="flex items-center gap-2.5">
                  <Check class="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Up to <strong>{{ plan.maxBranchesPerBusiness }}</strong> Branch(es) per business</span>
                </li>
                <li class="flex items-center gap-2.5">
                  <Check class="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Up to <strong>{{ plan.maxStaffPerBusiness }}</strong> Staff Accounts</span>
                </li>
                <li class="flex items-center gap-2.5">
                  <Check class="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Up to <strong>{{ plan.maxProductsPerBusiness.toLocaleString() }}</strong> Stock Items</span>
                </li>
                <li v-if="plan.hasAdvancedReports" class="flex items-center gap-2.5">
                  <Check class="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Advanced Margin & Stock Valuation Reports</span>
                </li>
              </ul>
            </div>

            <router-link 
              to="/register" 
              class="w-full py-3 rounded-xl font-semibold text-xs flex items-center justify-center transition-colors shadow-sm"
              :class="plan.code === 'pro' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'"
            >
              Select {{ plan.name }}
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Customer Reviews / Testimonials (InvoicePoint Dark Slate Star Cards) -->
    <section id="testimonials" class="py-24 bg-slate-950 text-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <p class="text-emerald-400 font-semibold text-xs uppercase tracking-widest mb-3">Real merchant results</p>
          <h2 class="text-3xl sm:text-4xl font-heading font-extrabold text-white mb-4">
            Trusted by Retailers Across Nigeria
          </h2>
          <p class="text-slate-400 text-sm">See how business owners eliminated notebook confusion with TradeOS.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div 
            v-for="rev in testimonials" 
            :key="rev.name" 
            class="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition-colors"
          >
            <div class="flex text-amber-400 text-sm mb-4 tracking-wider">
              ★★★★★
            </div>
            <p class="text-slate-300 text-sm leading-relaxed mb-8">
              "{{ rev.quote }}"
            </p>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-emerald-600">
                {{ rev.avatar }}
              </div>
              <div>
                <p class="font-semibold text-white text-sm">{{ rev.name }}</p>
                <p class="text-slate-400 text-xs">{{ rev.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom Full Width CTA Banner (InvoicePoint Signature Emerald Gradient) -->
    <section class="py-24 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
      <div class="max-w-3xl mx-auto px-6 text-center">
        <h2 class="text-4xl sm:text-5xl font-heading font-extrabold mb-6 tracking-tight">
          Ready to Modernize Your Business?
        </h2>
        <p class="text-lg text-emerald-100 mb-10 leading-relaxed font-normal">
          Join thousands of merchants taking control of daily revenue, stock inventory, debts, and cashbooks today.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <router-link 
            to="/register" 
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-emerald-800 text-base font-bold px-8 py-4 rounded-xl transition-all hover:bg-emerald-50 shadow-xl"
          >
            Start Free Today →
          </router-link>
          <a 
            href="#pricing" 
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500/30 hover:bg-emerald-500/40 text-white text-base font-semibold px-8 py-4 rounded-xl border border-white/20 transition-all"
          >
            See Pricing
          </a>
        </div>
        <p class="text-xs text-emerald-200 mt-6">
          No credit card required • Free to start • Instant cloud sync
        </p>
      </div>
    </section>

    <!-- Comprehensive Footer with Quick Links Section (Requested by User) -->
    <footer class="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-white/10 text-xs">
      <div class="max-w-7xl mx-auto px-6">
        <!-- Main Footer Columns -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <!-- Column 1: Brand Info -->
          <div class="col-span-2 space-y-4">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-heading font-bold text-sm">
                TO
              </div>
              <span class="font-heading font-bold text-white text-lg">TradeOS</span>
            </div>
            <p class="text-slate-400 leading-relaxed max-w-sm">
              The modern business operating system and commerce platform built specifically for Nigerian retail and growing enterprises.
            </p>
            <div class="flex items-center gap-2 text-slate-500">
              <ShieldCheck class="w-4 h-4 text-emerald-500" />
              <span>Compliant with NDPR & authoritative accounting standards.</span>
            </div>
          </div>

          <!-- Column 2: Quick Links (Primary navigation links) -->
          <div>
            <h4 class="font-heading font-bold text-white text-sm mb-4 tracking-wide uppercase">Quick Links</h4>
            <ul class="space-y-2.5">
              <li><router-link to="/pos" class="hover:text-white transition-colors">Point of Sale (POS)</router-link></li>
              <li><router-link to="/inventory" class="hover:text-white transition-colors">Products & Stock</router-link></li>
              <li><router-link to="/invoices" class="hover:text-white transition-colors">Invoices & Receipts</router-link></li>
              <li><router-link to="/debtors" class="hover:text-white transition-colors">Customer Debtors</router-link></li>
              <li><router-link to="/creditors" class="hover:text-white transition-colors">Supplier Creditors</router-link></li>
              <li><router-link to="/expenses" class="hover:text-white transition-colors">Expense Cashbook</router-link></li>
            </ul>
          </div>

          <!-- Column 3: Platform & Features -->
          <div>
            <h4 class="font-heading font-bold text-white text-sm mb-4 tracking-wide uppercase">Features</h4>
            <ul class="space-y-2.5">
              <li><a href="#features" class="hover:text-white transition-colors">Offline POS Resilience</a></li>
              <li><a href="#workflow" class="hover:text-white transition-colors">Instant Receipt Generator</a></li>
              <li><a href="#categories" class="hover:text-white transition-colors">Multi-Unit Conversions</a></li>
              <li><router-link to="/reports" class="hover:text-white transition-colors">Financial Reports</router-link></li>
              <li><router-link to="/staff" class="hover:text-white transition-colors">Staff Role Permissions</router-link></li>
              <li><router-link to="/subscription" class="hover:text-white transition-colors">Branch Expansion</router-link></li>
            </ul>
          </div>

          <!-- Column 4: Legal & Account -->
          <div>
            <h4 class="font-heading font-bold text-white text-sm mb-4 tracking-wide uppercase">Account & Legal</h4>
            <ul class="space-y-2.5">
              <li><router-link to="/login" class="hover:text-white transition-colors">Account Sign In</router-link></li>
              <li><router-link to="/register" class="hover:text-white transition-colors">Create Free Account</router-link></li>
              <li><router-link to="/pricing" class="hover:text-white transition-colors">Subscription Pricing</router-link></li>
              <li><router-link to="/terms" class="hover:text-white transition-colors">Terms of Service</router-link></li>
              <li><router-link to="/privacy" class="hover:text-white transition-colors">Privacy Policy</router-link></li>
            </ul>
          </div>
        </div>

        <!-- Bottom Copyright Row -->
        <div class="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-slate-500">
            © {{ new Date().getFullYear() }} TradeOS Technologies. All rights reserved. Built for Nigeria.
          </p>
          <div class="flex items-center gap-6">
            <router-link to="/terms" class="hover:text-white transition-colors">Terms</router-link>
            <router-link to="/privacy" class="hover:text-white transition-colors">Privacy</router-link>
            <router-link to="/login" class="hover:text-white transition-colors">Sign In</router-link>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { 
  ArrowRight, ShieldCheck, Check, ShoppingBag, 
  Tv, Shirt, Utensils, Sparkles, Box 
} from 'lucide-vue-next';

const authStore = useAuthStore();

const metrics = [
  { label: 'Registered Businesses', value: '2,400+' },
  { label: 'Transactions Processed', value: '180K+' },
  { label: 'Sales Volume Tracked', value: '₦2.1B+' },
  { label: 'Hours Saved Monthly', value: '10K+ hrs' }
];

const platformFeatures = [
  {
    icon: '🧾',
    title: 'Fast Point of Sale & Receipts',
    desc: 'Rapid walk-in retail sales, barcode search, thermal receipt printing, and verified payment tenders.'
  },
  {
    icon: '📦',
    title: 'Real-Time Inventory Tracking',
    desc: 'Auto-decrementing stock, multi-unit conversions (cartons to pieces), and reorder alerts.'
  },
  {
    icon: '💳',
    title: 'Debtors & Creditors Ledger',
    desc: 'Authoritative customer credit balances, payment timelines, and supplier purchase bills.'
  },
  {
    icon: '📋',
    title: 'Branded Invoices & Quotations',
    desc: 'Professional PDF invoices with your business logo, custom payment instructions, and terms.'
  },
  {
    icon: '📊',
    title: 'Accrual & Cash Flow Reports',
    desc: 'Clean gross margin, cost of goods sold, daily cash reconciliation, and operating profit reports.'
  },
  {
    icon: '📱',
    title: 'Installable PWA & Multi-Branch',
    desc: 'Install directly on phones or desktops. Manage multiple shops and staff with role-based access.'
  }
];

const workflowSteps = [
  {
    step: '1',
    icon: '✍️',
    title: 'Register & Setup',
    desc: 'Create your account, register your business name, and set default stock categories.'
  },
  {
    step: '2',
    icon: '📦',
    title: 'Add Your Products',
    desc: 'Input cost prices, selling prices, barcode IDs, and opening quantity on hand.'
  },
  {
    step: '3',
    icon: '🧾',
    title: 'Record Sales & Invoices',
    desc: 'Ring up sales at the counter, print thermal receipts, or send PDF invoices to customers.'
  },
  {
    step: '4',
    icon: '💰',
    title: 'Track Performance',
    desc: 'View real-time profit, customer debt collection, and cash in drawer with one click.'
  }
];

const categories = [
  { name: 'Provision Shops', units: 'Cartons, Packs, Pcs', icon: ShoppingBag },
  { name: 'Electronics Dealers', units: 'Serial Nos & Warranty', icon: Tv },
  { name: 'Fashion Retailers', units: 'Sizes & Colors', icon: Shirt },
  { name: 'Foodstuff Retailers', units: 'Kg, Bags, Bulk', icon: Utensils },
  { name: 'Cosmetics Retail', units: 'Expiry & Batches', icon: Sparkles },
  { name: 'General Goods', units: 'Configurable Units', icon: Box }
];

const testimonials = [
  {
    name: 'Adaeze Okonkwo',
    role: 'Fashion Boutique Owner, Lagos',
    avatar: 'A',
    quote: 'TradeOS completely transformed how we track inventory. We went from lost sales in notebooks to having our entire store in sync with one click.'
  },
  {
    name: 'Emeka Nwosu',
    role: 'Electronics Wholesaler, Alaba',
    avatar: 'E',
    quote: 'The customer debtors ledger is unmatched. We know exactly who owes what, and our receipts look extremely professional to our clients.'
  },
  {
    name: 'Funmi Adeleke',
    role: 'Supermarket Manager, Abuja',
    avatar: 'F',
    quote: 'Finally a Nigerian business OS that understands multi-unit cartons and walk-in sales. The thermal receipt and daily cashbook save us hours.'
  }
];
</script>
