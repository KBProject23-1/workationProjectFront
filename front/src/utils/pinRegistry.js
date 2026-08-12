import { getDeviceId } from '@/utils/device';

// 이 기기에서 PIN 이 등록됐는지 여부(디바이스 단위 불리언 캐시).
//
// PIN 등록의 진실은 서버((userId, deviceId) 조합)다. 매 네비게이션마다 서버에 물을 순 없으니
// 라우터 가드가 참조할 캐시를 둔다. 항상 서버 신호로 동기화한다:
//   - 로그인 응답 pinSetupRequired 로 매 로그인마다 재seed(=현재 유저+기기 기준 authoritative)
//   - PIN 설정 성공/이미등록(409) → true
//   - 거래 시 미등록(NOT_REGISTERED) → false
//
// userId 로 키를 잡지 않는 이유: 로그인 응답엔 userId, GET /users/me 엔 email 만 있어
// 로그인↔새로고침 사이 공통 키가 없다. 대신 "매 로그인마다 재seed"로 현재 유저 기준 정확성을 얻는다.
// deviceId 와 함께 저장해 deviceId 가 바뀌면(=다른 기기 신원) 캐시를 자동 무효화한다.
const KEY = 'pinRegistered';

export function isPinRegistered() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    return !!parsed && parsed.deviceId === getDeviceId() && parsed.registered === true;
  } catch {
    return false;
  }
}

export function setPinRegistered(registered) {
  localStorage.setItem(
    KEY,
    JSON.stringify({ deviceId: getDeviceId(), registered: !!registered }),
  );
}
