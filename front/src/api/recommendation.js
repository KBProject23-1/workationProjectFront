import axiosInstance from './axiosInstance';

const RECOMMENDATION_PATH = '/recommendations';

export const getRecommendationReferencePlace = (category, params = {}) => {
  return axiosInstance.get(`${RECOMMENDATION_PATH}/${category}/reference-place`, {
    params,
  });
};

export const getRecommendationReferencePlaceCandidates = (category) => {
  return axiosInstance.get(
    `${RECOMMENDATION_PATH}/${category}/reference-place-candidates`,
  );
};

export const getRecommendations = (category, params = {}) => {
  return axiosInstance.get(`${RECOMMENDATION_PATH}/${category}`, { params });
};
