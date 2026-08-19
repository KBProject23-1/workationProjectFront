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
      class="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3 text-gray-500"
    >
      <component :is="icon" :size="28" />
    </div>
    <p class="text-[14px] font-medium text-gray-500">{{ title }}</p>
    <p v-if="description" class="text-[12px] text-gray-500 mt-1">{{ description }}</p>
  </div>
</template>
