<script setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import ReviewForm from '@/components/review/ReviewForm.vue';
import { useReviewStore } from '@/stores/reviewStore';

const route = useRoute();
const router = useRouter();
const reviewStore = useReviewStore();
const { reviewFormMerchant, reviewDetail, isReviewSaving, reviewSaveError } = storeToRefs(reviewStore);

const mode = computed(() => route.meta.mode);
const sourceType = computed(() => route.meta.sourceType || null);
const sourceId = computed(() => Number(route.params.reservationId || route.params.transactionId));
const reviewId = computed(() => Number(route.params.reviewId));
const title = computed(() => (mode.value === 'edit' ? '리뷰 수정하기' : '리뷰 등록하기'));

onMounted(() => reviewStore.prepareReviewForm({ mode: mode.value, reviewId: reviewId.value }));

function goBack() {
  if (mode.value === 'edit') {
    router.push('/users/me/reviews');
    return;
  }

  router.back();
}

async function submitReview(form) {
  const result = await reviewStore.saveReview({
    mode: mode.value,
    sourceType: sourceType.value,
    sourceId: sourceId.value,
    reviewId: reviewId.value,
    ...form,
  });
  if (result) router.push('/users/me/reviews');
}
</script>

<template>
  <main class="form-page">
    <header class="page-header">
      <button type="button" aria-label="뒤로 가기" @click="goBack">‹</button>
      <h1>{{ title }}</h1><span aria-hidden="true"></span>
    </header>
    <p v-if="reviewSaveError" class="error-message">{{ reviewSaveError }}</p>
    <ReviewForm
      v-if="reviewFormMerchant"
      :mode="mode"
      :merchant="reviewFormMerchant"
      :initial-review="mode === 'edit' ? reviewDetail : null"
      :is-saving="isReviewSaving"
      @submit="submitReview"
    />
  </main>
</template>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/woff2/SUIT-Variable.css');
.form-page { width:min(402px,100%); min-height:871px; margin:0 auto; padding:0 29px 31px; color:#172033; background:#fff; font-family:'SUIT','SUIT Variable',sans-serif; }
.page-header { position:relative; height:50px; display:flex; align-items:center; justify-content:center; }.page-header button { position:absolute; left:0; width:36px; height:32px; padding:0; color:#172033; border:0; background:transparent; font-size:40px; line-height:1; cursor:pointer; }.page-header h1 { margin:0; text-align:center; font-size:18px; font-weight:800; }
.error-message { margin:0 0 10px; color:#dc2626; text-align:center; font-size:12px; }
@media (max-width:360px) { .form-page { padding-right:20px; padding-left:20px; } }
</style>
