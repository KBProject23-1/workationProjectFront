import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useWalletStore } from '@/stores/walletStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { useIdempotencyKey } from '@/composables/useIdempotencyKey';
import { classifyPinError } from '@/utils/pinError';
import { setPinRegistered } from '@/utils/pinRegistry';
import { toast } from 'vue-sonner';

// 충전/환불 공통 결제 스텝 머신 + PIN 에러 분기.
// 'amount' → 'pin' → 'loading' → 'complete'
//
// action(accountId, amount, pinNumber, idempotencyKey) => Promise<resultData>
//   충전은 walletStore.charge, 환불은 walletStore.refund 를 넘긴다.
// options.failMessage: PIN 무관 실패(잔액/한도 등) 시 토스트 문구
// options.minLoadingMs: 처리 로딩 최소 노출 시간(ms) — mock API 가 즉시 응답해도 "처리되는 느낌" 유지
export function useWalletPinPayment(action, { failMessage, minLoadingMs = 900 } = {}) {
  const router = useRouter();
  const walletStore = useWalletStore();
  const { showError } = useErrorToast();
  const { keyFor, reset: resetIdempotencyKey } = useIdempotencyKey();

  const step = ref('amount');
  const result = ref(null);
  const isSubmitting = ref(false); // 더블클릭/재진입 방어
  const pending = ref(null); // 금액 단계에서 확정한 { accountId, amount }
  const pin = ref('');
  const pinError = ref('');

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function handleAmountNext(payload) {
    pending.value = payload;
    pin.value = '';
    pinError.value = '';
    step.value = 'pin';
  }

  async function handlePinComplete(pinNumber) {
    if (isSubmitting.value) return; // 더블클릭/재진입 방어
    isSubmitting.value = true;
    const { accountId, amount } = pending.value;
    // 같은 시도(금액·계좌 동일)의 재시도면 같은 멱등키 재사용 → 응답 유실 후 재시도 시 중복 처리 방지
    const idempotencyKey = keyFor(`${accountId}:${amount}`);
    step.value = 'loading';
    try {
      const [data] = await Promise.all([
        action(accountId, amount, pinNumber, idempotencyKey),
        delay(minLoadingMs),
      ]);
      result.value = data;
      resetIdempotencyKey(); // 성공 → 다음 시도는 새 키
      step.value = 'complete';
    } catch (err) {
      // 409 = 같은 멱등키로 이미 처리됨(이전 시도가 실제론 성공) → 성공으로 간주
      if (err.response?.status === 409) {
        await walletStore.fetchWallet();
        resetIdempotencyKey();
        toast.success('이미 처리된 요청이에요');
        router.push('/wallet');
        return;
      }
      const pinKind = classifyPinError(err);
      if (pinKind === 'REENTER') {
        // 정정 PIN 재시도는 새 시도 — 같은 멱등키 재사용 시 409 오success/replay 방지
        resetIdempotencyKey();
        pin.value = '';
        pinError.value = err.message || 'PIN이 올바르지 않아요';
        step.value = 'pin';
        return;
      }
      if (pinKind === 'LOCKED') {
        toast.error(err.message || 'PIN이 잠겼어요. PIN을 재설정해주세요.');
        router.push('/wallet');
        return;
      }
      if (pinKind === 'NOT_REGISTERED') {
        // 서버가 이 기기 PIN 을 모름 → 캐시 false 동기화 후 재설정 유도
        // (deviceId 는 기기 신원이라 유지, setup 이 기존 deviceId 재사용)
        setPinRegistered(false);
        toast.error('PIN을 다시 설정해주세요');
        router.push('/pin/setup');
        return;
      }
      // PIN 무관 실패(잔액/한도 등) → 금액 입력으로 복귀 (같은 금액 재시도 시 멱등키 유지)
      step.value = 'amount';
      showError(err, failMessage);
    } finally {
      isSubmitting.value = false;
    }
  }

  function handleConfirm() {
    router.push('/wallet');
  }

  return {
    step,
    result,
    isSubmitting,
    pending,
    pin,
    pinError,
    handleAmountNext,
    handlePinComplete,
    handleConfirm,
  };
}
