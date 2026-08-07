import axiosInstance from './axiosInstance';

// Spring의 List<ReservationStatus>가 인식하도록 배열 값을 같은 키의 반복 파라미터로 변환
function serializeReservationParams(params) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, item));
      return;
    }

    if (value !== null && value !== undefined) {
      searchParams.append(key, value);
    }
  });

  return searchParams.toString();
}

// 로그인한 사용자의 예약 목록을 상태·카테고리·페이지 조건으로 조회
export const getReservationList = (params) => {
  return axiosInstance.get('/reservations', {
    params,
    paramsSerializer: {
      serialize: serializeReservationParams,
    },
  });
};

// 로그인한 사용자의 예약 확정·이용 완료 상세 조회
export const getReservationDetails = (reservationId) => {
  return axiosInstance.get(`/reservations/${reservationId}`);
};

// 로그인한 사용자의 예약 취소와 전액 환불 처리
export const cancelReservation = (reservationId) => {
  return axiosInstance.post(`/reservations/${reservationId}/cancel`);
};

// 취소 완료된 예약의 취소 일시·수수료·환불 금액 조회
export const getReservationCancellation = (reservationId) => {
  return axiosInstance.get(`/reservations/${reservationId}/cancellation`);
};
