<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft } from '@lucide/vue';
import { useRecommendationStore } from '@/stores/recommendationStore';
import { useSurveyStore } from '@/stores/surveyStore';
import { useWorkationStore } from '@/stores/workationStore';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';
import { RECOMMENDATION_CATEGORIES } from '@/config/recommendation';
import RecommendationCategoryCard from '@/components/recommendation/RecommendationCategoryCard.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const route = useRoute();
const router = useRouter();
const recommendationStore = useRecommendationStore();
const surveyStore = useSurveyStore();
const workationStore = useWorkationStore();
const loading = ref(true);
const hasSurvey = ref(false);
const surveyPromptOpen = ref(false);

const isSingleMode = computed(() => recommendationStore.mode === 'single');
const hasSelection = computed(
  () => recommendationStore.selectedCategories.length > 0,
);

onMounted(async () => {
  try {
    const [surveyResult] = await Promise.all([
      surveyStore.fetchMySurvey(),
      workationStore.fetchCurrent(),
    ]);

    // 설문이 없으면 추천할 근거가 없다.
    // 곧바로 설문 화면으로 넘기면 추천을 누른 사람이 이유를 모르니 안내를 띄운다
    if (!surveyResult) {
      surveyPromptOpen.value = true;
      return;
    }

    hasSurvey.value = true;
    recommendationStore.startFlow({
      mode: route.query.mode === 'single' ? 'single' : 'flow',
      sourceRoute: route.query.source ?? null,
      workation: workationStore.workation,
    });
  } finally {
    loading.value = false;
  }
});

// 설문은 워케이션 하위 경로에 있어 워케이션 ID 가 필요하다.
// 주소를 직접 입력해 들어온 경우 current 가 비어 있어 먼저 불러온다
const goSurvey = async () => {
  if (!workationStore.workationId) {
    try {
      await workationStore.fetchCurrent();
    } catch {
      router.push('/workation');
      return;
    }
  }

  const workationId = workationStore.workationId;
  if (!workationId) {
    router.push('/workation');
    return;
  }
  router.push(`/workation/${workationId}/survey`);
};

// 어디서 들어왔는지 모르니 이전 화면으로 돌린다.
// 히스토리가 없으면(주소 직접 입력) 워케이션 메인으로 보낸다
function goBack() {
  if (window.history.state?.back) {
    router.back();
    return;
  }
  router.push('/workation');
}

function selectCategory(categoryKey) {
  recommendationStore.toggleCategory(categoryKey);

  if (isSingleMode.value) {
    recommendationStore.beginRecommendation();
    router.push({
      name: 'RecommendationList',
      params: { category: categoryKey },
    });
  }
}

function startRecommendation() {
  const firstCategory = recommendationStore.beginRecommendation();
  if (!firstCategory) return;

  router.push({
    name: 'RecommendationList',
    params: { category: firstCategory },
  });
}
</script>

<template>
  <main v-if="loading" class="recommendation-home recommendation-loading">
    <p>설문 결과를 확인하고 있어요.</p>
  </main>

  <main v-else-if="hasSurvey" class="recommendation-home">
    <header class="home-header">
      <button
        type="button"
        class="p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full active:bg-gray-100 transition-colors"
        aria-label="뒤로 가기"
        @click="goBack"
      >
        <ChevronLeft :size="24" />
      </button>
    </header>

    <section class="home-content">
      <div class="home-heading">
        <h1>어떤 항목을<br />추천받고 싶으신가요?</h1>
        <p v-if="isSingleMode">카테고리를 하나 선택해 주세요.</p>
        <p v-else>
          카테고리를 선택하면 숙소부터<br />정해진 순서대로 추천해 드려요.
        </p>
      </div>

      <div class="category-grid">
        <RecommendationCategoryCard
          v-for="category in RECOMMENDATION_CATEGORIES"
          :key="category.key"
          :category="category"
          :selected="recommendationStore.isSelected(category.key)"
          @select="selectCategory"
        />
      </div>
    </section>

    <div v-if="!isSingleMode" class="start-area">
      <BaseButton
        variant="default"
        class="h-12 w-full rounded-xl text-base"
        :disabled="!hasSelection"
        @click="startRecommendation"
      >
        추천받기
      </BaseButton>
    </div>
  </main>

  <BaseConfirmModal
    :visible="surveyPromptOpen"
    title="아직 설문을 마치지 않았어요"
    message="취향 설문을 완료하면 숙소·공유오피스·음식점·여가를 추천해 드릴 수 있어요."
    cancel-label="나중에"
    confirm-label="설문 하러 가기"
    @confirm="goSurvey"
    @cancel="goBack"
  />
</template>

<style scoped>
.recommendation-home {
  width: 100%;
  max-width: 402px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #ffffff;
  color: #10213d;
  padding: 20px 34px 32px;
  font-family: 'SUIT', 'Pretendard Variable', sans-serif;
}

/* 뒤로가기가 없어 화면을 빠져나갈 방법이 없었다.
   기존 상단 여백(82px)을 헤더가 대신한다 */
.home-header {
  display: flex;
  align-items: center;
  height: 44px;
  margin: 0 0 18px -8px;
}

.home-content {
  width: 100%;
  max-width: 332px;
  margin: 0 auto;
}

.recommendation-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7b8494;
  font-size: 14px;
}

.home-heading h1 {
  margin: 0;
  font-size: 22px;
  line-height: 1.18;
  font-weight: 800;
  letter-spacing: -0.8px;
}

.home-heading p {
  margin: 12px 0 0;
  color: #7b8494;
  font-size: 12px;
  line-height: 1.6;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 14px;
  margin-top: 32px;
}

.start-area {
  position: fixed;
  right: 0;
  bottom: 20px;
  left: 0;
  width: 100%;
  max-width: 402px;
  margin: 0 auto;
  padding: 0 34px;
}

@media (max-height: 760px) {
  .home-header {
    margin-bottom: 8px;
  }

  .category-grid {
    margin-top: 24px;
  }
}
</style>
