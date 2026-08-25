<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import MyReviewListItem from '@/components/review/MyReviewListItem.vue';
import { useReviewStore } from '@/stores/reviewStore';
import BaseHeader from '@/components/common/BaseHeader.vue';
import BaseEmptyState from '@/components/common/BaseEmptyState.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import BaseErrorState from '@/components/common/BaseErrorState.vue';

const categories = [
  { value: 'ALL', label: '전체' },
  { value: 'ACCOMMODATION', label: '숙소' },
  { value: 'OFFICE', label: '공유오피스' },
  { value: 'RESTAURANT', label: '음식점' },
  { value: 'ACTIVITY', label: '여가' },
];

const router = useRouter();
const reviewStore = useReviewStore();
const {
  myReviews,
  myReviewCategory,
  myReviewHasNext,
  isMyReviewsLoading,
  isMyReviewsLoadingMore,
  myReviewsError,
} = storeToRefs(reviewStore);

const loadMoreTrigger = ref(null);
let loadMoreObserver;

onMounted(async () => {
  await reviewStore.fetchMyReviews();
  await nextTick();
  observeLoadMoreTrigger(loadMoreTrigger.value);
});

onBeforeUnmount(() => loadMoreObserver?.disconnect());

watch(loadMoreTrigger, (element) => observeLoadMoreTrigger(element));

function observeLoadMoreTrigger(element) {
  loadMoreObserver?.disconnect();
  if (!element) return;

  loadMoreObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) reviewStore.loadMoreMyReviews();
    },
    { rootMargin: '160px 0px' },
  );
  loadMoreObserver.observe(element);
}

function selectCategory(category) {
  reviewStore.fetchMyReviews(category);
}

function moveToReviewDetail(reviewId) {
  router.push(`/reviews/${reviewId}`);
}

</script>

<template>
  <main class="min-h-screen w-full bg-surface pb-6 text-ink">
    <div class="px-5 pt-4 mb-4">
      <BaseHeader
        title="내 리뷰"
        @back="router.back()"
      />
    </div>

    <section class="px-4">
      <nav
        class="grid grid-cols-[.72fr_.85fr_1.4fr_.72fr_.72fr] gap-1.5"
        aria-label="리뷰 카테고리"
      >
        <button
          v-for="category in categories"
          :key="category.value"
          type="button"
          class="min-w-0 truncate whitespace-nowrap rounded-chip border px-1 py-1.5 text-body-sm font-bold"
          :class="
            myReviewCategory === category.value
              ? 'border-brand bg-brand text-white'
              : 'border-line bg-surface text-ink-sub'
          "
          :aria-pressed="myReviewCategory === category.value"
          @click="selectCategory(category.value)"
        >
          {{ category.label }}
        </button>
      </nav>
    </section>

    <LoadingScreen
      v-if="isMyReviewsLoading"
      title="리뷰를 불러오고 있어요"
      :fullscreen="false"
    />
    <BaseErrorState
      v-else-if="myReviewsError && myReviews.length === 0"
      :title="myReviewsError"
      @retry="reviewStore.fetchMyReviews(myReviewCategory)"
    />
    <BaseEmptyState
      v-else-if="myReviews.length === 0"
      title="작성한 리뷰가 없습니다."
    />

    <section
      v-else
      class="flex flex-col gap-3 px-4 pt-4"
      aria-label="내 리뷰 목록"
    >
      <MyReviewListItem
        v-for="review in myReviews"
        :key="review.reviewId"
        :review="review"
        @open="moveToReviewDetail"
      />
      <div
        v-if="myReviewHasNext && !myReviewsError"
        ref="loadMoreTrigger"
        class="min-h-10 py-2.5 text-center text-caption text-ink-mute"
        aria-live="polite"
      >
        {{ isMyReviewsLoadingMore ? '리뷰를 더 불러오고 있어요' : '' }}
      </div>
      <BaseErrorState
        v-else-if="myReviewsError"
        :title="myReviewsError"
        @retry="reviewStore.loadMoreMyReviews()"
      />
    </section>
  </main>
</template>
