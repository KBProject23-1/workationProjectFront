import { defineStore } from 'pinia';

const accommodationResponse = {
  status: 'SUCCESS',
  message: '요청 성공',
  data: {
    merchantId: 101,
    name: '제주 스테이',
    address: '제주특별자치도 제주시 중앙로 10',
    phoneNumber: '064-000-0000',
    description: '업무와 휴식에 적합한 숙소입니다.',
    checkInTime: '15:00:00',
    checkOutTime: '11:00:00',
    rating: 4.7,
    reviewCount: 128,
    bookmarked: false,
    thumbnailUrl: 'https://example.com/merchants/101.jpg',
    products: [
      { productName: '스탠다드 A', description: '퀸사이즈 침대 2개 · 금연 객실 · 오션뷰', productDetailType: 'ROOM', maxHeadcount: 4, thumbnailURL: 'https://example.com/merchants/101-standard-a.jpg', price: 120000 },
      { productName: '디럭스 오션', description: '킹사이즈 침대 1개 · 금연 객실 · 오션뷰', productDetailType: 'ROOM', maxHeadcount: 2, thumbnailURL: 'https://example.com/merchants/101-deluxe-ocean.jpg', price: 165000 },
    ],
  },
};

export const useAccommodationStore = defineStore('accommodation', {
  state: () => ({
    accommodation: accommodationResponse.data,
    checkIn: '2026-08-10',
    checkOut: '2026-08-12',
    roomCount: 1,
    guestCount: 2,
    selectedProductName: accommodationResponse.data.products[0].productName,
  }),
  getters: {
    selectedProduct: (state) => state.accommodation.products.find((product) => product.productName === state.selectedProductName),
    nightCount: (state) => Math.max(1, Math.round((new Date(state.checkOut) - new Date(state.checkIn)) / 86400000)),
    totalPrice() {
      return (this.selectedProduct?.price ?? 0) * this.nightCount * this.roomCount;
    },
  },
  actions: {
    setDate(mode, value) {
      if (mode === 'checkIn') this.checkIn = value;
      else this.checkOut = value;
    },
    selectProduct(productName) {
      this.selectedProductName = productName;
    },
  },
});
