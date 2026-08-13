import axiosInstance from './axiosInstance';

// 예약 유형별 추천 목록.
// 목록 조회와 달리 서버가 추천 결과를 계산해 저장하므로 정렬 옵션이 아니라 별도 호출로 둔다
export const getAccommodationRecommendations = (params) => {
  return axiosInstance.get('/recommendations/accommodations', { params });
};

export const getOfficeRecommendations = (params) => {
  return axiosInstance.get('/recommendations/offices', { params });
};

// mealType 이 필수다. 아침·점심·저녁마다 기준 장소와 예산 배분이 다르다
export const getRestaurantRecommendations = (params) => {
  return axiosInstance.get('/recommendations/restaurants', { params });
};

export const getActivityRecommendations = (params) => {
  return axiosInstance.get('/recommendations/activities', { params });
};

// 현재 기준 장소. 고르지 않았으면 서버가 확정 예약을 기준으로 잡아 준다
export const getAccommodationReferencePlace = () => {
  return axiosInstance.get('/recommendations/accommodations/reference-place');
};

export const getOfficeReferencePlace = () => {
  return axiosInstance.get('/recommendations/offices/reference-place');
};

export const getRestaurantReferencePlace = (params) => {
  return axiosInstance.get('/recommendations/restaurants/reference-place', { params });
};

export const getActivityReferencePlace = () => {
  return axiosInstance.get('/recommendations/activities/reference-place');
};

// 기준 장소 이름 검색. 지역은 서버가 진행 중인 워케이션에서 가져온다
export const searchReferencePlaces = (params) => {
  return axiosInstance.get('/recommendations/reference-place-search', { params });
};

// 기준 장소 후보. 유형마다 후보가 되는 업종이 다르다
export const getAccommodationReferenceCandidates = () => {
  return axiosInstance.get('/recommendations/accommodations/reference-place-candidates');
};

export const getOfficeReferenceCandidates = () => {
  return axiosInstance.get('/recommendations/offices/reference-place-candidates');
};

export const getRestaurantReferenceCandidates = () => {
  return axiosInstance.get('/recommendations/restaurants/reference-place-candidates');
};

export const getActivityReferenceCandidates = () => {
  return axiosInstance.get('/recommendations/activities/reference-place-candidates');
};
