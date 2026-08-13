import { defineStore } from 'pinia';
import { getAccommodationDetail } from '@/api/merchants';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

const emptyAccommodation = {
  merchantId: null,
  name: '',
  address: '',
  phoneNumber: '',
  description: '',
  checkInTime: null,
  checkOutTime: null,
  rating: 0,
  reviewCount: 0,
  thumbnailUrl: null,
  bookmarked: false,
  products: [],
};

export const useAccommodationStore = defineStore('accommodation', {
  state: () => ({
    accommodation: { ...emptyAccommodation, products: [] },
    checkIn: formatDate(today),
    checkOut: formatDate(tomorrow),
    roomCount: 1,
    guestCount: 2,
    selectedProductId: null,
    isLoading: false,
    error: null,
  }),
  getters: {
    selectedProduct: (state) => state.accommodation.products.find(
      (product) => product.productId === state.selectedProductId,
    ) ?? null,
    nightCount: (state) => Math.max(
      1,
      Math.round((new Date(state.checkOut) - new Date(state.checkIn)) / 86400000),
    ),
    totalPrice() {
      return (this.selectedProduct?.price ?? 0) * this.nightCount * this.roomCount;
    },
  },
  actions: {
    async fetchAccommodation(merchantId) {
      this.isLoading = true;
      this.error = null;

      try {
        const { data } = await getAccommodationDetail(merchantId, {
          startDate: this.checkIn,
          endDate: this.checkOut,
          roomCount: this.roomCount,
          guestCount: this.guestCount,
        });
        this.accommodation = {
          ...data,
          products: data?.products ?? [],
        };

        const selectedProductExists = this.accommodation.products.some(
          (product) => product.productId === this.selectedProductId,
        );
        if (!selectedProductExists) {
          this.selectedProductId = this.accommodation.products[0]?.productId ?? null;
        }
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },
    setDate(mode, value) {
      if (mode === 'checkIn') {
        this.checkIn = value;
        if (this.checkOut < value) this.checkOut = value;
        return;
      }
      if (value >= this.checkIn) this.checkOut = value;
    },
    selectProduct(productId) {
      this.selectedProductId = productId;
    },
  },
});
