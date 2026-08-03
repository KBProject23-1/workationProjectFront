<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWalletStore } from '@/stores/walletStore';
import { useAccountStore } from '@/stores/accountStore';
import { useErrorToast } from '@/composables/useErrorToast';
import BaseToast from '@/components/common/BaseToast.vue';
import WalletChargeAmount from '@/components/wallet/WalletChargeAmount.vue';
import WalletChargeComplete from '@/components/wallet/WalletChargeComplete.vue';

const router = useRouter();
const walletStore = useWalletStore();
const accountStore = useAccountStore();
const { errorMessage, showError } = useErrorToast();

const step = ref(1);
const result = ref(null);

// TODO: PIN 담당자 컴포넌트 연동되면 payload에 pinNumber 받아서 charge에 전달
async function handleAmountNext(payload) {
  try {
    const data = await walletStore.charge(
      payload.accountId,
      payload.amount,
      '123456',
    ); // 임시 고정 PIN
    result.value = data;
    step.value = 2;
  } catch (err) {
    showError(err, '충전에 실패했어요. 다시 시도해주세요.');
  }
}

function handleConfirm() {
  router.push('/wallet');
}

onMounted(() => {
  accountStore.fetchMyAccounts();
});
</script>

<template>
  <div class="w-full mx-auto flex flex-col min-h-screen">
    <BaseToast :message="errorMessage" />

    <WalletChargeAmount
      v-if="step === 1"
      :accounts="accountStore.accounts"
      :is-loading="walletStore.isLoading"
      @next="handleAmountNext"
      @back="router.back()"
    />
    <WalletChargeComplete
      v-else-if="step === 2"
      :result="result"
      @confirm="handleConfirm"
    />
  </div>
</template>
