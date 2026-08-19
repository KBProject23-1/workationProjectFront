<script setup>
import { ref, computed, watch } from 'vue';
import { Wallet, X } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import AccountSelectField from '@/components/wallet/AccountSelectField.vue';

const props = defineProps({
  balance: { type: Number, default: 0 },
  accounts: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  accountsLoading: { type: Boolean, default: false },
});

const emit = defineEmits(['next', 'back']);

const amountInput = ref('');
const selectedAccountId = ref(null);
const warningMessage = ref('');

const amount = computed(() => Number(amountInput.value) || 0);

const presets = [10000, 50000, 100000, 300000];

// 계좌 목록이 로드되면 주 계좌(없으면 첫 계좌)를 기본 입금 계좌로 선택
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
  const next = (Number(amountInput.value) || 0) + value;
  // 보유 잔액을 넘지 않도록 클램프
  amountInput.value = String(Math.min(next, props.balance));
  warningMessage.value = '';
}

function setMaxAmount() {
  amountInput.value = String(props.balance);
  warningMessage.value = '';
}

function clearAmount() {
  amountInput.value = '';
  warningMessage.value = '';
}

function handleNext() {
  if (!selectedAccountId.value) {
    warningMessage.value = '입금 계좌를 먼저 연동해주세요.';
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
  emit('next', { accountId: selectedAccountId.value, amount: amount.value });
}
</script>

<template>
  <div class="flex flex-col w-full min-h-screen px-5 py-5 bg-white text-left">
    <div class="mb-5">
      <BaseHeader title="환불하기" @back="$emit('back')" />
    </div>

    <div class="mb-5">
      <p class="text-[12px] font-semibold text-gray-500 mb-1.5">
        환불 가능 포인트
      </p>
      <div
        class="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-3.5 shadow-xs"
      >
        <div
          class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50"
        >
          <Wallet :size="18" class="text-blue-600" />
        </div>
        <div>
          <p class="text-[16px] font-extrabold text-gray-900 leading-tight">
            {{ balance.toLocaleString('ko-KR') }} P
          </p>
          <p class="text-[11px] font-medium text-gray-500 mt-0.5">
            신청 즉시 연결된 내 계좌로 입금돼요
          </p>
        </div>
      </div>
    </div>

    <div class="mb-3">
      <div class="flex items-center justify-between mb-1">
        <p class="text-[12px] font-semibold text-gray-500">
          얼마나 환불할까요?
        </p>
        <button
          type="button"
          class="text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100/70 px-2.5 py-1 rounded-full transition-all active:scale-95"
          @click="setMaxAmount"
        >
          전액 입력
        </button>
      </div>

      <div class="flex items-baseline gap-1">
        <span
          class="text-[32px] font-extrabold tracking-tight transition-colors"
          :class="amount > 0 ? 'text-gray-900' : 'text-gray-500'"
        >
          {{ amount.toLocaleString('ko-KR') }}
        </span>
        <span
          class="text-[20px] font-bold"
          :class="amount > 0 ? 'text-gray-800' : 'text-gray-500'"
          >원</span
        >
      </div>
    </div>

    <div class="grid grid-cols-4 gap-1.5 mb-3">
      <button
        v-for="preset in presets"
        :key="preset"
        type="button"
        class="rounded-xl py-2.5 text-[12px] font-bold bg-blue-50/80 text-blue-600 hover:bg-blue-100/70 active:scale-95 transition-all"
        @click="addPreset(preset)"
      >
        +{{ preset / 10000 }}만원
      </button>
    </div>

    <div class="relative mb-5">
      <BaseInput
        v-model="amountInput"
        placeholder="환불 금액 직접 입력"
        :has-error="!!warningMessage"
        :error-message="warningMessage"
      />
      <button
        v-if="amountInput"
        type="button"
        class="absolute right-3 top-3.5 text-gray-500 hover:text-gray-600 p-0.5 rounded-full bg-gray-100"
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
        label="입금 계좌"
        empty-text="연동된 입금 계좌가 없습니다."
      />
    </div>

    <div class="mt-auto pt-4 pb-2 text-center">
      <BaseButton
        :disabled="isLoading"
        class="w-full py-3.5 text-[15px] font-bold rounded-2xl"
        @click="handleNext"
      >
        {{ isLoading ? '처리 중...' : '환불 신청' }}
      </BaseButton>
    </div>
  </div>
</template>
