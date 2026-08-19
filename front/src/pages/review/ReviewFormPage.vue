<script setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import ReviewForm from '@/components/review/ReviewForm.vue';
import { useReviewStore } from '@/stores/reviewStore';
import BaseHeader from '@/components/common/BaseHeader.vue';

const route = useRoute();
const router = useRouter();
const reviewStore = useReviewStore();
const { reviewFormMerchant, reviewDetail, isReviewSaving, reviewSaveError } = storeToRefs(reviewStore);

const mode = computed(() => route.meta.mode);
const sourceType = computed(() => route.meta.sourceType || null);
const sourceId = computed(() => Number(route.params.reservationId || route.params.transactionId));
const reviewId = computed(() => Number(route.params.reviewId));
const title = computed(() => (mode.value === 'edit' ? '리뷰 수정하기' : '리뷰 등록하기'));

onMounted(() => reviewStore.prepareReviewForm({
  mode: mode.value,
  reviewId: reviewId.value,
  sourceType: sourceType.value,
  sourceId: sourceId.value,
}));

function goBack() {
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
  if (!result) return;
  if (mode.value === 'edit') {
    router.push(`/reviews/${reviewId.value}`);
    return;
  }
  router.push('/users/me/reviews');
}
</script>

<template>
  <main class="form-page">
    <BaseHeader
      :title="title"
      @back="goBack"
    />
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
.form-page { min-height:871px; padding:0 29px 31px; color:#172033; background:#fff; font-family:'SUIT','SUIT Variable',sans-serif; }
.error-message { margin:0 0 10px; color:#dc2626; text-align:center; font-size:12px; }
@media (max-width:360px) { .form-page { padding-right:20px; padding-left:20px; } }
</style>
