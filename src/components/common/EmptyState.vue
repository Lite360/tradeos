<template>
  <div class="card-panel text-center py-12 px-6 flex flex-col items-center justify-center">
    <div
      class="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mb-4">
      <component :is="icon || PackageOpen" class="w-7 h-7" />
    </div>
    <h3 class="font-heading font-bold text-base text-tradeos-navy mb-1">{{ title }}</h3>
    <p class="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">{{ description }}</p>
    <button v-if="actionLabel" @click="$emit('action')" class="btn-primary text-xs">
      <Plus class="w-4 h-4" />
      <span>{{ actionLabel }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { PackageOpen, Plus } from 'lucide-vue-next';

defineProps<{
  title: string;
  description: string;
  actionLabel?: string;
  icon?: any;
}>();

defineEmits(['action']);
</script>
