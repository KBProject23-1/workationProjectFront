<script setup>
defineProps({
  icon: { type: [Object, Function], default: null },
  title: { type: String, required: true },
  description: { type: String, default: '' },
});
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div
      v-if="icon"
      class="w-14 h-14 rounded-sheet bg-canvas flex items-center justify-center mb-3 text-ink-sub"
    >
      <component :is="icon" :size="28" />
    </div>
    <p class="text-body font-medium text-ink-sub">{{ title }}</p>
    <p v-if="description" class="text-body-sm text-ink-sub mt-1">{{ description }}</p>
  </div>
</template>
