import { defineStore } from 'pinia';
import { getOfficeDetail } from '@/api/merchants';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

const emptyOffice = {
  merchantId: null,
  name: '',
  address: '',
  phoneNumber: '',
  description: '',
  rating: 0,
  reviewCount: 0,
  thumbnailUrl: null,
  bookmarked: false,
  products: [],
};

export const useOfficeStore = defineStore('office', {
  state: () => ({
    office: { ...emptyOffice, products: [] },
    startDate: formatDate(today),
    endDate: formatDate(tomorrow),
    spaceCount: 1,
    guestCount: 2,
    selectedProductName: '',
    isLoading: false,
    error: null,
  }),
  getters: {
    selectedProduct: (state) => state.office?.products?.find(
      (product) => product.productName === state.selectedProductName,
    ) ?? null,
    usageDayCount: (state) => Math.floor(
      (new Date(state.endDate) - new Date(state.startDate)) / 86400000,
    ) + 1,
    totalPrice() {
      const multiplier = this.selectedProduct?.productDetailType === 'OFFICE_SEAT'
        ? this.guestCount
        : this.spaceCount;
      return (this.selectedProduct?.price ?? 0) * this.usageDayCount * multiplier;
    },
  },
  actions: {
    async fetchOffice(merchantId) {
      this.isLoading = true;
      this.error = null;

      try {
        const { data } = await getOfficeDetail(merchantId, {
          startDate: this.startDate,
          endDate: this.endDate,
          guestCount: this.guestCount,
        });
        this.office = {
          ...data,
          products: data?.products ?? [],
        };

        const selectedProductExists = this.office.products.some(
          (product) => product.productName === this.selectedProductName,
        );
        if (!selectedProductExists) {
          this.selectedProductName = this.office.products[0]?.productName ?? '';
        }
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },
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
      if (this.selectedProduct?.productDetailType === 'OFFICE_SEAT') {
        this.spaceCount = 1;
      }
    },
  },
});
