<script setup>
defineProps({
  charge: { type: Number, default: 0 },
  outflow: { type: Number, default: 0 },
  outflowCount: { type: Number, default: 0 },
});
</script>

<template>
  <div class="w-full flex gap-3 mb-6">
    <div class="flex-1 bg-gray-50 rounded-2xl px-4 py-4 text-left">
      <p class="text-[13px] text-gray-500 mb-1">지출</p>
      <p class="text-[19px] font-bold text-gray-900">
        {{ outflow.toLocaleString('ko-KR') }}원
      </p>
      <p class="text-[12px] text-gray-400 mt-0.5">{{ outflowCount }}건</p>
    </div>
    <div class="flex-1 bg-gray-50 rounded-2xl px-4 py-4 text-left">
      <p class="text-[13px] text-gray-500 mb-1">충전</p>
      <p class="text-[19px] font-bold text-primary">
        +{{ charge.toLocaleString('ko-KR') }}원
      </p>
    </div>
  </div>
</template>
