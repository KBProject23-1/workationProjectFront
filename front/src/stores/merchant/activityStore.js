import { defineStore } from 'pinia';
import { getActivityDetail } from '@/api/merchants';
import { createBookmark, deleteBookmark, getBookmarks } from '@/api/bookmark';

const emptyActivity = {
  merchantId: null,
  merchantName: '',
  description: '',
  thumbnailUrl: null,
  address: '',
  price: 0,
  rating: 0,
  reviewCount: 0,
  bookmarked: false,
  bookmarkId: null,
  reviews: [],
};

export const useActivityStore = defineStore('activity', {
  state: () => ({
    activity: { ...emptyActivity, reviews: [] },
    isLoading: false,
    isBookmarkLoading: false,
    error: null,
  }),
  actions: {
    async fetchActivity(merchantId) {
      this.isLoading = true;
      this.error = null;

      try {
        const { data } = await getActivityDetail(merchantId);
        let bookmarkId = null;
        if (data?.bookmarked) {
          try {
            const { data: bookmarks } = await getBookmarks({
              category: 'ACTIVITY',
              size: '50',
            });
            bookmarkId = (bookmarks.content ?? []).find(
              (bookmark) => bookmark.merchantId === merchantId,
            )?.bookmarkId;
          } catch {
            bookmarkId = null;
          }
        }
        this.activity = {
          ...data,
          price: data?.price ?? 0,
          rating: data?.rating ?? 0,
          reviewCount: data?.reviewCount ?? 0,
          bookmarked: data?.bookmarked ?? false,
          bookmarkId,
          reviews: data?.reviews ?? [],
        };
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },
    async toggleBookmark() {
      if (this.isBookmarkLoading) return;
      this.isBookmarkLoading = true;
      try {
        if (this.activity.bookmarked) {
          if (!this.activity.bookmarkId) {
            const { data: bookmarks } = await getBookmarks({
              category: 'ACTIVITY',
              size: '50',
            });
            this.activity.bookmarkId = (bookmarks.content ?? []).find(
              (bookmark) => bookmark.merchantId === this.activity.merchantId,
            )?.bookmarkId;
          }
          if (!this.activity.bookmarkId) return;
          await deleteBookmark(this.activity.bookmarkId);
          this.activity.bookmarked = false;
          this.activity.bookmarkId = null;
          return;
        }

        const { data } = await createBookmark(this.activity.merchantId);
        this.activity.bookmarked = true;
        this.activity.bookmarkId = data.bookmarkId;
      } finally {
        this.isBookmarkLoading = false;
      }
    },
  },
});
