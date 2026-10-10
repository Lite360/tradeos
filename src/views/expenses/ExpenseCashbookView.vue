<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading font-extrabold text-2xl text-tradeos-navy">Income, Expenses & Cashbook</h1>
        <p class="text-xs text-slate-500 mt-1">Record business operating expenses, restock costs, and cashbook transactions</p>
      </div>

      <button @click="showAddModal = true" class="btn-primary text-xs">
        <Plus class="w-4 h-4" />
        <span>Record Expense</span>
      </button>
    </div>

    <!-- Summary Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="card-panel border-amber-200 bg-amber-50/40">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total Monthly Expenses</span>
        <h3 class="font-heading font-extrabold text-2xl text-amber-900">
          ₦{{ businessStore.dashboardSummary.totalExpensesMonth.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}
        </h3>
        <p class="text-[11px] text-slate-500 mt-1">Recorded operational expenses this calendar month</p>
      </div>

      <div class="card-panel">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total Expenses Logged</span>
        <h3 class="font-heading font-extrabold text-2xl text-tradeos-navy">{{ businessStore.expenses.length }}</h3>
        <p class="text-[11px] text-slate-500 mt-1">Audited expense entries in cashbook</p>
      </div>
    </div>

    <!-- Expenses Table -->
    <div class="card-panel p-0 overflow-hidden">
      <div v-if="businessStore.expenses.length > 0" class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
            <tr>
              <th class="p-3.5">Date</th>
              <th class="p-3.5">Category</th>
              <th class="p-3.5">Description</th>
              <th class="p-3.5">Payment Method</th>
              <th class="p-3.5 text-right">Amount (₦)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="e in businessStore.expenses" :key="e.id" class="hover:bg-slate-50">
              <td class="p-3.5 font-medium text-slate-600">{{ e.expenseDate }}</td>
              <td class="p-3.5">
                <Badge variant="warning" class="uppercase text-[9px]">{{ e.category }}</Badge>
              </td>
              <td class="p-3.5 font-medium text-tradeos-navy">{{ e.description }}</td>
              <td class="p-3.5 text-slate-600 capitalize">{{ e.paymentMethod.replace('_', ' ') }}</td>
              <td class="p-3.5 text-right font-bold text-rose-700">
                ₦{{ e.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState 
        v-else
        title="No Expenses Recorded"
        description="Log store rent, electricity, logistics, salaries, and restock costs for accurate net profit reporting."
        action-label="Record First Expense"
        :icon="Wallet"
        @action="showAddModal = true"
      />
    </div>

    <!-- Create Expense Modal -->
    <Modal :show="showAddModal" title="Record Expense Entry" @close="showAddModal = false">
      <form @submit.prevent="handleCreateExpense" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Expense Category *</label>
          <select v-model="category" required class="input-field">
            <option value="rent">Shop / Store Rent</option>
            <option value="utilities">Electricity / Generator Fuel / Water</option>
            <option value="salaries">Staff Salaries & Allowances</option>
            <option value="logistics">Logistics & Transportation</option>
            <option value="restock">Inventory Restock Cost</option>
            <option value="other">Miscellaneous / Other</option>
          </select>
        </div>

        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Amount (₦) *</label>
          <input v-model.number="amount" type="number" required min="1" step="0.01" class="input-field font-bold text-sm" />
        </div>

        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Payment Method *</label>
          <select v-model="paymentMethod" required class="input-field">
            <option value="cash">Cash Paid</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="card">Debit Card</option>
          </select>
        </div>

        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Description / Note *</label>
          <input v-model="description" type="text" required placeholder="e.g. Fuel for generator (20 liters)" class="input-field" />
        </div>

        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Date *</label>
          <input v-model="expenseDate" type="date" required class="input-field" />
        </div>

        <button type="submit" class="btn-primary w-full justify-center">Log Expense</button>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useBusinessStore } from '@/stores/business';
import type { Expense } from '@/types';
import Modal from '@/components/common/Modal.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import Badge from '@/components/common/Badge.vue';
import { Plus, Wallet } from 'lucide-vue-next';

const businessStore = useBusinessStore();

const showAddModal = ref(false);

const category = ref<Expense['category']>('utilities');
const amount = ref(0);
const paymentMethod = ref('cash');
const description = ref('');
const expenseDate = ref(new Date().toISOString().split('T')[0]);

const handleCreateExpense = () => {
  businessStore.recordExpense({
    category: category.value,
    amount: amount.value,
    paymentMethod: paymentMethod.value,
    description: description.value,
    expenseDate: expenseDate.value
  });
  showAddModal.value = false;
  amount.value = 0; description.value = '';
};
</script>
