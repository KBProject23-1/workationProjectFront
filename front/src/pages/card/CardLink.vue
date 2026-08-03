<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCardStore } from '@/stores/cardStore';
import { useErrorToast } from '@/composables/useErrorToast';
import CardLinkPrimarySelect from '@/components/card/CardLinkPrimarySelect.vue';
import CardLinkExtraSelect from '@/components/card/CardLinkExtraSelect.vue';
import CardLinkComplete from '@/components/card/CardLinkComplete.vue';

const router = useRouter();
const cardStore = useCardStore();
const { showError } = useErrorToast();

const step = ref(0); // 0: 초기 상태 확인 중
const linkedCards = ref([]);
const isFirstLink = ref(true); // 최초 연동 여부 (주카드 유무로 판단)

async function handlePrimarySelect(linkableCardId) {
  try {
    const data = await cardStore.linkCards([linkableCardId]);
    await cardStore.setPrimaryCard(data[0].cardId);
    linkedCards.value = data.map((card) => ({ ...card, isPrimary: true }));
    step.value = 2;
  } catch (err) {
    showError(err, '카드 연동에 실패했어요. 다시 시도해주세요.');
  }
}

async function handleExtraComplete(extraIds) {
  if (extraIds.length === 0) {
    finishFlow();
    return;
  }
  try {
    const data = await cardStore.linkCards(extraIds);
    linkedCards.value = [...linkedCards.value, ...data];
    step.value = 3;
  } catch (err) {
    showError(err, '카드 연동에 실패했어요. 다시 시도해주세요.');
  }
}

function handleSkip() {
  // 최초 연동(주 카드를 방금 연동한 상태)이면 완료 화면을 보여주고,
  // 추가 연동 흐름(주 카드가 이미 있었음)이면 완료 화면 없이 바로 종료
  if (isFirstLink.value) {
    step.value = 3;
  } else {
    finishFlow();
  }
}

function finishFlow() {
  router.push('/wallet');
}

function handleConfirm() {
  router.push('/wallet');
}

function goToWallet() {
  router.push('/wallet');
}

onMounted(async () => {
  await Promise.all([
    cardStore.fetchAvailableCards(),
    cardStore.fetchMyCards(),
  ]);
  isFirstLink.value = !cardStore.primaryCard;
  step.value = cardStore.primaryCard ? 2 : 1;
});
</script>

<template>
  <div class="w-full mx-auto flex flex-col min-h-screen">
    <p v-if="step === 0" class="text-[14px] text-gray-400 text-center mt-10">
      불러오는 중...
    </p>

    <CardLinkPrimarySelect
      v-if="step === 1"
      :cards="cardStore.availableCards"
      :is-loading="cardStore.isLoading"
      @select="handlePrimarySelect"
      @back="goToWallet"
    />
    <CardLinkExtraSelect
      v-else-if="step === 2"
      :cards="cardStore.availableCards"
      :is-loading="cardStore.isLoading"
      @complete="handleExtraComplete"
      @skip="handleSkip"
      @back="goToWallet"
    />
    <CardLinkComplete
      v-else-if="step === 3"
      :linked-cards="linkedCards"
      @confirm="handleConfirm"
    />
  </div>
</template>
