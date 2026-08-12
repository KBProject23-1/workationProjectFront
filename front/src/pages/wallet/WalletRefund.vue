<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWalletStore } from '@/stores/walletStore';
import { useAccountStore } from '@/stores/accountStore';
import { useWalletPinPayment } from '@/composables/useWalletPinPayment';
import WalletRefundAmount from '@/components/wallet/WalletRefundAmount.vue';
import WalletRefundComplete from '@/components/wallet/WalletRefundComplete.vue';
import WalletPinStep from '@/components/wallet/WalletPinStep.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';

const router = useRouter();
const walletStore = useWalletStore();
const accountStore = useAccountStore();
const accountsLoading = ref(true); // 계좌 목록 조회 중 (초기 깜빡임 방지)

// 금액→PIN→처리→완료 스텝 머신 + PIN 에러 분기 (충전/환불 공통)
const {
  step,
  result,
  isSubmitting,
  pending,
  pin,
  pinError,
  handleAmountNext,
  handlePinComplete,
  handleConfirm,
} = useWalletPinPayment(walletStore.refund, {
  failMessage: '환불에 실패했어요. 다시 시도해주세요.',
});

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

    <WalletPinStep
      v-else-if="step === 'pin'"
      v-model="pin"
      :amount="pending?.amount"
      action-label="환불"
      :error="pinError"
      :disabled="isSubmitting"
      @complete="handlePinComplete"
      @back="step = 'amount'"
    />

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
