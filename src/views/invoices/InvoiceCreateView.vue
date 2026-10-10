<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-heading font-extrabold text-2xl text-tradeos-navy">Create New Customer Invoice</h1>
        <p class="text-xs text-slate-500 mt-1">Issue an official invoice to a registered customer</p>
      </div>

      <router-link to="/invoices" class="btn-secondary text-xs">
        <ArrowLeft class="w-4 h-4" />
        <span>Back to Invoices</span>
      </router-link>
    </div>

    <form @submit.prevent="handleCreateInvoice" class="card-panel space-y-6 text-xs">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Select Customer *</label>
          <div class="flex gap-2">
            <select v-model="customerId" required class="input-field flex-1">
              <option value="" disabled>-- Select Customer --</option>
              <option v-for="c in businessStore.customers" :key="c.id" :value="c.id">
                {{ c.name }} ({{ c.phone || 'No phone' }})
              </option>
            </select>
            <button type="button" @click="showCustomerModal = true" class="btn-secondary py-2 px-3">
              <Plus class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Payment Due Date *</label>
          <input v-model="dueDate" type="date" required class="input-field" />
        </div>
      </div>

      <!-- Line Items Section -->
      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 class="font-heading font-bold text-sm text-tradeos-navy">Invoice Line Items</h3>
          <button type="button" @click="addLineItem" class="btn-secondary text-[11px] py-1 px-2.5">
            <Plus class="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        <div v-for="(item, idx) in lineItems" :key="idx" class="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
          <input v-model="item.description" type="text" required placeholder="Description / Product Name" class="input-field flex-1" />
          <input v-model.number="item.unitPrice" type="number" required placeholder="Unit Price" class="input-field w-32 font-semibold" />
          <input v-model.number="item.quantity" type="number" required min="1" placeholder="Qty" class="input-field w-20 font-bold" />
          <div class="w-32 font-heading font-bold text-tradeos-navy text-right">
            ₦{{ (item.unitPrice * item.quantity).toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}
          </div>
          <button v-if="lineItems.length > 1" type="button" @click="removeLineItem(idx)" class="text-red-500 hover:text-red-700 p-1">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <label class="block font-semibold text-tradeos-navy mb-1">Notes / Payment Terms</label>
        <textarea v-model="notes" rows="2" placeholder="e.g. Please pay into First Bank Account #1234567890..." class="input-field"></textarea>
      </div>

      <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div class="font-heading font-extrabold text-lg text-tradeos-navy">
          Total: <span class="text-tradeos-blue">₦{{ totalInvoiceAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}</span>
        </div>

        <button type="submit" class="btn-primary px-8">
          <CheckCircle2 class="w-4 h-4" />
          <span>Issue Invoice</span>
        </button>
      </div>
    </form>

    <!-- Quick New Customer Modal -->
    <Modal :show="showCustomerModal" title="Add Customer" @close="showCustomerModal = false">
      <form @submit.prevent="handleCreateCustomer" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Customer Full Name / Business *</label>
          <input v-model="newCustomerName" type="text" required class="input-field" />
        </div>
        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Phone Number</label>
          <input v-model="newCustomerPhone" type="text" class="input-field" />
        </div>
        <button type="submit" class="btn-primary w-full justify-center">Save Customer</button>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useBusinessStore } from '@/stores/business';
import Modal from '@/components/common/Modal.vue';
import { ArrowLeft, Plus, Trash2, CheckCircle2 } from 'lucide-vue-next';

const businessStore = useBusinessStore();
const router = useRouter();

const customerId = ref('');
const dueDate = ref(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
const notes = ref('');
const showCustomerModal = ref(false);

const newCustomerName = ref('');
const newCustomerPhone = ref('');

const lineItems = ref([
  { description: '', unitPrice: 0, quantity: 1 }
]);

const totalInvoiceAmount = computed(() => {
  return lineItems.value.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
});

const addLineItem = () => {
  lineItems.value.push({ description: '', unitPrice: 0, quantity: 1 });
};

const removeLineItem = (idx: number) => {
  lineItems.value.splice(idx, 1);
};

const handleCreateCustomer = () => {
  if (newCustomerName.value) {
    const cust = businessStore.addCustomer({ name: newCustomerName.value, phone: newCustomerPhone.value, creditLimit: 0 });
    customerId.value = cust.id;
    showCustomerModal.value = false;
    newCustomerName.value = '';
    newCustomerPhone.value = '';
  }
};

const handleCreateInvoice = () => {
  try {
    businessStore.createInvoice({
      customerId: customerId.value,
      dueDate: dueDate.value,
      items: lineItems.value,
      notes: notes.value
    });
    router.push('/invoices');
  } catch (err: any) {
    alert(err.message);
  }
};
</script>
