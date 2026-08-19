<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  retryLabel: { type: String, default: '다시 시도' },
  showRetry: { type: Boolean, default: true },
});

defineEmits(['retry']);
</script>

<template>
  <div class="text-center">
    <p class="text-[15px] font-semibold text-slate-600">{{ title }}</p>
    <p v-if="description" class="mt-2 text-[12px] text-slate-400">{{ description }}</p>
    <button
      v-if="showRetry"
      type="button"
      class="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-[14px] font-semibold text-slate-700"
      @click="$emit('retry')"
    >
      {{ retryLabel }}
    </button>
  </div>
</template>
