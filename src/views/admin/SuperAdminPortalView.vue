<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <ShieldCheck class="w-5 h-5 text-indigo-600" />
          <h1 class="font-heading font-extrabold text-2xl text-tradeos-navy">TradeOS Platform Super Admin</h1>
        </div>
        <p class="text-xs text-slate-500">Platform-wide configuration, subscription pricing rules, feature entitlements, and security audit logs</p>
      </div>

      <span class="badge badge-navy text-xs py-1 px-3">
        Super Admin Session: {{ authStore.user?.email }}
      </span>
    </div>

    <!-- Platform Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div class="card-panel border-indigo-200 bg-indigo-50/30">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Registered Workspaces</span>
        <h3 class="font-heading font-extrabold text-2xl text-indigo-900">{{ authStore.businesses.length || 1 }}</h3>
        <p class="text-[11px] text-slate-500 mt-1">Authoritative business tenants</p>
      </div>

      <div class="card-panel border-emerald-200 bg-emerald-50/30">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">System Health Status</span>
        <h3 class="font-heading font-extrabold text-2xl text-emerald-800">Operational</h3>
        <p class="text-[11px] text-slate-500 mt-1">Neon DB & Vercel Functions online</p>
      </div>

      <div class="card-panel border-amber-200 bg-amber-50/30">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Active Subscription Plans</span>
        <h3 class="font-heading font-extrabold text-2xl text-amber-900">{{ adminStore.plans.length }}</h3>
        <p class="text-[11px] text-slate-500 mt-1">Free, Pro, Enterprise tiers</p>
      </div>

      <div class="card-panel">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Audit Events Logged</span>
        <h3 class="font-heading font-extrabold text-2xl text-tradeos-navy">{{ adminStore.auditLogs.length }}</h3>
        <p class="text-[11px] text-slate-500 mt-1">Security & admin action trail</p>
      </div>
    </div>

    <!-- Subscription Plans Pricing Control Panel -->
    <div class="card-panel">
      <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div>
          <h3 class="font-heading font-bold text-base text-tradeos-navy">Subscription Plan Configuration</h3>
          <p class="text-xs text-slate-500">Configure prices, staff limits, product quotas, and feature toggles server-side</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
            <tr>
              <th class="p-3">Plan Name</th>
              <th class="p-3">Price (NGN)</th>
              <th class="p-3">Max Staff</th>
              <th class="p-3">Max Products</th>
              <th class="p-3">Advanced Reports</th>
              <th class="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="plan in adminStore.plans" :key="plan.id" class="hover:bg-slate-50">
              <td class="p-3 font-bold text-tradeos-navy">{{ plan.name }}</td>
              <td class="p-3 font-semibold">₦{{ plan.priceNgn.toLocaleString() }}</td>
              <td class="p-3">{{ plan.maxStaffPerBusiness }} Staff</td>
              <td class="p-3">{{ plan.maxProductsPerBusiness.toLocaleString() }} Items</td>
              <td class="p-3">
                <Badge :variant="plan.hasAdvancedReports ? 'success' : 'gray'">
                  {{ plan.hasAdvancedReports ? 'Enabled' : 'Disabled' }}
                </Badge>
              </td>
              <td class="p-3 text-right">
                <button @click="openEditPlanModal(plan)" class="btn-secondary text-[11px] py-1 px-2">
                  <Edit3 class="w-3 h-3" />
                  <span>Edit Plan</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Plan Modal -->
    <Modal :show="showEditModal" title="Edit Subscription Plan Controls" @close="showEditModal = false">
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

        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Max Products Quota *</label>
          <input v-model.number="selectedPlan.maxProductsPerBusiness" type="number" required class="input-field" />
        </div>

        <button type="submit" class="btn-primary w-full justify-center">Save Plan Changes</button>
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
import { ShieldCheck, Edit3 } from 'lucide-vue-next';

const authStore = useAuthStore();
const adminStore = useAdminStore();

const showEditModal = ref(false);
const selectedPlan = ref<SubscriptionPlan | null>(null);

const openEditPlanModal = (plan: SubscriptionPlan) => {
  selectedPlan.value = JSON.parse(JSON.stringify(plan));
  showEditModal.value = true;
};

const handleSavePlan = () => {
  if (selectedPlan.value) {
    adminStore.updatePlan(selectedPlan.value.id, selectedPlan.value);
    adminStore.logAdminAction('EDIT_PLAN_PRICE', 'SUBSCRIPTION_PLAN', selectedPlan.value.id, { price: selectedPlan.value.priceNgn });
    showEditModal.value = false;
  }
};
</script>
