<script setup>
import { Check } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';

defineProps({
  linkedAccounts: { type: Array, default: () => [] },
});

defineEmits(['confirm']);
</script>

<template>
  <div
    class="flex flex-col items-center w-full min-h-screen px-5 py-6 text-center bg-white"
  >
    <h1 class="text-xl font-bold mb-8">계좌 연동 완료</h1>

    <div class="flex-1 flex flex-col items-center justify-center gap-4 w-full">
      <div
        class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center"
      >
        <Check :size="28" :stroke-width="3" class="text-blue-600" />
      </div>
      <p class="text-[15px] text-gray-600">
        계좌 연동이 완료됐어요.<br />선택한 계좌가 정상적으로 연결되었습니다.
      </p>
    </div>

    <div class="border rounded-xl px-4 py-3.5 mb-6 w-full text-left">
      <p v-for="acc in linkedAccounts" :key="acc.accountId" class="text-[15px]">
        {{ acc.bankName }} · {{ acc.maskedAccountNumber }}
      </p>
    </div>

    <div class="w-full pb-4">
      <BaseButton class="w-full" @click="$emit('confirm')">확인</BaseButton>
    </div>
  </div>
</template>
