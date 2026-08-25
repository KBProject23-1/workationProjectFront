<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import ReservationMerchantCard from '@/components/merchant/ReservationMerchantCard.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import BaseEmptyState from '@/components/common/BaseEmptyState.vue';
import BaseErrorState from '@/components/common/BaseErrorState.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import { useBookmarkStore } from '@/stores/bookmarkStore';

const router = useRouter();
const bookmarkStore = useBookmarkStore();
const categories = [
  { label: '전체', value: '' },
  { label: '숙소', value: 'ACCOMMODATION' },
  { label: '공유오피스', value: 'OFFICE' },
  { label: '음식점', value: 'RESTAURANT' },
  { label: '여가', value: 'ACTIVITY' },
];
const routeNames = {
  ACCOMMODATION: 'AccommodationDetail',
  OFFICE: 'OfficeDetail',
  RESTAURANT: 'RestaurantDetail',
  ACTIVITY: 'ActivityDetail',
};
const loadMoreTrigger = ref(null);
let loadMoreObserver;

function showDetails(bookmark) {
  router.push({ name: routeNames[bookmark.category], params: { merchantId: bookmark.merchantId } });
}

onMounted(async () => {
  await bookmarkStore.fetchBookmarks();
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
      if (entry.isIntersecting) bookmarkStore.loadMoreBookmarks();
    },
    { rootMargin: '160px 0px' },
  );
  loadMoreObserver.observe(element);
}
</script>

<template>
  <main class="min-h-screen w-full bg-surface pb-6 text-ink">
    <div class="px-5 pt-4 mb-4">
      <BaseHeader
        title="내 장소"
        @back="router.back()"
      />
    </div>

    <section class="px-4">
      <nav
        class="grid grid-cols-[.72fr_.85fr_1.4fr_.72fr_.72fr] gap-1.5"
        aria-label="장소 유형"
      >
        <button
          v-for="category in categories"
          :key="category.value"
          type="button"
          class="min-w-0 truncate whitespace-nowrap rounded-chip border px-1 py-1.5 text-body-sm font-bold"
          :class="
            bookmarkStore.selectedCategory === category.value
              ? 'border-brand bg-brand text-white'
              : 'border-line bg-surface text-ink-sub'
          "
          @click="bookmarkStore.selectCategory(category.value)"
        >
          {{ category.label }}
        </button>
      </nav>
    </section>

    <LoadingScreen
      v-if="bookmarkStore.isLoading"
      title="북마크를 불러오고 있어요"
      :fullscreen="false"
    />
    <BaseErrorState
      v-else-if="bookmarkStore.error && bookmarkStore.bookmarks.length === 0"
      :title="bookmarkStore.error"
      @retry="bookmarkStore.fetchBookmarks()"
    />

    <section
      v-else
      class="flex flex-col gap-3 px-4 pt-4"
      aria-live="polite"
    >
      <ReservationMerchantCard
        v-for="bookmark in bookmarkStore.filteredBookmarks"
        :key="bookmark.bookmarkId"
        :merchant="bookmark"
        :show-price="false"
        @select="showDetails"
        @toggle-bookmark="bookmarkStore.removeBookmark(bookmark.bookmarkId)"
      />
      <BaseEmptyState
        v-if="!bookmarkStore.isLoading && bookmarkStore.filteredBookmarks.length === 0"
        title="저장한 장소가 없습니다."
      />
      <div
        v-if="bookmarkStore.hasNext && !bookmarkStore.error"
        ref="loadMoreTrigger"
        class="min-h-10 py-2.5 text-center text-caption text-ink-mute"
        aria-live="polite"
      >
        {{ bookmarkStore.isLoadingMore ? '장소를 더 불러오고 있어요' : '' }}
      </div>
      <BaseErrorState
        v-else-if="bookmarkStore.error"
        :title="bookmarkStore.error"
        @retry="bookmarkStore.loadMoreBookmarks()"
      />
    </section>
  </main>
</template>
