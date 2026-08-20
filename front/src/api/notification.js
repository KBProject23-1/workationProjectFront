import axiosInstance from './axiosInstance';

// 알림 설정 조회 (GET /api/v1/users/me/notifications/settings)
// - 로그인 사용자의 알림 카테고리별 수신 여부를 조회한다
// - 응답 data: { budgetNotify, transferNotify, paymentNotify, workationNotify, settlementNotify, scheduleNotify }
export const getNotificationSettings = () => {
  return axiosInstance.get('/users/me/notifications/settings');
};

// 알림 설정 변경 (PATCH /api/v1/users/me/notifications/settings)
// - 변경한 필드만 body 에 담아 보낸다 (PATCH 부분 수정)
// - Boolean 값이므로 false 도 정상적인 변경 값으로 전송한다
// - 응답 data: 변경 후 전체 알림 설정 상태
export const updateNotificationSettings = (payload) => {
  return axiosInstance.patch('/users/me/notifications/settings', payload);
};
