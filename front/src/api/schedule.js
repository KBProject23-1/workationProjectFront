import axiosInstance from './axiosInstance';

// 스케줄러 통합 조회. 숙소·공유오피스 예약과 음식점·여가 일정이 날짜별로 내려온다
// startDate 를 빼면 오늘, days 를 빼면 2일치. days 는 1~7
export const getSchedules = (workationId, params) => {
  return axiosInstance.get(`/workations/${workationId}/schedules`, { params });
};

// 음식점·여가 방문 계획 등록
export const createSchedule = (workationId, payload) => {
  return axiosInstance.post(`/workations/${workationId}/schedules`, payload);
};

// 일정 상세
export const getScheduleDetail = (workationId, scheduleId) => {
  return axiosInstance.get(`/workations/${workationId}/schedules/${scheduleId}`);
};

// 일정 삭제. 예약과 달리 결제가 없어 상태 전이 없이 지워진다
export const deleteSchedule = (workationId, scheduleId) => {
  return axiosInstance.delete(
    `/workations/${workationId}/schedules/${scheduleId}`,
  );
};
