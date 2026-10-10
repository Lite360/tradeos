<template>
  <div class="space-y-6">
    <!-- Header banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading font-extrabold text-2xl text-tradeos-navy">
          Workspace Dashboard — {{ authStore.activeBusiness?.name }}
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Branch: <strong class="text-tradeos-navy">{{ authStore.activeBranch?.name }}</strong> • 
          Category: <span class="capitalize font-semibold text-tradeos-blue">{{ authStore.activeBusiness?.category }} Retail</span>
        </p>
      </div>

      <div class="flex items-center gap-2">
        <router-link to="/pos" class="btn-primary text-xs">
          <ShoppingCart class="w-4 h-4" />
          <span>Launch POS Counter</span>
        </router-link>
        <router-link to="/inventory" class="btn-secondary text-xs">
          <Package class="w-4 h-4" />
          <span>Manage Stock</span>
        </router-link>
      </div>
    </div>

    <!-- 4 Core Performance Stat Cards (Strictly computed from actual DB records) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        label="Today's Sales Revenue" 
        :value="summary.totalSalesToday" 
        :is-currency="true"
        variant="emerald"
        :icon="ShoppingBag"
        :subtitle="`${summary.salesCountToday} Sale(s) Recorded Today`"
      />

      <StatCard 
        label="Cash Collected Today" 
        :value="summary.totalCashCollectedToday" 
        :is-currency="true"
        variant="emerald"
        :icon="Wallet"
        subtitle="Confirmed Received Cash"
      />

      <StatCard 
        label="Customer Debt (Owed to You)" 
        :value="summary.outstandingCustomerDebts" 
        :is-currency="true"
        variant="amber"
        :icon="Users"
        subtitle="Outstanding Credit Sales"
        :badge-text="summary.outstandingCustomerDebts > 0 ? 'Collectable' : 'Clean'"
      />

      <StatCard 
        label="Stock Inventory Valuation" 
        :value="summary.totalInventoryValuation" 
        :is-currency="true"
        variant="navy"
        :icon="Boxes"
        :subtitle="`${summary.lowStockItemsCount} Item(s) at Reorder Level`"
      />
    </div>

    <!-- Low Stock Alert Banner (If any) -->
    <div v-if="businessStore.lowStockProducts.length > 0" class="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-amber-100 text-amber-800">
          <AlertTriangle class="w-5 h-5" />
        </div>
        <div>
          <h4 class="font-heading font-bold text-xs text-amber-900">Low Stock Warning</h4>
          <p class="text-[11px] text-amber-700">
            {{ businessStore.lowStockProducts.length }} product(s) have reached or fallen below their low-stock threshold.
          </p>
        </div>
      </div>
      <router-link to="/inventory" class="btn-secondary text-xs py-1.5 px-3 border-amber-300 text-amber-900 bg-white">
        Restock Items
      </router-link>
    </div>

    <!-- Main Content Grid: Recent Sales & Quick Shortcuts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Sales Activity Table -->
      <div class="lg:col-span-2 card-panel">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-heading font-bold text-base text-tradeos-navy">Recent Sales Transactions</h3>
            <p class="text-xs text-slate-500">Real-time receipts from this branch</p>
          </div>
          <router-link to="/pos" class="text-xs font-bold text-tradeos-blue hover:underline">View All Sales</router-link>
        </div>

        <div v-if="businessStore.sales.length > 0" class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th class="p-3">Receipt #</th>
                <th class="p-3">Customer</th>
                <th class="p-3">Method</th>
                <th class="p-3">Status</th>
                <th class="p-3 text-right">Total (₦)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="sale in businessStore.sales.slice(0, 5)" :key="sale.id" class="hover:bg-slate-50">
                <td class="p-3 font-mono font-bold text-tradeos-navy">{{ sale.receiptNumber }}</td>
                <td class="p-3 font-medium text-slate-700">{{ sale.customerName || 'Walk-in Customer' }}</td>
                <td class="p-3 capitalize text-slate-600">{{ sale.paymentMethod.replace('_', ' ') }}</td>
                <td class="p-3">
                  <Badge :variant="sale.paymentStatus === 'paid' ? 'success' : sale.paymentStatus === 'partially_paid' ? 'warning' : 'danger'">
                    {{ sale.paymentStatus.replace('_', ' ') }}
                  </Badge>
                </td>
                <td class="p-3 text-right font-bold text-tradeos-navy">
                  ₦{{ sale.totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <EmptyState 
          v-else
          title="No Sales Recorded Yet"
          description="Your business workspace is active. Add products to inventory and record your first sale in the POS counter."
          action-label="Open POS Counter"
          :icon="ShoppingCart"
          @action="router.push('/pos')"
        />
      </div>

      <!-- Quick Operations Sidebar Panel -->
      <div class="space-y-4">
        <div class="card-panel">
          <h3 class="font-heading font-bold text-base text-tradeos-navy mb-3">Quick Actions</h3>
          <div class="space-y-2 text-xs">
            <router-link to="/pos" class="w-full btn-primary justify-start py-2.5">
              <ShoppingCart class="w-4 h-4" />
              <span>Record POS Sale</span>
            </router-link>
            <router-link to="/inventory" class="w-full btn-secondary justify-start py-2.5">
              <PlusCircle class="w-4 h-4 text-tradeos-blue" />
              <span>Add New Product</span>
            </router-link>
            <router-link to="/invoices/create" class="w-full btn-secondary justify-start py-2.5">
              <FileText class="w-4 h-4 text-tradeos-blue" />
              <span>Create Customer Invoice</span>
            </router-link>
            <router-link to="/expenses" class="w-full btn-secondary justify-start py-2.5">
              <Wallet class="w-4 h-4 text-amber-600" />
              <span>Record Expense Entry</span>
            </router-link>
          </div>
        </div>

        <!-- Supplier & Debtor Snapshot -->
        <div class="card-panel">
          <h3 class="font-heading font-bold text-sm text-tradeos-navy mb-3">Financial Balances Snapshot</h3>
          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60">
              <div>
                <span class="text-slate-600 font-medium block">Total Customer Debt</span>
                <span class="font-heading font-bold text-amber-900 text-sm">₦{{ summary.outstandingCustomerDebts.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}</span>
              </div>
              <router-link to="/debtors" class="text-amber-800 hover:underline font-bold text-[11px]">Manage</router-link>
            </div>

            <div class="flex items-center justify-between p-2.5 rounded-lg bg-rose-50/70 border border-rose-200/60">
              <div>
                <span class="text-slate-600 font-medium block">Total Supplier Liabilities</span>
                <span class="font-heading font-bold text-rose-900 text-sm">₦{{ summary.totalSupplierLiabilities.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}</span>
              </div>
              <router-link to="/creditors" class="text-rose-800 hover:underline font-bold text-[11px]">Manage</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useBusinessStore } from '@/stores/business';
import StatCard from '@/components/common/StatCard.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import Badge from '@/components/common/Badge.vue';
import { 
  ShoppingCart, Package, ShoppingBag, Wallet, 
  Users, Boxes, AlertTriangle, FileText, PlusCircle 
} from 'lucide-vue-next';

const authStore = useAuthStore();
const businessStore = useBusinessStore();
const router = useRouter();

const summary = computed(() => businessStore.dashboardSummary);
</script>
