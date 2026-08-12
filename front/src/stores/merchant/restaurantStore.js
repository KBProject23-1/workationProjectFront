import { defineStore } from 'pinia';
import { getRestaurantDetail } from '@/api/merchants';

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
  reviews: [],
};

export const useRestaurantStore = defineStore('restaurant', {
  state: () => ({
    restaurant: { ...emptyRestaurant, reviews: [] },
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchRestaurant(merchantId) {
      this.isLoading = true;
      this.error = null;

      try {
        const { data } = await getRestaurantDetail(merchantId);
        this.restaurant = {
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
      this.restaurant.bookmarked = !this.restaurant.bookmarked;
    },
  },
});
