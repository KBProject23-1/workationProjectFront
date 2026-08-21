<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { Heart, MapPin, Star } from '@lucide/vue';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import BaseErrorState from '@/components/common/BaseErrorState.vue';
import ScheduleRegistrationPanel from '@/components/schedule/ScheduleRegistrationPanel.vue';
import { useScheduleRegistration } from '@/composables/useScheduleRegistration';
import { useRestaurantStore } from '@/stores/merchant/restaurantStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { getMerchantDefaultImage } from '@/config/merchantDefaultImages';

const restaurantStore = useRestaurantStore();
const route = useRoute();
const router = useRouter();
const { restaurant, isLoading, isBookmarkLoading, error } =
  storeToRefs(restaurantStore);
const { showError } = useErrorToast();
const heroImageLoadFailed = ref(false);
const defaultThumbnail = computed(() => getMerchantDefaultImage({
  category: 'RESTAURANT',
  merchantId: restaurant.value.merchantId,
}));

const fetchRestaurant = async () => {
  heroImageLoadFailed.value = false;
  await restaurantStore.fetchRestaurant(Number(route.params.merchantId));
};

onMounted(fetchRestaurant);

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
} = useScheduleRegistration(restaurant);

const toggleBookmark = async () => {
  try {
    await restaurantStore.toggleBookmark();
  } catch (bookmarkError) {
    showError(bookmarkError, '북마크 처리 중 오류가 발생했습니다.');
  }
};

const goReviews = () => {
  router.push(`/merchants/${restaurant.value.merchantId}/reviews`);
};
</script>

<template>
  <main class="bg-canvas min-h-screen pb-8">
    <div class="px-5 pt-4">
      <BaseHeader title="음식점 상세" @back="$router.back()" />
    </div>

    <LoadingScreen
      v-if="isLoading"
      title="음식점 정보를 불러오고 있어요"
      :fullscreen="false"
    />

    <BaseErrorState v-else-if="error" :title="error" @retry="fetchRestaurant" />

    <div v-else class="px-4 pt-4">
      <!-- 대표 이미지와 가맹점 정보. 숙소·공유오피스와 같은 규격이다 -->
      <section class="rounded-sheet bg-surface shadow-card overflow-hidden">
        <div class="bg-brand-weak relative h-[190px]">
          <img
            class="h-full w-full object-cover"
            :src="restaurant.thumbnailUrl && !heroImageLoadFailed
              ? restaurant.thumbnailUrl
              : defaultThumbnail"
            :alt="`${restaurant.merchantName} 대표 이미지`"
            @error="heroImageLoadFailed = true"
          />

          <button
            type="button"
            class="bg-surface/90 shadow-card absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full transition-transform active:scale-95 disabled:opacity-50"
            :class="restaurant.bookmarked ? 'text-brand' : 'text-ink-mute'"
            :aria-label="restaurant.bookmarked ? '북마크 해제' : '북마크 추가'"
            :aria-pressed="restaurant.bookmarked"
            :disabled="isBookmarkLoading"
            @click="toggleBookmark"
          >
            <Heart
              :size="18"
              :fill="restaurant.bookmarked ? 'currentColor' : 'none'"
            />
          </button>
        </div>

        <div class="px-[18px] py-4">
          <h2 class="text-heading font-bold -tracking-[0.02em] text-ink">
            {{ restaurant.merchantName }}
          </h2>

          <p class="text-body-sm mt-1.5 flex items-center gap-1 text-ink-mute">
            <MapPin :size="14" class="shrink-0" />
            <span class="truncate">{{ restaurant.address }}</span>
          </p>

          <!-- 별점은 가맹점 이름과 한 덩어리로 읽혀야 한다 -->
          <div
            class="border-line mt-3.5 flex items-center justify-between gap-3 border-t pt-3.5"
          >
            <p class="text-body flex items-center gap-1.5 font-bold text-ink">
              <Star :size="15" class="text-warn" fill="currentColor" />
              {{ restaurant.rating }}
              <span class="text-body-sm font-medium text-ink-mute">
                리뷰 {{ restaurant.reviewCount }}개
              </span>
            </p>
            <button
              type="button"
              class="text-body-sm rounded-chip bg-brand-weak text-brand shrink-0 px-3 py-1.5 font-bold"
              @click="goReviews"
            >
              리뷰 보기
            </button>
          </div>
        </div>
      </section>

      <section
        v-if="restaurant.description"
        class="rounded-card bg-surface shadow-card mt-3 px-[18px] py-4"
      >
        <p class="text-body leading-relaxed text-ink-sub">
          {{ restaurant.description }}
        </p>
      </section>

      <section
        class="rounded-card bg-surface shadow-card mt-3 flex items-center justify-between px-[18px] py-4"
      >
        <span class="text-body-sm text-ink-sub">예상 가격</span>
        <span class="text-title font-bold text-ink">
          {{ restaurant.price.toLocaleString() }}원
        </span>
      </section>

      <!-- 예약이 아니라 방문 계획이라 날짜와 시간만 정한다 -->
      <section class="mt-5">
        <h3 class="text-title mb-2.5 px-1 font-bold -tracking-[0.01em] text-ink">
          방문 계획
        </h3>
        <ScheduleRegistrationPanel
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

    </div>

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
.restaurant-page { min-height:min(871px,100vh); padding-bottom:22px; color:#111827; background:#fff; font-family:'SUIT Variable','SUIT',sans-serif; } button { font:inherit; }
.hero-image { position:relative; height:175px; margin:0 16px 16px; overflow:hidden; border-radius:22px; background:#b4d3fb; }
.hero-image > img { width:100%; height:100%; object-fit:cover; }
.bookmark-button:disabled { cursor:wait; opacity:.55; }
.restaurant-info { position:relative; margin:0 16px; padding:20px; border:1.5px solid #dbe3ee; border-radius:20px; background:#fff; }.bookmark-button { position:absolute; top:17px; right:18px; padding:0; color:#88a0bf; border:0; background:transparent; cursor:pointer; transition:color .16s ease,transform .16s ease; }.bookmark-button:hover { color:#3087ed; transform:scale(1.1); }.bookmark-button.bookmarked { color:#3087ed; }.restaurant-info h2 { margin:0 42px 8px 0; font-size:22px; }.description { margin:0 0 9px; color:#687587; font-size:12px; line-height:1.5; }.address { display:flex; align-items:center; gap:4px; margin:0; color:#8592a2; font-size:12px; }.divider { height:1px; margin:12px 0; background:#e3e8ee; }.rating { margin:0; font-size:16px; font-weight:800; }.rating span { color:#ff8a00; }.price { height:32px; display:flex; align-items:center; justify-content:space-between; margin-top:12px; padding:0 16px; border:1px solid #e4e9ef; border-radius:999px; background:#f8fafc; }.price span { color:#7b8794; font-size:12px; }.price strong { font-size:16px; }
.review-section { padding:20px 12px 0; }.review-header { display:flex; align-items:center; justify-content:space-between; margin:0 4px 10px; }.review-section h3 { margin:0; font-size:16px; }.review-section h3 span { color:#7b8794; }.review-button { flex:none; padding:5px 10px; border:1px solid #3087ed; border-radius:999px; color:#3087ed; background:#fff; font-size:12px; font-weight:800; }.review-list { display:flex; flex-direction:column; gap:10px; padding:8px; border:1.5px solid #dbe3ee; border-radius:20px; background:#f8fbff; }
</style>
