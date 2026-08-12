import { generateUuid } from '@/utils/uuid';

// 이 브라우저(기기)를 식별하는 deviceId 관리.
//
// 불변식: "localStorage 에 deviceId 존재" ⟺ "이 기기에서 PIN 등록 완료".
// 그래서 getDeviceId() 는 자동 생성하지 않는다. 값 발급은 PIN 설정 플로우에서만
// issueDeviceId() 로 하고, 서버 등록 성공 후 persistDeviceId() 로 확정 저장한다.
const DEVICE_ID_KEY = 'deviceId';

// 저장된 deviceId. 없으면 null(= 아직 이 기기에서 PIN 미등록).
export function getDeviceId() {
  return localStorage.getItem(DEVICE_ID_KEY);
}

// 이 기기가 PIN 을 등록했는지 여부. 로그인 후 라우팅 가드에서 사용.
export function hasDeviceId() {
  return getDeviceId() !== null;
}

// PIN 설정 시 새 deviceId 후보를 발급한다(아직 저장하지 않음).
// 서버 등록(setupPin)이 성공하면 persistDeviceId() 로 확정한다.
export function issueDeviceId() {
  return generateUuid();
}

// PIN 설정 성공 후 deviceId 를 확정 저장한다.
export function persistDeviceId(deviceId) {
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
}

// deviceId 는 기기 신원이라 평소엔 지우지 않는다(로그아웃/재접속에도 유지).
export function clearDeviceId() {
  localStorage.removeItem(DEVICE_ID_KEY);
}
