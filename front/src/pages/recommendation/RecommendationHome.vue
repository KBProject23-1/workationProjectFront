<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRecommendationStore } from '@/stores/recommendationStore';
import { useSurveyStore } from '@/stores/surveyStore';
import { RECOMMENDATION_CATEGORIES } from '@/config/recommendation';
import RecommendationCategoryCard from '@/components/recommendation/RecommendationCategoryCard.vue';
import { Button } from '@/components/ui/button';

const route = useRoute();
const router = useRouter();
const recommendationStore = useRecommendationStore();
const surveyStore = useSurveyStore();
const loading = ref(true);
const hasSurvey = ref(false);

const isSingleMode = computed(() => recommendationStore.mode === 'single');
const hasSelection = computed(
  () => recommendationStore.selectedCategories.length > 0,
);

onMounted(async () => {
  try {
    const surveyResult = await surveyStore.fetchMySurvey();
    if (!surveyResult) {
      router.replace({ name: 'SurveyIntro' });
      return;
    }

    hasSurvey.value = true;
    recommendationStore.startFlow({
      mode: route.query.mode === 'single' ? 'single' : 'flow',
      sourceRoute: route.query.source ?? null,
    });
  } finally {
    loading.value = false;
  }
});

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
      <Button
        class="h-12 w-full rounded-xl text-base"
        :disabled="!hasSelection"
        @click="startRecommendation"
      >
        추천받기
      </Button>
    </div>
  </main>
</template>

<style scoped>
.recommendation-home {
  width: 100%;
  max-width: 402px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #ffffff;
  color: #10213d;
  padding: 82px 34px 32px;
  font-family: 'SUIT', 'Pretendard Variable', sans-serif;
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
  .recommendation-home {
    padding-top: 52px;
  }

  .category-grid {
    margin-top: 24px;
  }
}
</style>
