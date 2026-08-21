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
  { label: '공유 오피스', value: 'OFFICE' },
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
  <main class="bookmark-page">
    <div class="px-5 pt-4 mb-4">
      <BaseHeader
        title="내 장소"
        @back="router.back()"
      />
    </div>

    <nav class="category-tabs" aria-label="장소 유형">
      <button
        v-for="category in categories"
        :key="category.value"
        type="button"
        :class="{ active: bookmarkStore.selectedCategory === category.value }"
        @click="bookmarkStore.selectCategory(category.value)"
      >
        {{ category.label }}
      </button>
    </nav>

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

    <section v-else class="bookmark-list" aria-live="polite">
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
        class="load-more-status"
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

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/woff2/SUIT-Variable.css');
.bookmark-page { min-height:min(871px,100vh); padding-bottom:24px; color:#172033; background:#fff; font-family:'SUIT Variable','SUIT',sans-serif; }
button { font:inherit; }
.category-tabs { width:100%; height:50px; display:grid; grid-template-columns:.72fr .85fr 1.4fr .72fr .72fr; align-items:center; gap:5px; padding:0 25px; }
.category-tabs button { min-width:0; height:36px; padding:0 4px; overflow:hidden; color:#667085; border:1.5px solid #e1e8f0; border-radius:999px; background:#fff; font-size:12px; font-weight:700; text-overflow:ellipsis; white-space:nowrap; cursor:pointer; }.category-tabs button.active { color:#fff; border-color:#3087ed; background:#3087ed; }
.bookmark-list { display:flex; flex-direction:column; gap:8px; padding:10px 25px; }
.load-more-status { min-height:40px; padding:10px 0; color:#8493a7; text-align:center; font-size:12px; }
@media (max-width:370px) { .category-tabs,.bookmark-list { padding-left:16px; padding-right:16px; }.category-tabs { gap:4px; }.category-tabs button { font-size:11px; } }
</style>
