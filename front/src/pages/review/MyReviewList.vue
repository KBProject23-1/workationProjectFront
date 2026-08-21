<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import MyReviewListItem from '@/components/review/MyReviewListItem.vue';
import { useReviewStore } from '@/stores/reviewStore';
import BaseHeader from '@/components/common/BaseHeader.vue';
import BaseEmptyState from '@/components/common/BaseEmptyState.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import BaseErrorState from '@/components/common/BaseErrorState.vue';

const categories = [
  { value: 'ALL', label: '전체' },
  { value: 'ACCOMMODATION', label: '숙소' },
  { value: 'OFFICE', label: '공유 오피스' },
  { value: 'RESTAURANT', label: '음식점' },
  { value: 'ACTIVITY', label: '여가' },
];

const router = useRouter();
const reviewStore = useReviewStore();
const {
  myReviews,
  myReviewCategory,
  myReviewHasNext,
  isMyReviewsLoading,
  isMyReviewsLoadingMore,
  myReviewsError,
} = storeToRefs(reviewStore);

const loadMoreTrigger = ref(null);
let loadMoreObserver;

onMounted(async () => {
  await reviewStore.fetchMyReviews();
  await nextTick();
  observeLoadMoreTrigger(loadMoreTrigger.value);
});

onBeforeUnmount(() => loadMoreObserver?.disconnect());

watch(loadMoreTrigger, (element) => observeLoadMoreTrigger(element));

function observeLoadMoreTrigger(element) {
  loadMoreObserver?.disconnect();
  if (!element) return;

  loadMoreObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) reviewStore.loadMoreMyReviews();
    },
    { rootMargin: '160px 0px' },
  );
  loadMoreObserver.observe(element);
}

function selectCategory(category) {
  reviewStore.fetchMyReviews(category);
}

function moveToReviewDetail(reviewId) {
  router.push(`/reviews/${reviewId}`);
}

</script>

<template>
  <main class="my-review-page">
    <div class="-mx-[23px] px-5 pt-4 mb-4">
      <BaseHeader
        title="내 리뷰"
        @back="router.back()"
      />
    </div>

    <nav class="category-tabs" aria-label="리뷰 카테고리">
      <button
        v-for="category in categories"
        :key="category.value"
        type="button"
        :class="{ active: myReviewCategory === category.value }"
        :aria-pressed="myReviewCategory === category.value"
        @click="selectCategory(category.value)"
      >
        {{ category.label }}
      </button>
    </nav>

    <LoadingScreen v-if="isMyReviewsLoading" title="리뷰를 불러오고 있어요" :fullscreen="false" />
    <BaseErrorState v-else-if="myReviewsError && myReviews.length === 0" :title="myReviewsError" @retry="reviewStore.fetchMyReviews(myReviewCategory)" />
    <BaseEmptyState v-else-if="myReviews.length === 0" title="작성한 리뷰가 없습니다." />

    <section v-else class="review-list" aria-label="내 리뷰 목록">
      <MyReviewListItem
        v-for="review in myReviews"
        :key="review.reviewId"
        :review="review"
        @open="moveToReviewDetail"
      />
      <div
        v-if="myReviewHasNext && !myReviewsError"
        ref="loadMoreTrigger"
        class="load-more-status"
        aria-live="polite"
      >
        {{ isMyReviewsLoadingMore ? '리뷰를 더 불러오고 있어요' : '' }}
      </div>
      <BaseErrorState
        v-else-if="myReviewsError"
        :title="myReviewsError"
        @retry="reviewStore.loadMoreMyReviews()"
      />
    </section>

  </main>
</template>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/woff2/SUIT-Variable.css');
.my-review-page { min-height:871px; display:flex; flex-direction:column; padding:0 23px 36px; color:#172033; background:#fff; font-family:'SUIT','SUIT Variable',sans-serif; }
button { font:inherit; }
.category-tabs { display:grid; grid-template-columns:53px 72px 96px 54px 54px; justify-content:space-between; gap:4px; margin:0 5px 17px; }
.category-tabs button { height:36px; padding:0 5px; color:#64748b; border:1px solid #dce5ef; border-radius:19px; background:#fff; font-size:12px; font-weight:700; cursor:pointer; white-space:nowrap; }
.category-tabs button.active { color:#fff; border-color:#3087ed; background:#3087ed; }
.review-list { display:flex; flex-direction:column; align-items:center; gap:10px; }
.load-more-status { min-height:40px; padding:10px 0; color:#8493a7; text-align:center; font-size:12px; }
@media (max-width:380px) { .my-review-page { padding-right:15px; padding-left:15px; }.category-tabs { grid-template-columns:repeat(5,auto); }.category-tabs button { padding:0 8px; } }
</style>
