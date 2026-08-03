<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCardStore } from '@/stores/cardStore';
import { useErrorToast } from '@/composables/useErrorToast';
import BaseToast from '@/components/common/BaseToast.vue';
import CardLinkPrimarySelect from '@/components/card/CardLinkPrimarySelect.vue';
import CardLinkExtraSelect from '@/components/card/CardLinkExtraSelect.vue';
import CardLinkComplete from '@/components/card/CardLinkComplete.vue';

const router = useRouter();
const cardStore = useCardStore();
const { errorMessage, showError } = useErrorToast();

const step = ref(0); // 0: 초기 상태 확인 중
const linkedCards = ref([]);

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
    step.value = 3;
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

function handleConfirm() {
  router.push('/wallet');
}

onMounted(async () => {
  await Promise.all([
    cardStore.fetchAvailableCards(),
    cardStore.fetchMyCards(),
  ]);
  // 주 카드가 이미 있으면 주 카드 선택 단계를 건너뛰고 추가 연동으로 진입
  step.value = cardStore.primaryCard ? 2 : 1;
});
</script>

<template>
  <div class="w-full mx-auto flex flex-col min-h-screen">
    <BaseToast :message="errorMessage" />

    <p v-if="step === 0" class="text-[14px] text-gray-400 text-center mt-10">
      불러오는 중...
    </p>

    <CardLinkPrimarySelect
      v-if="step === 1"
      :cards="cardStore.availableCards"
      :is-loading="cardStore.isLoading"
      @select="handlePrimarySelect"
      @back="router.back()"
    />
    <CardLinkExtraSelect
      v-else-if="step === 2"
      :cards="cardStore.availableCards"
      :is-loading="cardStore.isLoading"
      @complete="handleExtraComplete"
      @skip="step = 3"
    />
    <CardLinkComplete
      v-else-if="step === 3"
      :linked-cards="linkedCards"
      @confirm="handleConfirm"
    />
  </div>
</template>
