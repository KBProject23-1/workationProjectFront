<template>
  <button
    class="rounded-card bg-danger/8 flex w-full items-center gap-3 px-4 py-3.5 text-left transition-transform active:scale-[0.99]"
    @click="$emit('click')"
  >
    <span
      class="text-caption bg-danger flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-bold text-white"
    >
      !
    </span>

    <span class="min-w-0 flex-1">
      <span class="text-body-sm block font-bold text-ink">
        확인이 필요한 지출 {{ count }}건
      </span>
      <span class="text-caption mt-0.5 block text-ink-sub">
        자동 분류한 카테고리가 맞는지 확인해 주세요
      </span>
    </span>

    <span class="text-caption text-danger shrink-0 font-bold">확인 ›</span>
  </button>
</template>

<script setup>
defineProps({
  count: { type: Number, required: true },
});

defineEmits(['click']);
</script>
