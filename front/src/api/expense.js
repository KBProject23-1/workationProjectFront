import axiosInstance from './axiosInstance';

// 지출 목록 조회. budgetType·expenseCategoryId·uncheckedOnly 는 선택 필터
export const getExpenses = (workationId, params) => {
  return axiosInstance.get(`/workations/${workationId}/expenses`, { params });
};

// 외부 결제내역 추가
export const createExpense = (workationId, payload) => {
  return axiosInstance.post(`/workations/${workationId}/expenses`, payload);
};

// 지출 단건 상세조회
export const getExpenseDetail = (expenseId) => {
  return axiosInstance.get(`/expenses/${expenseId}`);
};

// 지출 수정. 등록 폼을 재사용하므로 전체 필드를 보낸다
export const updateExpense = (expenseId, payload) => {
  return axiosInstance.put(`/expenses/${expenseId}`, payload);
};

export const deleteExpense = (expenseId) => {
  return axiosInstance.delete(`/expenses/${expenseId}`);
};

// 카테고리 수동 변경. applyToMerchant 가 true 면 같은 가맹점에 규칙으로 저장된다
export const updateExpenseCategory = (expenseId, expenseCategoryId, applyToMerchant = true) => {
  return axiosInstance.patch(`/expenses/${expenseId}/category`, {
    expenseCategoryId,
    applyToMerchant,
  });
};

// 경비/개인소비 구분 변경. 예산 유형이 바뀌면 카테고리도 함께 지정해야 한다
export const updateExpenseBudgetType = (expenseId, budgetType, expenseCategoryId) => {
  return axiosInstance.patch(`/expenses/${expenseId}/budget-type`, {
    budgetType,
    expenseCategoryId,
  });
};
