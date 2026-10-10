<template>
  <aside 
    class="bg-tradeos-navy text-slate-300 w-64 border-r border-emerald-900 flex flex-col fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-in-out lg:translate-x-0"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Top Branding -->
    <div class="h-16 px-6 flex items-center justify-between border-b border-emerald-900">
      <router-link to="/dashboard" class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-tradeos-blue flex items-center justify-center font-heading font-extrabold text-white text-lg">
          T
        </div>
        <div>
          <span class="font-heading font-extrabold text-white text-lg tracking-tight block leading-tight">TradeOS</span>
          <span class="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Business OS</span>
        </div>
      </router-link>

      <button @click="$emit('close')" class="lg:hidden text-slate-400 hover:text-white p-1">
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Navigation List -->
    <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-6">
      <!-- Main Core Section -->
      <div>
        <div class="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Core Operations</div>
        <div class="space-y-1">
          <router-link 
            v-for="item in navItemsCore" 
            :key="item.path" 
            :to="item.path"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors"
            :class="$route.path.startsWith(item.path) ? 'bg-tradeos-blue text-white shadow-sm' : 'text-slate-300 hover:bg-emerald-900/60 hover:text-white'"
            @click="$emit('close')"
          >
            <component :is="item.icon" class="w-4 h-4 shrink-0" />
            <span>{{ item.label }}</span>
            <span v-if="item.badge" class="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-900">
              {{ item.badge }}
            </span>
          </router-link>
        </div>
      </div>

      <!-- Financial & Records Section -->
      <div>
        <div class="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Finances & Records</div>
        <div class="space-y-1">
          <router-link 
            v-for="item in navItemsFinance" 
            :key="item.path" 
            :to="item.path"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors"
            :class="$route.path.startsWith(item.path) ? 'bg-tradeos-blue text-white shadow-sm' : 'text-slate-300 hover:bg-emerald-900/60 hover:text-white'"
            @click="$emit('close')"
          >
            <component :is="item.icon" class="w-4 h-4 shrink-0" />
            <span>{{ item.label }}</span>
          </router-link>
        </div>
      </div>

      <!-- Business Admin Section -->
      <div>
        <div class="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Administration</div>
        <div class="space-y-1">
          <router-link 
            v-for="item in navItemsAdmin" 
            :key="item.path" 
            :to="item.path"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors"
            :class="$route.path.startsWith(item.path) ? 'bg-tradeos-blue text-white shadow-sm font-bold' : 'text-slate-300 hover:bg-emerald-900/60 hover:text-white'"
            @click="$emit('close')"
          >
            <component :is="item.icon" class="w-4 h-4 shrink-0" />
            <span>{{ item.label }}</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Bottom Subscription Plan Info -->
    <div class="p-3 border-t border-emerald-900 bg-slate-950/40">
      <div class="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
        <div class="flex items-center justify-between text-slate-300 mb-1">
          <span class="font-bold text-white text-[11px]">Free Plan</span>
          <span class="text-[10px] text-emerald-400 font-semibold uppercase">Active</span>
        </div>
        <p class="text-[11px] text-slate-400 mb-2 leading-tight">Single branch workspace.</p>
        <router-link to="/subscription" class="btn-primary text-[11px] py-1.5 w-full justify-center">
          Upgrade to Pro
        </router-link>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBusinessStore } from '@/stores/business';
import { 
  LayoutDashboard, ShoppingCart, Package, FileText, 
  Users, Truck, Wallet, BarChart3, UserCheck, 
  Settings, ShieldCheck, X 
} from 'lucide-vue-next';

defineProps<{ isOpen: boolean }>();
defineEmits(['close']);

const businessStore = useBusinessStore();

const lowStockCount = computed(() => businessStore.lowStockProducts.length);

const navItemsCore = computed(() => [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/pos', label: 'Sales & POS', icon: ShoppingCart },
  { 
    path: '/inventory', 
    label: 'Products & Inventory', 
    icon: Package, 
    badge: lowStockCount.value > 0 ? `${lowStockCount.value} low` : undefined 
  },
  { path: '/invoices', label: 'Invoices & Quotations', icon: FileText },
]);

const navItemsFinance = [
  { path: '/debtors', label: 'Customers & Debtors', icon: Users },
  { path: '/creditors', label: 'Suppliers & Creditors', icon: Truck },
  { path: '/expenses', label: 'Income & Expenses', icon: Wallet },
  { path: '/reports', label: 'Financial Reports', icon: BarChart3 },
];

const navItemsAdmin = [
  { path: '/staff', label: 'Staff & Permissions', icon: UserCheck },
  { path: '/settings', label: 'Business Settings', icon: Settings },
  { path: '/subscription', label: 'Subscription & Billing', icon: ShieldCheck },
];
</script>
