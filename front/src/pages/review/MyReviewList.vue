<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import MyReviewListItem from '@/components/review/MyReviewListItem.vue';
import ReviewPagination from '@/components/review/ReviewPagination.vue';
import { useReviewStore } from '@/stores/reviewStore';
import BaseHeader from '@/components/common/BaseHeader.vue';
import BaseEmptyState from '@/components/common/BaseEmptyState.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';

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
  myReviewPage,
  myReviewTotalPages,
  isMyReviewsLoading,
  myReviewsError,
} = storeToRefs(reviewStore);

onMounted(() => reviewStore.fetchMyReviews());

function selectCategory(category) {
  reviewStore.fetchMyReviews(category);
}

function movePage(page) {
  reviewStore.setMyReviewPage(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

    <LoadingScreen v-if="isMyReviewsLoading" title="리뷰를 불러오고 있어요" />
    <p v-else-if="myReviewsError" class="status-message">{{ myReviewsError }}</p>
    <BaseEmptyState v-else-if="myReviews.length === 0" title="작성한 리뷰가 없습니다." />

    <section v-else class="review-list" aria-label="내 리뷰 목록">
      <MyReviewListItem
        v-for="review in myReviews"
        :key="review.reviewId"
        :review="review"
        @open="moveToReviewDetail"
      />
    </section>

    <div class="pagination-slot">
      <ReviewPagination
        :page="myReviewPage"
        :total-pages="myReviewTotalPages"
        @change="movePage"
      />
    </div>

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
.status-message { padding:100px 0; color:#8493a7; text-align:center; font-size:12px; }
.pagination-slot { margin-top:auto; }
@media (max-width:380px) { .my-review-page { padding-right:15px; padding-left:15px; }.category-tabs { grid-template-columns:repeat(5,auto); }.category-tabs button { padding:0 8px; } }
</style>
