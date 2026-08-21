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
import { useActivityStore } from '@/stores/merchant/activityStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { useMerchantImage } from '@/composables/useMerchantImage';

const activityStore = useActivityStore();
const route = useRoute();
const router = useRouter();
const { activity, isLoading, isBookmarkLoading, error } =
  storeToRefs(activityStore);
const { showError } = useErrorToast();
const { imageSource, handleImageError, resetImageError } = useMerchantImage({
  thumbnailUrl: () => activity.value.thumbnailUrl,
  category: 'ACTIVITY',
  merchantId: () => activity.value.merchantId,
  activityType: () => activity.value.activityType,
});
const isDescriptionOpen = ref(false);

const formattedDescription = computed(() =>
  String(activity.value.description ?? '')
    .replace(/\s*(?=\[[^\]]+\])/g, '\n')
    .trim(),
);

const fetchActivity = async () => {
  resetImageError();
  await activityStore.fetchActivity(Number(route.params.merchantId));
};

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

const toggleBookmark = async () => {
  try {
    await activityStore.toggleBookmark();
  } catch (bookmarkError) {
    showError(bookmarkError, '북마크 처리 중 오류가 발생했습니다.');
  }
};

const goReviews = () => {
  router.push(`/merchants/${activity.value.merchantId}/reviews`);
};
</script>

<template>
  <main class="bg-canvas min-h-screen pb-8">
    <div class="px-5 pt-4">
      <BaseHeader title="여가 상세" @back="$router.back()" />
    </div>

    <LoadingScreen
      v-if="isLoading"
      title="여가 정보를 불러오고 있어요"
      :fullscreen="false"
    />

    <BaseErrorState v-else-if="error" :title="error" @retry="fetchActivity" />

    <div v-else class="px-4 pt-4">
      <!-- 대표 이미지와 가맹점 정보. 숙소·공유오피스와 같은 규격이다 -->
      <section class="rounded-sheet bg-surface shadow-card overflow-hidden">
        <div class="bg-brand-weak relative h-[190px]">
          <img
            class="h-full w-full object-cover"
            :src="imageSource"
            :alt="`${activity.merchantName} 대표 이미지`"
            @error="handleImageError"
          />

          <button
            type="button"
            class="bg-surface/90 shadow-card absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full transition-transform active:scale-95 disabled:opacity-50"
            :class="activity.bookmarked ? 'text-brand' : 'text-ink-mute'"
            :aria-label="activity.bookmarked ? '북마크 해제' : '북마크 추가'"
            :aria-pressed="activity.bookmarked"
            :disabled="isBookmarkLoading"
            @click="toggleBookmark"
          >
            <Heart
              :size="18"
              :fill="activity.bookmarked ? 'currentColor' : 'none'"
            />
          </button>
        </div>

        <div class="px-[18px] py-4">
          <h2 class="text-heading font-bold -tracking-[0.02em] text-ink">
            {{ activity.merchantName }}
          </h2>

          <p class="text-body-sm mt-1.5 flex items-center gap-1 text-ink-mute">
            <MapPin :size="14" class="shrink-0" />
            <span class="truncate">{{ activity.address }}</span>
          </p>

          <!-- 별점은 가맹점 이름과 한 덩어리로 읽혀야 한다 -->
          <div
            class="border-line mt-3.5 flex items-center justify-between gap-3 border-t pt-3.5"
          >
            <p class="text-body flex items-center gap-1.5 font-bold text-ink">
              <Star :size="15" class="text-warn" fill="currentColor" />
              {{ activity.rating }}
              <span class="text-body-sm font-medium text-ink-mute">
                리뷰 {{ activity.reviewCount }}개
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
        v-if="activity.description"
        class="rounded-card bg-surface shadow-card mt-3 px-[18px] py-4"
      >
        <p
          class="description-copy text-body leading-relaxed text-ink-sub"
          :class="{ 'description-clamp': !isDescriptionOpen }"
        >
          {{ formattedDescription }}
        </p>
        <button
          type="button"
          class="text-body-sm text-brand mt-2 font-bold"
          :aria-expanded="isDescriptionOpen"
          @click="isDescriptionOpen = !isDescriptionOpen"
        >
          {{ isDescriptionOpen ? '상세정보 접기' : '상세정보 더보기' }}
        </button>
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
.description-copy {
  white-space: pre-line;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.description-clamp {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
</style>
