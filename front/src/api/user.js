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

// 이메일 인증번호 발송 (POST /api/v1/users/me/email/verification)
// - docs: 이메일 인증번호 발송 — 이메일 변경 전, 변경할 새 이메일(email)로 인증번호를 발송한다
//   (실제 이메일은 발송하지 않으며 Mock 방식으로 서버가 인증번호를 생성/임시 저장)
// - payload: { email } — 인증번호를 받을 변경 예정 이메일
// - 성공: data { email } (발송한(정규화된) 이메일 — 인증번호는 응답에 포함하지 않는다)
// - 실패: INVALID_EMAIL_REQUEST(400) / EMAIL_SAME_AS_CURRENT(400) / EMAIL_ALREADY_IN_USE(409) /
//   USER_ALREADY_WITHDRAWN(409) / USER_NOT_FOUND(404) / EMAIL_VERIFICATION_SEND_FAILED(500)
export const sendEmailVerification = (payload) => {
  return axiosInstance.post('/users/me/email/verification', payload);
};

// 이메일 인증번호 확인 (POST /api/v1/users/me/email/verification/confirm)
// - docs: 이메일 인증번호 확인 — 발송된 인증번호가 올바른지 확인하고, 성공 시 서버가 해당 이메일을
//   인증 완료 상태(VERIFIED)로 저장한다 (실제 이메일 변경은 별도 PATCH /users/me/email 에서 처리)
// - payload: { email, verificationCode } — 발송받은 이메일 + 6자리 인증번호
// - 성공: data { verified } (성공 시 true)
// - 실패: INVALID_EMAIL_REQUEST(400) / EMAIL_VERIFICATION_CODE_INVALID(400) /
//   EMAIL_VERIFICATION_NOT_FOUND(400) / EMAIL_VERIFICATION_CODE_EXPIRED(400) /
//   EMAIL_ALREADY_VERIFIED(400) / USER_ALREADY_WITHDRAWN(409) / USER_NOT_FOUND(404)
export const confirmEmailVerification = (payload) => {
  return axiosInstance.post('/users/me/email/verification/confirm', payload);
};

// 내 이메일 변경 (PATCH /api/v1/users/me/email)
// - docs: 이메일 변경 — Request Body 를 받지 않는다. 인증번호 확인(confirm)으로 인증 완료된 이메일을
//   서버가 EmailVerificationStore 에서 조회해 변경한다 (프론트가 이메일을 다시 전송하지 않는다)
// - 성공: data { updatedEmail } (인증 완료되어 변경된 이메일)
// - 실패: EMAIL_VERIFICATION_REQUIRED(400) / EMAIL_SAME_AS_CURRENT(400) /
//   EMAIL_ALREADY_IN_USE(409) / USER_ALREADY_WITHDRAWN(409) / USER_NOT_FOUND(404)
export const changeEmail = () => {
  return axiosInstance.patch('/users/me/email');
};

// 회원 탈퇴 (DELETE /api/v1/users/me)
// - docs: 회원 탈퇴 — 현재 비밀번호(password) 재확인으로 본인 인증(민감 작업 추가 인증) 후 Soft Delete 처리
// - body: { password } — 현재 사용 중인 비밀번호 원문 (Request Body 로만 전달, 저장 금지)
// - 탈퇴 성공 시 백엔드가 accessToken/refreshToken Cookie 를 즉시 만료(Max-Age=0) 처리한다
//   (프론트에서 Token Cookie 를 직접 삭제하지 않는다 — HttpOnly Cookie, JavaScript 접근 금지)
// - DELETE 상태 변경 메서드이므로 CSRF Header(X-XSRF-TOKEN)는 인터셉터가 자동 적용한다
// - 비밀번호 불일치: AUTH_INVALID_PASSWORD(400), 잔액 잔존: WALLET_BALANCE_REMAINING(409),
//   이미 탈퇴: USER_ALREADY_WITHDRAWN(409), 회원 없음: USER_NOT_FOUND(404),
//   password 누락: COMMON_INVALID_REQUEST(400)
export const withdrawAccount = (password) => {
  return axiosInstance.delete('/users/me', { data: { password } });
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
