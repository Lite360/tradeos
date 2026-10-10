<template>
  <div class="card-panel relative overflow-hidden flex flex-col justify-between">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{{ label }}</p>
        <h3 class="font-heading font-extrabold text-2xl text-tradeos-navy">
          <span v-if="isCurrency">₦</span>{{ formattedValue }}
        </h3>
      </div>
      <div v-if="icon" class="p-2.5 rounded-xl" :class="iconBgClass">
        <component :is="icon" class="w-5 h-5" :class="iconColorClass" />
      </div>
    </div>

    <div v-if="subtitle" class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
      <span class="text-slate-500">{{ subtitle }}</span>
      <span v-if="badgeText" class="font-bold" :class="badgeColorClass">{{ badgeText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  label: string;
  value: number | string;
  isCurrency?: boolean;
  subtitle?: string;
  badgeText?: string;
  variant?: 'emerald' | 'amber' | 'rose' | 'navy';
  icon?: any;
}>(), {
  isCurrency: false,
  variant: 'emerald'
});

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString('en-NG', { minimumFractionDigits: props.isCurrency ? 2 : 0, maximumFractionDigits: 2 });
  }
  return props.value;
});

const iconBgClass = computed(() => {
  switch (props.variant) {
    case 'emerald': return 'bg-emerald-50';
    case 'amber': return 'bg-amber-50';
    case 'rose': return 'bg-rose-50';
    case 'navy': return 'bg-slate-100';
    default: return 'bg-emerald-50';
  }
});

const iconColorClass = computed(() => {
  switch (props.variant) {
    case 'emerald': return 'text-emerald-600';
    case 'amber': return 'text-amber-600';
    case 'rose': return 'text-rose-600';
    case 'navy': return 'text-tradeos-navy';
    default: return 'text-tradeos-blue';
  }
});

const badgeColorClass = computed(() => {
  switch (props.variant) {
    case 'emerald': return 'text-emerald-700';
    case 'amber': return 'text-amber-700';
    case 'rose': return 'text-rose-700';
    default: return 'text-tradeos-blue';
  }
});
</script>
