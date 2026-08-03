import axiosInstance from './axiosInstance';

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
export const updateWorkation = (workationId, payload) => {
  return axiosInstance.put(`/workations/${workationId}`, payload);
};

// 워케이션 삭제
export const deleteWorkation = (workationId) => {
  return axiosInstance.delete(`/workations/${workationId}`);
};

// 워케이션 종료(정산 완료 처리)
export const settleWorkation = (workationId) => {
  return axiosInstance.patch(`/workations/${workationId}/settle`);
};
