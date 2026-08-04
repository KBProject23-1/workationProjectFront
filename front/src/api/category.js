import axiosInstance from './axiosInstance';

// 예산 유형별 카테고리 목록 조회
export const getExpenseCategories = (budgetType) => {
  return axiosInstance.get('/expense-categories', { params: { budgetType } });
};

// 카테고리 이름 변경. customName 을 null 로 보내면 기본 이름으로 되돌린다
export const updateCategoryLabel = (categoryId, customName) => {
  return axiosInstance.patch(`/expense-categories/${categoryId}/label`, { customName });
};
