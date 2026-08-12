import axiosInstance from './axiosInstance';

// 지갑 조회
export const getMyWallet = () => {
  return axiosInstance.get('/wallets/me');
};

// 충전
// idempotencyKey 는 호출자가 "한 번의 충전 시도" 단위로 생성해 재시도 시 재사용한다(중복 충전 방지).
// TODO: PIN 페이지 완성되면 deviceId 도 함께 전송 (BE 필수값)
export const chargeWallet = (accountId, amount, pinNumber, idempotencyKey) => {
  return axiosInstance.post('/wallets/charge', {
    accountId,
    amount,
    pinNumber,
    idempotencyKey,
  });
};

// 환불 (선택한 계좌로 입금)
// idempotencyKey 는 호출자가 "한 번의 환불 시도" 단위로 생성해 재시도 시 재사용한다(중복 환불 방지).
// TODO: PIN 페이지 완성되면 deviceId 도 함께 전송 (BE 필수값)
export const refundWallet = (accountId, amount, pinNumber, idempotencyKey) => {
  return axiosInstance.post('/wallets/refund', {
    accountId,
    amount,
    pinNumber,
    idempotencyKey,
  });
};
