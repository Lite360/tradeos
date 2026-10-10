<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading font-extrabold text-2xl text-tradeos-navy">Financial & Operational Reports</h1>
        <p class="text-xs text-slate-500 mt-1">
          Branch: <strong class="text-tradeos-navy">{{ authStore.activeBranch?.name }}</strong> • 
          Currency: <strong class="text-tradeos-navy">NGN (₦)</strong> • 
          Calculation Basis: <span class="font-semibold text-tradeos-blue">Accrual & Cash Basis Split</span>
        </p>
      </div>

      <button @click="triggerPrint" class="btn-secondary text-xs">
        <Printer class="w-4 h-4" />
        <span>Export Report PDF</span>
      </button>
    </div>

    <!-- Metric Calculations Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card-panel border-emerald-200 bg-emerald-50/30">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Gross Revenue (Accrual)</span>
        <h3 class="font-heading font-extrabold text-2xl text-tradeos-navy">
          ₦{{ totalRevenue.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}
        </h3>
        <p class="text-[10px] text-slate-500 mt-1">Total value of all sales issued (including credit)</p>
      </div>

      <div class="card-panel border-emerald-200 bg-emerald-50/30">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Actual Cash Collected</span>
        <h3 class="font-heading font-extrabold text-2xl text-emerald-800">
          ₦{{ totalCashCollected.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}
        </h3>
        <p class="text-[10px] text-slate-500 mt-1">Confirmed payments received in cash, card, or transfer</p>
      </div>

      <div class="card-panel border-amber-200 bg-amber-50/30">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Uncollected Customer Debt</span>
        <h3 class="font-heading font-extrabold text-2xl text-amber-900">
          ₦{{ businessStore.totalCustomerDebt.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}
        </h3>
        <p class="text-[10px] text-slate-500 mt-1">Outstanding credit sales awaiting collection</p>
      </div>

      <div class="card-panel border-slate-300">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Stock Inventory Valuation</span>
        <h3 class="font-heading font-extrabold text-2xl text-tradeos-navy">
          ₦{{ businessStore.totalInventoryValuation.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}
        </h3>
        <p class="text-[10px] text-slate-500 mt-1">Cost valuation of items currently on hand</p>
      </div>
    </div>

    <!-- Profit & Loss Summary -->
    <div class="card-panel">
      <h3 class="font-heading font-bold text-base text-tradeos-navy mb-4 border-b border-slate-100 pb-2">
        Estimated Profit & Loss Summary (Current Period)
      </h3>

      <div class="space-y-3 text-xs max-w-lg">
        <div class="flex justify-between py-1.5">
          <span class="text-slate-600 font-medium">Gross Sales Revenue:</span>
          <span class="font-bold text-tradeos-navy">₦{{ totalRevenue.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}</span>
        </div>
        <div class="flex justify-between py-1.5">
          <span class="text-slate-600 font-medium">Less: Cost of Goods Sold (COGS):</span>
          <span class="font-bold text-slate-700">- ₦{{ totalCOGS.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}</span>
        </div>
        <div class="flex justify-between py-2 border-t border-slate-200 font-bold text-tradeos-navy">
          <span>Gross Operating Profit:</span>
          <span class="text-tradeos-blue">₦{{ (totalRevenue - totalCOGS).toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}</span>
        </div>
        <div class="flex justify-between py-1.5">
          <span class="text-slate-600 font-medium">Less: Operating Expenses Logged:</span>
          <span class="font-bold text-rose-700">- ₦{{ totalExpenses.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}</span>
        </div>
        <div class="flex justify-between py-3 border-t-2 border-tradeos-navy font-heading font-extrabold text-sm text-tradeos-navy">
          <span>Estimated Net Business Income:</span>
          <span :class="(totalRevenue - totalCOGS - totalExpenses) >= 0 ? 'text-emerald-700' : 'text-rose-700'">
            ₦{{ (totalRevenue - totalCOGS - totalExpenses).toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useBusinessStore } from '@/stores/business';
import { Printer } from 'lucide-vue-next';

const authStore = useAuthStore();
const businessStore = useBusinessStore();

const totalRevenue = computed(() => {
  return businessStore.sales.reduce((sum, s) => sum + s.totalAmount, 0);
});

const totalCashCollected = computed(() => {
  return businessStore.sales.reduce((sum, s) => sum + s.amountPaid, 0);
});

const totalCOGS = computed(() => {
  return businessStore.sales.reduce((sum, s) => {
    const saleCOGS = s.items.reduce((itemSum, item) => itemSum + (item.unitCostSnapshot * item.quantity), 0);
    return sum + saleCOGS;
  }, 0);
});

const totalExpenses = computed(() => {
  return businessStore.expenses.reduce((sum, e) => sum + e.amount, 0);
});

const triggerPrint = () => {
  window.print();
};
</script>
