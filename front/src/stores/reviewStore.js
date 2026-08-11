import { defineStore } from 'pinia';
import { deleteReview } from '@/api/review';

const PAGE_SIZE = 10;

// API 연동 전 화면 확인을 위한 가맹점 리뷰 목록 응답 예시
const merchantReviewResponse = {
  merchantId: 20,
  merchantName: '서핑 체험 강릉',
  averageRating: 4.6,
  reviewCount: 384,
  ratingDistribution: { 5: 230, 4: 96, 3: 38, 2: 14, 1: 6 },
  reviews: [
    {
      reviewId: 101,
      nickname: '여행자',
      rating: 4,
      atmosphere: 'QUIET',
      content: '분위기가 좋고 접근성도 뛰어나 만족했어요.\n강사님도 친절하게 잘 알려주셨어요!',
      createdAt: '2026-07-14T10:20:00',
    },
    {
      reviewId: 102,
      nickname: '서퍼',
      rating: 5,
      content: '강습이 체계적이라 초보자도 편하게 즐겼어요.\n다음에도 또 이용할게요!',
      createdAt: '2026-07-10T18:30:00',
    },
    {
      reviewId: 103,
      nickname: '바다',
      rating: 3,
      content: '장비 상태가 좋아서 더 만족스러웠어요.\n사진도 예쁘게 남길 수 있었어요!',
      createdAt: '2026-07-03T13:10:00',
    },
    {
      reviewId: 104,
      nickname: '강릉러',
      rating: 4,
      content: '해변과 가까워 이동이 편하고 시설도 깨끗해요.\n친구들에게 추천하고 싶어요.',
      createdAt: '2026-07-01T09:40:00',
    },
    {
      reviewId: 105,
      nickname: '체험러',
      rating: 5,
      content: '체험 내내 즐거웠고 바다 풍경도 좋았어요.\n다음 여행 때 또 오고 싶어요!',
      createdAt: '2026-06-28T15:20:00',
    },
  ],
};

// API 연동 전 화면 확인을 위한 리뷰 상세 응답 예시
const reviewDetailResponse = {
  reviewId: 101,
  nickname: '여행자',
  rating: 4,
  atmosphere: 'QUIET',
  content:
    '객실이 깨끗하고 위치도 좋아서 편하게 잘 쉬다 왔어요.\n직원분들도 친절했고 주변에 식당과 카페가 많아서\n이용하기 좋았습니다. 다음에도 다시 방문하고 싶어요.',
  createdAt: '2026-07-14T10:20:00',
  imageUrl: 'https://example.com/reviews/101.jpg',
  merchant: {
    merchantId: 31,
    merchantName: '스테이 호텔 강남',
    address: '강남구 도보 6분 (450m)',
    category: '공유오피스',
    thumbnailUrl: 'https://example.com/merchants/31.jpg',
  },
  reservationId: 210,
  transactionId: null,
};

// API 연동 전 화면 확인을 위한 내 리뷰 목록 응답 예시
const myReviewResponse = {
  nickname: '여행자',
  reviews: Array.from({ length: 5 }, (_, index) => ({
    reviewId: 201 + index,
    nickname: '여행자',
    merchantId: 31,
    merchantName: '스테이 호텔 강남',
    category: 'OFFICE',
    rating: 4,
    atmosphere: 'QUIET',
    content: '객실이 깨끗하고 위치도 좋아서\n편하게 잘 쉬다 왔어요.',
    createdAt: '2025-05-10T12:00:00',
    thumbnailUrl: `https://example.com/reviews/${201 + index}.jpg`,
  })),
};

const reviewFormResponse = {
  nickname: '여행자',
  merchant: {
    merchantId: 31,
    merchantName: '스테이 호텔 강남',
    address: '강남구 도보 6분 (450m)',
    category: '공유오피스',
    thumbnailUrl: 'https://example.com/merchants/31.jpg',
  },
};

export const useReviewStore = defineStore('review', {
  state: () => ({
    merchantName: '',
    averageRating: 0,
    reviewCount: 0,
    ratingDistribution: {},
    reviews: [],
    sort: 'latest',
    page: 1,
    totalPages: 1,
    isLoading: false,
    error: null,
    reviewDetail: null,
    isDetailLoading: false,
    detailError: null,
    myReviews: [],
    myReviewCategory: 'ALL',
    myReviewPage: 1,
    myReviewTotalPages: 1,
    isMyReviewsLoading: false,
    myReviewsError: null,
    reviewFormMerchant: null,
    isReviewSaving: false,
    reviewSaveError: null,
    savedReview: null,
    isReviewDeleting: false,
    reviewDeleteError: null,
  }),

  actions: {
    async fetchMerchantReviews(merchantId, page = 1) {
      this.isLoading = true;
      this.error = null;

      try {
        // 실제 연동 시 getMerchantReviews(merchantId, { page: page - 1, size: PAGE_SIZE, sort: this.sort }) 응답으로 교체
        await Promise.resolve(merchantId);
        const response = merchantReviewResponse;

        this.merchantName = response.merchantName;
        this.averageRating = response.averageRating;
        this.reviewCount = response.reviewCount;
        this.ratingDistribution = response.ratingDistribution;
        this.reviews = response.reviews;
        this.page = page;
        this.totalPages = Math.max(1, Math.ceil(response.reviewCount / PAGE_SIZE));
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },

    setPage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.page = page;
    },

    async fetchReviewDetails(reviewId) {
      this.isDetailLoading = true;
      this.detailError = null;
      this.reviewDetail = null;

      try {
        // 실제 연동 시 getReviewDetails(reviewId)의 data 응답으로 교체
        await Promise.resolve(reviewId);
        this.reviewDetail = reviewDetailResponse;
      } catch (error) {
        this.detailError = error.message;
      } finally {
        this.isDetailLoading = false;
      }
    },

    async fetchMyReviews(category = 'ALL') {
      this.isMyReviewsLoading = true;
      this.myReviewsError = null;
      this.myReviewCategory = category;
      this.myReviewPage = 1;

      try {
        // 실제 연동 시 getMyReviews({ category })의 data 응답으로 교체
        await Promise.resolve(category);
        this.myReviews = myReviewResponse.reviews.filter(
          (review) => category === 'ALL' || review.category === category,
        );
      } catch (error) {
        this.myReviewsError = error.message;
      } finally {
        this.isMyReviewsLoading = false;
      }
    },

    setMyReviewPage(page) {
      if (page < 1 || page > this.myReviewTotalPages) return;
      this.myReviewPage = page;
    },

    async prepareReviewForm({ mode, reviewId }) {
      this.reviewSaveError = null;
      this.savedReview = null;
      await Promise.resolve(mode);
      this.reviewFormMerchant = reviewFormResponse.merchant;

      if (mode === 'edit') {
        await this.fetchReviewDetails(reviewId);
      }
    },

    async saveReview({ mode, sourceType, sourceId, reviewId, rating, content, atmosphere, image }) {
      if (this.isReviewSaving) return null;

      this.isReviewSaving = true;
      this.reviewSaveError = null;

      try {
        // 실제 연동 시 mode와 sourceType에 따라 등록 또는 수정 API에 FormData를 전달
        await Promise.resolve({ sourceType, sourceId, image });
        this.savedReview = {
          reviewId: mode === 'edit' ? reviewId : 301,
          nickname: reviewFormResponse.nickname,
          rating,
          content,
          atmosphere,
          imageUrl: image ? URL.createObjectURL(image) : null,
        };
        return this.savedReview;
      } catch (error) {
        this.reviewSaveError = error.message;
        return null;
      } finally {
        this.isReviewSaving = false;
      }
    },

    async deleteMyReview(reviewId) {
      if (this.isReviewDeleting) return false;

      this.isReviewDeleting = true;
      this.reviewDeleteError = null;

      try {
        await deleteReview(reviewId);
        this.myReviews = this.myReviews.filter((review) => review.reviewId !== reviewId);
        return true;
      } catch (error) {
        this.reviewDeleteError = error.response?.data?.message || error.message;
        return false;
      } finally {
        this.isReviewDeleting = false;
      }
    },
  },
});
