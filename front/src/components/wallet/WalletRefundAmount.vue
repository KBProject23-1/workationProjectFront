<script setup>
import { ref, computed } from 'vue';
import { ChevronLeft, Landmark, Wallet, X } from '@lucide/vue';
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

function setMaxAmount() {
  amountInput.value = String(props.balance);
  warningMessage.value = '';
}

function clearAmount() {
  amountInput.value = '';
  warningMessage.value = '';
}

function handleNext() {
  if (!props.primaryAccount) {
    warningMessage.value = '주 계좌가 설정되어 있지 않아요.';
    return;
  }
  if (amount.value <= 0) {
    warningMessage.value = '환급 금액을 입력해주세요.';
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
  <div class="flex flex-col w-full min-h-screen px-5 py-5 bg-white text-left">
    <div class="flex items-center gap-2 mb-5">
      <button
        type="button"
        class="p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full active:bg-gray-100 transition-colors"
        @click="$emit('back')"
      >
        <ChevronLeft :size="24" />
      </button>
      <h1 class="text-[18px] font-bold text-gray-900">내 계좌로 송금</h1>
    </div>

    <div class="mb-5">
      <p class="text-[12px] font-semibold text-gray-400 mb-1.5">
        환급 가능 포인트
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
          <p class="text-[11px] font-medium text-gray-400 mt-0.5">
            신청 즉시 연결된 내 계좌로 입금돼요
          </p>
        </div>
      </div>
    </div>

    <div class="mb-3">
      <div class="flex items-center justify-between mb-1">
        <p class="text-[12px] font-semibold text-gray-400">
          얼마나 환급할까요?
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

    <div class="relative mb-5">
      <BaseInput
        v-model="amountInput"
        placeholder="환급 금액 직접 입력"
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
      <p class="text-[12px] font-semibold text-gray-400 mb-2">
        입금 계좌 (주 계좌)
      </p>

      <div
        v-if="primaryAccount"
        class="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-3.5 transition-all hover:bg-gray-50"
      >
        <div
          class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs border border-gray-100"
        >
          <Landmark :size="18" class="text-blue-600" />
        </div>
        <div class="min-w-0">
          <p class="text-[14px] font-bold text-gray-900 truncate">
            {{ primaryAccount.bankName }}
          </p>
          <p class="text-[12px] font-medium text-gray-400 mt-0.5">
            {{ primaryAccount.maskedAccountNumber }}
          </p>
        </div>
      </div>

      <div
        v-else
        class="rounded-2xl border border-dashed border-gray-200 p-4 text-center"
      >
        <p class="text-[13px] font-medium text-gray-400">
          설정된 주 계좌가 없어요
        </p>
      </div>
    </div>

    <div class="mt-auto pt-4 pb-2">
      <BaseButton
        :disabled="isLoading"
        class="w-full py-3.5 text-[15px] font-bold rounded-2xl"
        @click="handleNext"
      >
        {{ isLoading ? '처리 중...' : '환급 신청' }}
      </BaseButton>
    </div>
  </div>
</template>
