import axiosInstance from './axiosInstance';

// 정산 내역 조회. budgetType 을 빼면 법인·개인 모두 내려온다
export const getSettlement = (workationId, params) => {
  return axiosInstance.get(`/workations/${workationId}/settlement`, { params });
};

// 세부내역 Excel. 바이너리로 받아야 하므로 blob 으로 요청한다
export const downloadSettlementExcel = (workationId, params) => {
  return axiosInstance.get(`/workations/${workationId}/settlement/excel`, {
    params,
    responseType: 'blob',
  });
};

// 증빙자료 PDF
export const downloadSettlementPdf = (workationId, params) => {
  return axiosInstance.get(`/workations/${workationId}/settlement/pdf`, {
    params,
    responseType: 'blob',
  });
};
