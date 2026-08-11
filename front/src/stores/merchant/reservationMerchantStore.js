import { defineStore } from 'pinia';

const initialResponse = {
  status: 'SUCCESS',
  message: '요청 성공',
  data: {
    content: [
      { category: 'ACCOMMODATION', merchantId: 101, name: '제주 스테이', address: '제주특별자치도 제주시 중앙로 10', price: 120000, rating: 4.7, reviewCount: 128, thumbnailUrl: 'https://example.com/merchants/101.jpg', bookmarked: false },
      { category: 'OFFICE', merchantId: 102, name: '제주 워크 라운지', address: '제주특별자치도 제주시 연동 24', price: 45000, rating: 4.9, reviewCount: 94, thumbnailUrl: 'https://example.com/merchants/102.jpg', bookmarked: true },
      { category: 'ACCOMMODATION', merchantId: 103, name: '오션뷰 호텔 강릉', address: '강원특별자치도 강릉시 창해로 123', price: 89000, rating: 4.6, reviewCount: 100, thumbnailUrl: 'https://example.com/merchants/103.jpg', bookmarked: false },
    ],
    size: 20,
    hasNext: true,
    nextCursor: 'eyJyYXRpbmciOjQuNSwibWVyY2hhbnRJZCI6MTIwfQ',
  },
};

const nextResponse = {
  status: 'SUCCESS',
  message: '요청 성공',
  data: {
    content: [
      { category: 'OFFICE', merchantId: 201, name: '파도 공유오피스', address: '부산광역시 해운대구 해운대로 52', price: 38000, rating: 4.5, reviewCount: 76, thumbnailUrl: 'https://example.com/merchants/201.jpg', bookmarked: false },
      { category: 'ACCOMMODATION', merchantId: 202, name: '경포 스테이', address: '강원특별자치도 강릉시 경포로 201', price: 135000, rating: 4.4, reviewCount: 72, thumbnailUrl: 'https://example.com/merchants/202.jpg', bookmarked: false },
    ],
    size: 20,
    hasNext: false,
    nextCursor: null,
  },
};

export const useReservationMerchantStore = defineStore('reservationMerchant', {
  state: () => ({
    merchants: [...initialResponse.data.content],
    checkIn: '2026-06-01',
    checkOut: '2026-06-05',
    guestCount: 2,
    category: '',
    sort: 'RATING_DESC',
    minPrice: '',
    maxPrice: '',
    size: initialResponse.data.size,
    hasNext: initialResponse.data.hasNext,
    nextCursor: initialResponse.data.nextCursor,
  }),

  getters: {
    filteredResults(state) {
      let results = state.category
        ? state.merchants.filter((merchant) => merchant.category === state.category)
        : [...state.merchants];
      const minimum = Number(state.minPrice) || 0;
      const maximum = Number(state.maxPrice) || Infinity;
      results = results.filter((merchant) => merchant.price >= minimum && merchant.price <= maximum);
      return results.sort((a, b) => state.sort === 'RATING_DESC' ? b.rating - a.rating : a.price - b.price);
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
    loadNextPage() {
      if (!this.hasNext || !this.nextCursor) return;
      this.merchants.push(...nextResponse.data.content);
      this.size = nextResponse.data.size;
      this.hasNext = nextResponse.data.hasNext;
      this.nextCursor = nextResponse.data.nextCursor;
    },
    toggleBookmark(merchantId) {
      const merchant = this.merchants.find((item) => item.merchantId === merchantId);
      if (merchant) merchant.bookmarked = !merchant.bookmarked;
    },
  },
});
