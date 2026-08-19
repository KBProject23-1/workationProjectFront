<script setup>
import { onMounted } from 'vue';
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
import { useRestaurantStore } from '@/stores/merchant/restaurantStore';
import { useErrorToast } from '@/composables/useErrorToast';

const restaurantStore = useRestaurantStore();
const route = useRoute();
const { restaurant, isLoading, isBookmarkLoading, error } =
  storeToRefs(restaurantStore);
const { showError } = useErrorToast();

async function fetchRestaurant() {
  await restaurantStore.fetchRestaurant(Number(route.params.merchantId));
}

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

async function toggleBookmark() {
  try {
    await restaurantStore.toggleBookmark();
  } catch (bookmarkError) {
    showError(bookmarkError, '북마크 처리 중 오류가 발생했습니다.');
  }
}
</script>

<template>
  <main class="restaurant-page">
    <div class="px-5 pt-4 mb-4">
      <BaseHeader
        title="음식점 상세보기"
        @back="$router.back()"
      />
    </div>

    <LoadingScreen v-if="isLoading" title="음식점 정보를 불러오고 있어요" />
    <BaseErrorState v-else-if="error" :title="error" @retry="fetchRestaurant" />

    <section
      v-if="!isLoading && !error"
      class="hero-image"
      aria-label="음식점 대표 이미지"
    >
      <img
        v-if="restaurant.thumbnailUrl"
        :src="restaurant.thumbnailUrl"
        :alt="`${restaurant.merchantName} 대표 이미지`"
      />
      <template v-else>
      <div class="restaurant-window"><i></i></div>
      <div class="pasta"><span></span><b></b><em></em></div>
      <div class="table-item"></div>
      </template>
    </section>

    <section v-if="!isLoading && !error" class="restaurant-info">
      <button
        type="button"
        class="bookmark-button"
        :class="{ bookmarked: restaurant.bookmarked }"
        :aria-label="restaurant.bookmarked ? '북마크 해제' : '북마크 추가'"
        :aria-pressed="restaurant.bookmarked"
        :disabled="isBookmarkLoading"
        @click="toggleBookmark"
      >
        <Heart :size="18" :fill="restaurant.bookmarked ? 'currentColor' : 'none'" />
      </button>
      <h2>{{ restaurant.merchantName }}</h2>
      <p class="description">{{ restaurant.description }}</p>
      <p class="address"><MapPin :size="24" /> {{ restaurant.address }}</p>
      <div class="divider"></div>
      <p class="rating"><span>★</span> {{ restaurant.rating }}</p>
      <div class="price"><span>예상 가격</span><strong>{{ restaurant.price.toLocaleString() }}원</strong></div>
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
        <h3>리뷰 <span>{{ restaurant.reviewCount }}개</span></h3>
        <button type="button" class="review-button" @click="$router.push(`/merchants/${restaurant.merchantId}/reviews`)">리뷰 보기</button>
      </div>
      <div class="review-list">
        <MerchantReviewCard v-for="review in restaurant.reviews" :key="`${review.nickname}-${review.created_at}`" :review="review" />
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
.restaurant-page { min-height:min(871px,100vh); padding-bottom:22px; color:#111827; background:#fff; font-family:'SUIT Variable','SUIT',sans-serif; } button { font:inherit; }
.hero-image { position:relative; height:175px; margin:0 16px 16px; overflow:hidden; border-radius:22px; background:#b4d3fb; }.restaurant-window { position:absolute; top:27px; left:26px; right:26px; height:104px; overflow:hidden; border-radius:11px; background:#edf4fd; }.restaurant-window::after { content:''; position:absolute; left:-15px; right:-15px; bottom:-14px; height:55px; border-radius:50% 50% 0 0; background:#b6d3f5; }.restaurant-window i { position:absolute; top:12px; right:39px; z-index:1; width:24px; height:24px; border-radius:50%; background:#ffd057; }.pasta { position:absolute; left:65px; bottom:64px; z-index:2; width:100px; height:35px; border:5px solid #df9854; border-radius:50%; background:#e7a654; }.pasta span,.pasta b,.pasta em { position:absolute; width:8px; height:8px; border-radius:50%; }.pasta span { top:7px; left:21px; background:#77ae67; }.pasta b { top:13px; left:45px; background:#e95d54; }.pasta em { top:4px; right:20px; background:#69ae67; }.table-item { position:absolute; right:106px; bottom:72px; width:58px; height:33px; border:9px solid #88776d; border-radius:7px; background:#e7ddd1; }
.hero-image > img { width:100%; height:100%; object-fit:cover; }
.bookmark-button:disabled { cursor:wait; opacity:.55; }
.restaurant-info { position:relative; margin:0 16px; padding:20px; border:1.5px solid #dbe3ee; border-radius:20px; background:#fff; }.bookmark-button { position:absolute; top:17px; right:18px; padding:0; color:#88a0bf; border:0; background:transparent; cursor:pointer; transition:color .16s ease,transform .16s ease; }.bookmark-button:hover { color:#3087ed; transform:scale(1.1); }.bookmark-button.bookmarked { color:#3087ed; }.restaurant-info h2 { margin:0 42px 8px 0; font-size:22px; }.description { margin:0 0 9px; color:#687587; font-size:12px; line-height:1.5; }.address { display:flex; align-items:center; gap:4px; margin:0; color:#8592a2; font-size:12px; }.divider { height:1px; margin:12px 0; background:#e3e8ee; }.rating { margin:0; font-size:16px; font-weight:800; }.rating span { color:#ff8a00; }.price { height:32px; display:flex; align-items:center; justify-content:space-between; margin-top:12px; padding:0 16px; border:1px solid #e4e9ef; border-radius:999px; background:#f8fafc; }.price span { color:#7b8794; font-size:12px; }.price strong { font-size:16px; }
.review-section { padding:20px 12px 0; }.review-header { display:flex; align-items:center; justify-content:space-between; margin:0 4px 10px; }.review-section h3 { margin:0; font-size:16px; }.review-section h3 span { color:#7b8794; }.review-button { flex:none; padding:5px 10px; border:1px solid #3087ed; border-radius:999px; color:#3087ed; background:#fff; font-size:12px; font-weight:800; }.review-list { display:flex; flex-direction:column; gap:10px; padding:8px; border:1.5px solid #dbe3ee; border-radius:20px; background:#f8fbff; }
</style>
