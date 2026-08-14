import { defineStore } from 'pinia';
import {
  RECOMMENDATION_CATEGORIES,
  REFERENCE_PLACES,
} from '@/config/recommendation';
import { createBookmark, deleteBookmark, getBookmarks } from '@/api/bookmark';
import {
  getRecommendationReferencePlace,
  getRecommendationReferencePlaceCandidates,
  getRecommendations,
} from '@/api/recommendation';

const CATEGORY_ORDER = RECOMMENDATION_CATEGORIES.map(
  (category) => category.key,
);

const emptyCategoryRecord = () =>
  Object.fromEntries(CATEGORY_ORDER.map((category) => [category, []]));

const emptyPageInfoRecord = () =>
  Object.fromEntries(
    CATEGORY_ORDER.map((category) => [
      category,
      { hasNext: false, nextCursor: null },
    ]),
  );

const emptyLoadingRecord = () =>
  Object.fromEntries(CATEGORY_ORDER.map((category) => [category, false]));

function referenceKey(category, mealType) {
  return category === 'restaurants' ? `${category}:${mealType}` : category;
}

function normalizeReference(data) {
  const primaryName = data.merchantName ?? data.primaryMerchantName;
  const secondaryName = data.secondaryMerchantName;
  return {
    merchantId: data.merchantId ?? data.primaryMerchantId,
    name:
      data.referenceType === 'AUTO_MIDPOINT'
        ? [primaryName, secondaryName].filter(Boolean).join(' · ') || '중간 지점'
        : primaryName ?? '지역 기준',
    type: data.referenceType,
    description:
      data.description ??
      (data.referenceType === 'REGION_ONLY'
        ? '기준 장소가 없어 워케이션 지역을 기준으로 추천해요.'
        : '예약 정보를 기준으로 자동 선택된 장소예요.'),
    latitude: data.latitude,
    longitude: data.longitude,
  };
}

function normalizeRecommendationItem(item) {
  return {
    ...item,
    name: item.name ?? item.merchantName,
    bookmarked: Boolean(item.bookmarked),
  };
}

export const useRecommendationStore = defineStore('recommendation', {
  state: () => ({
    mode: 'flow',
    selectedCategories: [],
    currentCategory: null,
    sourceRoute: null,
    selectedReferencePlaces: {},
    bookmarkIdsByMerchant: {},
    bookmarkLoadingMerchantIds: [],
    referencePlaces: {},
    referenceCandidates: emptyCategoryRecord(),
    recommendations: emptyCategoryRecord(),
    pageInfoByCategory: emptyPageInfoRecord(),
    loadingByCategory: emptyLoadingRecord(),
    loadingMoreByCategory: emptyLoadingRecord(),
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
      const key = referenceKey(category, mealType);
      const selectedPlace = this.selectedReferencePlaces[key];
      if (selectedPlace) return selectedPlace;

      if (this.referencePlaces[key]) {
        return this.referencePlaces[key];
      }

      const referenceConfig = REFERENCE_PLACES[category];
      if (category === 'restaurants') {
        return referenceConfig.defaults[mealType];
      }
      return referenceConfig.defaultPlace;
    },

    getReferenceCandidates(category) {
      return this.referenceCandidates[category] ?? [];
    },

    getRecommendationItems(category) {
      return this.recommendations[category] ?? [];
    },

    async fetchReferencePlace(category, mealType) {
      const params = category === 'restaurants' ? { mealType } : {};
      const { data } = await getRecommendationReferencePlace(category, params);
      const key = referenceKey(category, mealType);
      this.referencePlaces[key] = normalizeReference(data);
      return this.referencePlaces[key];
    },

    async fetchReferenceCandidates(category) {
      const { data } = await getRecommendationReferencePlaceCandidates(category);
      this.referenceCandidates[category] = (data.content ?? []).map(
        (candidate) => ({
          ...candidate,
          name: candidate.merchantName,
          description: candidate.reserved
            ? '예약 확정된 장소'
            : '선택 가능한 장소',
        }),
      );
      return this.referenceCandidates[category];
    },

    async fetchBookmarkIds(category) {
      const categoryType = RECOMMENDATION_CATEGORIES.find(
        (item) => item.key === category,
      )?.type;
      if (!categoryType) return;

      const bookmarkIds = {};
      let cursor = null;

      do {
        const { data } = await getBookmarks({
          category: categoryType,
          cursor,
          size: '100',
        });
        (data.content ?? []).forEach((bookmark) => {
          bookmarkIds[bookmark.merchantId] = bookmark.bookmarkId;
        });
        cursor = data.hasNext ? data.nextCursor : null;
      } while (cursor);

      const recommendationMerchantIds = new Set(
        this.recommendations[category].map((item) => item.merchantId),
      );
      const bookmarkIdsByMerchant = Object.fromEntries(
        Object.entries(this.bookmarkIdsByMerchant).filter(
          ([merchantId]) => !recommendationMerchantIds.has(Number(merchantId)),
        ),
      );
      this.bookmarkIdsByMerchant = {
        ...bookmarkIdsByMerchant,
        ...bookmarkIds,
      };
      this.recommendations[category].forEach((item) => {
        item.bookmarked = Boolean(bookmarkIds[item.merchantId]);
      });
    },

    async fetchRecommendations(category, {
      referenceMerchantId,
      mealType,
      append = false,
    } = {}) {
      if (append) {
        if (
          this.loadingByCategory[category] ||
          this.loadingMoreByCategory[category] ||
          !this.pageInfoByCategory[category].hasNext ||
          !this.pageInfoByCategory[category].nextCursor
        ) {
          return;
        }
        this.loadingMoreByCategory[category] = true;
      } else {
        this.loadingByCategory[category] = true;
        this.recommendations[category] = [];
        this.pageInfoByCategory[category] = {
          hasNext: false,
          nextCursor: null,
        };
      }

      try {
        const params = { size: 20 };
        if (referenceMerchantId != null) {
          params.referenceMerchantId = referenceMerchantId;
        }
        if (category === 'restaurants') {
          params.mealType = mealType;
        }
        if (append) {
          params.cursor = this.pageInfoByCategory[category].nextCursor;
        }

        const { data } = await getRecommendations(category, params);
        const content = (data.content ?? []).map(normalizeRecommendationItem);
        this.recommendations[category] = append
          ? [...this.recommendations[category], ...content]
          : content;
        this.pageInfoByCategory[category] = {
          hasNext: Boolean(data.pageInfo?.hasNext),
          nextCursor: data.pageInfo?.nextCursor ?? null,
        };
        return data;
      } finally {
        this.loadingByCategory[category] = false;
        this.loadingMoreByCategory[category] = false;
      }
    },

    selectReferencePlace(category, place, mealType) {
      this.selectedReferencePlaces[referenceKey(category, mealType)] = {
        ...place,
        type: 'USER_SELECTED',
        description: '사용자가 직접 변경한 기준 장소',
      };
    },

    resetReferencePlace(category, mealType) {
      delete this.selectedReferencePlaces[referenceKey(category, mealType)];
    },

    async toggleBookmark(merchantId, category, currentlyBookmarked = false) {
      if (this.bookmarkLoadingMerchantIds.includes(merchantId)) return;

      this.bookmarkLoadingMerchantIds.push(merchantId);
      try {
        let bookmarkId = this.bookmarkIdsByMerchant[merchantId];
        if (currentlyBookmarked && !bookmarkId) {
          await this.fetchBookmarkIds(category);
          bookmarkId = this.bookmarkIdsByMerchant[merchantId];
        }
        if (bookmarkId) {
          await deleteBookmark(bookmarkId);
          delete this.bookmarkIdsByMerchant[merchantId];
          this.setRecommendationBookmarkState(merchantId, false);
          return false;
        }

        const { data } = await createBookmark(merchantId);
        this.bookmarkIdsByMerchant[merchantId] = data.bookmarkId;
        this.setRecommendationBookmarkState(merchantId, true);
        return true;
      } finally {
        this.bookmarkLoadingMerchantIds =
          this.bookmarkLoadingMerchantIds.filter(
            (loadingMerchantId) => loadingMerchantId !== merchantId,
          );
      }
    },

    setRecommendationBookmarkState(merchantId, bookmarked) {
      CATEGORY_ORDER.forEach((category) => {
        const item = this.recommendations[category].find(
          (recommendation) => recommendation.merchantId === merchantId,
        );
        if (item) item.bookmarked = bookmarked;
      });
    },
  },
});
