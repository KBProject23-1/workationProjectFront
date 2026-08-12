import axiosInstance from './axiosInstance';

// 예약 가능한 가맹점 목록 조회
export const getMerchants = (params) => {
  return axiosInstance.get('/merchants', { params });
};

// 공유오피스 상세 조회
export const getOfficeDetail = (merchantId, params) => {
  return axiosInstance.get(`/merchants/${merchantId}/offices`, { params });
};

// 숙소 상세 조회
export const getAccommodationDetail = (merchantId, params) => {
  return axiosInstance.get(`/merchants/${merchantId}/accommodations`, { params });
};

// 음식점 상세 조회
export const getRestaurantDetail = (merchantId) => {
  return axiosInstance.get(`/merchants/${merchantId}/restaurants`);
};

// 여가 상세 조회
export const getActivityDetail = (merchantId) => {
  return axiosInstance.get(`/merchants/${merchantId}/activities`);
};
