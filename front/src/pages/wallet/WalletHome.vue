<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWalletStore } from '@/stores/walletStore';
import { useCardStore } from '@/stores/cardStore';
import { useErrorToast } from '@/composables/useErrorToast';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';
import WalletBalanceCard from '@/components/wallet/WalletBalanceCard.vue';
import WalletQuickActions from '@/components/wallet/WalletQuickActions.vue';
import WalletCardCarousel from '@/components/wallet/WalletCardCarousel.vue';

const router = useRouter();
const walletStore = useWalletStore();
const cardStore = useCardStore();
const { showError } = useErrorToast();

const confirmState = ref({ visible: false, type: null, cardId: null });

function requestSetPrimary(cardId) {
  confirmState.value = { visible: true, type: 'primary', cardId };
}

function requestDelete(cardId) {
  confirmState.value = { visible: true, type: 'delete', cardId };
}

function closeConfirm() {
  confirmState.value = { ...confirmState.value, visible: false };
}

async function handleConfirm() {
  const { type, cardId } = confirmState.value;
  try {
    if (type === 'primary') {
      await cardStore.setPrimaryCard(cardId);
    } else if (type === 'delete') {
      await cardStore.deleteCard(cardId);
    }
  } catch (err) {
    showError(
      err,
      type === 'primary'
        ? '주 카드 변경에 실패했어요.'
        : '카드 삭제에 실패했어요.',
    );
  } finally {
    closeConfirm();
  }
}

function handleEditNickname(cardId) {
  router.push(`/card/${cardId}/nickname`);
}

onMounted(() => {
  walletStore.fetchWallet();
  cardStore.fetchMyCards();
});
</script>

<template>
  <div
    class="flex flex-col items-center w-full min-h-screen px-5 py-6 bg-white"
  >
    <div class="w-full text-left mb-4">
      <h1 class="text-xl font-bold">{{ '000' }}님, 안녕하세요</h1>
    </div>

    <WalletBalanceCard
      :balance="walletStore.balance"
      @edit-accounts="router.push('/wallet/accounts')"
    />

    <WalletQuickActions
      @charge="router.push('/wallet/charge')"
      @refund="router.push('/wallet/refund')"
      @history="router.push('/transaction')"
      @pay="() => {}"
    />

    <WalletCardCarousel
      :cards="cardStore.cards"
      @request-primary="requestSetPrimary"
      @request-delete="requestDelete"
      @edit-nickname="handleEditNickname"
      @add="router.push('/card/link')"
    />

    <BaseConfirmModal
      :visible="confirmState.visible"
      :title="confirmState.type === 'primary' ? '주 카드 변경' : '카드 삭제'"
      :message="
        confirmState.type === 'primary'
          ? '이 카드를 주 카드로 변경할까요?'
          : '이 카드를 삭제할까요?'
      "
      @confirm="handleConfirm"
      @cancel="closeConfirm"
    />
  </div>
</template>
