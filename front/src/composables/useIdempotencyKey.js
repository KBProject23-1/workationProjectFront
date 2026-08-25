import { ref } from 'vue';
import { generateUuid } from '@/utils/uuid';

// 멱등키(idempotencyKey) 생명주기 관리.
// - 같은 시도(signature 동일)의 재시도면 같은 키를 재사용 → 네트워크 응답 유실 후
//   재시도하거나 더블클릭해도 BE 가 중복 요청으로 인식해 중복 처리(중복 충전/환불)를 막는다.
// - 성공하면 reset() 을 호출해 다음 시도엔 새 키가 발급되도록 한다.
export function useIdempotencyKey() {
  const key = ref(null);
  let signature = null;

  // signature 가 바뀌면(=다른 금액/계좌의 새 시도) 새 키, 같으면 기존 키 재사용
  function keyFor(sig) {
    if (key.value === null || signature !== sig) {
      key.value = generateUuid();
      signature = sig;
    }
    return key.value;
  }

  function reset() {
    key.value = null;
    signature = null;
  }

  return { keyFor, reset };
}
