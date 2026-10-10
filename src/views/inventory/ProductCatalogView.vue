<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading font-extrabold text-2xl text-tradeos-navy">Products & Stock Inventory</h1>
        <p class="text-xs text-slate-500 mt-1">Manage product catalog, prices, reorder levels and stock receipts</p>
      </div>

      <div class="flex items-center gap-2">
        <button @click="showAddModal = true" class="btn-primary text-xs">
          <Plus class="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="card-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="relative flex-1 w-full">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Filter by product name, SKU or barcode..." 
          class="input-field pl-9"
        />
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <button 
          @click="showLowStockOnly = !showLowStockOnly"
          class="btn-secondary text-xs px-3.5 border"
          :class="showLowStockOnly ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold' : ''"
        >
          <AlertTriangle class="w-4 h-4 text-amber-600" />
          <span>Low Stock Only ({{ businessStore.lowStockProducts.length }})</span>
        </button>
      </div>
    </div>

    <!-- Product Table -->
    <div class="card-panel p-0 overflow-hidden">
      <div v-if="filteredProducts.length > 0" class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
            <tr>
              <th class="p-3.5">Product Name & SKU</th>
              <th class="p-3.5">Category</th>
              <th class="p-3.5">Cost Price</th>
              <th class="p-3.5">Selling Price</th>
              <th class="p-3.5">Stock Level</th>
              <th class="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-slate-50">
              <td class="p-3.5">
                <div class="font-bold text-tradeos-navy">{{ product.name }}</div>
                <div class="text-[10px] text-slate-400 font-mono">SKU: {{ product.sku }}</div>
              </td>
              <td class="p-3.5 capitalize text-slate-600">
                <span class="badge badge-navy">{{ product.unitOfMeasure }}</span>
              </td>
              <td class="p-3.5 text-slate-600 font-medium">₦{{ product.costPrice.toLocaleString() }}</td>
              <td class="p-3.5 font-bold text-tradeos-navy">₦{{ product.sellingPrice.toLocaleString() }}</td>
              <td class="p-3.5">
                <span v-if="product.isService" class="badge badge-navy">Service</span>
                <div v-else class="flex items-center gap-2">
                  <span 
                    class="font-heading font-extrabold text-sm"
                    :class="(product.quantityOnHand || 0) <= product.reorderLevel ? 'text-amber-600' : 'text-slate-800'"
                  >
                    {{ product.quantityOnHand || 0 }}
                  </span>
                  <span v-if="(product.quantityOnHand || 0) <= product.reorderLevel" class="badge badge-warning text-[9px]">Low</span>
                </div>
              </td>
              <td class="p-3.5 text-right">
                <button @click="openStockAdjustModal(product)" class="btn-secondary text-[11px] py-1 px-2.5">
                  <RefreshCw class="w-3 h-3" />
                  <span>Adjust Stock</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState 
        v-else
        title="No Products Found"
        description="Add items to your inventory to begin tracking costs, selling prices and low stock reorder thresholds."
        action-label="Add First Product"
        :icon="Package"
        @action="showAddModal = true"
      />
    </div>

    <!-- Create Product Modal -->
    <Modal :show="showAddModal" title="Create New Product" size="lg" @close="showAddModal = false">
      <form @submit.prevent="handleCreateProduct" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-tradeos-navy mb-1">Product Name *</label>
            <input v-model="newProd.name" type="text" required placeholder="e.g. Milo 500g Pack" class="input-field" />
          </div>

          <div>
            <label class="block font-semibold text-tradeos-navy mb-1">SKU / Code *</label>
            <input v-model="newProd.sku" type="text" required placeholder="e.g. PRD-MIL-500" class="input-field font-mono" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block font-semibold text-tradeos-navy mb-1">Cost Price (₦) *</label>
            <input v-model.number="newProd.costPrice" type="number" required step="0.01" class="input-field font-semibold" />
          </div>

          <div>
            <label class="block font-semibold text-tradeos-navy mb-1">Selling Price (₦) *</label>
            <input v-model.number="newProd.sellingPrice" type="number" required step="0.01" class="input-field font-bold text-tradeos-blue" />
          </div>

          <div>
            <label class="block font-semibold text-tradeos-navy mb-1">Unit of Measure *</label>
            <select v-model="newProd.unitOfMeasure" class="input-field">
              <option value="pcs">Pieces (pcs)</option>
              <option value="carton">Carton</option>
              <option value="pack">Pack</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="liter">Liters</option>
              <option value="service">Service (No stock)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" v-if="newProd.unitOfMeasure !== 'service'">
          <div>
            <label class="block font-semibold text-tradeos-navy mb-1">Opening Stock Quantity</label>
            <input v-model.number="newProd.quantityOnHand" type="number" step="1" class="input-field" />
          </div>

          <div>
            <label class="block font-semibold text-tradeos-navy mb-1">Low Stock Reorder Threshold</label>
            <input v-model.number="newProd.reorderLevel" type="number" step="1" class="input-field" />
          </div>
        </div>

        <div class="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <button type="button" @click="showAddModal = false" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Save Product</button>
        </div>
      </form>
    </Modal>

    <!-- Stock Adjust Modal -->
    <Modal :show="showAdjustModal" title="Stock Receipt / Adjustment" @close="showAdjustModal = false">
      <form v-if="selectedProduct" @submit.prevent="handleStockAdjust" class="space-y-4 text-xs">
        <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div class="font-bold text-tradeos-navy text-sm">{{ selectedProduct.name }}</div>
          <div class="text-[11px] text-slate-500">Current Stock: <strong>{{ selectedProduct.quantityOnHand || 0 }} {{ selectedProduct.unitOfMeasure }}</strong></div>
        </div>

        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Quantity Change (+ for restock, - for deduction) *</label>
          <input v-model.number="adjustQty" type="number" required placeholder="e.g. 50 or -5" class="input-field font-bold" />
        </div>

        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Reason / Reference *</label>
          <input v-model="adjustReason" type="text" required placeholder="e.g. Supplier Restock Invoice #1042" class="input-field" />
        </div>

        <button type="submit" class="btn-primary w-full justify-center">Submit Stock Movement</button>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useBusinessStore } from '@/stores/business';
import type { Product } from '@/types';
import Modal from '@/components/common/Modal.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { Search, Plus, AlertTriangle, Package, RefreshCw } from 'lucide-vue-next';

const businessStore = useBusinessStore();

const searchQuery = ref('');
const showLowStockOnly = ref(false);
const showAddModal = ref(false);
const showAdjustModal = ref(false);
const selectedProduct = ref<Product | null>(null);

const adjustQty = ref(0);
const adjustReason = ref('');

const newProd = ref({
  name: '',
  sku: '',
  costPrice: 0,
  sellingPrice: 0,
  unitOfMeasure: 'pcs' as Product['unitOfMeasure'],
  reorderLevel: 5,
  quantityOnHand: 0,
  isService: false
});

const filteredProducts = computed(() => {
  return businessStore.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesLowStock = !showLowStockOnly.value || (!p.isService && (p.quantityOnHand || 0) <= p.reorderLevel);
    return matchesSearch && matchesLowStock;
  });
});

const handleCreateProduct = () => {
  businessStore.addProduct({
    ...newProd.value,
    isService: newProd.value.unitOfMeasure === 'service'
  });
  showAddModal.value = false;
  newProd.value = { name: '', sku: '', costPrice: 0, sellingPrice: 0, unitOfMeasure: 'pcs', reorderLevel: 5, quantityOnHand: 0, isService: false };
};

const openStockAdjustModal = (product: Product) => {
  selectedProduct.value = product;
  adjustQty.value = 0;
  adjustReason.value = 'Supplier Restock';
  showAdjustModal.value = true;
};

const handleStockAdjust = () => {
  if (selectedProduct.value && adjustQty.value !== 0) {
    businessStore.adjustStock(selectedProduct.value.id, adjustQty.value, adjustReason.value);
    showAdjustModal.value = false;
  }
};
</script>
