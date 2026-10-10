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
            Privacy & NDPR Compliance
          </span>
          <span class="text-xs text-slate-400">• Version 1.0</span>
        </div>
        <h1 class="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">Privacy Policy</h1>
        <p class="text-xs text-slate-500 mt-1">Effective Date: October 2026 • TradeOS Data Protection Policy (Nigeria)</p>
      </div>

      <!-- Content Sections -->
      <div class="space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <section class="space-y-2">
          <h2 class="font-heading font-bold text-base text-slate-900">1. Data Controller & Tenancy Isolation</h2>
          <p>
            TradeOS operates as a data processor for the business records you maintain within your workspace. 
            All financial entries, customer debtor names, contact information, supplier orders, and inventory catalogues are strictly tenant-isolated in Neon PostgreSQL and never cross-exposed to other businesses or unauthorised staff.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="font-heading font-bold text-base text-slate-900">2. Personal Data We Collect</h2>
          <p>
            We collect identity credentials (email address, full name, phone number) authenticated through Supabase Auth, along with workspace metadata (business name, category, tax identifiers) solely for identity verification, transaction auditability, and access control.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="font-heading font-bold text-base text-slate-900">3. Cookies & Session Storage</h2>
          <p>
            TradeOS utilizes strictly essential session cookies and local storage tokens to preserve active workspace selections, manage offline queued transactions, and prevent CSRF vulnerabilities. 
            Optional analytics cookies are loaded only upon explicit user consent via the cookie management banner.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="font-heading font-bold text-base text-slate-900">4. Nigerian Data Protection Regulation (NDPR) Rights</h2>
          <p>
            Under the NDPR, users possess the right to request full export of their business records, rectify inaccurate contact details, or request permanent workspace closure subject to mandatory statutory tax retention requirements.
          </p>
        </section>
      </div>

      <!-- Footer Note -->
      <div class="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Data protection inquiries:</span>
        <a href="mailto:privacy@tradeos.ng" class="font-bold text-emerald-600 hover:underline">privacy@tradeos.ng</a>
      </div>
    </div>
  </div>
</template>
