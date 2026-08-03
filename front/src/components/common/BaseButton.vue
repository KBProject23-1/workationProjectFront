<template>
  <button
    type="button"
    class="w-full max-w-[340px] font-medium transition"
    style="
      aspect-ratio: 340 / 70;
      font-size: 24px;
      border-radius: 20px;
      background-color: #3086ed;
      color: #ffffff;
    "
    :class="disabled ? 'opacity-40' : ''"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  disabled: { type: Boolean, default: false },
});
</script>
