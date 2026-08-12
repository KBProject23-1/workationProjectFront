<script setup>
defineProps({
  charge: { type: Number, default: 0 },
  outflow: { type: Number, default: 0 },
  outflowCount: { type: Number, default: 0 },
});
</script>

<template>
  <div
    class="w-full rounded-2xl bg-gray-50/80 p-4 text-left border border-gray-100/80 mb-3"
  >
    <div class="grid grid-cols-2 divide-x divide-gray-200/60">
      <div class="pr-3">
        <div class="flex items-center gap-1.5 mb-1">
          <span class="w-1.5 h-1.5 rounded-full bg-gray-800"></span>
          <span class="text-[12px] font-semibold text-gray-500">총 지출</span>
          <span class="text-[11px] font-medium text-gray-500"
            >({{ outflowCount }}건)</span
          >
        </div>
        <p class="text-[18px] font-extrabold text-gray-900 tracking-tight">
          {{ outflow.toLocaleString('ko-KR')
          }}<span class="text-[13px] font-bold text-gray-700 ml-0.5">원</span>
        </p>
      </div>

      <div class="pl-4">
        <div class="flex items-center gap-1.5 mb-1">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          <span class="text-[12px] font-semibold text-gray-500">총 충전</span>
        </div>
        <p class="text-[18px] font-extrabold text-blue-600 tracking-tight">
          +{{ charge.toLocaleString('ko-KR')
          }}<span class="text-[13px] font-bold text-blue-600/80 ml-0.5"
            >원</span
          >
        </p>
      </div>
    </div>
  </div>
</template>
