import { IdentityVerificationProvider } from './IdentityVerificationProvider';
import { completeIdentityVerification } from '@/api/identityVerification';

// Mock 본인인증 Provider
//
// - 실제 PASS 와 유사한 UX 를 위해 전송 시 최소 지연(로딩 상태 노출)을 흉내 낸다.
// - 이름/휴대폰 번호만 백엔드에 전송하고, 백엔드가 생성·발급한 identityVerificationId 응답만
//   신뢰한다 — 프론트가 ID 를 만들거나 임의로 성공 처리하지 않는다.
// - PortOne 연동 시 이 클래스와 동일한 시그니처의 PortOne Provider 로 교체한다.
const MIN_LATENCY_MS = 700;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockIdentityVerificationProvider extends IdentityVerificationProvider {
  async complete(payload) {
    await delay(MIN_LATENCY_MS);
    const { data } = await completeIdentityVerification(payload);
    return data;
  }
}
