<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BookmarkPlaceCard from '@/components/bookmark/BookmarkPlaceCard.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import BaseEmptyState from '@/components/common/BaseEmptyState.vue';
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

function showDetails(bookmark) {
  router.push({ name: routeNames[bookmark.category], params: { merchantId: bookmark.merchantId } });
}

onMounted(() => bookmarkStore.fetchBookmarks());
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

    <section class="bookmark-list" aria-live="polite">
      <BookmarkPlaceCard
        v-for="bookmark in bookmarkStore.filteredBookmarks"
        :key="bookmark.bookmarkId"
        :bookmark="bookmark"
        @remove="bookmarkStore.removeBookmark"
        @details="showDetails"
      />
      <BaseEmptyState
        v-if="!bookmarkStore.isLoading && bookmarkStore.filteredBookmarks.length === 0"
        title="저장한 장소가 없습니다."
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
@media (max-width:370px) { .category-tabs,.bookmark-list { padding-left:16px; padding-right:16px; }.category-tabs { gap:4px; }.category-tabs button { font-size:11px; } }
</style>
