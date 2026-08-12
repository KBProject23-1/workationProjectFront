import { defineStore } from 'pinia';
import { getBookmarks, deleteBookmark } from '@/api/bookmark';

const getBookmarkListFromPayload = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload.content)) return payload.content;
  if (Array.isArray(payload.bookmarks)) return payload.bookmarks;

  return [];
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
    async fetchBookmarks() {
      this.isLoading = true;
      this.error = null;

      try {
        const params = this.selectedCategory ? { category: this.selectedCategory } : undefined;
        const { data } = await getBookmarks(params);
        this.bookmarks = getBookmarkListFromPayload(data);
      } catch (error) {
        this.error = error?.message ?? '북마크 목록을 가져오지 못했습니다.';
      } finally {
        this.isLoading = false;
      }
    },

    selectCategory(category) {
      this.selectedCategory = category;
      this.fetchBookmarks();
    },

    async removeBookmark(bookmarkId) {
      this.error = null;
      try {
        await deleteBookmark(bookmarkId);
        this.bookmarks = this.bookmarks.filter(
          (bookmark) => bookmark.bookmarkId !== bookmarkId,
        );
      } catch (error) {
        this.error = error?.message ?? '북마크 삭제에 실패했습니다.';
      }
    },
  },
});
