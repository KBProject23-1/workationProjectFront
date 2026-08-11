import { MockIdentityVerificationProvider } from './MockIdentityVerificationProvider';

// 본인인증 Provider 팩토리
//
// - 현재는 MockIdentityVerificationProvider 만 존재한다.
// - 추후 PortOne V2 본인인증 연동 시 PortOneIdentityVerificationProvider 를 추가하고
//   이 팩토리에서 분기만 하면 페이지/컴포저블 코드는 수정하지 않는다.
let provider = null;

export function getIdentityVerificationProvider() {
  if (!provider) {
    provider = new MockIdentityVerificationProvider();
  }
  return provider;
}
