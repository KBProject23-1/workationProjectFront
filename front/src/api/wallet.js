import axiosInstance from './axiosInstance';
import { generateUuid } from '@/utils/uuid';

// 지갑 조회
export const getMyWallet = () => {
  return axiosInstance.get('/wallets/me');
};

// 충전
// TODO: PIN 담당자 deviceId 연동 필요 (BE 필수값). idempotencyKey 는 중복 요청 방지용으로 FE 생성
export const chargeWallet = (accountId, amount, pinNumber) => {
  return axiosInstance.post('/wallets/charge', {
    accountId,
    amount,
    pinNumber,
    idempotencyKey: generateUuid(),
  });
};

// 환불 (선택한 계좌로 입금)
// TODO: PIN 담당자 deviceId 연동 필요 (BE 필수값)
export const refundWallet = (accountId, amount, pinNumber) => {
  return axiosInstance.post('/wallets/refund', {
    accountId,
    amount,
    pinNumber,
    idempotencyKey: generateUuid(),
  });
};
