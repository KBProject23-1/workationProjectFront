import { acceptHMRUpdate, defineStore } from 'pinia';
import { getAccommodationDetail } from '@/api/merchants';
import { createBookmark, deleteBookmark, getBookmarks } from '@/api/bookmark';

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
  bookmarkId: null,
  products: [],
};

export const useAccommodationStore = defineStore('accommodation', {
  state: () => ({
    accommodation: { ...emptyAccommodation, products: [] },
    checkIn: formatDate(today),
    checkOut: formatDate(tomorrow),
    roomCount: 1,
    guestCount: 1,
    selectedProductId: null,
    isLoading: false,
    isBookmarkLoading: false,
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
        let bookmarkId = null;
        if (data?.bookmarked) {
          try {
            const { data: bookmarks } = await getBookmarks({
              category: 'ACCOMMODATION',
              size: '100',
            });
            bookmarkId = (bookmarks.content ?? []).find(
              (bookmark) => bookmark.merchantId === merchantId,
            )?.bookmarkId;
          } catch {
            bookmarkId = null;
          }
        }
        this.accommodation = {
          ...data,
          bookmarked: data?.bookmarked ?? false,
          bookmarkId,
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
    async toggleBookmark() {
      if (this.isBookmarkLoading) return;
      this.isBookmarkLoading = true;
      try {
        if (this.accommodation.bookmarked) {
          if (!this.accommodation.bookmarkId) {
            const { data: bookmarks } = await getBookmarks({
              category: 'ACCOMMODATION',
              size: '100',
            });
            this.accommodation.bookmarkId = (bookmarks.content ?? []).find(
              (bookmark) => bookmark.merchantId === this.accommodation.merchantId,
            )?.bookmarkId;
          }
          if (!this.accommodation.bookmarkId) return;
          await deleteBookmark(this.accommodation.bookmarkId);
          this.accommodation.bookmarked = false;
          this.accommodation.bookmarkId = null;
          return;
        }

        const { data } = await createBookmark(this.accommodation.merchantId);
        this.accommodation.bookmarked = true;
        this.accommodation.bookmarkId = data.bookmarkId;
      } finally {
        this.isBookmarkLoading = false;
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAccommodationStore, import.meta.hot));
}
