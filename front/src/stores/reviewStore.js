import { defineStore } from 'pinia';
import {
  addReservationReview,
  addTransactionReview,
  deleteReview,
  getMerchantReviews,
  getMyReviews,
  getReviewDetails,
  modifyReview,
} from '@/api/review';
import { getReservationDetails } from '@/api/reservations';
import { getTransactionDetail } from '@/api/transaction';

const PAGE_SIZE = 10;

const resolveReviewImageUrl = (imageUrl) => {
  if (!imageUrl || imageUrl.startsWith('blob:') || /^https?:\/\//.test(imageUrl)) return imageUrl;
  return `${import.meta.env.VITE_API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};

const createReviewFormData = ({ rating, content, atmosphere, image }) => {
  const formData = new FormData();
  formData.append('rating', rating);
  formData.append('content', content);
  if (atmosphere) formData.append('atmosphere', atmosphere);
  if (image) formData.append('image', image);
  return formData;
};

export const useReviewStore = defineStore('review', {
  state: () => ({
    merchantId: null, merchantName: '', averageRating: 0, reviewCount: 0,
    ratingDistribution: {}, reviews: [], page: 1, totalPages: 1,
    isLoading: false, error: null, reviewDetail: null, isDetailLoading: false,
    detailError: null, myReviews: [], myReviewCategory: 'ALL', myReviewPage: 1,
    myReviewTotalPages: 1, isMyReviewsLoading: false, myReviewsError: null,
    reviewFormMerchant: null, isReviewSaving: false, reviewSaveError: null,
    savedReview: null, isReviewDeleting: false, reviewDeleteError: null,
  }),
  actions: {
    async fetchMerchantReviews(merchantId, page = 1) {
      this.isLoading = true; this.error = null; this.merchantId = merchantId;
      try {
        const { data } = await getMerchantReviews(merchantId, { page: page - 1, size: PAGE_SIZE });
        const reviewPage = data?.reviews;
        if (!reviewPage || !Array.isArray(reviewPage.content)) throw new Error('가맹점 리뷰 응답 형식이 올바르지 않습니다.');
        this.merchantName = data.merchantName;
        this.averageRating = Number(data.averageRating || 0);
        this.reviewCount = Number(data.reviewCount || 0);
        this.ratingDistribution = data.ratingDistribution || {};
        this.reviews = reviewPage.content.map((review) => ({ ...review, imageUrl: resolveReviewImageUrl(review.imageUrl) }));
        this.page = reviewPage.page + 1;
        this.totalPages = Math.max(1, reviewPage.totalPages);
      } catch (error) { this.error = error.message; } finally { this.isLoading = false; }
    },
    setPage(page) {
      if (page < 1 || page > this.totalPages || page === this.page) return;
      this.fetchMerchantReviews(this.merchantId, page);
    },
    async fetchReviewDetails(reviewId) {
      this.isDetailLoading = true; this.detailError = null; this.reviewDetail = null;
      try {
        const { data } = await getReviewDetails(reviewId);
        if (!data?.reviewId || !data.merchant) throw new Error('리뷰 상세 응답 형식이 올바르지 않습니다.');
        this.reviewDetail = { ...data, imageUrl: resolveReviewImageUrl(data.imageUrl) };
      } catch (error) { this.detailError = error.message; } finally { this.isDetailLoading = false; }
    },
    async fetchMyReviews(category = 'ALL', page = 1) {
      this.isMyReviewsLoading = true; this.myReviewsError = null; this.myReviewCategory = category;
      try {
        const { data } = await getMyReviews({ category, page: page - 1, size: PAGE_SIZE });
        if (!Array.isArray(data?.content)) throw new Error('내 리뷰 목록 응답 형식이 올바르지 않습니다.');
        this.myReviews = data.content.map((review) => ({
          ...review, category: review.merchantCategory, imageUrl: resolveReviewImageUrl(review.imageUrl),
        }));
        this.myReviewPage = data.page + 1;
        this.myReviewTotalPages = Math.max(1, data.totalPages);
      } catch (error) { this.myReviewsError = error.message; } finally { this.isMyReviewsLoading = false; }
    },
    setMyReviewPage(page) {
      if (page < 1 || page > this.myReviewTotalPages || page === this.myReviewPage) return;
      this.fetchMyReviews(this.myReviewCategory, page);
    },
    async prepareReviewForm({ mode, reviewId, sourceType, sourceId }) {
      this.reviewSaveError = null; this.savedReview = null; this.reviewFormMerchant = null;
      try {
        if (mode === 'edit') {
          await this.fetchReviewDetails(reviewId);
          if (!this.reviewDetail) throw new Error(this.detailError || '리뷰를 불러오지 못했습니다.');
          this.reviewFormMerchant = this.reviewDetail.merchant;
          return;
        }
        if (sourceType === 'reservation') {
          const { data } = await getReservationDetails(sourceId);
          this.reviewFormMerchant = {
            merchantId: data.merchant.merchantId, merchantName: data.merchant.name,
            address: data.merchant.address, category: data.merchant.category,
            thumbnailUrl: data.merchant.thumbnailUrl,
          };
          return;
        }
        const { data } = await getTransactionDetail(sourceId);
        this.reviewFormMerchant = {
          merchantId: data.merchantId, merchantName: data.merchantName,
          address: '', category: data.categoryAssigned, thumbnailUrl: null,
        };
      } catch (error) { this.reviewSaveError = error.message; }
    },
    async saveReview({ mode, sourceType, sourceId, reviewId, ...review }) {
      if (this.isReviewSaving) return null;
      this.isReviewSaving = true; this.reviewSaveError = null;
      try {
        let response;
        if (mode === 'edit') {
          const request = review.image ? createReviewFormData(review) : {
            rating: review.rating, content: review.content, atmosphere: review.atmosphere,
          };
          response = await modifyReview(reviewId, request);
        } else {
          const formData = createReviewFormData(review);
          response = sourceType === 'reservation'
            ? await addReservationReview(sourceId, formData)
            : await addTransactionReview(sourceId, formData);
        }
        this.savedReview = response.data;
        return response.data;
      } catch (error) { this.reviewSaveError = error.message; return null; }
      finally { this.isReviewSaving = false; }
    },
    async deleteMyReview(reviewId) {
      if (this.isReviewDeleting) return false;
      this.isReviewDeleting = true; this.reviewDeleteError = null;
      try { await deleteReview(reviewId); return true; }
      catch (error) { this.reviewDeleteError = error.message; return false; }
      finally { this.isReviewDeleting = false; }
    },
  },
});
