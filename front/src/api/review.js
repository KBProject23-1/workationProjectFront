import axiosInstance from './axiosInstance';

// 가맹점에 등록된 활성 리뷰 목록 조회
export const getMerchantReviews = (merchantId, params) => {
  return axiosInstance.get(`/merchants/${merchantId}/reviews`, { params });
};

// 리뷰 ID에 해당하는 리뷰 상세 조회
export const getReviewDetails = (reviewId) => {
  return axiosInstance.get(`/reviews/${reviewId}`);
};

// 로그인한 사용자가 작성한 리뷰 목록 조회
export const getMyReviews = (params) => {
  return axiosInstance.get('/users/me/reviews', { params });
};

// 이용 완료된 예약을 기준으로 리뷰 등록
export const addReservationReview = (reservationId, formData) => {
  return axiosInstance.post(`/reservations/${reservationId}/reviews`, formData);
};

// 결제 완료된 거래를 기준으로 리뷰 등록
export const addTransactionReview = (transactionId, formData) => {
  return axiosInstance.post(`/transactions/${transactionId}/reviews`, formData);
};

// 로그인한 사용자가 작성한 리뷰 수정
export const modifyReview = (reviewId, request) => {
  return axiosInstance.patch(`/reviews/${reviewId}`, request);
};

// 로그인한 사용자가 작성한 리뷰 삭제
export const deleteReview = (reviewId) => {
  return axiosInstance.delete(`/reviews/${reviewId}`);
};
