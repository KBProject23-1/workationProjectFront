<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWalletStore } from '@/stores/walletStore';
import { useCardStore } from '@/stores/cardStore';
import { useErrorToast } from '@/composables/useErrorToast';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import WalletBalanceCard from '@/components/wallet/WalletBalanceCard.vue';
import WalletCardCarousel from '@/components/wallet/WalletCardCarousel.vue';

const router = useRouter();
const walletStore = useWalletStore();
const cardStore = useCardStore();
const { showError } = useErrorToast();

const confirmState = ref({ visible: false, type: null, cardId: null });
const isProcessing = ref(false);

// 지갑은 워케이션 허브의 하위 화면 — 뒤로가기는 항상 허브로 복귀
function goBack() {
  router.push('/workation');
}

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
  isProcessing.value = true;
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
    isProcessing.value = false;
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
  <main
    class="flex flex-col items-center w-full min-h-screen px-5 pt-4 pb-8 bg-canvas"
  >
    <div class="w-full mb-4">
      <BaseHeader
        title="내 지갑"
        @back="goBack"
      />
    </div>

    <WalletBalanceCard
      :balance="walletStore.balance"
      @edit-accounts="router.push('/wallet/accounts')"
      @charge="router.push('/wallet/charge')"
      @refund="router.push('/wallet/refund')"
      @history="router.push('/transaction')"
      @pay="router.push('/wallet/pay')"
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
      :loading="isProcessing"
      @confirm="handleConfirm"
      @cancel="closeConfirm"
    />
  </main>
</template>
