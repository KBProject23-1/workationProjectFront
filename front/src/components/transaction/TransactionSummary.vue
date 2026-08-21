<script setup>
defineProps({
  charge: { type: Number, default: 0 },
  outflow: { type: Number, default: 0 },
  outflowCount: { type: Number, default: 0 },
});
</script>

<template>
  <div
    class="w-full rounded-sheet bg-canvas/80 p-4 text-left border border-line/80 mb-3"
  >
    <div class="grid grid-cols-2 divide-x divide-line/60">
      <div class="pr-3">
        <div class="flex items-center gap-1.5 mb-1">
          <span class="w-1.5 h-1.5 rounded-full bg-gray-800"></span>
          <span class="text-body-sm font-semibold text-ink-sub">총 지출</span>
          <span class="text-caption font-medium text-ink-sub"
            >({{ outflowCount }}건)</span
          >
        </div>
        <p class="text-heading font-bold text-ink tracking-tight">
          {{ outflow.toLocaleString('ko-KR')
          }}<span class="text-body-sm font-bold text-ink ml-0.5">원</span>
        </p>
      </div>

      <div class="pl-4">
        <div class="flex items-center gap-1.5 mb-1">
          <span class="w-1.5 h-1.5 rounded-full bg-brand"></span>
          <span class="text-body-sm font-semibold text-ink-sub">총 충전</span>
        </div>
        <p class="text-heading font-bold text-brand tracking-tight">
          +{{ charge.toLocaleString('ko-KR')
          }}<span class="text-body-sm font-bold text-brand/80 ml-0.5"
            >원</span
          >
        </p>
      </div>
    </div>
  </div>
</template>
