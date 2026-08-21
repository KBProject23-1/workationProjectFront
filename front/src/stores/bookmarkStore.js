import { defineStore } from 'pinia';
import { getBookmarks, deleteBookmark } from '@/api/bookmark';

const PAGE_SIZE = 20;

const resolveBookmarkImageUrl = (imageUrl) => {
  if (!imageUrl || /^https?:\/\//.test(imageUrl)) return imageUrl;
  return `${import.meta.env.VITE_API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};

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
    isLoadingMore: false,
    hasNext: false,
    nextCursor: null,
    error: null,
  }),

  getters: {
    filteredBookmarks: (state) => state.selectedCategory
      ? state.bookmarks.filter((bookmark) => bookmark.category === state.selectedCategory)
      : state.bookmarks,
  },

  actions: {
    async fetchBookmarks({ append = false } = {}) {
      if (append) {
        if (this.isLoading || this.isLoadingMore || !this.hasNext || !this.nextCursor) return;
        this.isLoadingMore = true;
      } else {
        this.isLoading = true;
        this.bookmarks = [];
        this.hasNext = false;
        this.nextCursor = null;
      }
      this.error = null;

      try {
        const params = {
          size: String(PAGE_SIZE),
          ...(this.selectedCategory ? { category: this.selectedCategory } : {}),
          ...(append ? { cursor: this.nextCursor } : {}),
        };
        const { data } = await getBookmarks(params);
        const bookmarks = getBookmarkListFromPayload(data).map((bookmark) => ({
          ...bookmark,
          thumbnailUrl: resolveBookmarkImageUrl(bookmark.thumbnailUrl),
          rating: bookmark.rating ?? 0,
          reviewCount: bookmark.reviewCount ?? 0,
          bookmarked: true,
          bookmarkLoading: false,
        }));
        this.bookmarks = append ? [...this.bookmarks, ...bookmarks] : bookmarks;
        this.hasNext = Boolean(data?.hasNext);
        this.nextCursor = data?.nextCursor ?? null;
      } catch (error) {
        this.error = error?.message ?? '북마크 목록을 가져오지 못했습니다.';
      } finally {
        this.isLoading = false;
        this.isLoadingMore = false;
      }
    },

    loadMoreBookmarks() {
      return this.fetchBookmarks({ append: true });
    },

    selectCategory(category) {
      this.selectedCategory = category;
      this.fetchBookmarks();
    },

    async removeBookmark(bookmarkId) {
      this.error = null;
      const bookmark = this.bookmarks.find((item) => item.bookmarkId === bookmarkId);
      if (!bookmark || bookmark.bookmarkLoading) return;
      bookmark.bookmarkLoading = true;
      try {
        await deleteBookmark(bookmarkId);
        this.bookmarks = this.bookmarks.filter(
          (bookmark) => bookmark.bookmarkId !== bookmarkId,
        );
      } catch (error) {
        bookmark.bookmarkLoading = false;
        this.error = error?.message ?? '북마크 삭제에 실패했습니다.';
      }
    },
  },
});
