import axiosInstance from './axiosInstance';

// 지갑 조회
export const getMyWallet = () => {
  return axiosInstance.get('/wallets/me');
};

// 충전
export const chargeWallet = (accountId, amount, pinNumber) => {
  return axiosInstance.post('/wallets/charge', {
    accountId,
    amount,
    pinNumber,
  });
};

// 환불 (항상 주 계좌로)
export const refundWallet = (amount, pinNumber) => {
  return axiosInstance.post('/wallets/refund', { amount, pinNumber });
};
