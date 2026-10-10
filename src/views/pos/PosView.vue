<template>
  <div class="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6 overflow-hidden">
    <!-- Left: Product Catalog & Counter Selector -->
    <div class="flex-1 flex flex-col min-w-0 bg-white border border-tradeos-border rounded-xl shadow-sm overflow-hidden">
      <!-- Search & Category Header -->
      <div class="p-4 border-b border-tradeos-border space-y-3 bg-slate-50/50">
        <div class="flex items-center gap-3">
          <div class="relative flex-1">
            <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search product name, SKU or barcode..." 
              class="input-field pl-9"
            />
          </div>
          <button @click="showAddProductModal = true" class="btn-secondary text-xs shrink-0">
            <Plus class="w-4 h-4" />
            <span class="hidden sm:inline">New Item</span>
          </button>
        </div>

        <!-- Category Filter Tabs -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
          <button 
            @click="selectedCategory = 'all'"
            class="px-3 py-1.5 rounded-lg border shrink-0 transition-colors"
            :class="selectedCategory === 'all' ? 'bg-tradeos-navy text-white border-tradeos-navy' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
          >
            All Products
          </button>
          <button 
            v-for="cat in businessStore.categories" 
            :key="cat.id"
            @click="selectedCategory = cat.id"
            class="px-3 py-1.5 rounded-lg border shrink-0 transition-colors"
            :class="selectedCategory === cat.id ? 'bg-tradeos-navy text-white border-tradeos-navy' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="filteredProducts.length > 0" class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          <button
            v-for="product in filteredProducts"
            :key="product.id"
            @click="addToCart(product)"
            class="card-panel p-3 text-left hover:border-tradeos-blue hover:shadow-md transition-all flex flex-col justify-between group relative"
            :class="(!product.isService && (product.quantityOnHand || 0) <= 0) ? 'opacity-60 bg-slate-50' : ''"
          >
            <div>
              <div class="flex items-start justify-between gap-1 mb-1">
                <span class="font-bold text-xs text-tradeos-navy group-hover:text-tradeos-blue transition-colors line-clamp-2">
                  {{ product.name }}
                </span>
                <span v-if="product.isService" class="badge badge-navy text-[9px]">Service</span>
              </div>
              <p class="text-[10px] text-slate-400 font-mono">SKU: {{ product.sku }}</p>
            </div>

            <div class="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
              <span class="font-heading font-extrabold text-sm text-tradeos-navy">
                ₦{{ product.sellingPrice.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}
              </span>
              <span 
                v-if="!product.isService"
                class="text-[10px] font-bold"
                :class="(product.quantityOnHand || 0) <= product.reorderLevel ? 'text-amber-600' : 'text-slate-500'"
              >
                {{ product.quantityOnHand || 0 }} {{ product.unitOfMeasure }}
              </span>
            </div>
          </button>
        </div>

        <EmptyState 
          v-else
          title="No Matching Products"
          description="Create your product catalog to start recording sales at the POS terminal."
          action-label="Add First Product"
          :icon="Package"
          @action="showAddProductModal = true"
        />
      </div>
    </div>

    <!-- Right: POS Checkout Terminal Cart Sidebar -->
    <div class="w-full lg:w-96 bg-white border border-tradeos-border rounded-xl shadow-sm flex flex-col justify-between overflow-hidden">
      <!-- Cart Header -->
      <div class="p-4 border-b border-tradeos-border flex items-center justify-between bg-slate-50/50">
        <div class="flex items-center gap-2">
          <ShoppingCart class="w-5 h-5 text-tradeos-blue" />
          <h3 class="font-heading font-bold text-base text-tradeos-navy">Current Cart Order</h3>
        </div>
        <button 
          v-if="businessStore.cart.length > 0"
          @click="businessStore.clearCart()" 
          class="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      <!-- Cart Item List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div v-if="businessStore.cart.length > 0" class="space-y-2">
          <div 
            v-for="item in businessStore.cart" 
            :key="item.product.id" 
            class="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
          >
            <div class="flex-1 min-w-0">
              <div class="font-bold text-tradeos-navy truncate">{{ item.product.name }}</div>
              <div class="text-[10px] text-slate-500">
                ₦{{ item.unitPrice.toLocaleString() }} x {{ item.quantity }}
              </div>
            </div>

            <!-- Quantity Controls -->
            <div class="flex items-center gap-1.5 shrink-0">
              <button 
                @click="businessStore.updateCartQuantity(item.product.id, item.quantity - 1)"
                class="w-6 h-6 rounded bg-white border border-slate-300 font-bold flex items-center justify-center hover:bg-slate-100"
              >-</button>
              <span class="w-6 text-center font-bold text-tradeos-navy">{{ item.quantity }}</span>
              <button 
                @click="businessStore.updateCartQuantity(item.product.id, item.quantity + 1)"
                class="w-6 h-6 rounded bg-white border border-slate-300 font-bold flex items-center justify-center hover:bg-slate-100"
              >+</button>
            </div>

            <div class="text-right shrink-0">
              <div class="font-heading font-bold text-tradeos-navy">
                ₦{{ (item.unitPrice * item.quantity).toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-16 text-slate-400">
          <ShoppingCart class="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p class="text-xs">Select products from the left counter to add to cart</p>
        </div>
      </div>

      <!-- Cart Footer Totals & Checkout -->
      <div class="p-4 border-t border-tradeos-border bg-slate-50 space-y-3">
        <div class="space-y-1.5 text-xs text-slate-600">
          <div class="flex justify-between">
            <span>Subtotal</span>
            <span class="font-semibold text-tradeos-navy">₦{{ businessStore.cartSubtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span>Discount (₦)</span>
            <input 
              v-model.number="businessStore.cartDiscount" 
              type="number" 
              min="0"
              class="w-24 text-right px-2 py-1 border border-slate-300 rounded bg-white text-xs font-semibold" 
            />
          </div>
          <div class="flex justify-between text-sm font-extrabold text-tradeos-navy pt-2 border-t border-slate-200">
            <span>Total Payable</span>
            <span class="text-tradeos-blue text-lg">₦{{ businessStore.cartTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}</span>
          </div>
        </div>

        <button 
          @click="openCheckoutModal" 
          :disabled="businessStore.cart.length === 0" 
          class="btn-primary w-full justify-center py-3 text-sm"
        >
          <CreditCard class="w-4 h-4" />
          <span>Proceed to Payment</span>
        </button>
      </div>
    </div>

    <!-- Checkout Payment Modal -->
    <Modal :show="showCheckoutModal" title="POS Payment Settlement" @close="showCheckoutModal = false">
      <form @submit.prevent="executeSale" class="space-y-4 text-xs">
        <div class="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex justify-between items-center">
          <span class="text-slate-600 font-semibold">Total Amount Due:</span>
          <span class="font-heading font-extrabold text-xl text-tradeos-navy">₦{{ businessStore.cartTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}</span>
        </div>

        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Select Customer (Optional for Walk-in)</label>
          <select v-model="selectedCustomerId" class="input-field">
            <option :value="null">-- Walk-in Retail Customer --</option>
            <option v-for="cust in businessStore.customers" :key="cust.id" :value="cust.id">
              {{ cust.name }} (Debt: ₦{{ (cust.outstandingDebt || 0).toLocaleString() }})
            </option>
          </select>
        </div>

        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Payment Method *</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              v-for="method in paymentMethods"
              :key="method.value"
              @click="paymentMethod = method.value"
              class="p-2.5 rounded-lg border font-semibold text-left transition-all flex items-center gap-2"
              :class="paymentMethod === method.value ? 'border-tradeos-blue bg-emerald-50 text-tradeos-blue' : 'border-slate-200 hover:bg-slate-50 text-slate-700'"
            >
              <component :is="method.icon" class="w-4 h-4" />
              <span>{{ method.label }}</span>
            </button>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Amount Received (₦) *</label>
          <input 
            v-model.number="amountPaid" 
            type="number" 
            required 
            step="0.01"
            class="input-field font-bold text-sm"
          />
        </div>

        <div v-if="amountPaid > businessStore.cartTotal" class="p-3 rounded-lg bg-emerald-600 text-white shadow-sm flex justify-between font-bold">
          <span>Change to Return:</span>
          <span>₦{{ (amountPaid - businessStore.cartTotal).toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}</span>
        </div>

        <button type="submit" class="btn-primary w-full justify-center py-2.5">
          <CheckCircle2 class="w-4 h-4" />
          <span>Confirm & Print Receipt</span>
        </button>
      </form>
    </Modal>

    <!-- Receipt Modal -->
    <Modal :show="showReceiptModal" title="Transaction Receipt" @close="showReceiptModal = false">
      <div v-if="lastSale" class="space-y-4 text-xs">
        <div class="text-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div class="font-heading font-extrabold text-lg text-tradeos-navy">{{ authStore.activeBusiness?.name }}</div>
          <div class="text-[11px] text-slate-500">{{ authStore.activeBranch?.name }} • {{ authStore.activeBusiness?.phoneNumber }}</div>
          <div class="mt-2 text-xs font-mono font-bold text-tradeos-blue">Receipt #: {{ lastSale.receiptNumber }}</div>
          <div class="text-[10px] text-slate-400">{{ new Date(lastSale.createdAt).toLocaleString() }}</div>
        </div>

        <div class="divide-y divide-slate-100">
          <div v-for="item in lastSale.items" :key="item.id" class="py-2 flex justify-between">
            <div>
              <div class="font-bold text-tradeos-navy">{{ item.productNameSnapshot }}</div>
              <div class="text-[10px] text-slate-500">{{ item.quantity }} x ₦{{ item.unitPrice.toLocaleString() }}</div>
            </div>
            <div class="font-bold text-tradeos-navy">₦{{ item.lineTotal.toLocaleString() }}</div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-200 space-y-1 font-bold text-tradeos-navy">
          <div class="flex justify-between">
            <span>Total Paid:</span>
            <span>₦{{ lastSale.totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}</span>
          </div>
          <div class="flex justify-between text-slate-500 text-[11px]">
            <span>Payment Method:</span>
            <span class="capitalize">{{ lastSale.paymentMethod.replace('_', ' ') }}</span>
          </div>
        </div>

        <div class="flex gap-3 pt-4 border-t border-slate-100">
          <button @click="triggerPrint" class="btn-secondary flex-1 justify-center">
            <Printer class="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button @click="showReceiptModal = false" class="btn-primary flex-1 justify-center">
            <span>Done</span>
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useBusinessStore } from '@/stores/business';
import type { Product, Sale } from '@/types';
import Modal from '@/components/common/Modal.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { 
  Search, Plus, Package, ShoppingCart, Trash2, 
  CreditCard, CheckCircle2, Banknote, Building, 
  UserCheck, Printer 
} from 'lucide-vue-next';

const authStore = useAuthStore();
const businessStore = useBusinessStore();

const searchQuery = ref('');
const selectedCategory = ref('all');
const showAddProductModal = ref(false);
const showCheckoutModal = ref(false);
const showReceiptModal = ref(false);

const paymentMethod = ref<Sale['paymentMethod']>('cash');
const amountPaid = ref(0);
const selectedCustomerId = ref<string | null>(null);
const lastSale = ref<Sale | null>(null);

const paymentMethods = [
  { value: 'cash', label: 'Cash Payment', icon: Banknote },
  { value: 'card', label: 'Card POS', icon: CreditCard },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Building },
  { value: 'credit', label: 'Store Credit Sale', icon: UserCheck }
] as const;

const filteredProducts = computed(() => {
  return businessStore.products.filter(p => {
    const matchesCat = selectedCategory.value === 'all' || p.categoryId === selectedCategory.value;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCat && matchesSearch;
  });
});

const addToCart = (product: Product) => {
  businessStore.addToCart(product, 1);
};

const openCheckoutModal = () => {
  amountPaid.value = businessStore.cartTotal;
  showCheckoutModal.value = true;
};

const executeSale = () => {
  try {
    const sale = businessStore.completeSale({
      paymentMethod: paymentMethod.value,
      amountPaid: amountPaid.value,
      customerId: selectedCustomerId.value || undefined
    });
    lastSale.value = sale;
    showCheckoutModal.value = false;
    showReceiptModal.value = true;
  } catch (err: any) {
    alert(err.message);
  }
};

const triggerPrint = () => {
  window.print();
};
</script>
