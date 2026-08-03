<script setup>
import { ref, computed } from 'vue';
import { ChevronLeft } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseInput from '@/components/common/BaseInput.vue';

const props = defineProps({
  accounts: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
});

const emit = defineEmits(['next', 'back']);

const presets = [10000, 50000, 100000, 300000];
const amountInput = ref('');
const selectedAccountId = computed(
  () =>
    props.accounts.find((a) => a.isPrimary)?.accountId ??
    props.accounts[0]?.accountId ??
    null,
);
const warningMessage = ref('');

const amount = computed(() => Number(amountInput.value) || 0);

const selectedAccount = computed(() =>
  props.accounts.find((a) => a.accountId === selectedAccountId.value),
);

// 프리셋 클릭 시 기존 금액에 누적
function addPreset(value) {
  const current = Number(amountInput.value) || 0;
  amountInput.value = String(current + value);
  warningMessage.value = '';
}

function handleNext() {
  if (!selectedAccountId.value) {
    warningMessage.value = '출금 계좌를 먼저 연동해주세요.';
    return;
  }
  if (amount.value < 10000) {
    warningMessage.value = '최소 충전 금액은 10,000원이에요.';
    return;
  }
  if (amount.value > 2000000) {
    warningMessage.value = '1회 최대 충전 금액은 2,000,000원이에요.';
    return;
  }
  warningMessage.value = '';
  emit('next', { accountId: selectedAccountId.value, amount: amount.value });
}
</script>

<template>
  <div class="flex flex-col w-full min-h-screen px-5 py-6">
    <button type="button" class="mb-4 self-start" @click="$emit('back')">
      <ChevronLeft :size="24" />
    </button>
    <h1 class="text-xl font-bold mb-6">충전하기</h1>

    <p class="text-[14px] text-gray-500 mb-2 text-left">충전 금액 선택</p>
    <div class="grid grid-cols-2 gap-2 mb-4">
      <button
        v-for="preset in presets"
        :key="preset"
        type="button"
        class="border border-gray-200 rounded-xl py-3 text-[15px] text-gray-700"
        @click="addPreset(preset)"
      >
        +{{ preset.toLocaleString('ko-KR') }}원
      </button>
    </div>

    <BaseInput
      v-model="amountInput"
      placeholder="직접 입력"
      :has-error="!!warningMessage"
      :error-message="warningMessage"
      class="mb-6"
    />

    <p class="text-[14px] text-gray-500 mb-2 text-left">출금 계좌</p>
    <div
      v-if="selectedAccount"
      class="border rounded-xl px-4 py-3.5 mb-6 text-left"
    >
      <p class="text-[15px] font-medium">{{ selectedAccount.bankName }}</p>
      <p class="text-[13px] text-gray-500">
        잔액 {{ selectedAccount.balance?.toLocaleString('ko-KR') }}원
      </p>
    </div>
    <p v-else class="text-[14px] text-gray-400 mb-6">연동된 계좌가 없어요</p>

    <div class="flex-1"></div>

    <p class="text-right text-xl font-bold mb-4">
      {{ amount.toLocaleString('ko-KR') }}원
    </p>

    <div class="w-full pb-4">
      <BaseButton :disabled="isLoading" class="w-full" @click="handleNext">
        {{ isLoading ? '충전 중...' : '다음' }}
      </BaseButton>
    </div>
  </div>
</template>
