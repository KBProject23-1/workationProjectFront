<template>
  <div>
    <div class="mb-2 flex items-baseline justify-between gap-3">
      <label class="text-body-sm font-semibold text-ink-sub">{{ label }}</label>
      <span v-if="hint" class="text-body-sm shrink-0 text-ink-mute">
        {{ hint }}
      </span>
    </div>

    <slot />

    <p v-if="errorMessage" class="text-body-sm text-danger mt-1.5">
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
