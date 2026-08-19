<script setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import ReviewListItem from '@/components/review/ReviewListItem.vue';
import ReviewPagination from '@/components/review/ReviewPagination.vue';
import { useReviewStore } from '@/stores/reviewStore';
import BaseHeader from '@/components/common/BaseHeader.vue';

const route = useRoute();
const router = useRouter();
const reviewStore = useReviewStore();
const { merchantName, reviewCount, reviews, page, totalPages, isLoading, error } =
  storeToRefs(reviewStore);

const merchantId = computed(() => Number(route.params.merchantId));

onMounted(() => {
  reviewStore.fetchMerchantReviews(merchantId.value);
});

function movePage(nextPage) {
  reviewStore.setPage(nextPage);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function moveToReviewDetail(reviewId) {
  router.push(`/reviews/${reviewId}`);
}
</script>

<template>
  <main class="review-page">
    <BaseHeader
      :title="merchantName || '서핑 체험 강릉'"
      title-class="max-w-[280px] overflow-hidden text-ellipsis whitespace-nowrap text-[18px] font-bold text-gray-900"
      @back="router.back()"
    />

    <section class="review-section" aria-labelledby="review-summary">
      <p id="review-summary" class="review-summary">
        리뷰 {{ reviewCount }}개 · 최신순
      </p>

      <p v-if="isLoading" class="status-message">리뷰를 불러오고 있어요.</p>
      <p v-else-if="error" class="status-message">{{ error }}</p>
      <p v-else-if="reviews.length === 0" class="status-message">등록된 리뷰가 없습니다.</p>

      <div v-else class="review-list">
        <ReviewListItem
          v-for="review in reviews"
          :key="review.reviewId"
          :review="review"
          @open="moveToReviewDetail"
        />
      </div>
    </section>

    <div class="pagination-slot">
      <ReviewPagination :page="page" :total-pages="totalPages" @change="movePage" />
    </div>
  </main>
</template>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/woff2/SUIT-Variable.css');
.review-page { min-height:871px; display:flex; flex-direction:column; padding:0 23px 28px; color:#172033; background:#fff; font-family:'SUIT','SUIT Variable',sans-serif; }
button { font:inherit; }
.review-section { padding-top:17px; }
.review-summary { margin:0 5px 14px; color:#8997aa; font-size:12px; }
.review-list { display:flex; flex-direction:column; align-items:center; gap:10px; }
.status-message { padding:70px 0; color:#8997aa; text-align:center; font-size:12px; }
.pagination-slot { margin-top:auto; }
@media (max-width: 360px) { .review-thumbnail { width:78px; } }
</style>
