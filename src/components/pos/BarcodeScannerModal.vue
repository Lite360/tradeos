<template>
  <Modal :show="show" title="Camera Barcode & QR Scanner" @close="handleClose">
    <div class="space-y-4">
      <!-- Camera Viewport -->
      <div class="relative bg-slate-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-slate-700">
        <div id="tradeos-qr-reader" class="w-full h-full"></div>

        <!-- Scanning Overlay Frame -->
        <div v-if="isScanning" class="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div class="w-48 h-36 border-2 border-emerald-400 rounded-lg relative animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.5)]">
            <div class="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400"></div>
            <div class="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400"></div>
            <div class="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400"></div>
            <div class="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400"></div>
            <div class="w-full h-0.5 bg-emerald-400/80 absolute top-1/2 -translate-y-1/2 shadow-sm"></div>
          </div>
        </div>

        <div v-if="errorMessage" class="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white">
          <AlertCircle class="w-10 h-10 text-rose-500 mb-2" />
          <p class="text-xs font-semibold text-rose-300">{{ errorMessage }}</p>
          <button @click="startScanner" class="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold">
            Try Again
          </button>
        </div>
      </div>

      <!-- Controls & Status -->
      <div class="flex items-center justify-between text-xs text-slate-600 px-1">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full" :class="isScanning ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'"></span>
          <span class="font-semibold">{{ isScanning ? 'Point camera at product barcode' : 'Scanner paused' }}</span>
        </div>

        <div class="flex items-center gap-2">
          <button 
            type="button" 
            @click="switchCamera" 
            class="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
            title="Switch Camera"
          >
            <Camera class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800">
        <span class="font-bold">Tip:</span> TradeOS also automatically detects hardware USB / Bluetooth handheld laser scanners when typing SKU or scanning in the POS terminal.
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, nextTick } from 'vue';
import { Html5Qrcode } from 'html5-qrcode';
import Modal from '@/components/common/Modal.vue';
import { AlertCircle, Camera } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'scan', code: string): void;
}>();

const isScanning = ref(false);
const errorMessage = ref('');
let scannerInstance: Html5Qrcode | null = null;
let currentFacingMode: 'environment' | 'user' = 'environment';

const startScanner = async () => {
  errorMessage.value = '';
  await nextTick();

  try {
    if (!scannerInstance) {
      scannerInstance = new Html5Qrcode('tradeos-qr-reader');
    }

    if (scannerInstance.isScanning) {
      await scannerInstance.stop();
    }

    await scannerInstance.start(
      { facingMode: currentFacingMode },
      {
        fps: 15,
        qrbox: { width: 250, height: 180 },
        aspectRatio: 1.777778
      },
      (decodedText) => {
        // Success scan
        emit('scan', decodedText);
        handleClose();
      },
      () => {
        // ignore frame parse errors
      }
    );

    isScanning.value = true;
  } catch (err: any) {
    console.error('Barcode scanner initialization error:', err);
    errorMessage.value = err?.message || 'Could not access device camera. Please check camera permissions.';
    isScanning.value = false;
  }
};

const stopScanner = async () => {
  if (scannerInstance && scannerInstance.isScanning) {
    try {
      await scannerInstance.stop();
    } catch (e) {
      console.warn('Error stopping scanner:', e);
    }
  }
  isScanning.value = false;
};

const switchCamera = async () => {
  currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
  await stopScanner();
  await startScanner();
};

const handleClose = async () => {
  await stopScanner();
  emit('close');
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      startScanner();
    }, 200);
  } else {
    stopScanner();
  }
});

onBeforeUnmount(() => {
  stopScanner();
});
</script>
