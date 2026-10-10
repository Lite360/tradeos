<template>
  <div class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-500 selection:text-white">
    <div class="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-8">
      <!-- Header -->
      <div class="border-b border-slate-100 pb-6">
        <router-link to="/" class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline mb-3">
          ← Back to Home
        </router-link>
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            Legal Agreement
          </span>
          <span class="text-xs text-slate-400">• Version 1.0</span>
        </div>
        <h1 class="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">Terms of Service</h1>
        <p class="text-xs text-slate-500 mt-1">Effective Date: October 2026 • TradeOS Business Operating System (Nigeria)</p>
      </div>

      <!-- Content Sections -->
      <div class="space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <section class="space-y-2">
          <h2 class="font-heading font-bold text-base text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By creating an account, accessing, or using TradeOS ("the Service"), you agree to be bound by these Terms of Service. 
            If you represent a registered business or partnership, you confirm that you possess the authority to bind that entity to these Terms.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="font-heading font-bold text-base text-slate-900">2. Authoritative Records & Integrity Standard</h2>
          <p>
            TradeOS is engineered as an authoritative operating system for commerce. You agree to enter only genuine business transactions, authentic inventory counts, real customer debtors, and verified expenses. 
            TradeOS strictly prohibits the fabrication of turnover figures, falsified invoice totals, or fraudulent transactional records.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="font-heading font-bold text-base text-slate-900">3. Workspace Tenancy & Multi-Branch Access</h2>
          <p>
            Each business workspace is tenant-isolated. You are solely responsible for maintaining the confidentiality of your staff login credentials, enforcing branch-specific role permissions, and reviewing cashier transaction privileges.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="font-heading font-bold text-base text-slate-900">4. Subscriptions, Payments & Entitlements</h2>
          <p>
            Paid subscriptions (Pro and Enterprise) activate exclusively upon confirmed server-side payment verification through approved payment gateways. 
            Upon subscription expiration, your business records are preserved and never held hostage; access reverts to read-only or Free starter tier limits without data deletion.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="font-heading font-bold text-base text-slate-900">5. Limitation of Liability</h2>
          <p>
            TradeOS provides record-keeping, point of sale, stock conversion primitives, and financial reporting. TradeOS does not replace accredited statutory auditing, certified tax consultancy, or legal advisory.
          </p>
        </section>
      </div>

      <!-- Footer Note -->
      <div class="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Questions about our terms?</span>
        <a href="mailto:legal@tradeos.ng" class="font-bold text-emerald-600 hover:underline">legal@tradeos.ng</a>
      </div>
    </div>
  </div>
</template>
