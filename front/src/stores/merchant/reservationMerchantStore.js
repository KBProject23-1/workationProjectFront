import { defineStore } from 'pinia';
import { getMerchants } from '@/api/merchants';
import { createBookmark, deleteBookmark, getBookmarks } from '@/api/bookmark';
import {
  getAccommodationRecommendations,
  getAccommodationReferenceCandidates,
  getActivityRecommendations,
  getActivityReferenceCandidates,
  getAccommodationReferencePlace,
  getActivityReferencePlace,
  getOfficeRecommendations,
  getOfficeReferenceCandidates,
  getOfficeReferencePlace,
  getRestaurantReferencePlace,
  getRestaurantRecommendations,
  getRestaurantReferenceCandidates,
} from '@/api/recommendation';

// 추천 응답은 유형마다 이름 필드가 name / merchantName 으로 갈린다.
// 목록 카드가 쓰는 모양으로 맞춰 준다
const toMerchantItem = (item, category) => ({
  merchantId: item.merchantId,
  category: item.category ?? category,
  name: item.name ?? item.merchantName,
  address: item.address,
  thumbnailUrl: item.thumbnailUrl,
  price: Number(item.price ?? 0),
  rating: item.rating,
  reviewCount: item.reviewCount ?? 0,
  bookmarked: Boolean(item.bookmarked),
  bookmarkId: item.bookmarkId ?? null,
  bookmarkLoading: false,
  recommendationReason: item.recommendationReason ?? null,
});

const RECOMMENDATION_FETCHERS = {
  ACCOMMODATION: (params) => getAccommodationRecommendations(params),
  OFFICE: (params) => getOfficeRecommendations(params),
  ACTIVITY: (params) => getActivityRecommendations(params),
  RESTAURANT: (params) => getRestaurantRecommendations(params),
};

const REFERENCE_PLACE_FETCHERS = {
  ACCOMMODATION: () => getAccommodationReferencePlace(),
  OFFICE: () => getOfficeReferencePlace(),
  ACTIVITY: () => getActivityReferencePlace(),
  RESTAURANT: (mealType) => getRestaurantReferencePlace({ mealType }),
};

const REFERENCE_CANDIDATE_FETCHERS = {
  ACCOMMODATION: getAccommodationReferenceCandidates,
  OFFICE: getOfficeReferenceCandidates,
  RESTAURANT: getRestaurantReferenceCandidates,
  ACTIVITY: getActivityReferenceCandidates,
};

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
    guestCount: 1,
    roomCount: 1,
    // 예약 유형 4탭. 탭마다 쓰는 필터가 달라 전체 탭은 두지 않는다
    category: 'ACCOMMODATION',
    sort: 'RATING_DESC',
    minPrice: '',
    maxPrice: '',
    // 유형별 상세 필터
    accommodationType: '',
    noiseLevel: '',
    foodType: '',
    priceLevel: '',
    activityType: '',
    // 음식점 추천은 식사 시간이 있어야 기준 장소와 예산 배분을 정할 수 있다
    mealType: 'BREAKFAST',
    // SEARCH: 내가 조건을 건다 / RECOMMEND: 서버가 워케이션 조건으로 고른다
    mode: 'RECOMMEND',
    // 추천에서 유일하게 고를 수 있는 값
    referenceMerchantId: '',
    referenceCandidates: [],
    // 서버가 잡아 준 기본 기준 장소. 이름을 보여줘야 왜 그곳이 기준인지 알 수 있다
    referencePlace: null,
    // 적용하기를 누르기 전에는 결과를 보여주지 않는다
    searched: false,
    size: 20,
    hasNext: false,
    nextCursor: null,
    regionId: null,
    isLoading: false,
    isLoadingMore: false,
    error: null,
    bookmarkIdsByMerchant: {},
  }),

  getters: {
    // 숙소·공유오피스만 재고가 있어 날짜와 인원을 본다
    reservable: (state) =>
      state.category === 'ACCOMMODATION' || state.category === 'OFFICE',

    queryParams(state) {
      const params = {
        category: state.category || undefined,
        sort: state.sort,
        size: state.size,
        regionId: state.regionId || undefined,
      };

      if (state.category === 'ACCOMMODATION' || state.category === 'OFFICE') {
        params.startDate = state.checkIn || undefined;
        params.endDate = state.checkOut || undefined;
        params.headcount = state.guestCount || undefined;
        params.minPrice = state.minPrice === '' ? undefined : Number(state.minPrice);
        params.maxPrice = state.maxPrice === '' ? undefined : Number(state.maxPrice);
      }

      if (state.category === 'ACCOMMODATION') {
        params.roomCount = state.roomCount || 1;
        params.accommodationType = state.accommodationType || undefined;
      }
      if (state.category === 'OFFICE') {
        params.noiseLevel = state.noiseLevel || undefined;
      }
      if (state.category === 'RESTAURANT') {
        params.foodType = state.foodType || undefined;
        params.priceLevel = state.priceLevel === '' ? undefined : Number(state.priceLevel);
      }
      if (state.category === 'ACTIVITY') {
        params.activityType = state.activityType || undefined;
      }

      return params;
    },
  },

  actions: {
    resetEntrySelection(workation = null) {
      this.checkIn = workation?.startDate ?? formatDate(today);
      this.checkOut = workation?.endDate ?? formatDate(tomorrow);
      this.guestCount = 1;
      this.roomCount = 1;
      this.category = 'ACCOMMODATION';
      this.mode = 'RECOMMEND';
      this.merchants = [];
      this.searched = false;
      this.error = null;
      this.hasNext = false;
      this.nextCursor = null;
      this.referenceMerchantId = '';
      this.mealType = 'BREAKFAST';
      this.accommodationType = '';
      this.noiseLevel = '';
      this.foodType = '';
      this.priceLevel = '';
      this.activityType = '';
      this.loadReference();
    },
    setDate(mode, value) {
      if (mode === 'checkIn') {
        this.checkIn = value;
        if (this.checkOut < value) this.checkOut = value;
        return;
      }
      if (value >= this.checkIn) this.checkOut = value;
    },
    // 탭을 옮기면 이전 탭에서 고른 상세 필터는 의미가 없다
    setMode(mode) {
      if (this.mode === mode) return;
      this.mode = mode;
      this.merchants = [];
      this.searched = false;
      if (mode === 'RECOMMEND' && this.category === 'RESTAURANT') {
        this.mealType = 'BREAKFAST';
      }
      if (mode === 'RECOMMEND') this.loadReference();
    },

    async loadReference() {
      await Promise.all([this.fetchReferencePlace(), this.fetchReferenceCandidates()]);
    },

    // 고르지 않았을 때 서버가 무엇을 기준으로 잡는지 보여준다
    async fetchReferencePlace() {
      const fetcher = REFERENCE_PLACE_FETCHERS[this.category];
      this.referencePlace = null;
      if (!fetcher) return;

      try {
        const { data } = await fetcher(this.mealType);
        this.referencePlace = data ?? null;
      } catch {
        this.referencePlace = null;
      }
    },

    // 공유오피스·여가 후보는 예약된 곳만 나오므로 예약이 없으면 빈 목록이다
    async fetchReferenceCandidates() {
      const fetcher = REFERENCE_CANDIDATE_FETCHERS[this.category];
      this.referenceCandidates = [];
      this.referenceMerchantId = '';
      if (!fetcher) return;

      try {
        const { data } = await fetcher();
        this.referenceCandidates = data?.candidates ?? data?.content ?? [];
      } catch {
        this.referenceCandidates = [];
      }
    },

    setCategory(category) {
      if (this.category === category) return;
      this.category = category;
      this.merchants = [];
      this.searched = false;
      if (category === 'RESTAURANT' && this.mode === 'RECOMMEND') {
        this.mealType = 'BREAKFAST';
      }
      if (this.mode === 'RECOMMEND') this.loadReference();
      this.accommodationType = '';
      this.noiseLevel = '';
      this.foodType = '';
      this.priceLevel = '';
      this.activityType = '';
    },
    selectReference(place) {
      this.referenceMerchantId = place ? place.merchantId : '';
      this.referencePlace = place;
    },

    setPrice(field, value) {
      const sanitizedValue = value.replace(/\D/g, '').slice(0, 9);
      if (field === 'min') this.minPrice = sanitizedValue;
      else this.maxPrice = sanitizedValue;
    },
    applyResponse(data, append = false) {
      const content = (data?.content ?? []).map((item) =>
        toMerchantItem(item, this.category),
      );
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
        if (this.mode === 'RECOMMEND') {
          await this.fetchRecommendations();
        } else {
          const { data } = await getMerchants(this.queryParams);
          this.applyResponse(data);
        }
        await this.fetchBookmarkIds().catch(() => {});
      } catch (error) {
        this.merchants = [];
        this.hasNext = false;
        this.nextCursor = null;
        this.error = error.message;
      } finally {
        this.isLoading = false;
        this.searched = true;
      }
    },

    // 추천은 커서 페이징 규격이 목록과 달라 한 번에 받은 만큼만 보여준다
    async fetchRecommendations() {
      const fetcher = RECOMMENDATION_FETCHERS[this.category];
      if (!fetcher) {
        this.merchants = [];
        return;
      }

      const params = {};
      if (this.category === 'RESTAURANT') params.mealType = this.mealType;
      if (this.referenceMerchantId) {
        params.referenceMerchantId = this.referenceMerchantId;
      }

      const { data } = await fetcher(params);
      this.merchants = (data?.content ?? []).map((item) =>
        toMerchantItem(item, this.category),
      );
      this.hasNext = false;
      this.nextCursor = null;
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
        await this.fetchBookmarkIds().catch(() => {});
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLoadingMore = false;
      }
    },
    async fetchBookmarkIds() {
      const bookmarkIds = {};
      let cursor = null;

      do {
        const { data } = await getBookmarks({
          category: this.category,
          cursor,
          size: '100',
        });
        (data.content ?? []).forEach((bookmark) => {
          bookmarkIds[bookmark.merchantId] = bookmark.bookmarkId;
        });
        cursor = data.hasNext ? data.nextCursor : null;
      } while (cursor);

      const merchantIds = new Set(this.merchants.map((merchant) => merchant.merchantId));
      const bookmarkIdsByMerchant = Object.fromEntries(
        Object.entries(this.bookmarkIdsByMerchant).filter(
          ([merchantId]) => !merchantIds.has(Number(merchantId)),
        ),
      );
      this.bookmarkIdsByMerchant = {
        ...bookmarkIdsByMerchant,
        ...bookmarkIds,
      };
      this.merchants.forEach((merchant) => {
        merchant.bookmarkId = bookmarkIds[merchant.merchantId] ?? null;
        merchant.bookmarked = Boolean(merchant.bookmarkId);
      });
    },
    async toggleBookmark(merchantId) {
      const merchant = this.merchants.find((item) => item.merchantId === merchantId);
      if (!merchant || merchant.bookmarkLoading) return;

      merchant.bookmarkLoading = true;
      try {
        let bookmarkId = merchant.bookmarkId ?? this.bookmarkIdsByMerchant[merchantId];
        if (merchant.bookmarked && !bookmarkId) {
          await this.fetchBookmarkIds();
          bookmarkId = this.bookmarkIdsByMerchant[merchantId];
        }

        if (bookmarkId) {
          await deleteBookmark(bookmarkId);
          delete this.bookmarkIdsByMerchant[merchantId];
          merchant.bookmarkId = null;
          merchant.bookmarked = false;
          return;
        }

        const { data } = await createBookmark(merchantId);
        this.bookmarkIdsByMerchant[merchantId] = data.bookmarkId;
        merchant.bookmarkId = data.bookmarkId;
        merchant.bookmarked = true;
      } finally {
        merchant.bookmarkLoading = false;
      }
    },
  },
});
