<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Bed, Building2, Ticket, UtensilsCrossed } from '@lucide/vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useReviewStore } from '@/stores/reviewStore';
import AtmosphereTagSelector from '@/components/review/AtmosphereTagSelector.vue';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import BaseErrorState from '@/components/common/BaseErrorState.vue';
import { getMerchantDefaultImage } from '@/config/merchantDefaultImages';

const route = useRoute();
const router = useRouter();
const reviewStore = useReviewStore();
const { reviewDetail, isDetailLoading, detailError, isReviewDeleting, reviewDeleteError } = storeToRefs(reviewStore);
const reviewId = computed(() => Number(route.params.reviewId));
const hasReviewImage = computed(() => Boolean(reviewDetail.value?.imageUrl));
const merchantThumbnailLoadFailed = ref(false);
const merchantImageIndex = ref(0);
const merchantCategoryIcons = {
  ACCOMMODATION: Bed,
  OFFICE: Building2,
  RESTAURANT: UtensilsCrossed,
  ACTIVITY: Ticket,
};
const merchantThumbnailClasses = {
  ACCOMMODATION: 'bg-brand-weak text-blue-400',
  OFFICE: 'bg-emerald-50 text-emerald-400',
  RESTAURANT: 'bg-warn-weak text-amber-400',
  ACTIVITY: 'bg-violet-50 text-violet-400',
};
const merchantCategoryIcon = computed(
  () => merchantCategoryIcons[reviewDetail.value?.merchant?.category] ?? Ticket,
);
const merchantThumbnailClass = computed(
  () =>
    merchantThumbnailClasses[reviewDetail.value?.merchant?.category] ??
    'bg-canvas text-ink-mute',
);
const merchantImageCandidates = computed(() =>
  [
    reviewDetail.value?.imageUrl,
    reviewDetail.value?.merchant?.thumbnailUrl,
    getMerchantDefaultImage({
      category: reviewDetail.value?.merchant?.category,
      merchantId: reviewDetail.value?.merchant?.merchantId,
    }),
  ]
    .filter(Boolean)
    .filter((url, index, urls) => urls.indexOf(url) === index),
);
const merchantSummaryImage = computed(
  () => merchantImageCandidates.value[merchantImageIndex.value] ?? '',
);
const hasMerchantThumbnail = computed(
  () => Boolean(merchantSummaryImage.value) && !merchantThumbnailLoadFailed.value,
);
const isDeleteModalOpen = ref(false);
const isModifyPeriodExpired = computed(() => {
  if (reviewDetail.value?.reservationEndDate) {
    const deadline = new Date(`${reviewDetail.value.reservationEndDate}T23:59:59.999`);
    deadline.setDate(deadline.getDate() + 30);
    return Date.now() > deadline.getTime();
  }
  if (reviewDetail.value?.transactionApprovedAt) {
    const deadline = new Date(reviewDetail.value.transactionApprovedAt);
    deadline.setDate(deadline.getDate() + 30);
    return Date.now() > deadline.getTime();
  }
  return false;
});

onMounted(() => reviewStore.fetchReviewDetails(reviewId.value));

watch(merchantImageCandidates, () => {
  merchantImageIndex.value = 0;
  merchantThumbnailLoadFailed.value = false;
});

function handleMerchantImageError() {
  if (merchantImageIndex.value < merchantImageCandidates.value.length - 1) {
    merchantImageIndex.value += 1;
    return;
  }
  merchantThumbnailLoadFailed.value = true;
}

function formatDate(value) {
  return value.slice(0, 10).replaceAll('-', '. ');
}

function moveToReviewEdit() {
  if (!isModifyPeriodExpired.value) router.push(`/reviews/${reviewId.value}/edit`);
}
function closeDeleteModal() {
  if (!isReviewDeleting.value) isDeleteModalOpen.value = false;
}
async function confirmDelete() {
  const deleted = await reviewStore.deleteMyReview(reviewId.value);
  if (deleted) router.back();
}
</script>

<template>
  <main class="detail-page">
    <div class="pt-4 mb-4">
      <BaseHeader
        title="리뷰 상세보기"
        @back="router.back()"
      />
    </div>

    <LoadingScreen v-if="isDetailLoading" title="리뷰를 불러오고 있어요" />
    <BaseErrorState v-else-if="detailError" :title="detailError" @retry="reviewStore.fetchReviewDetails(reviewId)" />

    <div v-else-if="reviewDetail" class="review-content">
      <section class="merchant-summary" aria-label="가맹점 정보">
        <div class="merchant-thumbnail" :class="merchantThumbnailClass">
          <img
            v-if="hasMerchantThumbnail"
            :src="merchantSummaryImage"
            :alt="`${reviewDetail.merchant.merchantName} 리뷰 이미지`"
            @error="handleMerchantImageError"
          />
          <component
            :is="merchantCategoryIcon"
            v-else
            class="merchant-thumbnail-placeholder"
            aria-label="가맹점 이미지 없음"
          />
        </div>
        <div class="merchant-info">
          <h2>{{ reviewDetail.merchant.merchantName }}</h2>
          <p>{{ reviewDetail.merchant.address }}</p>
        </div>
      </section>

      <section class="author-field" aria-label="리뷰 작성 정보">
        <div>
          <h2>작성자</h2>
          <strong>{{ reviewDetail.nickname }}</strong>
        </div>
        <div>
          <h2>작성일</h2>
          <time :datetime="reviewDetail.createdAt">{{ formatDate(reviewDetail.createdAt) }}</time>
        </div>
      </section>

      <section class="rating-field" aria-labelledby="rating-title">
        <h2 id="rating-title">평점</h2>
        <div class="stars" :aria-label="`별점 ${reviewDetail.rating}점`">
          <span v-for="score in 5" :key="score" :class="{ selected: score <= reviewDetail.rating }">★</span>
        </div>
      </section>

      <section v-if="reviewDetail.atmosphere" class="atmosphere-field" aria-labelledby="atmosphere-title">
        <h2 id="atmosphere-title">분위기</h2>
        <AtmosphereTagSelector :model-value="reviewDetail.atmosphere" readonly />
      </section>

      <section v-if="hasReviewImage" class="photo-field" aria-labelledby="photo-title">
        <h2 id="photo-title">리뷰 사진</h2>
        <img class="photo-image" :src="reviewDetail.imageUrl" alt="사용자가 등록한 리뷰 사진" />
      </section>

      <section class="text-field" aria-labelledby="content-title">
        <h2 id="content-title">리뷰 내용</h2>
        <p>{{ reviewDetail.content }}</p>
      </section>

      <p v-if="reviewDeleteError" class="delete-error">{{ reviewDeleteError }}</p>
      <section v-if="reviewDetail.isMine" class="review-actions" aria-label="내 리뷰 관리">
        <button
          type="button"
          class="h-[52px] w-full rounded-card bg-surface text-body font-bold text-danger shadow-[0_2px_10px_rgba(229,72,77,0.18)] transition-transform active:scale-[0.98]"
          @click="isDeleteModalOpen = true"
        >
          삭제하기
        </button>
        <BaseButton :disabled="isModifyPeriodExpired" @click="moveToReviewEdit">
          {{ isModifyPeriodExpired ? '수정 기간 만료' : '수정하기' }}
        </BaseButton>
      </section>
    </div>
    <BaseConfirmModal
      :visible="isDeleteModalOpen"
      :title="'리뷰를 삭제하시면\n재작성이 불가합니다.'"
      message="삭제하시겠습니까?"
      cancel-label="닫기"
      confirm-label="확인"
      :loading="isReviewDeleting"
      @cancel="closeDeleteModal"
      @confirm="confirmDelete"
    />
  </main>
</template>

<style scoped>
.detail-page { min-height:100vh; padding:0 20px 100px; color:var(--color-ink); background:var(--color-canvas); font-family:var(--font-sans); }
button { font:inherit; }
.review-content { display:flex; flex-direction:column; gap:12px; }
.merchant-summary,.author-field,.rating-field,.atmosphere-field,.photo-field,.text-field { border:1px solid var(--color-line); border-radius:var(--radius-card); background:var(--color-surface); box-shadow:var(--shadow-card); }
.merchant-summary { display:flex; align-items:flex-start; gap:14px; padding:16px; }
.merchant-thumbnail { display:flex; width:116px; min-width:116px; max-width:116px; height:116px; min-height:116px; max-height:116px; flex:0 0 116px; align-items:center; justify-content:center; overflow:hidden; border-radius:var(--radius-chip); }
.merchant-thumbnail img { display:block; width:116px; min-width:116px; max-width:116px; height:116px; min-height:116px; max-height:116px; object-fit:cover; object-position:center; }
.merchant-thumbnail-placeholder { width:32px; height:32px; }
.merchant-info { min-width:0; padding-top:7px; }
.merchant-info h2 { margin:0 0 8px; font-size:16px; font-weight:800; }
.merchant-info p { margin:0 0 7px; color:#7c8ca3; font-size:12px; line-height:1.5; white-space:normal; word-break:keep-all; }
.merchant-info > span { display:inline-block; padding:6px 13px; color:#3087ed; border-radius:14px; background:#eaf3ff; font-size:12px; }
.author-field { display:grid; grid-template-columns:1fr 1fr; padding:16px; }
.author-field > div + div { padding-left:18px; border-left:1px solid #e1e7ee; }
.author-field h2,.rating-field h2,.atmosphere-field h2,.text-field h2,.photo-field h2 { margin:0 0 9px; font-size:12px; font-weight:800; }
.author-field h2,.rating-field h2,.text-field h2 { font-size:14px; }
.author-field strong,.author-field time { color:#52647b; font-size:13px; font-weight:500; }
.rating-field { padding:16px; }
.stars { display:flex; gap:2px; height:42px; }
.stars span { width:38px; color:#ced9e5; font-size:40px; line-height:1; }
.stars span.selected { color:#ff9500; }
.atmosphere-field { padding:16px; }
.text-field { padding:16px; }
.text-field > p { min-height:140px; margin:0; color:#42546a; font-size:13px; line-height:1.8; white-space:pre-line; }
.photo-field { padding:16px; }
.photo-field h2 { margin-bottom:12px; }
.photo-image { width:180px; height:180px; object-fit:cover; border-radius:12px; }
.review-actions { position:fixed; z-index:10; bottom:0; left:50%; display:grid; width:min(430px,100%); grid-template-columns:1fr 1fr; gap:10px; padding:12px 20px calc(12px + env(safe-area-inset-bottom)); transform:translateX(-50%); border-top:1px solid var(--color-line); background:var(--color-surface); }
.delete-error { margin:20px 0 0; color:#dc2626; text-align:center; font-size:12px; }
.status-message { padding:100px 0; color:#8292a8; text-align:center; font-size:12px; }
@media (max-width:360px) { .detail-page { padding-right:16px; padding-left:16px; }.review-actions { padding-right:16px; padding-left:16px; } }
</style>
