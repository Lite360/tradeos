<template>
  <header class="bg-white border-b border-tradeos-border h-16 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
    <!-- Left: Brand / Mobile menu trigger & Business Switcher -->
    <div class="flex items-center gap-3">
      <button 
        @click="$emit('toggle-sidebar')" 
        class="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        aria-label="Toggle navigation menu"
      >
        <Menu class="w-5 h-5" />
      </button>

      <!-- Active Business & Branch Badge -->
      <div v-if="authStore.activeBusiness" class="flex items-center gap-2">
        <button 
          @click="showBusinessModal = true"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-left"
        >
          <Building2 class="w-4 h-4 text-tradeos-blue shrink-0" />
          <div class="hidden sm:block">
            <div class="text-xs font-bold text-tradeos-navy leading-tight truncate max-w-[140px]">
              {{ authStore.activeBusiness.name }}
            </div>
            <div class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              {{ authStore.activeBranch?.name || 'Main Branch' }}
            </div>
          </div>
          <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
        </button>

        <span class="hidden md:inline-flex badge badge-navy text-[11px] capitalize">
          {{ authStore.activeBusiness.category }} Retail
        </span>
      </div>

      <div v-else class="flex items-center gap-2">
        <span class="font-heading text-lg font-extrabold text-tradeos-navy">TradeOS</span>
      </div>
    </div>

    <!-- Center: Search or Offline Indicator -->
    <div class="flex items-center gap-2">
      <div v-if="businessStore.isOffline" class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold animate-pulse">
        <WifiOff class="w-3.5 h-3.5 text-amber-600" />
        <span>Offline Mode (Queueing Actions)</span>
      </div>
    </div>

    <!-- Right: Notifications, Super Admin link, User Profile Menu -->
    <div class="flex items-center gap-3">
      <router-link 
        v-if="authStore.isSuperAdmin" 
        to="/admin" 
        class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold transition-colors"
      >
        <ShieldCheck class="w-4 h-4 text-indigo-600" />
        <span>Super Admin</span>
      </router-link>

      <!-- Account Menu Dropdown -->
      <div class="relative">
        <button 
          @click="showUserMenu = !showUserMenu"
          class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <div class="w-8 h-8 rounded-full bg-tradeos-navy text-white flex items-center justify-center font-heading font-bold text-sm">
            {{ userInitial }}
          </div>
          <span class="hidden sm:inline text-xs font-semibold text-tradeos-navy">
            {{ authStore.user?.fullName }}
          </span>
          <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
        </button>

        <!-- Menu Popup -->
        <div 
          v-if="showUserMenu"
          @click.outside="showUserMenu = false"
          class="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 text-xs"
        >
          <div class="px-4 py-2 border-b border-slate-100">
            <div class="font-bold text-tradeos-navy">{{ authStore.user?.fullName }}</div>
            <div class="text-slate-500 truncate">{{ authStore.user?.email }}</div>
          </div>

          <router-link to="/onboarding" class="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700">
            <PlusCircle class="w-4 h-4 text-slate-400" />
            <span>Create New Business</span>
          </router-link>

          <router-link to="/subscription" class="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700">
            <CreditCard class="w-4 h-4 text-slate-400" />
            <span>Plan & Subscriptions</span>
          </router-link>

          <div class="border-t border-slate-100 my-1"></div>

          <button 
            @click="handleLogout"
            class="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-left font-medium"
          >
            <LogOut class="w-4 h-4 text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Business Switcher Modal -->
    <Modal :show="showBusinessModal" title="Switch Business Workspace" @close="showBusinessModal = false">
      <div class="space-y-3">
        <p class="text-xs text-slate-500">Select a workspace to manage sales, stock, and records:</p>
        
        <div class="space-y-2 max-h-60 overflow-y-auto">
          <button
            v-for="biz in authStore.businesses"
            :key="biz.id"
            @click="selectBusiness(biz.id)"
            class="w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all"
            :class="biz.id === authStore.activeBusinessId ? 'border-tradeos-blue bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'"
          >
            <div>
              <div class="font-bold text-tradeos-navy text-sm">{{ biz.name }}</div>
              <div class="text-xs text-slate-500 capitalize">{{ biz.category }} Retail • {{ biz.branches?.length || 1 }} Branch(es)</div>
            </div>
            <Check v-if="biz.id === authStore.activeBusinessId" class="w-5 h-5 text-tradeos-blue shrink-0" />
          </button>
        </div>

        <div class="pt-2 border-t border-slate-100">
          <router-link 
            to="/onboarding" 
            @click="showBusinessModal = false"
            class="btn-secondary w-full text-xs justify-center"
          >
            <PlusCircle class="w-4 h-4" />
            <span>Add Another Business</span>
          </router-link>
        </div>
      </div>
    </Modal>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useBusinessStore } from '@/stores/business';
import Modal from '@/components/common/Modal.vue';
import { 
  Menu, Building2, ChevronDown, WifiOff, ShieldCheck, 
  PlusCircle, CreditCard, LogOut, Check 
} from 'lucide-vue-next';

defineEmits(['toggle-sidebar']);

const authStore = useAuthStore();
const businessStore = useBusinessStore();
const router = useRouter();

const showUserMenu = ref(false);
const showBusinessModal = ref(false);

const userInitial = computed(() => {
  return authStore.user?.fullName ? authStore.user.fullName.charAt(0).toUpperCase() : 'U';
});

const selectBusiness = (bizId: string) => {
  authStore.setActiveBusiness(bizId);
  businessStore.initializeWorkspaceData();
  showBusinessModal.value = false;
};

const handleLogout = () => {
  showUserMenu.value = false;
  authStore.logout();
  router.push('/login');
};
</script>
