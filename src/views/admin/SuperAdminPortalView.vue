<template>
  <div class="space-y-6">
    <!-- Header with Admin Context -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <ShieldAlert class="w-6 h-6 text-emerald-600" />
          <h1 class="font-heading font-extrabold text-2xl text-tradeos-navy">TradeOS Super Admin Console</h1>
        </div>
        <p class="text-xs text-slate-500">
          Global multi-tenant governance, subscription pricing rules, tenant verification, and platform security audit logs
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          Super Admin: {{ authStore.user?.email || 'admin@tradeos.ng' }}
        </span>
      </div>
    </div>

    <!-- Live Platform KPI Overview Bar -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card-panel border-emerald-200 bg-emerald-50/40">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Active Tenants</span>
        <h3 class="font-heading font-extrabold text-2xl text-emerald-950">{{ adminStore.tenants.length }}</h3>
        <p class="text-[11px] text-emerald-700 mt-1">Multi-category workspaces</p>
      </div>

      <div class="card-panel border-emerald-200 bg-emerald-50/40">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Monthly Run-Rate (MRR)</span>
        <h3 class="font-heading font-extrabold text-2xl text-emerald-950">₦{{ adminStore.platformStats.monthlyRecurringRevenueNgn.toLocaleString() }}</h3>
        <p class="text-[11px] text-emerald-700 mt-1">Active paid subscriptions</p>
      </div>

      <div class="card-panel border-emerald-200 bg-emerald-50/40">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Infrastructure Health</span>
        <div class="flex items-center gap-2 mt-1">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <h3 class="font-heading font-extrabold text-xl text-emerald-900">100% Operational</h3>
        </div>
        <p class="text-[10px] text-slate-500 mt-1">Neon DB • Supabase • Vercel</p>
      </div>

      <div class="card-panel">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Audit Events Recorded</span>
        <h3 class="font-heading font-extrabold text-2xl text-tradeos-navy">{{ adminStore.auditLogs.length }}</h3>
        <p class="text-[11px] text-slate-500 mt-1">Immutable security trail</p>
      </div>
    </div>

    <!-- Navigation Tabs: Tenants vs Plans vs Audit Trail -->
    <div class="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
      <button 
        @click="activeTab = 'tenants'"
        class="px-4 py-2 rounded-lg transition-all"
        :class="activeTab === 'tenants' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
      >
        Registered Businesses & Tenants ({{ adminStore.tenants.length }})
      </button>
      <button 
        @click="activeTab = 'plans'"
        class="px-4 py-2 rounded-lg transition-all"
        :class="activeTab === 'plans' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
      >
        Subscription Pricing & Limits ({{ adminStore.plans.length }})
      </button>
      <button 
        @click="activeTab = 'audit'"
        class="px-4 py-2 rounded-lg transition-all"
        :class="activeTab === 'audit' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
      >
        Security Audit Trail ({{ adminStore.auditLogs.length }})
      </button>
    </div>

    <!-- TAB 1: Registered Business Tenants Table -->
    <div v-if="activeTab === 'tenants'" class="card-panel p-0 overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 class="font-heading font-bold text-base text-tradeos-navy">Tenant Workspaces & Compliance</h3>
          <p class="text-xs text-slate-500">Monitor multi-tenant activity, verification status, and subscription health</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
            <tr>
              <th class="p-3.5">Business Name & Category</th>
              <th class="p-3.5">Owner Account</th>
              <th class="p-3.5">Active Plan</th>
              <th class="p-3.5">Branches / Staff</th>
              <th class="p-3.5">Sales Volume</th>
              <th class="p-3.5">Verification</th>
              <th class="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="t in adminStore.tenants" :key="t.id" class="hover:bg-slate-50">
              <td class="p-3.5">
                <div class="font-bold text-tradeos-navy">{{ t.name }}</div>
                <div class="text-[10px] text-slate-400">{{ t.category }} • Joined {{ new Date(t.createdAt).toLocaleDateString() }}</div>
              </td>
              <td class="p-3.5 font-mono text-slate-600">{{ t.ownerEmail }}</td>
              <td class="p-3.5">
                <Badge :variant="t.subscriptionPlanId === 'plan_enterprise' ? 'navy' : t.subscriptionPlanId === 'plan_pro' ? 'success' : 'gray'">
                  {{ t.subscriptionPlanId.replace('plan_', '').toUpperCase() }}
                </Badge>
              </td>
              <td class="p-3.5 font-semibold text-slate-700">
                {{ t.branchesCount }} Outlets • {{ t.staffCount }} Staff
              </td>
              <td class="p-3.5 font-bold text-tradeos-navy">
                ₦{{ t.salesVolumeNgn.toLocaleString() }}
              </td>
              <td class="p-3.5">
                <span 
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                  :class="t.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                >
                  <component :is="t.isVerified ? CheckCircle2 : AlertCircle" class="w-3 h-3" />
                  <span>{{ t.isVerified ? 'Verified Business' : 'Unverified' }}</span>
                </span>
              </td>
              <td class="p-3.5 text-right">
                <button 
                  @click="adminStore.toggleTenantVerification(t.id)" 
                  class="btn-secondary text-[11px] py-1 px-2.5"
                >
                  <span>{{ t.isVerified ? 'Revoke Verification' : 'Verify Business' }}</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 2: Subscription Plan Controls -->
    <div v-else-if="activeTab === 'plans'" class="card-panel p-0 overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 class="font-heading font-bold text-base text-tradeos-navy">Server-Side Subscription Limits & Tiers</h3>
          <p class="text-xs text-slate-500">Configure prices, staff limits, product quotas, and feature toggles server-side</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
            <tr>
              <th class="p-3.5">Plan Name</th>
              <th class="p-3.5">Price (NGN)</th>
              <th class="p-3.5">Max Branches</th>
              <th class="p-3.5">Max Staff</th>
              <th class="p-3.5">Max Products</th>
              <th class="p-3.5">Advanced Reports</th>
              <th class="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="plan in adminStore.plans" :key="plan.id" class="hover:bg-slate-50">
              <td class="p-3.5 font-bold text-tradeos-navy">{{ plan.name }}</td>
              <td class="p-3.5 font-semibold text-emerald-700">₦{{ plan.priceNgn.toLocaleString() }}</td>
              <td class="p-3.5">{{ plan.maxBranchesPerBusiness }} Outlets</td>
              <td class="p-3.5">{{ plan.maxStaffPerBusiness }} Accounts</td>
              <td class="p-3.5">{{ plan.maxProductsPerBusiness.toLocaleString() }} Items</td>
              <td class="p-3.5">
                <Badge :variant="plan.hasAdvancedReports ? 'success' : 'gray'">
                  {{ plan.hasAdvancedReports ? 'Enabled' : 'Disabled' }}
                </Badge>
              </td>
              <td class="p-3.5 text-right">
                <button @click="openEditPlanModal(plan)" class="btn-secondary text-[11px] py-1 px-2.5">
                  <Edit3 class="w-3.5 h-3.5" />
                  <span>Configure Limits</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 3: Immutable Security Audit Trail -->
    <div v-else-if="activeTab === 'audit'" class="card-panel p-0 overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 class="font-heading font-bold text-base text-tradeos-navy">Platform Security & Governance Audit Log</h3>
          <p class="text-xs text-slate-500">Every sensitive admin action, pricing adjustment, or status override is recorded</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
            <tr>
              <th class="p-3.5">Timestamp</th>
              <th class="p-3.5">Actor</th>
              <th class="p-3.5">Action Event</th>
              <th class="p-3.5">Entity Type & ID</th>
              <th class="p-3.5">Metadata Snapshot</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-mono">
            <tr v-for="log in adminStore.auditLogs" :key="log.id" class="hover:bg-slate-50">
              <td class="p-3.5 text-slate-500">{{ new Date(log.createdAt).toLocaleString() }}</td>
              <td class="p-3.5 font-bold text-slate-800">{{ log.actorName }}</td>
              <td class="p-3.5">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                  {{ log.action }}
                </span>
              </td>
              <td class="p-3.5 text-slate-600">{{ log.entityType }}: {{ log.entityId }}</td>
              <td class="p-3.5 text-[11px] text-slate-500">{{ JSON.stringify(log.metadata) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Plan Modal -->
    <Modal :show="showEditModal" title="Configure Plan Limits & Pricing" @close="showEditModal = false">
      <form v-if="selectedPlan" @submit.prevent="handleSavePlan" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Plan Display Name *</label>
          <input v-model="selectedPlan.name" type="text" required class="input-field" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-tradeos-navy mb-1">Monthly Price (₦) *</label>
            <input v-model.number="selectedPlan.priceNgn" type="number" required class="input-field font-bold" />
          </div>

          <div>
            <label class="block font-semibold text-tradeos-navy mb-1">Max Staff Accounts *</label>
            <input v-model.number="selectedPlan.maxStaffPerBusiness" type="number" required class="input-field" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-tradeos-navy mb-1">Max Branches Outlets *</label>
            <input v-model.number="selectedPlan.maxBranchesPerBusiness" type="number" required class="input-field" />
          </div>

          <div>
            <label class="block font-semibold text-tradeos-navy mb-1">Max Products Quota *</label>
            <input v-model.number="selectedPlan.maxProductsPerBusiness" type="number" required class="input-field" />
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <input id="hasReports" v-model="selectedPlan.hasAdvancedReports" type="checkbox" class="rounded border-slate-300 text-emerald-600" />
          <label for="hasReports" class="font-semibold text-tradeos-navy">Enable Advanced Financial & Analytics Reports</label>
        </div>

        <button type="submit" class="btn-primary w-full justify-center py-2.5">Save Plan Configuration</button>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useAdminStore } from '@/stores/admin';
import type { SubscriptionPlan } from '@/types';
import Modal from '@/components/common/Modal.vue';
import Badge from '@/components/common/Badge.vue';
import { ShieldAlert, Edit3, CheckCircle2, AlertCircle } from 'lucide-vue-next';

const authStore = useAuthStore();
const adminStore = useAdminStore();

const activeTab = ref<'tenants' | 'plans' | 'audit'>('tenants');
const showEditModal = ref(false);
const selectedPlan = ref<SubscriptionPlan | null>(null);

const openEditPlanModal = (plan: SubscriptionPlan) => {
  selectedPlan.value = JSON.parse(JSON.stringify(plan));
  showEditModal.value = true;
};

const handleSavePlan = () => {
  if (selectedPlan.value) {
    adminStore.updatePlan(selectedPlan.value.id, selectedPlan.value);
    showEditModal.value = false;
  }
};
</script>
