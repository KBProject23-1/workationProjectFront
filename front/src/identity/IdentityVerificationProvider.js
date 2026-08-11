// 본인인증 Provider 계약 (추상 베이스)
//
// - 실제 PASS 본인인증(현재는 Mock)의 공통 인터페이스 역할을 한다.
// - 나중에 PortOne V2 본인인증으로 교체할 때는 동일 시그니처의
//   PortOneIdentityVerificationProvider 를 구현하고 팩토리(index.js)만 분기하면 된다.
//   페이지/컴포저블 코드는 수정하지 않는다.
//
// 원칙 (Mock 에서도 동일):
// - 인증 성공 여부를 프론트가 결정하지 않는다.
// - 모든 인증 상태 변경/판정은 백엔드 API 응답을 신뢰한다.
export class IdentityVerificationProvider {
  /**
   * Mock 인증 완료 등록 — 프론트가 생성한 identityVerificationId 를 백엔드로 전송
   * @param payload {{ identityVerificationId: string, name: string, phoneNumber: string }}
   * @returns { identityVerificationId, status: 'VERIFIED', name }
   */
  async complete(_payload) {
    throw new Error('Not implemented');
  }
}
