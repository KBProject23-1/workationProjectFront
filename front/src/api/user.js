import axiosInstance from './axiosInstance';

// 내 프로필 조회 (GET /api/v1/users/me)
// - 쿠키(또는 Bearer) 인증 필요. 로그인 상태 복원(세션 확인)에도 사용한다.
//   200 이면 로그인 상태, 401 이면 비로그인.
export const getMe = () => {
  // skipAuthRedirect: 비로그인 probe 라 401 이어도 인터셉터가 /login 으로 하드 리다이렉트하지 않게 한다.
  // (refresh 는 정상 수행 — 유효한 refresh 쿠키가 있으면 세션이 복원된다)
  return axiosInstance.get('/users/me', { skipAuthRedirect: true });
};
