import axiosInstance from './axiosInstance';

// ───────────────────────────────────────────────────────────
// 알림 목록 / 읽음 처리 / 읽지 않은 개수 API
// ───────────────────────────────────────────────────────────

// 알림 목록 조회 (GET /api/v1/users/me/notifications)
// - 커서 기반 페이지네이션, category 로 필터링 가능
// - 응답 data: { notifications, nextCursor, hasNext }
export const getNotificationList = (params = {}) => {
  return axiosInstance.get('/users/me/notifications', { params });
};

// 단건 알림 읽음 처리 (PATCH /api/v1/users/me/notifications/{notificationId}/read)
// - 이미 읽은 알림을 다시 요청해도 200 OK (idempotent)
export const markNotificationAsRead = (notificationId) => {
  return axiosInstance.patch(`/users/me/notifications/${notificationId}/read`);
};

// 전체 알림 읽음 처리 (PATCH /api/v1/users/me/notifications/read-all)
export const markAllNotificationsAsRead = () => {
  return axiosInstance.patch('/users/me/notifications/read-all');
};

// 읽지 않은 알림 개수 조회 (GET /api/v1/users/me/notifications/unread-count)
// - 응답 data: { unreadCount }
export const getUnreadCount = () => {
  return axiosInstance.get('/users/me/notifications/unread-count');
};

// ───────────────────────────────────────────────────────────
// 알림 수신 설정 API
// ───────────────────────────────────────────────────────────

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
