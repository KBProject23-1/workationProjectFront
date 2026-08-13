import { defineStore } from 'pinia';
import { getRestaurantDetail } from '@/api/merchants';
import { createBookmark, deleteBookmark, getBookmarks } from '@/api/bookmark';

const emptyRestaurant = {
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

export const useRestaurantStore = defineStore('restaurant', {
  state: () => ({
    restaurant: { ...emptyRestaurant, reviews: [] },
    isLoading: false,
    isBookmarkLoading: false,
    error: null,
  }),
  actions: {
    async fetchRestaurant(merchantId) {
      this.isLoading = true;
      this.error = null;

      try {
        const { data } = await getRestaurantDetail(merchantId);
        let bookmarkId = null;
        if (data?.bookmarked) {
          try {
            const { data: bookmarks } = await getBookmarks({
              category: 'RESTAURANT',
              size: '50',
            });
            bookmarkId = (bookmarks.content ?? []).find(
              (bookmark) => bookmark.merchantId === merchantId,
            )?.bookmarkId;
          } catch {
            bookmarkId = null;
          }
        }
        this.restaurant = {
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
        if (this.restaurant.bookmarked) {
          if (!this.restaurant.bookmarkId) {
            const { data: bookmarks } = await getBookmarks({
              category: 'RESTAURANT',
              size: '50',
            });
            this.restaurant.bookmarkId = (bookmarks.content ?? []).find(
              (bookmark) => bookmark.merchantId === this.restaurant.merchantId,
            )?.bookmarkId;
          }
          if (!this.restaurant.bookmarkId) return;
          await deleteBookmark(this.restaurant.bookmarkId);
          this.restaurant.bookmarked = false;
          this.restaurant.bookmarkId = null;
          return;
        }

        const { data } = await createBookmark(this.restaurant.merchantId);
        this.restaurant.bookmarked = true;
        this.restaurant.bookmarkId = data.bookmarkId;
      } finally {
        this.isBookmarkLoading = false;
      }
    },
  },
});
