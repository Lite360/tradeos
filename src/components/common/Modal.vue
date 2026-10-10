<template>
  <Teleport to="body">
    <div 
      v-if="show" 
      class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <div 
        class="bg-white rounded-xl shadow-2xl border border-tradeos-border w-full max-w-lg overflow-hidden transform transition-all"
        :class="maxWidthClass"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-tradeos-border flex items-center justify-between bg-slate-50/50">
          <h3 class="font-heading font-bold text-lg text-tradeos-navy">{{ title }}</h3>
          <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6">
          <slot></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { X } from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  show: boolean;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}>(), {
  size: 'md'
});

defineEmits(['close']);

const maxWidthClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'max-w-md';
    case 'lg': return 'max-w-2xl';
    case 'xl': return 'max-w-4xl';
    default: return 'max-w-lg';
  }
});
</script>
