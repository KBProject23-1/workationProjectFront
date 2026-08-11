import axiosInstance from './axiosInstance';

// Mock PASS 본인인증 API (개발/테스트 전용)
//
// - 실제 PASS/PortOne 연동 전까지 본인인증 UX 를 제공하는 Mock API
// - 프론트가 생성한 identityVerificationId 를 백엔드로 전송하면 백엔드가 VERIFIED 세션을 등록한다.
//   이후 verify-identity(/auth/signup/verify-identity)는 VERIFIED 세션만 수용하므로
//   흐름을 건너뛰고 인증 ID 만 보내는 방식은 성립하지 않는다.
// - axiosInstance 가 공통 응답 { status, message, data } 의 data 를 unwrap 하므로
//   소비 코드는 `const { data } = await ...` 후 실제 payload 를 받는다.
//
// 응답 data (카멜케이스):
// - complete → { identityVerificationId, status: 'VERIFIED', name }

// Mock 인증 완료 등록 — 프론트가 생성한 identityVerificationId 를 백엔드로 전송
// POST /api/v1/auth/pass
// body: { identityVerificationId, name, phoneNumber }
export const completeIdentityVerification = (payload) => {
  return axiosInstance.post('/auth/pass', payload);
};
