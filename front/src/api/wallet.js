import axiosInstance from './axiosInstance';
import { getDeviceId } from '@/utils/device';

// 지갑 조회
export const getMyWallet = () => {
  return axiosInstance.get('/wallets/me');
};

// 충전
export const chargeWallet = (accountId, amount, pinNumber, idempotencyKey) => {
  return axiosInstance.post('/wallets/charge', {
    accountId,
    amount,
    pinNumber,
    idempotencyKey,
    deviceId: getDeviceId(),
  });
};

// 환불
export const refundWallet = (accountId, amount, pinNumber, idempotencyKey) => {
  return axiosInstance.post('/wallets/refund', {
    accountId,
    amount,
    pinNumber,
    idempotencyKey,
    deviceId: getDeviceId(),
  });
};
