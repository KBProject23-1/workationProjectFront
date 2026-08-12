import { defineStore } from 'pinia';
import { getActivityDetail } from '@/api/merchants';

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
  reviews: [],
};

export const useActivityStore = defineStore('activity', {
  state: () => ({
    activity: { ...emptyActivity, reviews: [] },
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchActivity(merchantId) {
      this.isLoading = true;
      this.error = null;

      try {
        const { data } = await getActivityDetail(merchantId);
        this.activity = {
          ...data,
          price: data?.price ?? 0,
          rating: data?.rating ?? 0,
          reviewCount: data?.reviewCount ?? 0,
          bookmarked: data?.bookmarked ?? false,
          reviews: data?.reviews ?? [],
        };
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },
    toggleBookmark() {
      this.activity.bookmarked = !this.activity.bookmarked;
    },
  },
});
