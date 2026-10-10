<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white font-sans">
    <div class="w-full max-w-xl bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10">
      <div class="mb-6">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
          Step 1 of 1 • Workspace Setup
        </span>
        <h2 class="font-heading font-extrabold text-2xl text-slate-900 mt-2">Setup Your Business Workspace</h2>
        <p class="text-xs text-slate-500 mt-1">Configure your business details and primary retail stock primitives</p>
      </div>

      <form @submit.prevent="handleCreateBusiness" class="space-y-5">
        <div>
          <label class="block text-xs font-semibold text-tradeos-navy mb-1">Business Name *</label>
          <input 
            v-model="name" 
            type="text" 
            required 
            placeholder="e.g. De-Great Supermarket & Provisions" 
            class="input-field" 
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-tradeos-navy mb-1">Primary Retail Category *</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              type="button"
              v-for="cat in categoryOptions"
              :key="cat.value"
              @click="category = cat.value"
              class="p-3 rounded-lg border text-left transition-all flex flex-col justify-between"
              :class="category === cat.value ? 'border-tradeos-blue bg-emerald-50/60 ring-2 ring-tradeos-blue/20' : 'border-slate-200 hover:bg-slate-50'"
            >
              <div class="font-bold text-xs text-tradeos-navy">{{ cat.label }}</div>
              <div class="text-[10px] text-slate-500 mt-1">{{ cat.unitDesc }}</div>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-tradeos-navy mb-1">Phone Number</label>
            <input 
              v-model="phoneNumber" 
              type="text" 
              placeholder="e.g. 0803 123 4567" 
              class="input-field" 
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-tradeos-navy mb-1">Business Location / Address</label>
            <input 
              v-model="address" 
              type="text" 
              placeholder="e.g. Alaba Market, Lagos" 
              class="input-field" 
            />
          </div>
        </div>

        <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button type="button" @click="router.back()" class="btn-secondary text-xs">
            Cancel
          </button>
          <button type="submit" :disabled="authStore.isLoading" class="btn-primary text-xs px-6">
            <Loader2 v-if="authStore.isLoading" class="w-4 h-4 animate-spin" />
            <span>Launch Business OS</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useBusinessStore } from '@/stores/business';
import type { RetailCategory } from '@/types';
import { Loader2 } from 'lucide-vue-next';

const name = ref('');
const category = ref<RetailCategory>('provision');
const phoneNumber = ref('');
const address = ref('');

const authStore = useAuthStore();
const businessStore = useBusinessStore();
const router = useRouter();

const categoryOptions: { value: RetailCategory; label: string; unitDesc: string }[] = [
  { value: 'provision', label: 'Provision Shop', unitDesc: 'Cartons, Packs, Pcs' },
  { value: 'electronics', label: 'Electronics Dealer', unitDesc: 'Serial Nos & Warranty' },
  { value: 'fashion', label: 'Fashion Retailer', unitDesc: 'Sizes & Color Variants' },
  { value: 'foodstuff', label: 'Foodstuff Retailer', unitDesc: 'Bags, Kg, Bulk' },
  { value: 'cosmetics', label: 'Cosmetics Shop', unitDesc: 'Expiry & Batch Codes' },
  { value: 'general', label: 'General Merchandise', unitDesc: 'Standard Stock Units' }
];

const handleCreateBusiness = async () => {
  try {
    await authStore.createBusiness({
      name: name.value,
      category: category.value,
      phoneNumber: phoneNumber.value,
      address: address.value
    });
    businessStore.initializeWorkspaceData();
    router.push('/dashboard');
  } catch {}
};
</script>
