<script setup>
defineProps({
  message: { type: String, default: '' },
});
</script>

<template>
  <div
    v-if="message"
    class="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[14px] px-4 py-2 rounded-lg z-50"
  >
    {{ message }}
  </div>
</template>
