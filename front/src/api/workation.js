import axiosInstance from './axiosInstance';

// 지역 목록 조회
export const getRegions = () => {
  return axiosInstance.get('/regions');
};

// 워케이션 등록
export const createWorkation = (payload) => {
  return axiosInstance.post('/workations', payload);
};

// 진행 중 워케이션 조회
export const getCurrentWorkation = () => {
  return axiosInstance.get('/workations/current');
};

// 워케이션 기록 목록 조회
export const getWorkations = (params) => {
  return axiosInstance.get('/workations', { params });
};

// 워케이션 수정
// force 를 주면 새 기간을 벗어나는 지출을 워케이션에서 떼어내고 진행한다
export const updateWorkation = (workationId, payload, force = false) => {
  return axiosInstance.put(`/workations/${workationId}`, payload, {
    params: force ? { force: true } : undefined,
  });
};

// 워케이션 삭제
export const deleteWorkation = (workationId) => {
  return axiosInstance.delete(`/workations/${workationId}`);
};

// 기간 변경·삭제 전에 예약이 어떻게 어긋나는지 확인한다
// 날짜를 주지 않으면 현재 기간 기준으로 조회한다
export const checkReservations = (workationId, params) => {
  return axiosInstance.get(`/workations/${workationId}/reservation-check`, {
    params,
  });
};

// 워케이션 종료(정산 완료 처리)
export const settleWorkation = (workationId) => {
  return axiosInstance.patch(`/workations/${workationId}/settle`);
};
