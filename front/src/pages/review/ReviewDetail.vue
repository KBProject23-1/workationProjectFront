<script setup>
import { computed, onMounted, ref } from 'vue';
import { MapPin } from '@lucide/vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useReviewStore } from '@/stores/reviewStore';
import AtmosphereTagSelector from '@/components/review/AtmosphereTagSelector.vue';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';

const route = useRoute();
const router = useRouter();
const reviewStore = useReviewStore();
const { reviewDetail, isDetailLoading, detailError, isReviewDeleting, reviewDeleteError } = storeToRefs(reviewStore);
const reviewId = computed(() => Number(route.params.reviewId));
const hasReviewImage = computed(() => Boolean(reviewDetail.value?.imageUrl));
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
    <div class="-mx-[29px] px-5 pt-4 mb-4">
      <BaseHeader
        title="리뷰 상세보기"
        @back="router.back()"
      />
    </div>

    <LoadingScreen v-if="isDetailLoading" title="리뷰를 불러오고 있어요" />
    <p v-else-if="detailError" class="status-message">{{ detailError }}</p>

    <div v-else-if="reviewDetail" class="review-content">
      <section class="merchant-summary" aria-label="가맹점 정보">
        <div class="room-image" role="img" aria-label="호텔 객실 이미지">
          <span class="wall"></span><span class="window"></span>
          <span class="bed"></span><span class="table"></span>
        </div>
        <div class="merchant-info">
          <h2>{{ reviewDetail.merchant.merchantName }}</h2>
          <p><MapPin :size="20" /> {{ reviewDetail.merchant.address }}</p>
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
        <button type="button" class="modify-button" :disabled="isModifyPeriodExpired" @click="moveToReviewEdit">
          {{ isModifyPeriodExpired ? '수정 기간 만료' : '수정하기' }}
        </button>
        <button type="button" class="delete-button" @click="isDeleteModalOpen = true">삭제하기</button>
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
@import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/woff2/SUIT-Variable.css');
.detail-page { min-height:871px; padding:0 29px 50px; color:#172033; background:#fff; font-family:'SUIT','SUIT Variable',sans-serif; }
button { font:inherit; }
.review-content { display:flex; flex-direction:column; }
.merchant-summary { display:flex; align-items:flex-start; gap:14px; }
.room-image { position:relative; width:96px; height:94px; flex:none; overflow:hidden; border-radius:8px; background:#b99573; }
.wall { position:absolute; inset:0 0 46%; background:linear-gradient(125deg,#4b4239 0 36%,#d6d4ce 36% 52%,#b7c5cd 52% 100%); }
.window { position:absolute; top:9%; right:4%; width:43%; height:40%; border:3px solid #332f2b; background:linear-gradient(145deg,#9eb8c4,#dbe3e5); }
.bed { position:absolute; left:13%; bottom:12%; width:68%; height:34%; border:5px solid #f7f3ed; border-radius:3px; background:#e8e0d6; transform:skewX(-7deg); }
.bed::before { content:''; position:absolute; left:8%; top:-13px; width:34%; height:12px; border-radius:3px; background:#fff; }
.table { position:absolute; right:5%; bottom:12%; width:13%; height:28%; background:#594838; }
.merchant-info { min-width:0; padding-top:7px; }
.merchant-info h2 { margin:0 0 8px; font-size:16px; font-weight:800; }
.merchant-info p { display:flex; align-items:center; gap:3px; margin:0 0 7px; color:#7c8ca3; font-size:12px; white-space:nowrap; }
.merchant-info p svg { flex:none; }
.merchant-info > span { display:inline-block; padding:6px 13px; color:#3087ed; border-radius:14px; background:#eaf3ff; font-size:12px; }
.author-field { display:grid; grid-template-columns:1fr 1fr; margin-top:27px; padding:14px 15px; border:1.5px solid #d5e1ef; border-radius:17px; }
.author-field > div + div { padding-left:18px; border-left:1px solid #e1e7ee; }
.author-field h2,.rating-field h2,.atmosphere-field h2,.text-field h2,.photo-field h2 { margin:0 0 9px; font-size:12px; font-weight:800; }
.author-field strong,.author-field time { color:#52647b; font-size:12px; font-weight:500; }
.rating-field { margin-top:27px; }
.stars { display:flex; gap:2px; height:42px; }
.stars span { width:38px; color:#ced9e5; font-size:40px; line-height:1; }
.stars span.selected { color:#ff9500; }
.atmosphere-field { margin-top:27px; }
.text-field { margin-top:27px; }
.text-field > p { min-height:160px; margin:0; padding:14px 15px; color:#42546a; border:1.5px solid #d5e1ef; border-radius:17px; font-size:12px; line-height:1.8; white-space:pre-line; }
.photo-field { margin-top:27px; }
.photo-field h2 { margin-bottom:17px; }
.photo-image { width:180px; height:180px; object-fit:cover; border-radius:12px; }
.review-actions { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:32px; }
.review-actions button { height:48px; border-radius:12px; font-size:16px; font-weight:600; cursor:pointer; }
.modify-button { color:#fff; border:1.5px solid #3087ed; background:#3087ed; }
.modify-button:disabled { color:#94a3b8; border-color:#e2e8f0; background:#e2e8f0; cursor:default; }
.delete-button { color:#3087ed; border:1.5px solid #3087ed; background:#fff; }
.delete-error { margin:20px 0 0; color:#dc2626; text-align:center; font-size:12px; }
.status-message { padding:100px 0; color:#8292a8; text-align:center; font-size:12px; }
@media (max-width:360px) { .detail-page { padding-right:20px; padding-left:20px; }.merchant-info p { white-space:normal; } }
</style>
