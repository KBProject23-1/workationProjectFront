import { generateUuid } from '@/utils/uuid';

// deviceId = 이 브라우저(기기)의 신원 = 기기 설치 ID.
//
// - 첫 접근 시 1회 생성해 localStorage 에 영구 저장하고, 이후(로그인마다 포함) 같은 값을 재사용한다.
//   절대 매번 재생성하지 않는다.
// - PIN 등록 여부와는 무관하다. "이 유저가 이 기기에 PIN 등록했나"는 서버 진실(로그인 응답
//   pinSetupRequired) + pinRegistry 캐시로 판단한다. deviceId 는 그저 "어느 기기인가"만 나타낸다.
// - BE 는 (userId, deviceId)로 PIN 을 저장/검증하고, 로그인 요청의 deviceId 로 기기 등록 여부를 판별한다.
const DEVICE_ID_KEY = 'deviceId';

// 저장된 deviceId 를 반환한다. 없으면 새로 발급·저장 후 반환(기기 설치 ID).
export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = generateUuid();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// deviceId 는 기기 신원이라 평소엔 지우지 않는다(로그아웃/재접속에도 유지).
// 명시적 기기 등록 해제 같은 특수 상황에서만 사용하는 유틸.
export function clearDeviceId() {
  localStorage.removeItem(DEVICE_ID_KEY);
}
