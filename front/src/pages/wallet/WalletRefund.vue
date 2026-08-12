<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWalletStore } from '@/stores/walletStore';
import { useAccountStore } from '@/stores/accountStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { useIdempotencyKey } from '@/composables/useIdempotencyKey';
import { classifyPinError } from '@/utils/pinError';
import { getCurrentUserId } from '@/utils/currentUser';
import { unmarkPinRegistered } from '@/utils/pinRegistry';
import { toast } from 'vue-sonner';
import { ChevronLeft } from '@lucide/vue';
import WalletRefundAmount from '@/components/wallet/WalletRefundAmount.vue';
import WalletRefundComplete from '@/components/wallet/WalletRefundComplete.vue';
import PinKeypad from '@/components/pin/PinKeypad.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';

const router = useRouter();
const walletStore = useWalletStore();
const accountStore = useAccountStore();
const { showError } = useErrorToast();
const { keyFor, reset: resetIdempotencyKey } = useIdempotencyKey();

// 'amount' → 'pin' → 'loading' → 'complete'
const step = ref('amount');
const result = ref(null);
const accountsLoading = ref(true); // 계좌 목록 조회 중 (초기 깜빡임 방지)
const isSubmitting = ref(false); // 더블클릭/재진입 방어

const pending = ref(null); // 금액 단계에서 확정한 { accountId, amount }
const pin = ref('');
const pinError = ref('');

const REFUND_DURATION = 900; // 처리 로딩 최소 노출 시간(ms)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function handleAmountNext(payload) {
  pending.value = payload;
  pin.value = '';
  pinError.value = '';
  step.value = 'pin';
}

async function handlePinComplete(pinNumber) {
  if (isSubmitting.value) return; // 더블클릭/재진입 방어
  isSubmitting.value = true;
  const { accountId, amount } = pending.value;
  const idempotencyKey = keyFor(`${accountId}:${amount}`);
  step.value = 'loading';
  try {
    const [data] = await Promise.all([
      walletStore.refund(accountId, amount, pinNumber, idempotencyKey),
      delay(REFUND_DURATION),
    ]);
    result.value = data;
    resetIdempotencyKey(); // 성공 → 다음 환불은 새 키
    step.value = 'complete';
  } catch (err) {
    if (err.response?.status === 409) {
      await walletStore.fetchWallet();
      resetIdempotencyKey();
      toast.success('이미 처리된 요청이에요');
      router.push('/wallet');
      return;
    }
    const pinKind = classifyPinError(err);
    if (pinKind === 'REENTER') {
      pin.value = '';
      pinError.value = err.message || 'PIN이 올바르지 않아요';
      step.value = 'pin';
      return;
    }
    if (pinKind === 'LOCKED') {
      toast.error(err.message || 'PIN이 잠겼어요. PIN을 재설정해주세요.');
      router.push('/wallet');
      return;
    }
    if (pinKind === 'NOT_REGISTERED') {
      // 서버가 이 (userId, deviceId) PIN 을 모름 → 캐시 동기화 후 재설정 유도
      // (deviceId 는 기기 신원이라 유지, setup 이 기존 deviceId 재사용)
      const userId = getCurrentUserId();
      if (userId != null) unmarkPinRegistered(userId);
      toast.error('PIN을 다시 설정해주세요');
      router.push('/pin/setup');
      return;
    }
    // PIN 무관 실패(잔액 등) → 금액 입력으로 복귀 (같은 금액 재시도 시 멱등키 유지)
    step.value = 'amount';
    showError(err, '환불에 실패했어요. 다시 시도해주세요.');
  } finally {
    isSubmitting.value = false;
  }
}

function handleConfirm() {
  router.push('/wallet');
}

onMounted(async () => {
  walletStore.fetchWallet();
  try {
    await accountStore.fetchMyAccounts();
  } finally {
    accountsLoading.value = false;
  }
});
</script>

<template>
  <div class="w-full mx-auto flex flex-col min-h-screen">
    <WalletRefundAmount
      v-if="step === 'amount'"
      :balance="walletStore.balance"
      :accounts="accountStore.accounts"
      :is-loading="walletStore.isLoading"
      :accounts-loading="accountsLoading"
      @next="handleAmountNext"
      @back="router.back()"
    />

    <div
      v-else-if="step === 'pin'"
      class="flex flex-col min-h-screen px-5 pt-6 pb-8"
    >
      <button
        type="button"
        class="self-start p-1 -ml-1 text-gray-700 active:bg-gray-100 rounded-full"
        @click="step = 'amount'"
      >
        <ChevronLeft :size="24" />
      </button>
      <div class="flex-1 flex flex-col justify-center">
        <PinKeypad
          v-model="pin"
          title="결제 PIN을 입력해주세요"
          :description="`${Number(pending?.amount).toLocaleString('ko-KR')}원 환불`"
          :error="pinError"
          :disabled="isSubmitting"
          @complete="handlePinComplete"
        />
      </div>
    </div>

    <LoadingScreen
      v-else-if="step === 'loading'"
      title="환불 처리 중이에요"
      description="잠시만 기다려 주세요"
    />
    <WalletRefundComplete
      v-else-if="step === 'complete'"
      :result="result"
      @confirm="handleConfirm"
    />
  </div>
</template>
