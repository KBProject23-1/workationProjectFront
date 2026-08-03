<script setup>
import BaseButton from '@/components/common/BaseButton.vue';

defineProps({
  result: { type: Object, default: null },
});

defineEmits(['confirm']);
</script>

<template>
  <div
    class="flex flex-col items-center w-full min-h-screen px-5 py-6 text-center bg-white"
  >
    <h1 class="text-xl font-bold mb-8">충전 완료</h1>

    <div class="flex-1 flex flex-col items-center justify-center gap-4 w-full">
      <div
        class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl"
      >
        ✓
      </div>
      <p class="text-[15px] text-gray-600">충전이 완료되었습니다.</p>
    </div>

    <div
      v-if="result"
      class="border rounded-xl px-4 py-3.5 mb-6 w-full text-left space-y-2"
    >
      <div class="flex justify-between text-[15px]">
        <span class="text-gray-500">충전 금액</span>
        <span class="font-medium"
          >{{ result.chargedAmount?.toLocaleString('ko-KR') }}원</span
        >
      </div>
      <div class="flex justify-between text-[15px]">
        <span class="text-gray-500">현재 잔액</span>
        <span class="font-medium"
          >{{ result.currentBalance?.toLocaleString('ko-KR') }}원</span
        >
      </div>
    </div>

    <div class="w-full pb-4">
      <BaseButton class="w-full" @click="$emit('confirm')">확인</BaseButton>
    </div>
  </div>
</template>
