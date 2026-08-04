<template>
  <button
    class="flex w-full items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left"
    @click="$emit('click')"
  >
    <span
      class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white"
    >
      !
    </span>

    <span class="flex-1">
      <span class="block text-sm font-bold text-slate-900">확인이 필요한 지출 {{ count }}건</span>
      <span class="block text-xs text-slate-500">자동 분류한 카테고리가 맞는지 확인해 주세요</span>
    </span>

    <span class="text-red-400">›</span>
  </button>
</template>

<script setup>
defineProps({
  count: { type: Number, required: true },
});

defineEmits(['click']);
</script>
