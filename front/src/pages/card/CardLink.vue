<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCardStore } from '@/stores/cardStore';
import { useErrorToast } from '@/composables/useErrorToast';
import CardLinkPrimarySelect from '@/components/card/CardLinkPrimarySelect.vue';
import CardLinkExtraSelect from '@/components/card/CardLinkExtraSelect.vue';
import CardLinkComplete from '@/components/card/CardLinkComplete.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';

const router = useRouter();
const route = useRoute();
const cardStore = useCardStore();
const { showError } = useErrorToast();

// 로그인 직후 온보딩 흐름(계좌→카드→PIN)이면 완료 후 PIN 설정으로, 그 외엔 지갑으로 이동한다.
// (온보딩 체인은 계좌 0개=미온보딩 유저만 진입하므로 PIN 은 항상 미등록 상태다)
function goAfterLink() {
  if (route.query.flow === 'onboarding') {
    const redirect =
      typeof route.query.redirect === 'string' ? route.query.redirect : '/workation';
    router.push({ path: '/pin/setup', query: { redirect } });
  } else {
    router.push('/wallet');
  }
}

// 0: 목록 불러오는 중, 1: 주카드 선택, 2: 추가 선택, 3: 완료, 4: 연동 진행 중
const step = ref(0);
const linkedCards = ref([]);
const isFirstLink = ref(true); // 최초 연동 여부 (주카드 유무로 판단)

const LIST_LOADING_DURATION = 900; // 목록 로딩 최소 노출 시간(ms)
const LINKING_DURATION = 900; // 연동 처리 최소 노출 시간(ms)

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// mock API 가 즉시 응답해도 최소 노출 시간을 보장해 "처리되는 느낌"을 유지
async function runWithProgress(task) {
  step.value = 4; // 연동 처리 로딩 시작
  const [result] = await Promise.all([task(), delay(LINKING_DURATION)]);
  return result;
}

async function handlePrimarySelect(linkableCardId) {
  try {
    const data = await runWithProgress(async () => {
      const linked = await cardStore.linkCards([linkableCardId]);
      await cardStore.setPrimaryCard(linked[0].cardId);
      return linked;
    });
    linkedCards.value = data.map((card) => ({ ...card, isPrimary: true }));
    step.value = 2;
  } catch (err) {
    step.value = 1; // 실패 시 주카드 선택으로 복귀
    showError(err, '카드 연동에 실패했어요. 다시 시도해주세요.');
  }
}

async function handleExtraComplete(extraIds) {
  if (extraIds.length === 0) {
    finishFlow();
    return;
  }
  try {
    const data = await runWithProgress(() => cardStore.linkCards(extraIds));
    linkedCards.value = [...linkedCards.value, ...data];
    step.value = 3;
  } catch (err) {
    step.value = 2; // 실패 시 추가 선택으로 복귀
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
  goAfterLink();
}

function handleConfirm() {
  goAfterLink();
}

function goToWallet() {
  router.push('/wallet');
}

onMounted(async () => {
  // 목록 조회도 즉시 끝나면 밋밋하므로 최소 노출 시간을 함께 보장
  await Promise.all([
    cardStore.fetchAvailableCards(),
    cardStore.fetchMyCards(),
    delay(LIST_LOADING_DURATION),
  ]);
  isFirstLink.value = !cardStore.primaryCard;
  step.value = cardStore.primaryCard ? 2 : 1;
});
</script>

<template>
  <main class="w-full mx-auto flex flex-col min-h-screen bg-canvas">
    <LoadingScreen
      v-if="step === 0"
      title="카드 정보를 불러오고 있어요"
      description="연동 가능한 카드를 확인하고 있어요"
    />

    <CardLinkPrimarySelect
      v-else-if="step === 1"
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
    <LoadingScreen
      v-else-if="step === 4"
      title="카드를 안전하게 연결하고 있어요"
      description="잠시만 기다려 주세요"
    />
  </main>
</template>
