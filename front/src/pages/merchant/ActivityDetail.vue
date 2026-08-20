<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { Heart, MapPin } from '@lucide/vue';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import BaseErrorState from '@/components/common/BaseErrorState.vue';
import MerchantReviewCard from '@/components/merchant/MerchantReviewCard.vue';
import ScheduleRegistrationPanel from '@/components/schedule/ScheduleRegistrationPanel.vue';
import { useScheduleRegistration } from '@/composables/useScheduleRegistration';
import { useActivityStore } from '@/stores/merchant/activityStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { getMerchantDefaultImage } from '@/config/merchantDefaultImages';

const activityStore = useActivityStore();
const route = useRoute();
const { activity, isLoading, isBookmarkLoading, error } =
  storeToRefs(activityStore);
const { showError } = useErrorToast();
const heroImageLoadFailed = ref(false);
const defaultThumbnail = computed(() => getMerchantDefaultImage({
  category: 'ACTIVITY',
  merchantId: activity.value.merchantId,
  activityType: activity.value.activityType,
}));

async function fetchActivity() {
  heroImageLoadFailed.value = false;
  await activityStore.fetchActivity(Number(route.params.merchantId));
}

onMounted(fetchActivity);

const {
  workation,
  isCreating,
  selectedDate,
  selectedTime,
  unavailableTimes,
  confirmVisible,
  registrationDisabled,
  registrationMessage,
  confirmMessage,
  requestRegistration,
  registerSchedule,
} = useScheduleRegistration(activity);

async function toggleBookmark() {
  try {
    await activityStore.toggleBookmark();
  } catch (bookmarkError) {
    showError(bookmarkError, '북마크 처리 중 오류가 발생했습니다.');
  }
}
</script>

<template>
  <main class="activity-page">
    <div class="px-5 pt-4 mb-4">
      <BaseHeader
        title="여가 상세보기"
        @back="$router.back()"
      />
    </div>

    <LoadingScreen v-if="isLoading" title="여가 정보를 불러오고 있어요" />
    <BaseErrorState
      v-else-if="error"
      :title="error"
      title-class="text-[14px] text-[#e05252]"
      @retry="fetchActivity"
    />

    <section
      v-if="!isLoading && !error"
      class="hero-image"
      aria-label="여가활동 대표 이미지"
    >
      <img
        :src="activity.thumbnailUrl && !heroImageLoadFailed
          ? activity.thumbnailUrl
          : defaultThumbnail"
        :alt="`${activity.merchantName} 대표 이미지`"
        @error="heroImageLoadFailed = true"
      />
    </section>

    <section v-if="!isLoading && !error" class="activity-info">
      <button
        type="button"
        class="bookmark-button"
        :class="{ bookmarked: activity.bookmarked }"
        :aria-label="activity.bookmarked ? '북마크 해제' : '북마크 추가'"
        :aria-pressed="activity.bookmarked"
        :disabled="isBookmarkLoading"
        @click="toggleBookmark"
      >
        <Heart :size="18" :fill="activity.bookmarked ? 'currentColor' : 'none'" />
      </button>
      <h2>{{ activity.merchantName }}</h2>
      <p class="description">{{ activity.description }}</p>
      <p class="address"><MapPin :size="24" /> {{ activity.address }}</p>
      <div class="divider"></div>
      <p class="rating"><span>★</span> {{ activity.rating }}</p>
      <ScheduleRegistrationPanel
        v-if="!isLoading && !error"
        v-model:selected-date="selectedDate"
        v-model:selected-time="selectedTime"
        :min-date="workation?.startDate ?? ''"
        :max-date="workation?.endDate ?? ''"
        :loading="isCreating"
        :disabled="registrationDisabled"
        :disabled-times="unavailableTimes"
        :error-message="registrationMessage"
        @register="requestRegistration"
      />
    </section>

    <section v-if="!isLoading && !error" class="review-section">
      <div class="review-header">
        <h3>리뷰 <span>{{ activity.reviewCount }}개</span></h3>
        <button type="button" class="review-button" @click="$router.push(`/merchants/${activity.merchantId}/reviews`)">리뷰 보기</button>
      </div>
      <div class="review-list">
        <MerchantReviewCard v-for="review in activity.reviews" :key="`${review.nickname}-${review.created_at}`" :review="review" />
      </div>
    </section>

    <BaseConfirmModal
      :visible="confirmVisible"
      title="일정을 등록하시겠습니까?"
      :message="confirmMessage"
      :loading="isCreating"
      cancel-label="아니요"
      confirm-label="예"
      @cancel="confirmVisible = false"
      @confirm="registerSchedule"
    />
  </main>
</template>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/woff2/SUIT-Variable.css');
.activity-page { min-height:min(871px,100vh); padding-bottom:22px; color:#111827; background:#fff; font-family:'SUIT Variable','SUIT',sans-serif; } button { font:inherit; }
.hero-image { position:relative; height:175px; margin:0 16px 16px; overflow:hidden; border-radius:22px; background:#b4d3fb; }
.hero-image > img { width:100%; height:100%; object-fit:cover; }
.bookmark-button:disabled { cursor:wait; opacity:.55; }
.activity-info { position:relative; margin:0 16px; padding:20px; border:1.5px solid #dbe3ee; border-radius:20px; background:#fff; }.bookmark-button { position:absolute; top:17px; right:18px; padding:0; color:#88a0bf; border:0; background:transparent; cursor:pointer; transition:color .16s ease,transform .16s ease; }.bookmark-button:hover { color:#3087ed; transform:scale(1.1); }.bookmark-button.bookmarked { color:#3087ed; }.activity-info h2 { margin:0 42px 8px 0; font-size:22px; }.description { margin:0 0 9px; color:#687587; font-size:12px; line-height:1.5; }.address { display:flex; align-items:center; gap:4px; margin:0; color:#8592a2; font-size:12px; }.divider { height:1px; margin:12px 0; background:#e3e8ee; }.rating { margin:0; font-size:16px; font-weight:800; }.rating span { color:#ff8a00; }
.review-section { padding:20px 12px 0; }.review-header { display:flex; align-items:center; justify-content:space-between; margin:0 4px 10px; }.review-section h3 { margin:0; font-size:16px; }.review-section h3 span { color:#7b8794; }.review-button { flex:none; padding:5px 10px; border:1px solid #3087ed; border-radius:999px; color:#3087ed; background:#fff; font-size:12px; font-weight:800; }.review-list { display:flex; flex-direction:column; gap:10px; padding:8px; border:1.5px solid #dbe3ee; border-radius:20px; background:#f8fbff; }
</style>
