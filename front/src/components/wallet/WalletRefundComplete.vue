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
    class="flex flex-col items-center w-full min-h-screen px-5 py-6 text-center bg-canvas"
  >
    <div class="w-full flex items-center justify-center mb-4">
      <h1 class="text-title font-bold text-ink">환불 완료</h1>
    </div>

    <div
      class="flex-1 flex flex-col items-center justify-center w-full my-auto"
    >
      <div class="relative mb-5">
        <div
          class="w-20 h-20 rounded-full bg-brand-weak flex items-center justify-center relative z-10 shadow-inner"
        >
          <Check
            :size="36"
            :stroke-width="3"
            class="text-brand animate-bounce-once"
          />
        </div>
        <div
          class="absolute inset-0 bg-brand-weak/50 rounded-full blur-xl pointer-events-none"
        ></div>
      </div>

      <p class="text-body font-semibold text-brand mb-1">환불 신청 완료</p>

      <p
        v-if="result?.refundedAmount"
        class="text-[30px] font-bold text-ink tracking-tight"
      >
        {{ result.refundedAmount.toLocaleString('ko-KR')
        }}<span class="text-heading font-bold ml-1">원</span>
      </p>

      <p class="text-body-sm font-medium text-ink-sub mt-1">
        선택한 계좌로 안전하게 입금됐어요
      </p>
    </div>

    <div
      v-if="result"
      class="rounded-sheet bg-canvas/80 p-5 mb-6 w-full text-left space-y-3 border border-line"
    >
      <div class="flex justify-between items-center text-body-sm">
        <span class="text-ink-sub font-medium">환불 신청 포인트</span>
        <span class="font-bold text-ink text-body">
          {{ result.refundedAmount?.toLocaleString('ko-KR') }} P
        </span>
      </div>

      <div class="flex justify-between items-center text-body-sm">
        <span class="text-ink-sub font-medium">입금 계좌</span>
        <span class="font-semibold text-ink text-body-sm">
          {{ result.targetAccount?.maskedAccountNumber || '주 계좌' }}
        </span>
      </div>

      <div
        class="flex justify-between items-center text-body-sm pt-3 border-t border-line/60"
      >
        <span class="text-ink-sub font-medium">환불 후 잔액</span>
        <span class="font-bold text-brand text-body">
          {{ result.remainingBalance?.toLocaleString('ko-KR') }}원
        </span>
      </div>
    </div>

    <div class="w-full pb-2 mt-auto text-center">
      <BaseButton
        class="w-full"
        @click="$emit('confirm')"
      >
        확인
      </BaseButton>
    </div>
  </div>
</template>
