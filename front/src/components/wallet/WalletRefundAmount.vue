<script setup>
import { ref, computed } from 'vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseInput from '@/components/common/BaseInput.vue';

const props = defineProps({
  balance: { type: Number, default: 0 },
  primaryAccount: { type: Object, default: null },
  isLoading: { type: Boolean, default: false },
});

const emit = defineEmits(['next', 'back']);

const amountInput = ref('');
const warningMessage = ref('');

const amount = computed(() => Number(amountInput.value) || 0);

function handleNext() {
  if (!props.primaryAccount) {
    warningMessage.value = '주 계좌가 설정되어 있지 않아요.';
    return;
  }
  if (amount.value <= 0) {
    warningMessage.value = '환불 금액을 입력해주세요.';
    return;
  }
  if (amount.value > props.balance) {
    warningMessage.value = '보유 잔액을 초과했어요.';
    return;
  }
  warningMessage.value = '';
  emit('next', { amount: amount.value });
}
</script>

<template>
  <div class="flex flex-col w-full min-h-screen px-5 py-6">
    <button
      type="button"
      class="text-2xl mb-4 self-start"
      @click="$emit('back')"
    >
      ‹
    </button>
    <h1 class="text-xl font-bold mb-2">내 계좌로 송금</h1>

    <p class="text-[14px] text-gray-500 mb-2 text-left mt-4">
      환급 가능 포인트
    </p>
    <div class="border rounded-xl px-4 py-4 mb-6 text-left">
      <p class="text-xl font-bold">{{ balance.toLocaleString('ko-KR') }} P</p>
      <p class="text-[12px] text-gray-400 mt-1">
        지금 환급 신청 시, 즉시 입금됩니다.
      </p>
    </div>

    <BaseInput
      v-model="amountInput"
      placeholder="환급 금액 입력"
      :has-error="!!warningMessage"
      :error-message="warningMessage"
      class="mb-6"
    />

    <p class="text-[14px] text-gray-500 mb-2 text-left">환급 계좌</p>
    <div
      v-if="primaryAccount"
      class="flex items-center justify-between border rounded-xl px-4 py-3.5 mb-6"
    >
      <div class="text-left">
        <p class="text-[15px] font-medium">{{ primaryAccount.bankName }}</p>
        <p class="text-[13px] text-gray-500">
          {{ primaryAccount.maskedAccountNumber }}
        </p>
      </div>
    </div>
    <p v-else class="text-[14px] text-gray-400 mb-6">주 계좌가 없어요</p>

    <div class="flex-1"></div>

    <div class="w-full pb-4">
      <BaseButton :disabled="isLoading" class="w-full" @click="handleNext">
        {{ isLoading ? '처리 중...' : '환급 신청' }}
      </BaseButton>
    </div>
  </div>
</template>
