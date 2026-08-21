<script setup>
import { ref, computed, watch } from 'vue';
import { X } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import AccountSelectField from '@/components/wallet/AccountSelectField.vue';

const props = defineProps({
  accounts: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  accountsLoading: { type: Boolean, default: false },
});

const emit = defineEmits(['next', 'back']);

const presets = [10000, 50000, 100000, 300000];
const amountInput = ref('');
const selectedAccountId = ref(null);
const warningMessage = ref('');

const amount = computed(() => Number(amountInput.value) || 0);

// 계좌 목록이 로드되면 주 계좌(없으면 첫 계좌)를 기본 출금 계좌로 선택
watch(
  () => props.accounts,
  (accounts) => {
    const stillValid = accounts.some(
      (a) => a.accountId === selectedAccountId.value,
    );
    if (selectedAccountId.value && stillValid) return;
    selectedAccountId.value =
      accounts.find((a) => a.isPrimary)?.accountId ??
      accounts[0]?.accountId ??
      null;
  },
  { immediate: true },
);

function addPreset(value) {
  const current = Number(amountInput.value) || 0;
  amountInput.value = String(current + value);
  warningMessage.value = '';
}

function clearAmount() {
  amountInput.value = '';
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
  <div class="flex flex-col w-full min-h-screen px-5 pt-4 pb-5 bg-canvas text-left">
    <div class="mb-6">
      <BaseHeader title="충전하기" @back="$emit('back')" />
    </div>

    <div class="mb-6">
      <p class="text-body-sm font-semibold text-ink-sub mb-1">
        얼마나 충전할까요?
      </p>
      <div class="flex items-baseline gap-1">
        <span
          class="text-[32px] font-bold tracking-tight transition-colors"
          :class="amount > 0 ? 'text-ink' : 'text-ink-sub'"
        >
          {{ amount.toLocaleString('ko-KR') }}
        </span>
        <span
          class="text-heading font-bold"
          :class="amount > 0 ? 'text-ink' : 'text-ink-sub'"
          >원</span
        >
      </div>
    </div>

    <div class="grid grid-cols-4 gap-1.5 mb-3">
      <button
        v-for="preset in presets"
        :key="preset"
        type="button"
        class="rounded-card py-2.5 text-body-sm font-bold bg-brand-weak/80 text-brand hover:bg-brand-weak/70 active:scale-95 transition-all"
        @click="addPreset(preset)"
      >
        +{{ preset / 10000 }}만원
      </button>
    </div>

    <div class="relative mb-6">
      <BaseInput
        v-model="amountInput"
        placeholder="직접 입력"
        :has-error="!!warningMessage"
        :error-message="warningMessage"
      />
      <button
        v-if="amountInput"
        type="button"
        class="absolute right-3 top-3.5 text-ink-sub hover:text-ink-sub p-0.5 rounded-full bg-canvas"
        aria-label="입력 지우기"
        @click="clearAmount"
      >
        <X :size="14" />
      </button>
    </div>

    <div class="mb-6">
      <AccountSelectField
        v-model="selectedAccountId"
        :accounts="accounts"
        :is-loading="accountsLoading"
        label="출금 계좌"
        empty-text="연동된 출금 계좌가 없습니다."
      />
    </div>

    <div class="mt-auto pt-4 pb-2 text-center">
      <BaseButton
        :disabled="isLoading"
        class="w-full"
        @click="handleNext"
      >
        {{ isLoading ? '충전 중...' : '다음' }}
      </BaseButton>
    </div>
  </div>
</template>
