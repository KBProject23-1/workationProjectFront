<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWalletStore } from '@/stores/walletStore';
import { useAccountStore } from '@/stores/accountStore';
import { useErrorToast } from '@/composables/useErrorToast';
import WalletChargeAmount from '@/components/wallet/WalletChargeAmount.vue';
import WalletChargeComplete from '@/components/wallet/WalletChargeComplete.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';

const router = useRouter();
const walletStore = useWalletStore();
const accountStore = useAccountStore();
const { showError } = useErrorToast();

// 1: 금액/계좌 입력, 2: 처리 로딩, 3: 완료
const step = ref(1);
const result = ref(null);
const accountsLoading = ref(true); // 계좌 목록 조회 중 (초기 깜빡임 방지)

const CHARGE_DURATION = 900; // 처리 로딩 최소 노출 시간(ms)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// TODO: PIN 담당자 컴포넌트 연동되면 payload에 pinNumber 받아서 charge에 전달
async function handleAmountNext(payload) {
  step.value = 2; // 처리 로딩 시작
  try {
    // mock API 가 즉시 응답해도 최소 노출 시간을 보장해 "처리되는 느낌"을 유지
    const [data] = await Promise.all([
      walletStore.charge(payload.accountId, payload.amount, '123456'), // 임시 고정 PIN
      delay(CHARGE_DURATION),
    ]);
    result.value = data;
    step.value = 3;
  } catch (err) {
    step.value = 1; // 실패 시 입력 화면으로 복귀
    showError(err, '충전에 실패했어요. 다시 시도해주세요.');
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
