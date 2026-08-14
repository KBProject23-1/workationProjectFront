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

// 내 비밀번호 변경 (PATCH /api/v1/users/me/password)
// - docs: 로그인 후 비밀번호 변경 — 현재 비밀번호(currentPassword) 확인 후 새 비밀번호(newPassword)로 변경
// - 로그인 사용자 전용 (accessToken HttpOnly Cookie 인증) — 상태 변경(PATCH)이므로 CSRF Header 적용
// - 변경 성공 후에도 로그인 세션(인증 Cookie)이 유지된다 — Access/Refresh Token Cookie 를 삭제·재발급하지 않음
// - 비밀번호 원문은 토큰/세션과 무관하게 Request Body 로만 전달한다 (Pinia/localStorage 저장 금지)
// - 현재 비밀번호 불일치: AUTH_INVALID_PASSWORD(400), 동일 비밀번호: AUTH_SAME_PASSWORD(400),
//   약한 비밀번호: WEAK_PASSWORD(422), 필수 값 누락: INVALID_PASSWORD_CHANGE_REQUEST(400),
//   회원 없음: USER_NOT_FOUND(404)
export const changePassword = (payload) => {
  return axiosInstance.patch('/users/me/password', payload);
};

// 내 휴대폰 번호 변경 (PATCH /api/v1/users/me/phone)
// - docs: 휴대폰 번호 변경 — Mock PASS 인증(POST /auth/pass) 완료 후 백엔드가 발급한
//   identityVerificationId 만 전달한다. 변경할 휴대폰 번호(phoneNumber)는 보내지 않는다
//   (백엔드가 identityVerificationId 기준 PASS 인증 결과에서 인증된 번호를 조회해 변경 —
//    프론트가 전달한 번호는 신뢰하지 않는다).
// - identityVerificationId 는 백엔드가 발급한 값만 사용한다 (프론트 임의 생성 금지)
// - 성공: data { updatedPhone } (PASS 인증으로 변경된 휴대폰 번호)
// - 실패: INVALID_VERIFICATION_ID(400) / VERIFICATION_FAILED(400) / PHONE_SAME_AS_CURRENT(400) /
//   PHONE_ALREADY_IN_USE(409) / USER_ALREADY_WITHDRAWN(409) / USER_NOT_FOUND(404)
export const changePhone = (payload) => {
  return axiosInstance.patch('/users/me/phone', payload);
};

// 계정 설정 진입용 비밀번호 재인증 (POST /api/v1/users/me/account/verify)
// - docs: 계정 설정 진입용 비밀번호 재인증 — 로그인 사용자가 계정 설정 화면에 진입하기 전
//   현재 비밀번호(password)를 한 번 더 입력하여 본인임을 확인한다
// - 재인증 성공 여부는 Redis/DB/Session 에 저장하지 않으며 Access/Refresh Token 도 재발급하지 않는다
//   → 성공 여부는 프론트 인메모리에서만 유지한다 (localStorage/Pinia 장기 저장 금지)
// - 비밀번호 불일치: AUTH_INVALID_PASSWORD(400), 이미 탈퇴: USER_ALREADY_WITHDRAWN(409),
//   회원 없음: USER_NOT_FOUND(404), password 누락: COMMON_INVALID_REQUEST(400)
export const verifyAccountPassword = (password) => {
  return axiosInstance.post('/users/me/account/verify', { password });
};
