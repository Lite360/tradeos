<template>
  <div class="min-h-screen bg-tradeos-bg flex flex-col font-sans">
    <!-- Authenticated Workspace Layout -->
    <template v-if="isWorkspaceRoute">
      <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <div class="flex flex-1 pt-16">
        <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

        <!-- Overlay backdrop for mobile -->
        <div 
          v-if="sidebarOpen" 
          @click="sidebarOpen = false" 
          class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
        ></div>

        <main class="flex-1 lg:ml-64 p-4 lg:p-8 min-w-0">
          <router-view />
        </main>
      </div>
    </template>

    <!-- Public / Standalone Auth / Onboarding Layout -->
    <template v-else>
      <router-view />
    </template>

    <!-- Cookie Consent Banner (all pages) -->
    <CookieConsent />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useBusinessStore } from '@/stores/business';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import CookieConsent from '@/components/common/CookieConsent.vue';

const route = useRoute();
const authStore = useAuthStore();
const businessStore = useBusinessStore();

const sidebarOpen = ref(false);

const isWorkspaceRoute = computed(() => {
  return route.meta.requiresBusiness === true;
});

onMounted(async () => {
  await authStore.initializeFromSession();
  if (authStore.activeBusinessId) {
    businessStore.initializeWorkspaceData();
  }
});
</script>
