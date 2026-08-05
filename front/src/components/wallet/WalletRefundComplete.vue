<script setup>
import { Check } from '@lucide/vue';
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
    <div class="w-full flex items-center justify-center mb-4">
      <h1 class="text-[16px] font-bold text-gray-800">환급 완료</h1>
    </div>

    <div
      class="flex-1 flex flex-col items-center justify-center w-full my-auto"
    >
      <div class="relative mb-5">
        <div
          class="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center relative z-10 shadow-inner"
        >
          <Check
            :size="36"
            :stroke-width="3"
            class="text-blue-600 animate-bounce-once"
          />
        </div>
        <div
          class="absolute inset-0 bg-blue-100/50 rounded-full blur-xl pointer-events-none"
        ></div>
      </div>

      <p class="text-[14px] font-semibold text-blue-600 mb-1">환급 신청 완료</p>

      <p
        v-if="result?.refundedAmount"
        class="text-[30px] font-extrabold text-gray-900 tracking-tight"
      >
        {{ result.refundedAmount.toLocaleString('ko-KR')
        }}<span class="text-[20px] font-bold ml-1">원</span>
      </p>

      <p class="text-[13px] font-medium text-gray-400 mt-1">
        주 계좌로 안전하게 입금됐어요
      </p>
    </div>

    <div
      v-if="result"
      class="rounded-2xl bg-gray-50/80 p-5 mb-6 w-full text-left space-y-3 border border-gray-100"
    >
      <div class="flex justify-between items-center text-[13px]">
        <span class="text-gray-400 font-medium">환급 신청 포인트</span>
        <span class="font-bold text-gray-900 text-[14px]">
          {{ result.refundedAmount?.toLocaleString('ko-KR') }} P
        </span>
      </div>

      <div class="flex justify-between items-center text-[13px]">
        <span class="text-gray-400 font-medium">입금 계좌</span>
        <span class="font-semibold text-gray-700 text-[13px]">주 계좌</span>
      </div>

      <div
        class="flex justify-between items-center text-[13px] pt-3 border-t border-gray-200/60"
      >
        <span class="text-gray-400 font-medium">환급 후 잔액</span>
        <span class="font-bold text-blue-600 text-[14px]">
          {{ result.remainingBalance?.toLocaleString('ko-KR') }}원
        </span>
      </div>
    </div>

    <div class="w-full pb-2 mt-auto text-center">
      <BaseButton
        class="w-full py-3.5 text-[15px] font-bold rounded-2xl"
        @click="$emit('confirm')"
      >
        확인
      </BaseButton>
    </div>
  </div>
</template>
