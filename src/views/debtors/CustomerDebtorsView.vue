<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading font-extrabold text-2xl text-tradeos-navy">Customers & Debtors Ledger</h1>
        <p class="text-xs text-slate-500 mt-1">Track customer contact profiles, credit balances, due dates and debt repayments</p>
      </div>

      <button @click="showAddModal = true" class="btn-primary text-xs">
        <Plus class="w-4 h-4" />
        <span>Add Customer</span>
      </button>
    </div>

    <!-- Summary Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="card-panel border-amber-200 bg-amber-50/40">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total Customer Debt Owed</span>
        <h3 class="font-heading font-extrabold text-2xl text-amber-900">
          ₦{{ businessStore.totalCustomerDebt.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}
        </h3>
        <p class="text-[11px] text-slate-500 mt-1">Accounts Receivable balance across all customers</p>
      </div>

      <div class="card-panel">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total Registered Customers</span>
        <h3 class="font-heading font-extrabold text-2xl text-tradeos-navy">{{ businessStore.customers.length }}</h3>
        <p class="text-[11px] text-slate-500 mt-1">Active customer profiles in workspace</p>
      </div>
    </div>

    <!-- Customer Table -->
    <div class="card-panel p-0 overflow-hidden">
      <div v-if="businessStore.customers.length > 0" class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
            <tr>
              <th class="p-3.5">Customer Name</th>
              <th class="p-3.5">Phone Number</th>
              <th class="p-3.5">Email / Address</th>
              <th class="p-3.5">Outstanding Debt (₦)</th>
              <th class="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="c in businessStore.customers" :key="c.id" class="hover:bg-slate-50">
              <td class="p-3.5 font-bold text-tradeos-navy">{{ c.name }}</td>
              <td class="p-3.5 text-slate-600">{{ c.phone || 'N/A' }}</td>
              <td class="p-3.5 text-slate-500">{{ c.email || c.address || 'N/A' }}</td>
              <td class="p-3.5 font-heading font-extrabold" :class="(c.outstandingDebt || 0) > 0 ? 'text-amber-700' : 'text-slate-700'">
                ₦{{ (c.outstandingDebt || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}
              </td>
              <td class="p-3.5 text-right">
                <button v-if="(c.outstandingDebt || 0) > 0" @click="openPaymentModal(c)" class="btn-primary text-[11px] py-1 px-2.5">
                  <CreditCard class="w-3 h-3" />
                  <span>Record Repayment</span>
                </button>
                <span v-else class="text-[11px] text-slate-400 italic">No debt</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState 
        v-else
        title="No Customers Registered"
        description="Add customer profiles to record credit sales, send statements and collect debt payments."
        action-label="Add First Customer"
        :icon="Users"
        @action="showAddModal = true"
      />
    </div>

    <!-- Create Customer Modal -->
    <Modal :show="showAddModal" title="Create Customer Profile" @close="showAddModal = false">
      <form @submit.prevent="handleCreateCustomer" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Customer / Business Name *</label>
          <input v-model="name" type="text" required placeholder="e.g. Alhassan Traders" class="input-field" />
        </div>
        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Phone Number</label>
          <input v-model="phone" type="text" placeholder="e.g. 0802 999 8888" class="input-field" />
        </div>
        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Email Address</label>
          <input v-model="email" type="email" placeholder="customer@mail.com" class="input-field" />
        </div>
        <button type="submit" class="btn-primary w-full justify-center">Save Customer Profile</button>
      </form>
    </Modal>

    <!-- Record Debt Repayment Modal -->
    <Modal :show="showPaymentModal" title="Record Debt Repayment" @close="showPaymentModal = false">
      <form v-if="selectedCust" @submit.prevent="handleRecordRepayment" class="space-y-4 text-xs">
        <div class="p-3 rounded-lg bg-amber-50 border border-amber-200">
          <div class="font-bold text-amber-900 text-sm">{{ selectedCust.name }}</div>
          <div class="text-[11px] text-amber-800">Current Debt Owed: <strong>₦{{ (selectedCust.outstandingDebt || 0).toLocaleString() }}</strong></div>
        </div>

        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Repayment Amount Received (₦) *</label>
          <input v-model.number="repayAmount" type="number" required min="1" step="0.01" class="input-field font-bold text-sm" />
        </div>

        <button type="submit" class="btn-primary w-full justify-center">Record Payment</button>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useBusinessStore } from '@/stores/business';
import type { Customer } from '@/types';
import Modal from '@/components/common/Modal.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { Plus, Users, CreditCard } from 'lucide-vue-next';

const businessStore = useBusinessStore();

const showAddModal = ref(false);
const showPaymentModal = ref(false);

const name = ref('');
const phone = ref('');
const email = ref('');

const selectedCust = ref<Customer | null>(null);
const repayAmount = ref(0);

const handleCreateCustomer = () => {
  businessStore.addCustomer({ name: name.value, phone: phone.value, email: email.value, creditLimit: 0 });
  showAddModal.value = false;
  name.value = ''; phone.value = ''; email.value = '';
};

const openPaymentModal = (cust: Customer) => {
  selectedCust.value = cust;
  repayAmount.value = cust.outstandingDebt || 0;
  showPaymentModal.value = true;
};

const handleRecordRepayment = () => {
  if (selectedCust.value && repayAmount.value > 0) {
    businessStore.recordCustomerDebtPayment(selectedCust.value.id, repayAmount.value);
    showPaymentModal.value = false;
  }
};
</script>
