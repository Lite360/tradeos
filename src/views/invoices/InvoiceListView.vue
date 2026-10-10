<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading font-extrabold text-2xl text-tradeos-navy">Invoices & Quotations</h1>
        <p class="text-xs text-slate-500 mt-1">Issue branded invoices, quotations, track due dates and customer payments</p>
      </div>

      <router-link to="/invoices/create" class="btn-primary text-xs">
        <Plus class="w-4 h-4" />
        <span>Create Invoice</span>
      </router-link>
    </div>

    <!-- Invoice Table -->
    <div class="card-panel p-0 overflow-hidden">
      <div v-if="businessStore.invoices.length > 0" class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
            <tr>
              <th class="p-3.5">Invoice #</th>
              <th class="p-3.5">Customer</th>
              <th class="p-3.5">Issue Date</th>
              <th class="p-3.5">Due Date</th>
              <th class="p-3.5">Status</th>
              <th class="p-3.5 text-right">Total (₦)</th>
              <th class="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="inv in businessStore.invoices" :key="inv.id" class="hover:bg-slate-50">
              <td class="p-3.5 font-mono font-bold text-tradeos-navy">{{ inv.invoiceNumber }}</td>
              <td class="p-3.5 font-medium text-slate-700">{{ inv.customerName }}</td>
              <td class="p-3.5 text-slate-500">{{ inv.issueDate }}</td>
              <td class="p-3.5 text-slate-500">{{ inv.dueDate }}</td>
              <td class="p-3.5">
                <Badge :variant="inv.status === 'paid' ? 'success' : inv.status === 'issued' ? 'navy' : 'warning'">
                  {{ inv.status }}
                </Badge>
              </td>
              <td class="p-3.5 text-right font-bold text-tradeos-navy">
                ₦{{ inv.totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}
              </td>
              <td class="p-3.5 text-right flex items-center justify-end gap-1.5">
                <button 
                  @click="shareOnWhatsApp(inv)" 
                  class="btn-secondary text-[11px] py-1 px-2.5 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                  title="Share via WhatsApp"
                >
                  <MessageCircle class="w-3.5 h-3.5 text-emerald-600" />
                  <span class="hidden sm:inline">WhatsApp</span>
                </button>
                <button @click="viewInvoice(inv)" class="btn-secondary text-[11px] py-1 px-2.5">
                  <Printer class="w-3 h-3" />
                  <span>Print PDF</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState 
        v-else
        title="No Invoices Created Yet"
        description="Issue professional, branded customer invoices with automated numbering and due dates."
        action-label="Create First Invoice"
        :icon="FileText"
        @action="router.push('/invoices/create')"
      />
    </div>

    <!-- Print PDF View Modal -->
    <Modal :show="showModal" title="Invoice Print View" size="xl" @close="showModal = false">
      <div v-if="selectedInv" class="space-y-6 text-xs no-print-padding">
        <div class="flex justify-between items-start border-b border-slate-200 pb-4">
          <div>
            <h2 class="font-heading font-extrabold text-xl text-tradeos-navy">{{ authStore.activeBusiness?.name }}</h2>
            <p class="text-slate-500">{{ authStore.activeBusiness?.address }} • {{ authStore.activeBusiness?.phoneNumber }}</p>
          </div>
          <div class="text-right">
            <h3 class="font-heading font-extrabold text-2xl text-tradeos-blue">INVOICE</h3>
            <p class="font-mono font-bold text-tradeos-navy">{{ selectedInv.invoiceNumber }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">Billed To:</span>
            <div class="font-bold text-tradeos-navy text-sm">{{ selectedInv.customerName }}</div>
            <div class="text-slate-500">{{ selectedInv.customerPhone }}</div>
          </div>
          <div class="text-right space-y-1">
            <div><span class="text-slate-400">Issue Date:</span> <strong class="text-tradeos-navy">{{ selectedInv.issueDate }}</strong></div>
            <div><span class="text-slate-400">Due Date:</span> <strong class="text-tradeos-navy">{{ selectedInv.dueDate }}</strong></div>
          </div>
        </div>

        <table class="w-full text-left text-xs border border-slate-200">
          <thead class="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
            <tr>
              <th class="p-2.5">Description</th>
              <th class="p-2.5 text-right">Unit Price</th>
              <th class="p-2.5 text-right">Qty</th>
              <th class="p-2.5 text-right">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in selectedInv.items" :key="item.id">
              <td class="p-2.5 font-medium">{{ item.description }}</td>
              <td class="p-2.5 text-right">₦{{ item.unitPrice.toLocaleString() }}</td>
              <td class="p-2.5 text-right font-bold">{{ item.quantity }}</td>
              <td class="p-2.5 text-right font-bold">₦{{ item.lineTotal.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>

        <div class="flex justify-end pt-2">
          <div class="w-64 space-y-1 text-right font-bold text-tradeos-navy">
            <div class="flex justify-between text-sm pt-2 border-t border-slate-300">
              <span>Total Amount:</span>
              <span class="text-tradeos-blue">₦{{ selectedInv.totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}</span>
            </div>
          </div>
        </div>

        <div class="flex gap-3 pt-4 border-t border-slate-100 no-print">
          <button @click="shareOnWhatsApp(selectedInv)" class="btn-secondary flex-1 justify-center text-emerald-800 border-emerald-300 bg-emerald-50 hover:bg-emerald-100">
            <MessageCircle class="w-4 h-4 text-emerald-700" />
            <span>Send via WhatsApp</span>
          </button>
          <button @click="triggerPrint" class="btn-primary flex-1 justify-center">
            <Printer class="w-4 h-4" />
            <span>Print A4 Invoice</span>
          </button>
          <button @click="showModal = false" class="btn-secondary px-4 justify-center">
            <span>Close</span>
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useBusinessStore } from '@/stores/business';
import type { Invoice } from '@/types';
import Modal from '@/components/common/Modal.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import Badge from '@/components/common/Badge.vue';
import { printA4Invoice, generateWhatsAppInvoiceShareUrl } from '@/services/invoiceShare';
import { Plus, FileText, Printer, MessageCircle } from 'lucide-vue-next';

const authStore = useAuthStore();
const businessStore = useBusinessStore();
const router = useRouter();

const showModal = ref(false);
const selectedInv = ref<Invoice | null>(null);

const viewInvoice = (inv: Invoice) => {
  selectedInv.value = inv;
  showModal.value = true;
};

const triggerPrint = () => {
  if (!selectedInv.value) return;
  printA4Invoice(selectedInv.value, authStore.activeBusiness, authStore.activeBranch);
};

const shareOnWhatsApp = (inv: Invoice) => {
  const url = generateWhatsAppInvoiceShareUrl(inv, authStore.activeBusiness);
  window.open(url, '_blank');
};
</script>
