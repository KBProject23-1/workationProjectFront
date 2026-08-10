import { defineStore } from 'pinia';

const bookmarkListResponse = {
  status: 'SUCCESS',
  message: '요청 성공',
  data: {
    content: [
      { bookmarkId: 1, merchantId: 101, category: 'ACCOMMODATION', name: '스테이 호텔 강남', thumbnailUrl: 'https://example.com/merchants/101.jpg', address: '강남역', price: 180000, rating: 4.7, createdAt: '2026-08-10T00:00:00' },
      { bookmarkId: 2, merchantId: 102, category: 'ACCOMMODATION', name: '호텔 더 디자이너스', thumbnailUrl: 'https://example.com/merchants/102.jpg', address: '신논현역', price: 165000, rating: 4.6, createdAt: '2026-08-09T00:00:00' },
      { bookmarkId: 3, merchantId: 103, category: 'ACCOMMODATION', name: 'L7 홍대 바이 롯데', thumbnailUrl: 'https://example.com/merchants/103.jpg', address: '홍대입구역', price: 155000, rating: 4.5, createdAt: '2026-08-08T00:00:00' },
      { bookmarkId: 4, merchantId: 104, category: 'ACCOMMODATION', name: '호텔 나루 서울', thumbnailUrl: 'https://example.com/merchants/104.jpg', address: '마포역', price: 142000, rating: 4.4, createdAt: '2026-08-07T00:00:00' },
      { bookmarkId: 5, merchantId: 105, category: 'ACCOMMODATION', name: '글래드 여의도', thumbnailUrl: 'https://example.com/merchants/105.jpg', address: '여의도역', price: 135000, rating: 4.3, createdAt: '2026-08-06T00:00:00' },
      { bookmarkId: 6, merchantId: 201, category: 'OFFICE', name: '패스트파이브 강남점', thumbnailUrl: 'https://example.com/merchants/201.jpg', address: '강남역', price: 35000, rating: 4.8, createdAt: '2026-08-05T00:00:00' },
      { bookmarkId: 7, merchantId: 301, category: 'RESTAURANT', name: '오복수산 여의도점', thumbnailUrl: 'https://example.com/merchants/301.jpg', address: '여의도역', price: 28000, rating: 4.6, createdAt: '2026-08-04T00:00:00' },
      { bookmarkId: 8, merchantId: 401, category: 'ACTIVITY', name: '서울숲 도예 공방', thumbnailUrl: 'https://example.com/merchants/401.jpg', address: '서울숲역', price: 45000, rating: 4.7, createdAt: '2026-08-03T00:00:00' },
    ],
    nextCursor: null,
    size: 20,
    hasNext: false,
  },
};

export const useBookmarkStore = defineStore('bookmark', {
  state: () => ({
    bookmarks: [],
    selectedCategory: '',
    isLoading: false,
    error: null,
  }),

  getters: {
    filteredBookmarks: (state) => state.selectedCategory
      ? state.bookmarks.filter((bookmark) => bookmark.category === state.selectedCategory)
      : state.bookmarks,
  },

  actions: {
    // 실제 연동 시 GET /api/v1/bookmarks 응답으로 교체합니다.
    fetchBookmarks() {
      this.isLoading = true;
      this.error = null;
      this.bookmarks = this.selectedCategory
        ? bookmarkListResponse.data.content.filter((bookmark) => bookmark.category === this.selectedCategory)
        : bookmarkListResponse.data.content;
      this.isLoading = false;
    },

    selectCategory(category) {
      this.selectedCategory = category;
      this.fetchBookmarks();
    },

    // 실제 연동 시 DELETE /api/v1/bookmarks/{bookmarkId} 호출로 교체합니다.
    removeBookmark(bookmarkId) {
      this.bookmarks = this.bookmarks.filter((bookmark) => bookmark.bookmarkId !== bookmarkId);
    },
  },
});
