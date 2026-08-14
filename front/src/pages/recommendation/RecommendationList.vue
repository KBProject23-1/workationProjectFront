<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft } from '@lucide/vue';
import { useRecommendationStore } from '@/stores/recommendationStore';
import {
  MEAL_TYPES,
  RECOMMENDATION_CATEGORY_MAP,
} from '@/config/recommendation';
import RecommendationListItem from '@/components/recommendation/RecommendationListItem.vue';
import RecommendationReferenceModal from '@/components/recommendation/RecommendationReferenceModal.vue';
import { useErrorToast } from '@/composables/useErrorToast';
import { Button } from '@/components/ui/button';

const route = useRoute();
const router = useRouter();
const recommendationStore = useRecommendationStore();
const { showError } = useErrorToast();

const mealType = ref('BREAKFAST');
const isReferenceModalOpen = ref(false);

const category = computed(
  () => RECOMMENDATION_CATEGORY_MAP[route.params.category],
);
const isRestaurant = computed(() => category.value?.key === 'restaurants');
const recommendationItems = computed(() =>
  recommendationStore.getRecommendationItems(category.value?.key),
);
const currentReferencePlace = computed(() =>
  recommendationStore.getReferencePlace(category.value?.key, mealType.value),
);
const referenceCandidates = computed(() =>
  recommendationStore.getReferenceCandidates(category.value?.key),
);
const isLastCategory = computed(() => {
  const categories = recommendationStore.orderedSelectedCategories;
  return categories.at(-1) === category.value?.key;
});

async function loadCategory(categoryKey) {
  try {
    await Promise.all([
      recommendationStore.fetchReferencePlace(categoryKey, mealType.value),
      recommendationStore.fetchReferenceCandidates(categoryKey),
      recommendationStore.fetchRecommendations(categoryKey, {
        mealType: mealType.value,
      }),
    ]);
    await recommendationStore.fetchBookmarkIds(categoryKey);
  } catch (error) {
    showError(error, `${category.value.title} 추천 목록을 불러오지 못했습니다.`);
  }
}

watch(
  [() => category.value?.key, mealType],
  async ([categoryKey]) => {
    if (!categoryKey) {
      router.replace({ name: 'RecommendationHome' });
      return;
    }
    recommendationStore.setCurrentCategory(categoryKey);
    await loadCategory(categoryKey);
  },
  { immediate: true },
);

function goBack() {
  router.back();
}

function showReferencePlace() {
  isReferenceModalOpen.value = true;
}

async function selectReferencePlace(place) {
  recommendationStore.selectReferencePlace(
    category.value.key,
    place,
    mealType.value,
  );
  isReferenceModalOpen.value = false;

  try {
    await recommendationStore.fetchRecommendations(category.value.key, {
      referenceMerchantId: place.merchantId,
      mealType: mealType.value,
    });
  } catch (error) {
    showError(error, '선택한 기준 장소의 추천 목록을 불러오지 못했습니다.');
  }
}

async function selectAutomaticReferencePlace() {
  recommendationStore.resetReferencePlace(category.value.key, mealType.value);
  isReferenceModalOpen.value = false;

  try {
    await recommendationStore.fetchRecommendations(category.value.key, {
      mealType: mealType.value,
    });
  } catch (error) {
    showError(error, '자동 기준의 추천 목록을 불러오지 못했습니다.');
  }
}

async function loadMore() {
  const referenceKey = isRestaurant.value
    ? `restaurants:${mealType.value}`
    : category.value.key;
  try {
    await recommendationStore.fetchRecommendations(category.value.key, {
      referenceMerchantId:
        recommendationStore.selectedReferencePlaces[referenceKey]?.merchantId,
      mealType: mealType.value,
      append: true,
    });
  } catch (error) {
    showError(error, '추천 목록을 추가로 불러오지 못했습니다.');
  }
}

function goDetail(item) {
  router.push({
    name: category.value.detailRoute,
    params: { merchantId: item.merchantId },
  });
}

async function toggleBookmark(item) {
  try {
    await recommendationStore.toggleBookmark(
      item.merchantId,
      category.value.key,
      item.bookmarked ||
        Boolean(recommendationStore.bookmarkIdsByMerchant[item.merchantId]),
    );
  } catch (error) {
    showError(error, '북마크 처리 중 오류가 발생했습니다.');
  }
}

function moveNext() {
  const nextCategory = recommendationStore.moveToNextCategory();
  if (!nextCategory) {
    router.push({ name: 'RecommendationHome' });
    return;
  }

  router.push({
    name: 'RecommendationList',
    params: { category: nextCategory },
  });
}
</script>

<template>
  <main v-if="category" class="recommendation-list-page">
    <header class="list-header">
      <button type="button" aria-label="뒤로 가기" @click="goBack">
        <ChevronLeft :size="32" />
      </button>
      <h1>{{ category.pageTitle }}</h1>
      <span></span>
    </header>

    <nav v-if="isRestaurant" class="meal-tabs" aria-label="식사 시간대">
      <button
        v-for="meal in MEAL_TYPES"
        :key="meal.value"
        type="button"
        :class="{ active: mealType === meal.value }"
        @click="mealType = meal.value"
      >
        {{ meal.label }}
      </button>
    </nav>

    <section class="reference-box">
      <p>현재 기준: {{ currentReferencePlace.name }}</p>
      <button type="button" @click="showReferencePlace">기준 장소 변경</button>
    </section>

    <section class="result-list" aria-label="추천 결과">
      <p
        v-if="recommendationStore.loadingByCategory[category.key]"
        class="result-status"
      >
        {{ category.title }} 추천을 불러오고 있습니다.
      </p>
      <p
        v-else-if="!recommendationItems.length"
        class="result-status"
      >
        추천할 수 있는 {{ category.title }}이(가) 없습니다.
      </p>
      <RecommendationListItem
        v-for="(item, index) in recommendationItems"
        :key="item.merchantId"
        :item="item"
        :ranking="item.ranking ?? index + 1"
        :bookmarked="
          item.bookmarked ||
          Boolean(recommendationStore.bookmarkIdsByMerchant[item.merchantId])
        "
        :bookmark-loading="
          recommendationStore.bookmarkLoadingMerchantIds.includes(
            item.merchantId,
          )
        "
        @detail="goDetail"
        @bookmark="toggleBookmark"
      />
      <button
        v-if="recommendationStore.pageInfoByCategory[category.key].hasNext"
        type="button"
        class="load-more-button"
        :disabled="recommendationStore.loadingMoreByCategory[category.key]"
        @click="loadMore"
      >
        {{
          recommendationStore.loadingMoreByCategory[category.key]
            ? '불러오는 중...'
            : `추천 ${category.title} 더 보기`
        }}
      </button>
    </section>

    <Button
      v-if="recommendationStore.mode === 'flow'"
      class="mt-5 h-12 w-full rounded-xl text-base"
      @click="moveNext"
    >
      {{ isLastCategory ? '추천 완료' : '다음 추천 보기' }}
    </Button>

    <RecommendationReferenceModal
      :open="isReferenceModalOpen"
      :current-place="currentReferencePlace"
      :candidates="referenceCandidates"
      @close="isReferenceModalOpen = false"
      @select="selectReferencePlace"
      @select-auto="selectAutomaticReferencePlace"
    />
  </main>
</template>

<style scoped>
.recommendation-list-page {
  width: 100%;
  max-width: 402px;
  min-height: 100dvh;
  margin: 0 auto;
  padding: 50px 26px 30px;
  background: #ffffff;
  color: #12213b;
  font-family: 'SUIT', 'Pretendard Variable', sans-serif;
}

.list-header {
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  height: 50px;
}

.list-header button {
  display: flex;
  padding: 0;
  border: 0;
  background: transparent;
  color: #0c1118;
}

.list-header h1 {
  margin: 0;
  color: #0c1118;
  font-size: 22px;
  font-weight: 800;
  text-align: center;
  letter-spacing: -0.5px;
}

.meal-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 34px;
}

.meal-tabs button {
  height: 32px;
  border: 1.5px solid #dbe3ef;
  border-radius: 999px;
  background: #ffffff;
  color: #778397;
  font-size: 16px;
}

.meal-tabs button.active {
  border-color: #3087ed;
  background: #3087ed;
  color: #ffffff;
  font-weight: 700;
}

.reference-box {
  display: flex;
  height: 55px;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding: 0 12px;
  border: 1.5px solid #8bbaff;
  border-radius: 14px;
  background: #f7faff;
}

.reference-box p {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
}

.reference-box button {
  height: 34px;
  padding: 0 10px;
  border: 1.5px solid #71a8ff;
  border-radius: 9px;
  background: #ffffff;
  color: #237df0;
  font-size: 11px;
  font-weight: 700;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 7px;
}

.result-status {
  margin: 32px 0;
  color: #778397;
  font-size: 14px;
  text-align: center;
}

.load-more-button {
  height: 42px;
  margin-top: 6px;
  border: 1.5px solid #8bbaff;
  border-radius: 12px;
  background: #ffffff;
  color: #237df0;
  font-size: 14px;
  font-weight: 700;
}

.load-more-button:disabled {
  cursor: wait;
  opacity: 0.55;
}

@media (max-height: 820px) {
  .recommendation-list-page {
    padding-top: 36px;
  }

  .result-card {
    min-height: 96px;
  }
}
</style>
