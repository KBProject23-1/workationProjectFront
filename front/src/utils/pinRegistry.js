import { getDeviceId } from '@/utils/device';

// 이 기기에서 PIN 을 등록한 userId 목록(클라 캐시).
//
// PIN 등록의 진실은 서버((userId, deviceId) 조합)지만, 매 네비게이션마다 서버에 물을 순 없으니
// 가드가 참조할 캐시를 둔다. 서버 응답으로 항상 동기화한다:
//   - 등록 성공/이미등록(409) → markPinRegistered
//   - 거래 시 미등록(NOT_REGISTERED) → unmarkPinRegistered
//
// deviceId 와 함께 저장해 deviceId 가 바뀌면(=다른 기기 신원) 캐시를 자동 무효화한다.
const KEY = 'pinRegisteredUsers';

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    if (
      parsed &&
      parsed.deviceId === getDeviceId() &&
      Array.isArray(parsed.userIds)
    ) {
      return parsed;
    }
  } catch {
    // 파싱 실패 시 초기화
  }
  return { deviceId: getDeviceId(), userIds: [] };
}

function write(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function isPinRegistered(userId) {
  return read().userIds.includes(userId);
}

export function markPinRegistered(userId) {
  const state = read();
  if (!state.userIds.includes(userId)) {
    state.userIds.push(userId);
    write(state);
  }
}

export function unmarkPinRegistered(userId) {
  const state = read();
  const idx = state.userIds.indexOf(userId);
  if (idx !== -1) {
    state.userIds.splice(idx, 1);
    write(state);
  }
}
