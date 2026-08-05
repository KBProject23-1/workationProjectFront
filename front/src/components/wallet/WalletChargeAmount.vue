<script setup>
import { ref, computed } from 'vue';
import { ChevronLeft, Landmark, X } from '@lucide/vue';
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
  <div class="flex flex-col w-full min-h-screen px-5 py-5 bg-white text-left">
    <div class="flex items-center gap-2 mb-6">
      <button
        type="button"
        class="p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full active:bg-gray-100 transition-colors"
        @click="$emit('back')"
      >
        <ChevronLeft :size="24" />
      </button>
      <h1 class="text-[18px] font-bold text-gray-900">충전하기</h1>
    </div>

    <div class="mb-6">
      <p class="text-[12px] font-semibold text-gray-400 mb-1">
        얼마나 충전할까요?
      </p>
      <div class="flex items-baseline gap-1">
        <span
          class="text-[32px] font-extrabold tracking-tight transition-colors"
          :class="amount > 0 ? 'text-gray-900' : 'text-gray-300'"
        >
          {{ amount.toLocaleString('ko-KR') }}
        </span>
        <span
          class="text-[20px] font-bold"
          :class="amount > 0 ? 'text-gray-800' : 'text-gray-300'"
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
        class="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 p-0.5 rounded-full bg-gray-100"
        @click="clearAmount"
      >
        <X :size="14" />
      </button>
    </div>

    <div class="mb-6">
      <p class="text-[12px] font-semibold text-gray-400 mb-2">출금 계좌</p>

      <div
        v-if="selectedAccount"
        class="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:bg-gray-50"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs border border-gray-100"
          >
            <Landmark :size="18" class="text-blue-600" />
          </div>
          <div class="min-w-0">
            <p class="text-[14px] font-bold text-gray-900 truncate">
              {{ selectedAccount.bankName }}
            </p>
            <p class="text-[12px] font-medium text-gray-400 mt-0.5">
              잔액 {{ selectedAccount.balance?.toLocaleString('ko-KR') }}원
            </p>
          </div>
        </div>
      </div>

      <div
        v-else
        class="rounded-2xl border border-dashed border-gray-200 p-4 text-center"
      >
        <p class="text-[13px] font-medium text-gray-400">
          연동된 출금 계좌가 없습니다.
        </p>
      </div>
    </div>

    <div class="mt-auto pt-4 pb-2 text-center">
      <BaseButton
        :disabled="isLoading"
        class="w-full py-3.5 text-[15px] font-bold rounded-2xl"
        @click="handleNext"
      >
        {{ isLoading ? '충전 중...' : '다음' }}
      </BaseButton>
    </div>
  </div>
</template>
