import axiosInstance from './axiosInstance';

// 내 프로필 조회 (GET /api/v1/users/me)
// - accessToken HttpOnly 쿠키 인증 필요. 로그인 상태 복원(세션 확인)에도 사용한다.
//   200 이면 로그인 상태, 401 이면 비로그인.
export const getMe = () => {
  // skipAuthRedirect: 비로그인 probe 라 401 이어도 인터셉터가 /login 으로 하드 리다이렉트하지 않게 한다.
  // (refresh 는 정상 수행 — 유효한 refresh 쿠키가 있으면 세션이 복원된다)
  return axiosInstance.get('/users/me', { skipAuthRedirect: true });
};

// 내 프로필 수정 (PATCH /api/v1/users/me)
// - docs: 내 프로필 정보 수정 — 닉네임/소속 회사명만 수정 가능 (name/phoneNumber/email 은 이 API 로 수정 불가)
// - PATCH 방식: nickname/companyName 중 변경된 필드만 body 에 담아 보낸다 (둘 다 없으면 400 INVALID_PROFILE_REQUEST)
// - 소속 회사 삭제: companyName 을 null 로 보내면 company_name 을 NULL 로 저장한다 (빈 문자열도 동일 처리)
// - nickname: 필수 아님(선택) + trim 후 VARCHAR(50), companyName: 선택 + trim 후 VARCHAR(100) — 백엔드 Service 검증
// - 닉네임 중복: DUPLICATE_NICKNAME(409), 프로필 미등록: PROFILE_NOT_FOUND(404)
export const updateProfile = (payload) => {
  return axiosInstance.patch('/users/me', payload);
};
