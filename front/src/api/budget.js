import axiosInstance from './axiosInstance';

// 예산 사용현황 조회. budgetType 을 빼면 법인·개인 모두 내려온다
export const getBudgetStatus = (workationId, params) => {
  return axiosInstance.get(`/workations/${workationId}/budgets`, { params });
};

// 예산 카테고리별 세부 금액 설정
export const setupBudget = (workationId, payload) => {
  return axiosInstance.post(`/workations/${workationId}/budgets`, payload);
};

// 예산 세부 금액 수정. 해당 예산 유형의 배분 전체를 덮어쓴다
export const updateBudget = (workationId, payload) => {
  return axiosInstance.put(`/workations/${workationId}/budgets`, payload);
};
