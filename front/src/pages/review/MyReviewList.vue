<script setup>
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import MyReviewListItem from '@/components/review/MyReviewListItem.vue';
import ReviewPagination from '@/components/review/ReviewPagination.vue';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';
import { useReviewStore } from '@/stores/reviewStore';

const categories = [
  { value: 'ALL', label: '전체' },
  { value: 'ACCOMMODATION', label: '숙소' },
  { value: 'OFFICE', label: '공유 오피스' },
  { value: 'RESTAURANT', label: '식당' },
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
  isReviewDeleting,
  reviewDeleteError,
} = storeToRefs(reviewStore);
const deleteReviewId = ref(null);

onMounted(() => reviewStore.fetchMyReviews());

function selectCategory(category) {
  reviewStore.fetchMyReviews(category);
}

function movePage(page) {
  reviewStore.setMyReviewPage(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function moveToReviewEdit(reviewId) {
  router.push(`/reviews/${reviewId}/edit`);
}

function openDeleteModal(reviewId) {
  deleteReviewId.value = reviewId;
}

function closeDeleteModal() {
  if (isReviewDeleting.value) return;
  deleteReviewId.value = null;
}

async function confirmDelete() {
  if (!deleteReviewId.value) return;
  const deleted = await reviewStore.deleteMyReview(deleteReviewId.value);
  if (deleted) closeDeleteModal();
}

</script>

<template>
  <main class="my-review-page">
    <header class="page-header">
      <button type="button" aria-label="뒤로 가기" @click="router.back()">
        ‹
      </button>
      <h1>내 리뷰</h1><span aria-hidden="true"></span>
    </header>

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

    <p v-if="reviewDeleteError" class="delete-error">{{ reviewDeleteError }}</p>
    <p v-if="isMyReviewsLoading" class="status-message">리뷰를 불러오고 있어요.</p>
    <p v-else-if="myReviewsError" class="status-message">{{ myReviewsError }}</p>
    <p v-else-if="myReviews.length === 0" class="status-message">작성한 리뷰가 없습니다.</p>

    <section v-else class="review-list" aria-label="내 리뷰 목록">
      <MyReviewListItem
        v-for="review in myReviews"
        :key="review.reviewId"
        :review="review"
        @modify="moveToReviewEdit"
        @remove="openDeleteModal"
      />
    </section>

    <ReviewPagination
      v-if="!isMyReviewsLoading && !myReviewsError && myReviews.length > 0"
      :page="myReviewPage"
      :total-pages="myReviewTotalPages"
      @change="movePage"
    />

    <BaseConfirmModal
      :visible="deleteReviewId !== null"
      :title="'리뷰를 삭제하시면\n재작성이 불가합니다.'"
      message="삭제하시겠습니까?"
      cancel-label="닫기"
      confirm-label="확인"
      content-class="max-w-[300px] min-h-[230px] content-center gap-8 px-6 py-8"
      header-class="items-center sm:!text-center"
      :loading="isReviewDeleting"
      @cancel="closeDeleteModal"
      @confirm="confirmDelete"
    />
  </main>
</template>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/woff2/SUIT-Variable.css');
.my-review-page { width:min(402px,100%); min-height:871px; margin:0 auto; padding:0 23px 36px; color:#172033; background:#fff; font-family:'SUIT','SUIT Variable',sans-serif; }
button { font:inherit; }
.page-header { position:relative; height:50px; display:flex; align-items:center; justify-content:center; }
.page-header button { position:absolute; left:4px; width:36px; height:32px; padding:0; color:#172033; border:0; background:transparent; font-size:40px; line-height:1; cursor:pointer; }
.page-header h1 { margin:0; text-align:center; font-size:18px; font-weight:800; }
.category-tabs { display:grid; grid-template-columns:53px 72px 96px 54px 54px; justify-content:space-between; gap:4px; margin:0 5px 17px; }
.category-tabs button { height:36px; padding:0 5px; color:#64748b; border:1px solid #dce5ef; border-radius:19px; background:#fff; font-size:12px; font-weight:700; cursor:pointer; white-space:nowrap; }
.category-tabs button.active { color:#fff; border-color:#3087ed; background:#3087ed; }
.review-list { display:flex; flex-direction:column; align-items:center; gap:10px; }
.status-message { padding:100px 0; color:#8493a7; text-align:center; font-size:12px; }
.delete-error { margin:0 0 10px; color:#dc2626; text-align:center; font-size:12px; }
@media (max-width:380px) { .my-review-page { padding-right:15px; padding-left:15px; }.category-tabs { grid-template-columns:repeat(5,auto); }.category-tabs button { padding:0 8px; } }
</style>
