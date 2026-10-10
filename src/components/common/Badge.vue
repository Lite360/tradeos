<template>
  <span 
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border"
    :class="variantClass"
  >
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'navy' | 'gray';
}>(), {
  variant: 'gray'
});

const variantClass = computed(() => {
  switch (props.variant) {
    case 'success': return 'bg-emerald-600 text-white border-emerald-600 font-bold';
    case 'warning': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'danger': return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'info': return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    case 'navy': return 'bg-emerald-50/70 text-tradeos-navy border-emerald-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
});
</script>
