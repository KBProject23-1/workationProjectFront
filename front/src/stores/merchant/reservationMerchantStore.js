import { defineStore } from 'pinia';
import { getMerchants } from '@/api/merchants';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

export const useReservationMerchantStore = defineStore('reservationMerchant', {
  state: () => ({
    merchants: [],
    checkIn: formatDate(today),
    checkOut: formatDate(tomorrow),
    guestCount: 2,
    category: '',
    sort: 'RATING_DESC',
    minPrice: '',
    maxPrice: '',
    size: 20,
    hasNext: false,
    nextCursor: null,
    regionId: null,
    isLoading: false,
    isLoadingMore: false,
    error: null,
  }),

  getters: {
    queryParams(state) {
      return {
        category: state.category || undefined,
        startDate: state.checkIn || undefined,
        endDate: state.checkOut || undefined,
        headcount: state.guestCount || undefined,
        minPrice: state.minPrice === '' ? undefined : Number(state.minPrice),
        maxPrice: state.maxPrice === '' ? undefined : Number(state.maxPrice),
        sort: state.sort,
        size: state.size,
        regionId: state.regionId || undefined,
      };
    },
  },

  actions: {
    setDate(mode, value) {
      if (mode === 'checkIn') {
        this.checkIn = value;
        if (this.checkOut < value) this.checkOut = value;
        return;
      }
      if (value >= this.checkIn) this.checkOut = value;
    },
    setPrice(field, value) {
      const sanitizedValue = value.replace(/\D/g, '').slice(0, 9);
      if (field === 'min') this.minPrice = sanitizedValue;
      else this.maxPrice = sanitizedValue;
    },
    applyResponse(data, append = false) {
      const content = data?.content ?? [];
      const pageInfo = data?.pageInfo ?? {};
      this.merchants = append ? [...this.merchants, ...content] : content;
      this.size = pageInfo.size ?? this.size;
      this.hasNext = pageInfo.hasNext ?? false;
      this.nextCursor = pageInfo.nextCursor ?? null;
    },
    async fetchMerchants() {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await getMerchants(this.queryParams);
        this.applyResponse(data);
      } catch (error) {
        this.merchants = [];
        this.hasNext = false;
        this.nextCursor = null;
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },
    async loadNextPage() {
      if (!this.hasNext || !this.nextCursor || this.isLoadingMore) return;
      this.isLoadingMore = true;
      this.error = null;
      try {
        const { data } = await getMerchants({
          ...this.queryParams,
          cursor: this.nextCursor,
        });
        this.applyResponse(data, true);
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLoadingMore = false;
      }
    },
    toggleBookmark(merchantId) {
      const merchant = this.merchants.find((item) => item.merchantId === merchantId);
      if (merchant) merchant.bookmarked = !merchant.bookmarked;
    },
  },
});
