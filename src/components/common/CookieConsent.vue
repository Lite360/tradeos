<template>
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div 
      v-if="isVisible" 
      id="cookie-consent-banner"
      class="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4 sm:px-6 sm:pb-6 no-print"
    >
      <div class="max-w-5xl mx-auto bg-white rounded-2xl border border-tradeos-border shadow-xl overflow-hidden">
        <div class="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <!-- Icon & Text -->
          <div class="flex items-start gap-3 flex-1 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <Cookie class="w-5 h-5 text-tradeos-blue" />
            </div>
            <div>
              <h3 class="font-heading font-bold text-sm text-tradeos-navy mb-1">We value your privacy</h3>
              <p class="text-xs text-tradeos-text-secondary leading-relaxed">
                TradeOS uses essential cookies to keep you signed in and remember your workspace preferences. 
                We also use analytics cookies to understand how you use our platform so we can improve it. 
                No personal data is sold to third parties. 
                <router-link to="/privacy" class="text-tradeos-blue hover:underline font-semibold">Read our Privacy Policy</router-link>
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              id="cookie-reject-btn"
              @click="handleReject"
              class="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-tradeos-border text-xs font-semibold text-tradeos-navy bg-white hover:bg-emerald-50 transition-colors"
            >
              Essential Only
            </button>
            <button
              id="cookie-accept-btn"
              @click="handleAcceptAll"
              class="flex-1 sm:flex-none btn-primary text-xs px-5 py-2"
            >
              Accept All
            </button>
          </div>
        </div>

        <!-- Expandable Preferences (optional detail) -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-60 opacity-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="max-h-60 opacity-100"
          leave-to-class="max-h-0 opacity-0"
        >
          <div v-if="showDetails" class="border-t border-tradeos-border px-5 sm:px-6 py-4 bg-emerald-50/30 overflow-hidden">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div class="flex items-center justify-between p-3 rounded-lg bg-white border border-tradeos-border">
                <div>
                  <span class="font-semibold text-tradeos-navy block">Essential</span>
                  <span class="text-tradeos-text-secondary text-[10px]">Auth, session, CSRF</span>
                </div>
                <span class="text-[10px] font-bold text-emerald-600 uppercase">Always On</span>
              </div>

              <div class="flex items-center justify-between p-3 rounded-lg bg-white border border-tradeos-border">
                <div>
                  <span class="font-semibold text-tradeos-navy block">Functional</span>
                  <span class="text-tradeos-text-secondary text-[10px]">Preferences & workspace</span>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="functionalEnabled" class="sr-only peer">
                  <div class="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:bg-tradeos-blue transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              <div class="flex items-center justify-between p-3 rounded-lg bg-white border border-tradeos-border">
                <div>
                  <span class="font-semibold text-tradeos-navy block">Analytics</span>
                  <span class="text-tradeos-text-secondary text-[10px]">Usage patterns & errors</span>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="analyticsEnabled" class="sr-only peer">
                  <div class="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:bg-tradeos-blue transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            </div>

            <div class="mt-3 flex justify-end">
              <button
                @click="handleSavePreferences"
                class="btn-primary text-xs px-4 py-1.5"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </Transition>

        <!-- Toggle Details Link -->
        <div class="border-t border-tradeos-border px-5 sm:px-6 py-2.5 flex justify-center">
          <button
            id="cookie-customize-btn"
            @click="showDetails = !showDetails"
            class="text-[11px] text-tradeos-text-secondary hover:text-tradeos-blue font-semibold transition-colors flex items-center gap-1"
          >
            <Settings class="w-3 h-3" />
            {{ showDetails ? 'Hide Cookie Settings' : 'Customize Cookie Settings' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Cookie, Settings } from 'lucide-vue-next';

const COOKIE_CONSENT_KEY = 'tradeos_cookie_consent';

interface CookiePreferences {
  essential: boolean;     // always true
  functional: boolean;
  analytics: boolean;
  consentDate: string;
}

const isVisible = ref(false);
const showDetails = ref(false);
const functionalEnabled = ref(true);
const analyticsEnabled = ref(true);

function getStoredConsent(): CookiePreferences | null {
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore parse errors
  }
  return null;
}

function saveConsent(preferences: CookiePreferences) {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
  isVisible.value = false;
}

function handleAcceptAll() {
  saveConsent({
    essential: true,
    functional: true,
    analytics: true,
    consentDate: new Date().toISOString()
  });
}

function handleReject() {
  saveConsent({
    essential: true,
    functional: false,
    analytics: false,
    consentDate: new Date().toISOString()
  });
}

function handleSavePreferences() {
  saveConsent({
    essential: true,
    functional: functionalEnabled.value,
    analytics: analyticsEnabled.value,
    consentDate: new Date().toISOString()
  });
}

onMounted(() => {
  const consent = getStoredConsent();
  if (!consent) {
    // Delay showing banner slightly for better UX — let the page load first
    setTimeout(() => {
      isVisible.value = true;
    }, 1200);
  } else {
    // Pre-populate toggles from stored preferences
    functionalEnabled.value = consent.functional;
    analyticsEnabled.value = consent.analytics;
  }
});
</script>
