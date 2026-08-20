<script setup>
import { onMounted } from 'vue';
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

const restaurantStore = useRestaurantStore();
const route = useRoute();
const router = useRouter();
const { restaurant, isLoading, isBookmarkLoading, error } =
  storeToRefs(restaurantStore);
const { showError } = useErrorToast();

const fetchRestaurant = async () => {
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
            v-if="restaurant.thumbnailUrl"
            class="h-full w-full object-cover"
            :src="restaurant.thumbnailUrl"
            :alt="`${restaurant.merchantName} 대표 이미지`"
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
