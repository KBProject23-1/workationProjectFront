<template>
  <div>
    <div class="mb-1.5 flex items-baseline justify-between">
      <label class="text-xs text-slate-500">{{ label }}</label>
      <span v-if="hint" class="text-xs text-slate-400">{{ hint }}</span>
    </div>

    <slot />

    <p v-if="errorMessage" class="mt-1.5 text-xs text-red-500">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
});
</script>
