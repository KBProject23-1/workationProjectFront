import axiosInstance from './axiosInstance';

// 연동 가능 계좌 조회
export const getAvailableAccounts = () => {
  return axiosInstance.get('/accounts/available');
};

// 내 계좌 목록 조회
export const getMyAccounts = () => {
  return axiosInstance.get('/accounts/me');
};

// 계좌 등록(연동)
export const linkAccounts = (linkableAccountIds) => {
  return axiosInstance.post('/accounts', { linkableAccountIds });
};

// 주 계좌 변경
export const setPrimaryAccount = (accountId) => {
  return axiosInstance.patch(`/accounts/${accountId}/primary`);
};

// 계좌 삭제
export const deleteAccount = (accountId) => {
  return axiosInstance.delete(`/accounts/${accountId}`);
};
