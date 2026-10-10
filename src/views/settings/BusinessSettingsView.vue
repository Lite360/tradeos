<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div>
      <h1 class="font-heading font-extrabold text-2xl text-tradeos-navy">Business Settings & Branding</h1>
      <p class="text-xs text-slate-500 mt-1">Configure legal trading details, logo, document prefixes, and bank payment instructions</p>
    </div>

    <form @submit.prevent="handleSaveSettings" class="card-panel space-y-5 text-xs">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Business Name *</label>
          <input v-model="name" type="text" required class="input-field" />
        </div>

        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Legal Registered Name</label>
          <input v-model="legalName" type="text" class="input-field" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Phone Number</label>
          <input v-model="phone" type="text" class="input-field" />
        </div>

        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Business Address</label>
          <input v-model="address" type="text" class="input-field" />
        </div>
      </div>

      <div class="border-t border-slate-100 pt-4">
        <h3 class="font-heading font-bold text-sm text-tradeos-navy mb-3">Document Prefixes</h3>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">Invoice Prefix</label>
            <input v-model="invoicePrefix" type="text" class="input-field font-mono" />
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">Quote Prefix</label>
            <input v-model="quotePrefix" type="text" class="input-field font-mono" />
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">Receipt Prefix</label>
            <input v-model="receiptPrefix" type="text" class="input-field font-mono" />
          </div>
        </div>
      </div>

      <div class="pt-4 border-t border-slate-100 flex justify-end">
        <button type="submit" class="btn-primary px-6">
          <Save class="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { Save } from 'lucide-vue-next';

const authStore = useAuthStore();
const biz = authStore.activeBusiness;

const name = ref(biz?.name || '');
const legalName = ref(biz?.legalName || '');
const phone = ref(biz?.phoneNumber || '');
const address = ref(biz?.address || '');

const invoicePrefix = ref(biz?.branding.invoicePrefix || 'INV-');
const quotePrefix = ref(biz?.branding.quotePrefix || 'QT-');
const receiptPrefix = ref(biz?.branding.receiptPrefix || 'REC-');

const handleSaveSettings = () => {
  if (biz) {
    biz.name = name.value;
    biz.legalName = legalName.value;
    biz.phoneNumber = phone.value;
    biz.address = address.value;
    biz.branding.invoicePrefix = invoicePrefix.value;
    biz.branding.quotePrefix = quotePrefix.value;
    biz.branding.receiptPrefix = receiptPrefix.value;
    alert('Settings saved successfully!');
  }
};
</script>
