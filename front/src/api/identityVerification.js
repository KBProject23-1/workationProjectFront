import axiosInstance from './axiosInstance';

// Mock PASS 본인인증 API (개발/테스트 전용)
//
// - 실제 PASS/PortOne 연동 전까지 본인인증 UX 를 제공하는 Mock API
// - identityVerificationId 는 프론트가 생성하지 않는다 — 백엔드 MockPassService 가 생성해
//   인증 성공 후 발급한다. 프론트는 발급받은 ID 만 보관해 후속 API(회원가입/아이디 찾기)에 전달한다.
// - axiosInstance 가 공통 응답 { status, message, data } 의 data 를 unwrap 하므로
//   소비 코드는 `const { data } = await ...` 후 실제 payload 를 받는다.
//
// 응답 data (카멜케이스):
// - complete → { identityVerificationId, status: 'VERIFIED' } (개인정보 미포함)

// Mock 본인인증 처리 — 이름/휴대폰 번호만 전송하면 백엔드가 세션 생성 + identityVerificationId 발급
// POST /api/v1/auth/pass
// body: { name, phoneNumber }
export const completeIdentityVerification = (payload) => {
  return axiosInstance.post('/auth/pass', payload);
};
