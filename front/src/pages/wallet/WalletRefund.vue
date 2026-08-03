<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWalletStore } from '@/stores/walletStore';
import { useAccountStore } from '@/stores/accountStore';
import { useErrorToast } from '@/composables/useErrorToast';
import BaseToast from '@/components/common/BaseToast.vue';
import WalletRefundAmount from '@/components/wallet/WalletRefundAmount.vue';
import WalletRefundComplete from '@/components/wallet/WalletRefundComplete.vue';

const router = useRouter();
const walletStore = useWalletStore();
const accountStore = useAccountStore();
const { errorMessage, showError } = useErrorToast();

const step = ref(1);
const result = ref(null);

const primaryAccount = computed(() => accountStore.primaryAccount);

// TODO: PIN 담당자 컴포넌트 연동되면 payload에 pinNumber 받아서 refund에 전달
async function handleAmountNext(payload) {
  try {
    const data = await walletStore.refund(payload.amount, '123456'); // 임시 고정 PIN
    result.value = data;
    step.value = 2;
  } catch (err) {
    showError(err, '환급에 실패했어요. 다시 시도해주세요.');
  }
}

function handleConfirm() {
  router.push('/wallet');
}

onMounted(() => {
  walletStore.fetchWallet();
  accountStore.fetchMyAccounts();
});
</script>

<template>
  <div class="w-full mx-auto flex flex-col min-h-screen">
    <BaseToast :message="errorMessage" />

    <WalletRefundAmount
      v-if="step === 1"
      :balance="walletStore.balance"
      :primary-account="primaryAccount"
      :is-loading="walletStore.isLoading"
      @next="handleAmountNext"
      @back="router.back()"
    />
    <WalletRefundComplete
      v-else-if="step === 2"
      :result="result"
      @confirm="handleConfirm"
    />
  </div>
</template>
