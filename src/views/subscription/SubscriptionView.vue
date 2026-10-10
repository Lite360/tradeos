<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading font-extrabold text-2xl text-tradeos-navy">Subscription Plans & Entitlements</h1>
        <p class="text-xs text-slate-500 mt-1">
          Active Plan: <strong class="text-tradeos-blue uppercase font-extrabold">{{ currentPlan.name }}</strong> • Status: <span class="text-emerald-600 font-bold">Active</span>
        </p>
      </div>
    </div>

    <!-- Alert Banner on Verification -->
    <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
      <div class="flex items-center gap-3">
        <ShieldCheck class="w-5 h-5 text-tradeos-blue shrink-0" />
        <p class="text-slate-700">
          <strong>Server-Verified Billing Architecture:</strong> Subscriptions activate through Paystack inline payment verification. Plan limits are strictly enforced server-side.
        </p>
      </div>
    </div>

    <!-- Plan Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div 
        v-for="plan in authStore.subscriptionPlans" 
        :key="plan.id" 
        class="card-panel flex flex-col justify-between"
        :class="plan.code === 'pro' ? 'border-2 border-tradeos-blue shadow-md relative' : ''"
      >
        <div v-if="plan.code === 'pro'" class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-tradeos-blue text-white text-[10px] font-extrabold uppercase rounded-full">
          Recommended for Growing Stores
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-heading font-bold text-lg text-tradeos-navy">{{ plan.name }}</h3>
            <Badge :variant="currentPlan.code === plan.code ? 'success' : 'info'">
              {{ currentPlan.code === plan.code ? 'Active' : 'Upgrade' }}
            </Badge>
          </div>
          <p class="text-xs text-slate-500 mb-4 leading-relaxed">{{ plan.description }}</p>

          <div class="mb-6">
            <span class="font-heading font-extrabold text-3xl text-tradeos-navy">
              {{ plan.priceNgn === 0 ? 'Free' : `₦${plan.priceNgn.toLocaleString()}` }}
            </span>
            <span v-if="plan.priceNgn > 0" class="text-xs text-slate-500 font-semibold"> / month</span>
          </div>

          <ul class="space-y-2.5 text-xs text-slate-600 mb-6">
            <li class="flex items-center gap-2">
              <Check class="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Up to {{ plan.maxBusinesses }} Business Workspace(s)</span>
            </li>
            <li class="flex items-center gap-2">
              <Check class="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Up to {{ plan.maxBranchesPerBusiness }} Branch(es)</span>
            </li>
            <li class="flex items-center gap-2">
              <Check class="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Up to {{ plan.maxStaffPerBusiness }} Staff Accounts</span>
            </li>
            <li class="flex items-center gap-2">
              <Check class="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Up to {{ plan.maxProductsPerBusiness.toLocaleString() }} Products</span>
            </li>
            <li class="flex items-center gap-2">
              <Check class="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{{ plan.hasAdvancedReports ? 'Advanced Analytics & P&L' : 'Basic Sales Reports' }}</span>
            </li>
          </ul>
        </div>

        <button 
          @click="initiateSubscription(plan)" 
          :disabled="currentPlan.code === plan.code"
          class="btn-primary w-full justify-center"
          :class="currentPlan.code === plan.code ? 'opacity-70 bg-slate-200 text-slate-600 border-none cursor-default hover:bg-slate-200' : ''"
        >
          <CreditCard class="w-4 h-4" />
          <span>{{ currentPlan.code === plan.code ? 'Current Plan' : `Upgrade to ${plan.name}` }}</span>
        </button>
      </div>
    </div>

    <!-- Verification Gateway Modal -->
    <Modal :show="showPayModal" title="Initiate Paystack Plan Payment" @close="showPayModal = false">
      <div v-if="selectedPlan" class="space-y-4 text-xs">
        <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div class="font-bold text-tradeos-navy text-sm">{{ selectedPlan.name }}</div>
          <div class="text-[11px] text-slate-500">Billing Amount: <strong>₦{{ selectedPlan.priceNgn.toLocaleString() }} / month</strong></div>
        </div>

        <p class="text-slate-600">
          Payment will be processed via Paystack. Upon verified authorization, your workspace entitlements (branches, staff limit, product catalog capacity) will be instantly unlocked.
        </p>

        <div v-if="paymentSuccessMsg" class="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-semibold">
          {{ paymentSuccessMsg }}
        </div>

        <button @click="confirmPaymentCheckout" class="btn-primary w-full justify-center py-2.5">
          <ExternalLink class="w-4 h-4" />
          <span>Pay with Paystack (₦{{ selectedPlan.priceNgn.toLocaleString() }})</span>
        </button>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { SubscriptionPlan } from '@/types';
import Modal from '@/components/common/Modal.vue';
import Badge from '@/components/common/Badge.vue';
import { openPaystackSubscriptionCheckout } from '@/services/paystack';
import { ShieldCheck, Check, CreditCard, ExternalLink } from 'lucide-vue-next';

const authStore = useAuthStore();
const showPayModal = ref(false);
const selectedPlan = ref<SubscriptionPlan | null>(null);
const paymentSuccessMsg = ref('');

const currentPlan = computed(() => {
  const planId = authStore.activeBusiness?.subscriptionPlanId || 'plan_free';
  return authStore.subscriptionPlans.find(p => p.id === planId) || authStore.subscriptionPlans[0];
});

const initiateSubscription = (plan: SubscriptionPlan) => {
  selectedPlan.value = plan;
  paymentSuccessMsg.value = '';
  showPayModal.value = true;
};

const confirmPaymentCheckout = () => {
  if (!selectedPlan.value) return;

  const userEmail = authStore.user?.email || 'billing@tradeos.ng';
  const businessId = authStore.activeBusiness?.id || 'biz_active';

  openPaystackSubscriptionCheckout({
    email: userEmail,
    amountNgn: selectedPlan.value.priceNgn,
    planName: selectedPlan.value.name,
    planCode: selectedPlan.value.code,
    businessId,
    onSuccess: (resp) => {
      authStore.upgradeSubscriptionPlan(selectedPlan.value!.code);
      paymentSuccessMsg.value = `Payment verified! Reference: ${resp.reference}. Your subscription has been successfully updated to ${selectedPlan.value!.name}.`;
      setTimeout(() => {
        showPayModal.value = false;
      }, 1800);
    },
    onClose: () => {
      console.log('Payment modal closed');
    }
  });
};
</script>
