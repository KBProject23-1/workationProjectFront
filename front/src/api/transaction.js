import axiosInstance from './axiosInstance';

// 거래내역 목록 조회 (필터링 지원)
export const getTransactions = (params = {}) => {
  return axiosInstance.get('/transactions', { params });
};

// 거래내역 조회 기간 전체 집계 (결제 합계 / 충전 합계, 페이징과 무관)
export const getTransactionSummary = (params = {}) => {
  return axiosInstance.get('/transactions/summary', { params });
};

// 거래내역 상세 조회
export const getTransactionDetail = (transactionId) => {
  return axiosInstance.get(`/transactions/${transactionId}`);
};

// 매출전표 조회
export const getTransactionReceipt = (transactionId) => {
  return axiosInstance.get(`/transactions/${transactionId}/receipts`);
};

// 통합 결제 (지갑/카드)
export const createPayment = (payload) => {
  return axiosInstance.post('/payments', payload);
};
