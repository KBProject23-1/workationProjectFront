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
