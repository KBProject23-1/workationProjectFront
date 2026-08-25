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

// 카테고리 키(accommodations/offices/restaurants/activities)로 위 유형별 함수를 분기하는 파사드.
// recommendationStore 는 카테고리 문자열 하나로 호출하므로, 여기서 유형별 API 로 위임한다.
const RECOMMENDATION_LIST_APIS = {
  accommodations: getAccommodationRecommendations,
  offices: getOfficeRecommendations,
  restaurants: getRestaurantRecommendations,
  activities: getActivityRecommendations,
};

const RECOMMENDATION_REFERENCE_PLACE_APIS = {
  accommodations: getAccommodationReferencePlace,
  offices: getOfficeReferencePlace,
  restaurants: getRestaurantReferencePlace,
  activities: getActivityReferencePlace,
};

const RECOMMENDATION_REFERENCE_CANDIDATE_APIS = {
  accommodations: getAccommodationReferenceCandidates,
  offices: getOfficeReferenceCandidates,
  restaurants: getRestaurantReferenceCandidates,
  activities: getActivityReferenceCandidates,
};

export const getRecommendations = (category, params) => {
  const api = RECOMMENDATION_LIST_APIS[category];
  if (!api) throw new Error(`알 수 없는 추천 카테고리: ${category}`);
  return api(params);
};

export const getRecommendationReferencePlace = (category, params) => {
  const api = RECOMMENDATION_REFERENCE_PLACE_APIS[category];
  if (!api) throw new Error(`알 수 없는 추천 카테고리: ${category}`);
  // 숙소/오피스/액티비티 기준 장소 API 는 인자를 받지 않는다(무해하게 무시됨).
  return api(params);
};

export const getRecommendationReferencePlaceCandidates = (category) => {
  const api = RECOMMENDATION_REFERENCE_CANDIDATE_APIS[category];
  if (!api) throw new Error(`알 수 없는 추천 카테고리: ${category}`);
  return api();
};
