import { acceptHMRUpdate, defineStore } from 'pinia';
import { getOfficeDetail } from '@/api/merchants';
import { createBookmark, deleteBookmark, getBookmarks } from '@/api/bookmark';
import { daysBetween } from '@/components/workation/format';

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
  bookmarkId: null,
  products: [],
};

export const useOfficeStore = defineStore('office', {
  state: () => ({
    office: { ...emptyOffice, products: [] },
    startDate: formatDate(today),
    endDate: formatDate(tomorrow),
    spaceCount: 1,
    guestCount: 1,
    selectedProductId: null,
    isLoading: false,
    isBookmarkLoading: false,
    error: null,
  }),
  getters: {
    selectedProduct: (state) => state.office?.products?.find(
      (product) => product.productId === state.selectedProductId,
    ) ?? null,
    usageDayCount: (state) => daysBetween(state.startDate, state.endDate),
    totalPrice() {
      const multiplier = this.selectedProduct?.productDetailType === 'OFFICE_SEAT'
        ? this.guestCount
        : this.spaceCount;
      return (this.selectedProduct?.price ?? 0) * this.usageDayCount * multiplier;
    },
  },
  actions: {
    async fetchOffice(merchantId, { showLoading = true } = {}) {
      if (showLoading) this.isLoading = true;
      this.error = null;

      try {
        const { data } = await getOfficeDetail(merchantId, {
          startDate: this.startDate,
          endDate: this.endDate,
          guestCount: this.guestCount,
        });
        let bookmarkId = null;
        if (data?.bookmarked) {
          try {
            const { data: bookmarks } = await getBookmarks({
              category: 'OFFICE',
              size: '100',
            });
            bookmarkId = (bookmarks.content ?? []).find(
              (bookmark) => bookmark.merchantId === merchantId,
            )?.bookmarkId;
          } catch {
            bookmarkId = null;
          }
        }
        this.office = {
          ...data,
          bookmarked: data?.bookmarked ?? false,
          bookmarkId,
          products: data?.products ?? [],
        };

        const selectedProductExists = this.office.products.some(
          (product) => product.productId === this.selectedProductId,
        );
        if (!selectedProductExists) {
          this.selectedProductId = this.office.products[0]?.productId ?? null;
        }
      } catch (error) {
        this.error = error.message;
      } finally {
        if (showLoading) this.isLoading = false;
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
    selectProduct(productId) {
      this.selectedProductId = productId;
      if (this.selectedProduct?.productDetailType === 'OFFICE_SEAT') {
        this.spaceCount = 1;
      }
    },
    async toggleBookmark() {
      if (this.isBookmarkLoading) return;
      this.isBookmarkLoading = true;
      try {
        if (this.office.bookmarked) {
          if (!this.office.bookmarkId) {
            const { data: bookmarks } = await getBookmarks({
              category: 'OFFICE',
              size: '100',
            });
            this.office.bookmarkId = (bookmarks.content ?? []).find(
              (bookmark) => bookmark.merchantId === this.office.merchantId,
            )?.bookmarkId;
          }
          if (!this.office.bookmarkId) return;
          await deleteBookmark(this.office.bookmarkId);
          this.office.bookmarked = false;
          this.office.bookmarkId = null;
          return;
        }

        const { data } = await createBookmark(this.office.merchantId);
        this.office.bookmarked = true;
        this.office.bookmarkId = data.bookmarkId;
      } finally {
        this.isBookmarkLoading = false;
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOfficeStore, import.meta.hot));
}
