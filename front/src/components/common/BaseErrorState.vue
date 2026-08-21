<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  retryLabel: { type: String, default: '다시 시도' },
  showRetry: { type: Boolean, default: true },
  titleClass: { type: [String, Array, Object], default: 'text-body font-semibold text-ink-sub' },
});

defineEmits(['retry']);
</script>

<template>
  <div class="text-center">
    <p :class="titleClass">{{ title }}</p>
    <p v-if="description" class="mt-2 text-body-sm text-ink-mute">{{ description }}</p>
    <button
      v-if="showRetry"
      type="button"
      class="mt-5 rounded-chip border border-line px-4 py-2 text-body font-semibold text-ink"
      @click="$emit('retry')"
    >
      {{ retryLabel }}
    </button>
  </div>
</template>
