<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading font-extrabold text-2xl text-tradeos-navy">Suppliers & Creditors Ledger</h1>
        <p class="text-xs text-slate-500 mt-1">Track supplier accounts, outstanding bills and liability payments</p>
      </div>

      <button @click="showAddModal = true" class="btn-primary text-xs">
        <Plus class="w-4 h-4" />
        <span>Add Supplier</span>
      </button>
    </div>

    <!-- Summary Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="card-panel border-rose-200 bg-rose-50/40">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total Supplier Liabilities Owed</span>
        <h3 class="font-heading font-extrabold text-2xl text-rose-900">
          ₦{{ businessStore.totalSupplierLiability.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}
        </h3>
        <p class="text-[11px] text-slate-500 mt-1">Accounts Payable balance across all suppliers</p>
      </div>

      <div class="card-panel">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total Registered Suppliers</span>
        <h3 class="font-heading font-extrabold text-2xl text-tradeos-navy">{{ businessStore.suppliers.length }}</h3>
        <p class="text-[11px] text-slate-500 mt-1">Active supplier profiles in workspace</p>
      </div>
    </div>

    <!-- Supplier Table -->
    <div class="card-panel p-0 overflow-hidden">
      <div v-if="businessStore.suppliers.length > 0" class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
            <tr>
              <th class="p-3.5">Company Name</th>
              <th class="p-3.5">Contact Person</th>
              <th class="p-3.5">Phone Number</th>
              <th class="p-3.5">Outstanding Liability (₦)</th>
              <th class="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="s in businessStore.suppliers" :key="s.id" class="hover:bg-slate-50">
              <td class="p-3.5 font-bold text-tradeos-navy">{{ s.companyName }}</td>
              <td class="p-3.5 text-slate-700">{{ s.contactPerson || 'N/A' }}</td>
              <td class="p-3.5 text-slate-600">{{ s.phone || 'N/A' }}</td>
              <td class="p-3.5 font-heading font-extrabold" :class="(s.outstandingLiability || 0) > 0 ? 'text-rose-700' : 'text-slate-700'">
                ₦{{ (s.outstandingLiability || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}
              </td>
              <td class="p-3.5 text-right">
                <button v-if="(s.outstandingLiability || 0) > 0" @click="openPaymentModal(s)" class="btn-primary text-[11px] py-1 px-2.5">
                  <CreditCard class="w-3 h-3" />
                  <span>Record Bill Repayment</span>
                </button>
                <span v-else class="text-[11px] text-slate-400 italic">No liability</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState 
        v-else
        title="No Suppliers Registered"
        description="Add supplier profiles to track restock bills and outstanding business liabilities."
        action-label="Add First Supplier"
        :icon="Truck"
        @action="showAddModal = true"
      />
    </div>

    <!-- Create Supplier Modal -->
    <Modal :show="showAddModal" title="Create Supplier Profile" @close="showAddModal = false">
      <form @submit.prevent="handleCreateSupplier" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Company Name *</label>
          <input v-model="companyName" type="text" required placeholder="e.g. Flour Mills of Nigeria Plc" class="input-field" />
        </div>
        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Contact Person</label>
          <input v-model="contactPerson" type="text" placeholder="e.g. Mr. Chidozie" class="input-field" />
        </div>
        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Phone Number</label>
          <input v-model="phone" type="text" placeholder="e.g. 0803 111 2222" class="input-field" />
        </div>
        <button type="submit" class="btn-primary w-full justify-center">Save Supplier Profile</button>
      </form>
    </Modal>

    <!-- Record Bill Payment Modal -->
    <Modal :show="showPaymentModal" title="Record Supplier Bill Repayment" @close="showPaymentModal = false">
      <form v-if="selectedSupp" @submit.prevent="handleRecordRepayment" class="space-y-4 text-xs">
        <div class="p-3 rounded-lg bg-rose-50 border border-rose-200">
          <div class="font-bold text-rose-900 text-sm">{{ selectedSupp.companyName }}</div>
          <div class="text-[11px] text-rose-800">Current Liability Owed: <strong>₦{{ (selectedSupp.outstandingLiability || 0).toLocaleString() }}</strong></div>
        </div>

        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Payment Amount Paid (₦) *</label>
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
import type { Supplier } from '@/types';
import Modal from '@/components/common/Modal.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { Plus, Truck, CreditCard } from 'lucide-vue-next';

const businessStore = useBusinessStore();

const showAddModal = ref(false);
const showPaymentModal = ref(false);

const companyName = ref('');
const contactPerson = ref('');
const phone = ref('');

const selectedSupp = ref<Supplier | null>(null);
const repayAmount = ref(0);

const handleCreateSupplier = () => {
  businessStore.addSupplier({ companyName: companyName.value, contactPerson: contactPerson.value, phone: phone.value });
  showAddModal.value = false;
  companyName.value = ''; contactPerson.value = ''; phone.value = '';
};

const openPaymentModal = (supp: Supplier) => {
  selectedSupp.value = supp;
  repayAmount.value = supp.outstandingLiability || 0;
  showPaymentModal.value = true;
};

const handleRecordRepayment = () => {
  if (selectedSupp.value && repayAmount.value > 0) {
    businessStore.recordSupplierLiabilityPayment(selectedSupp.value.id, repayAmount.value);
    showPaymentModal.value = false;
  }
};
</script>
