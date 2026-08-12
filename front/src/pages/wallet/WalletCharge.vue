<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWalletStore } from '@/stores/walletStore';
import { useAccountStore } from '@/stores/accountStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { useIdempotencyKey } from '@/composables/useIdempotencyKey';
import { toast } from 'vue-sonner';
import WalletChargeAmount from '@/components/wallet/WalletChargeAmount.vue';
import WalletChargeComplete from '@/components/wallet/WalletChargeComplete.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';

const router = useRouter();
const walletStore = useWalletStore();
const accountStore = useAccountStore();
const { showError } = useErrorToast();
const { keyFor, reset: resetIdempotencyKey } = useIdempotencyKey();

// 1: 금액/계좌 입력, 2: 처리 로딩, 3: 완료
const step = ref(1);
const result = ref(null);
const accountsLoading = ref(true); // 계좌 목록 조회 중 (초기 깜빡임 방지)
const isSubmitting = ref(false); // 더블클릭/재진입 방어

const CHARGE_DURATION = 900; // 처리 로딩 최소 노출 시간(ms)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// TODO: PIN 페이지 완성되면 payload 에 pinNumber/deviceId 받아서 charge 에 전달
async function handleAmountNext(payload) {
  if (isSubmitting.value) return; // 더블클릭/재진입 방어
  isSubmitting.value = true;
  // 같은 시도(금액·계좌 동일)의 재시도면 같은 멱등키 재사용 → 응답 유실 후 재시도 시 중복 충전 방지
  const idempotencyKey = keyFor(`${payload.accountId}:${payload.amount}`);
  step.value = 2; // 처리 로딩 시작
  try {
    // mock API 가 즉시 응답해도 최소 노출 시간을 보장해 "처리되는 느낌"을 유지
    const [data] = await Promise.all([
      walletStore.charge(payload.accountId, payload.amount, '123456', idempotencyKey), // 임시 고정 PIN
      delay(CHARGE_DURATION),
    ]);
    result.value = data;
    resetIdempotencyKey(); // 성공 → 다음 충전은 새 키
    step.value = 3;
  } catch (err) {
    // 409 = 같은 멱등키로 이미 처리됨(이전 시도가 실제론 성공) → 성공으로 간주
    if (err.response?.status === 409) {
      await walletStore.fetchWallet();
      resetIdempotencyKey();
      toast.success('이미 처리된 요청이에요');
      router.push('/wallet');
      return;
    }
    step.value = 1; // 실패 시 입력 화면으로 복귀 (같은 금액 재시도 시 멱등키 유지)
    showError(err, '충전에 실패했어요. 다시 시도해주세요.');
  } finally {
    isSubmitting.value = false;
  }
}

function handleConfirm() {
  router.push('/wallet');
}

onMounted(async () => {
  try {
    await accountStore.fetchMyAccounts();
  } finally {
    accountsLoading.value = false;
  }
});
</script>

<template>
  <div class="w-full mx-auto flex flex-col min-h-screen">
    <WalletChargeAmount
      v-if="step === 1"
      :accounts="accountStore.accounts"
      :is-loading="walletStore.isLoading"
      :accounts-loading="accountsLoading"
      @next="handleAmountNext"
      @back="router.back()"
    />
    <LoadingScreen
      v-else-if="step === 2"
      title="충전하고 있어요"
      description="잠시만 기다려 주세요"
    />
    <WalletChargeComplete
      v-else-if="step === 3"
      :result="result"
      @confirm="handleConfirm"
    />
  </div>
</template>
