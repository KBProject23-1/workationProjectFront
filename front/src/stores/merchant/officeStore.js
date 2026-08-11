import { defineStore } from 'pinia';

const officeResponse = {
  success: true,
  data: {
    merchantId: 201,
    name: '제주 워크라운지',
    address: '제주특별자치도 제주시 중앙로 10',
    phoneNumber: '064-000-0000',
    description: '업무와 휴식에 적합한 공유오피스입니다.',
    rating: 4.7,
    reviewCount: 128,
    bookmarked: false,
    thumbnailUrl: 'https://example.com/merchants/201.jpg',
    products: [
      { productName: '오픈좌석', description: '오픈좌석, Wi-Fi 이용가능', productDetailType: 'OFFICE_SEAT', maxHeadcount: 1, thumbnailURL: 'https://example.com/merchants/201-open-seat.jpg', price: 120000 },
      { productName: '미팅룸', description: '독립 회의실, 모니터 이용가능', productDetailType: 'MEETING_ROOM', maxHeadcount: 4, thumbnailURL: 'https://example.com/merchants/201-meeting-room.jpg', price: 180000 },
    ],
  },
};

export const useOfficeStore = defineStore('office', {
  state: () => ({
    office: officeResponse.data,
    startDate: '2026-08-10',
    endDate: '2026-08-12',
    spaceCount: 1,
    guestCount: 2,
    selectedProductName: officeResponse.data.products[0].productName,
  }),
  getters: {
    selectedProduct: (state) => state.office.products.find((product) => product.productName === state.selectedProductName),
    usageDayCount: (state) => Math.floor((new Date(state.endDate) - new Date(state.startDate)) / 86400000) + 1,
    totalPrice() {
      const multiplier = this.selectedProduct?.productDetailType === 'OFFICE_SEAT'
        ? this.guestCount
        : this.spaceCount;
      return (this.selectedProduct?.price ?? 0) * this.usageDayCount * multiplier;
    },
  },
  actions: {
    setDate(mode, value) {
      if (mode === 'checkIn') {
        this.startDate = value;
        if (this.endDate < value) this.endDate = value;
        return;
      }
      if (value >= this.startDate) this.endDate = value;
    },
    selectProduct(productName) {
      this.selectedProductName = productName;
      if (this.selectedProduct.productDetailType === 'OFFICE_SEAT') {
        this.spaceCount = 1;
      }
    },
  },
});
