import axios from 'axios';
import axiosInstance from './axiosInstance';

// 로그인. loginType 에 따라 필요한 필드가 다르다
// PASSWORD -> loginId(이메일/휴대폰) + password + deviceId(선택) / PIN -> pinNumber + deviceId
//
// 응답의 token_info 는 snake_case 다. 다른 API 와 달리 인증 스펙을 그대로 따른다
// data: { userId, name, pinSetupRequired, token_info: { grant_type, access_token, access_token_expires_in } }
// - pinSetupRequired: 기기 최초 로그인(deviceId 미등록) 여부 → 로그인 화면에서 PIN 등록 유도 분기
export const login = (payload) => {
  return axiosInstance.post('/auth/login', payload);
};

// 액세스 토큰 재발급
// refreshToken 은 HttpOnly 쿠키로만 오가므로 본문이 없다.
//
// axiosInstance 를 쓰면 이 요청의 401 이 다시 인터셉터를 타서 무한루프가 되므로
// 인터셉터가 없는 별도 인스턴스로 보낸다.
export const refresh = () => {
  return axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/refresh`,
    null,
    { withCredentials: true },
  );
};

// 로그아웃. 서버가 refreshToken 쿠키를 즉시 만료시킨다
export const logout = () => {
  return axiosInstance.post('/auth/logout');
};

// 회원가입 및 서비스 내에서 사용할 약관 목록과 본문 내용 조회
// GET /api/v1/auth/terms
export const getTerms = () => {
  return axiosInstance.get('/auth/terms');
};

// 아이디 찾기 — PASS 본인인증 기반 가입 이메일(로그인 ID) 조회
// POST /api/v1/auth/find-id
// body: { identityVerificationId }
// - 이름/휴대폰 번호는 전달하지 않는다 (백엔드가 CI 로 가입 회원 조회)
// - 이메일은 백엔드가 마스킹하여 반환한다 (프론트 마스킹 불필요)
// - data: { email: 'user****@example.com', createdAt: '2026-07-24' }
export const findId = (identityVerificationId) => {
  return axiosInstance.post('/auth/find-id', { identityVerificationId });
};

// 회원가입 이메일 중복 확인
// GET /api/v1/auth/signup/check-email?email=...
// 중복이어도 200 SUCCESS — data.available 로 판단한다 (false = 사용 불가)
export const checkEmailAvailability = (email) => {
  return axiosInstance.get('/auth/signup/check-email', {
    params: { email },
  });
};

// 최종 회원가입 완료 (DB 최종 저장 + 자동 로그인)
// POST /api/v1/auth/signup
// body: { identityVerificationId, email, password, agreedTermsIds }
// - identityVerificationId 는 POST /auth/pass 에서 백엔드가 발급한 값 (프론트 생성 금지)
// - name/phoneNumber/ci 는 전송하지 않는다 (백엔드가 Redis 세션에서 복원)
// - 닉네임은 백엔드가 기본값(워케이너{userId})으로 자동 생성한다 (닉네임 입력 기능 제거)
// - 성공 시 Backend가 ACCESS_TOKEN / REFRESH_TOKEN HttpOnly Cookie 를 발급한다 (자동 로그인)
// - Access Token/Refresh Token 을 JavaScript에서 읽거나 저장하지 않는다 (Cookie 기반)
// - data: { userId, name, token_info }
export const signup = (payload) => {
  return axiosInstance.post('/auth/signup', payload);
};

// PIN 번호 최초 설정 (로그인 사용자 전용 — Cookie 기반 인증)
// POST /api/v1/auth/me/pin
// body: { pinNumber, deviceId, deviceName }
export const setupPin = (payload) => {
  return axiosInstance.post('/auth/me/pin', payload);
};
