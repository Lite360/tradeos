<template>
  <div class="min-h-screen bg-slate-50 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
    <!-- Public Storefront Navigation Header -->
    <header class="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-tradeos-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
            {{ storeBusiness.name.charAt(0) }}
          </div>
          <div>
            <h1 class="font-heading font-extrabold text-lg text-tradeos-navy flex items-center gap-1.5">
              <span>{{ storeBusiness.name }}</span>
              <CheckCircle2 class="w-4 h-4 text-emerald-600 inline" />
            </h1>
            <p class="text-[11px] text-slate-500 flex items-center gap-2">
              <span>{{ storeBusiness.category }}</span>
              <span>•</span>
              <span class="flex items-center gap-1 text-emerald-700 font-semibold">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Open for Orders
              </span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button 
            @click="showCartDrawer = true"
            class="relative p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-2 text-xs font-bold text-tradeos-navy shadow-sm"
          >
            <ShoppingBag class="w-4 h-4 text-emerald-600" />
            <span class="hidden sm:inline">My Cart</span>
            <span v-if="cartItemsCount > 0" class="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold flex items-center justify-center">
              {{ cartItemsCount }}
            </span>
          </button>
        </div>
      </div>
    </header>

    <!-- Storefront Hero Banner -->
    <section class="bg-gradient-to-b from-emerald-50/70 to-slate-50 border-b border-emerald-100 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              Verified Merchant Storefront
            </span>
            <h2 class="font-heading font-extrabold text-2xl sm:text-3xl text-tradeos-navy mt-2">
              Shop Directly from {{ storeBusiness.name }}
            </h2>
            <p class="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Browse authentic stock, place direct orders, enjoy fast pickup or door-step logistics delivery.
            </p>
          </div>

          <!-- Merchant Quick Info Card -->
          <div class="p-3.5 bg-white rounded-xl border border-tradeos-border shadow-sm text-xs space-y-1.5 sm:w-72">
            <div class="flex items-center gap-2 text-slate-600">
              <MapPin class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span class="truncate">{{ storeBusiness.address || 'Lagos, Nigeria' }}</span>
            </div>
            <div class="flex items-center gap-2 text-slate-600">
              <Phone class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{{ storeBusiness.phoneNumber || '+234 800 000 0000' }}</span>
            </div>
          </div>
        </div>

        <!-- Search & Filter Controls -->
        <div class="mt-6 flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search products by title or brand..." 
              class="input-field pl-10 bg-white"
            />
          </div>

          <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
            <button 
              @click="selectedCategory = 'all'"
              class="px-4 py-2 rounded-xl border shrink-0 transition-colors"
              :class="selectedCategory === 'all' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'"
            >
              All Items
            </button>
            <button 
              v-for="cat in businessStore.categories"
              :key="cat.id"
              @click="selectedCategory = cat.id"
              class="px-4 py-2 rounded-xl border shrink-0 transition-colors"
              :class="selectedCategory === cat.id ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Products Catalog Grid -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
      <div v-if="filteredProducts.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id"
          class="bg-white border border-tradeos-border rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg hover:border-emerald-500 transition-all group"
        >
          <div>
            <div class="w-full aspect-square bg-slate-50 rounded-xl mb-3 flex items-center justify-center border border-slate-100 group-hover:scale-[1.02] transition-transform">
              <Package class="w-12 h-12 text-emerald-600/60" />
            </div>

            <div class="flex items-start justify-between gap-1 mb-1">
              <h3 class="font-bold text-xs sm:text-sm text-tradeos-navy line-clamp-2">
                {{ product.name }}
              </h3>
            </div>
            <p class="text-[10px] text-slate-400 font-mono">SKU: {{ product.sku }}</p>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span class="font-heading font-extrabold text-base text-emerald-700">
                ₦{{ product.sellingPrice.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}
              </span>
              <span class="block text-[10px] text-slate-400 font-semibold">In Stock ({{ product.quantityOnHand || 0 }} {{ product.unitOfMeasure }})</span>
            </div>

            <button 
              @click="addToStoreCart(product)"
              class="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
              title="Add to Cart"
            >
              <Plus class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20 bg-white rounded-2xl border border-tradeos-border p-8">
        <Package class="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 class="font-heading font-bold text-base text-tradeos-navy">No Matching Products</h3>
        <p class="text-xs text-slate-500 mt-1">Try clearing your search or category filter.</p>
      </div>
    </main>

    <!-- Public Storefront Footer -->
    <footer class="bg-white border-t border-tradeos-border py-6 px-4 text-center text-xs text-slate-500">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© 2026 {{ storeBusiness.name }}. All rights reserved.</p>
        <p class="text-emerald-700 font-semibold flex items-center gap-1 justify-center">
          <span>Powered by</span>
          <strong class="text-tradeos-navy font-heading font-extrabold">TradeOS</strong>
        </p>
      </div>
    </footer>

    <!-- Shopping Cart Checkout Drawer -->
    <div v-if="showCartDrawer" class="fixed inset-0 z-50 overflow-hidden">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showCartDrawer = false"></div>

      <div class="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div class="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          <div class="p-4 border-b border-tradeos-border flex items-center justify-between bg-slate-50">
            <div class="flex items-center gap-2">
              <ShoppingBag class="w-5 h-5 text-emerald-600" />
              <h3 class="font-heading font-bold text-base text-tradeos-navy">Your Order Cart</h3>
            </div>
            <button @click="showCartDrawer = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Drawer Items -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div v-if="onlineCart.length > 0" class="space-y-3">
              <div 
                v-for="item in onlineCart" 
                :key="item.product.id"
                class="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
              >
                <div class="flex-1 min-w-0">
                  <div class="font-bold text-tradeos-navy truncate">{{ item.product.name }}</div>
                  <div class="text-[11px] text-emerald-700 font-semibold">₦{{ item.product.sellingPrice.toLocaleString() }} each</div>
                </div>

                <div class="flex items-center gap-2">
                  <button @click="updateCartQty(item.product.id, item.qty - 1)" class="w-6 h-6 rounded bg-white border border-slate-300 font-bold flex items-center justify-center">-</button>
                  <span class="font-bold text-tradeos-navy w-4 text-center">{{ item.qty }}</span>
                  <button @click="updateCartQty(item.product.id, item.qty + 1)" class="w-6 h-6 rounded bg-white border border-slate-300 font-bold flex items-center justify-center">+</button>
                </div>

                <div class="text-right font-bold text-tradeos-navy">
                  ₦{{ (item.product.sellingPrice * item.qty).toLocaleString() }}
                </div>
              </div>
            </div>

            <div v-else class="text-center py-24 text-slate-400">
              <ShoppingBag class="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p class="text-xs">Your online shopping cart is empty</p>
            </div>
          </div>

          <!-- Drawer Checkout Actions -->
          <div class="p-4 border-t border-tradeos-border bg-slate-50 space-y-3">
            <div class="flex justify-between items-center text-sm font-extrabold text-tradeos-navy">
              <span>Total Payable</span>
              <span class="text-emerald-700 text-lg">₦{{ cartTotalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 }) }}</span>
            </div>

            <div class="space-y-2">
              <input v-model="customerName" type="text" placeholder="Your Full Name *" required class="input-field text-xs bg-white" />
              <input v-model="customerPhone" type="tel" placeholder="WhatsApp Phone Number *" required class="input-field text-xs bg-white" />
              <textarea v-model="deliveryAddress" rows="2" placeholder="Delivery Address or Store Pickup Note *" class="input-field text-xs bg-white"></textarea>
            </div>

            <button 
              @click="submitOnlineOrder"
              :disabled="onlineCart.length === 0 || !customerName || !customerPhone"
              class="btn-primary w-full justify-center py-3 text-xs"
            >
              <Send class="w-4 h-4" />
              <span>Place Order via WhatsApp Checkout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useBusinessStore } from '@/stores/business';
import { useAuthStore } from '@/stores/auth';
import type { Product } from '@/types';
import { 
  ShoppingBag, Search, Plus, MapPin, Phone, 
  CheckCircle2, Package, X, Send 
} from 'lucide-vue-next';

const businessStore = useBusinessStore();
const authStore = useAuthStore();

const storeBusiness = computed(() => {
  return authStore.activeBusiness || {
    id: 'biz_main',
    name: 'Heritage Mart & Provisions',
    category: 'Retail & Supermarket',
    address: 'Victoria Island, Lagos',
    phoneNumber: '+234 812 345 6789'
  };
});

const searchQuery = ref('');
const selectedCategory = ref('all');
const showCartDrawer = ref(false);

const onlineCart = ref<Array<{ product: Product; qty: number }>>([]);
const customerName = ref('');
const customerPhone = ref('');
const deliveryAddress = ref('');

const filteredProducts = computed(() => {
  return businessStore.products.filter(p => {
    const matchesCat = selectedCategory.value === 'all' || p.categoryId === selectedCategory.value;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCat && matchesSearch;
  });
});

const cartItemsCount = computed(() => {
  return onlineCart.value.reduce((acc, item) => acc + item.qty, 0);
});

const cartTotalAmount = computed(() => {
  return onlineCart.value.reduce((acc, item) => acc + (item.product.sellingPrice * item.qty), 0);
});

const addToStoreCart = (product: Product) => {
  const existing = onlineCart.value.find(item => item.product.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    onlineCart.value.push({ product, qty: 1 });
  }
  showCartDrawer.value = true;
};

const updateCartQty = (productId: string, newQty: number) => {
  if (newQty <= 0) {
    onlineCart.value = onlineCart.value.filter(item => item.product.id !== productId);
  } else {
    const item = onlineCart.value.find(item => item.product.id === productId);
    if (item) item.qty = newQty;
  }
};

const submitOnlineOrder = () => {
  const businessPhone = (storeBusiness.value.phoneNumber || '').replace(/[^0-9]/g, '');
  let recipientPhone = businessPhone || '2348000000000';
  if (recipientPhone.startsWith('0') && recipientPhone.length === 11) {
    recipientPhone = '234' + recipientPhone.substring(1);
  }

  const itemsList = onlineCart.value.map(
    (i, idx) => `${idx + 1}. *${i.product.name}* (x${i.qty}) - ₦${(i.product.sellingPrice * i.qty).toLocaleString()}`
  ).join('\n');

  const message = `*NEW ONLINE ORDER - ${storeBusiness.value.name}*\n\n` +
    `*Customer:* ${customerName.value}\n` +
    `*Phone:* ${customerPhone.value}\n` +
    `*Address/Note:* ${deliveryAddress.value || 'Store Pickup'}\n\n` +
    `*Items Ordered:*\n${itemsList}\n\n` +
    `*Total Payable:* *₦${cartTotalAmount.value.toLocaleString()}*\n\n` +
    `_Placed via TradeOS Commerce Storefront_`;

  const url = `https://wa.me/${recipientPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
  onlineCart.value = [];
  showCartDrawer.value = false;
  alert('Thank you! Your order has been dispatched directly to the merchant via WhatsApp.');
};
</script>
