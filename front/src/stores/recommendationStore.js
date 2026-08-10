import { defineStore } from 'pinia';
import {
  RECOMMENDATION_CATEGORIES,
  REFERENCE_PLACES,
} from '@/config/recommendation';
import { createBookmark, deleteBookmark } from '@/api/bookmark';

const CATEGORY_ORDER = RECOMMENDATION_CATEGORIES.map(
  (category) => category.key,
);

export const useRecommendationStore = defineStore('recommendation', {
  state: () => ({
    mode: 'flow',
    selectedCategories: [],
    currentCategory: null,
    sourceRoute: null,
    selectedReferencePlaces: {},
    bookmarkIdsByMerchant: {},
    bookmarkLoadingMerchantIds: [],
  }),

  getters: {
    orderedSelectedCategories: (state) =>
      CATEGORY_ORDER.filter((category) =>
        state.selectedCategories.includes(category),
      ),
    isSelected: (state) => (category) =>
      state.selectedCategories.includes(category),
  },

  actions: {
    startFlow({ mode = 'flow', sourceRoute = null } = {}) {
      this.mode = mode;
      this.sourceRoute = sourceRoute;
      this.selectedCategories = [];
      this.currentCategory = null;
      this.selectedReferencePlaces = {};
    },

    toggleCategory(category) {
      if (!CATEGORY_ORDER.includes(category)) return;

      if (this.mode === 'single') {
        this.selectedCategories = [category];
        return;
      }

      if (this.selectedCategories.includes(category)) {
        this.selectedCategories = this.selectedCategories.filter(
          (selectedCategory) => selectedCategory !== category,
        );
        return;
      }

      this.selectedCategories.push(category);
    },

    beginRecommendation() {
      const [firstCategory] = this.orderedSelectedCategories;
      this.currentCategory = firstCategory ?? null;
      return this.currentCategory;
    },

    moveToNextCategory() {
      if (this.mode === 'single') return null;

      const categories = this.orderedSelectedCategories;
      const currentIndex = categories.indexOf(this.currentCategory);
      const nextCategory = categories[currentIndex + 1] ?? null;
      this.currentCategory = nextCategory;
      return nextCategory;
    },

    setCurrentCategory(category) {
      if (!CATEGORY_ORDER.includes(category)) return;
      this.currentCategory = category;
    },

    getReferencePlace(category, mealType) {
      const selectedPlace = this.selectedReferencePlaces[category];
      if (selectedPlace) return selectedPlace;

      const referenceConfig = REFERENCE_PLACES[category];
      if (category === 'restaurants') {
        return referenceConfig.defaults[mealType];
      }
      return referenceConfig.defaultPlace;
    },

    getReferenceCandidates(category) {
      return REFERENCE_PLACES[category]?.candidates ?? [];
    },

    selectReferencePlace(category, place) {
      this.selectedReferencePlaces[category] = {
        ...place,
        type: 'USER_SELECTED',
        description: '사용자가 직접 변경한 기준 장소',
      };
    },

    resetReferencePlace(category) {
      delete this.selectedReferencePlaces[category];
    },

    async toggleBookmark(merchantId) {
      if (this.bookmarkLoadingMerchantIds.includes(merchantId)) return;

      this.bookmarkLoadingMerchantIds.push(merchantId);
      try {
        const bookmarkId = this.bookmarkIdsByMerchant[merchantId];
        if (bookmarkId) {
          await deleteBookmark(bookmarkId);
          delete this.bookmarkIdsByMerchant[merchantId];
          return false;
        }

        const { data } = await createBookmark(merchantId);
        this.bookmarkIdsByMerchant[merchantId] = data.bookmarkId;
        return true;
      } finally {
        this.bookmarkLoadingMerchantIds =
          this.bookmarkLoadingMerchantIds.filter(
            (loadingMerchantId) => loadingMerchantId !== merchantId,
          );
      }
    },
  },
});
