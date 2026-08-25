import { computed, ref } from 'vue';
import { getIdentityVerificationProvider } from '@/identity';

// Mock PASS 본인인증 상태 머신 컴포저블
//
// 상태:
//   IDLE        본인인증 안내 + 'PASS 인증하기' 버튼
//   CARRIER     팝업 1 — 통신사 선택 + 약관 전체 동의 ('PASS로 인증하기' 활성화)
//   FORM        팝업 2 — 이름 / 휴대폰 번호 / 보안문자 입력 (PASS2 왼쪽 화면)
//   SUBMITTING  백엔드 전송 중 (중복 요청 방지)
//   SUCCESS     본인인증 완료
//   FAILURE     인증 실패 (원인 안내 + 재시도)
//   CANCELLED   사용자 취소 (팝업 닫힘 → 안내 화면 복귀)
//   DUPLICATE_USER  중복 회원 차단 — verify-identity(/auth/signup/verify-identity) 에서
//                   동일 휴대폰(CI) 가입 회원이 감지되면 회원가입 진행 불가 + 로그인 안내
//
// 원칙:
// - identityVerificationId 는 프론트가 생성하지 않는다 — 백엔드(POST /auth/pass)가 생성해 발급한다.
// - 프론트는 이름/휴대폰 번호만 전송하고, 발급받은 identityVerificationId 를 보관한다.
// - 인증 성공 여부는 백엔드가 결정한다. 프론트는 VERIFIED 응답만 신뢰하고 화면에 반영한다.
export const VERIFICATION_STATUS = Object.freeze({
  IDLE: 'IDLE',
  CARRIER: 'CARRIER',
  FORM: 'FORM',
  SUBMITTING: 'SUBMITTING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  CANCELLED: 'CANCELLED',
  DUPLICATE_USER: 'DUPLICATE_USER',
});

export function useIdentityVerification() {
  const status = ref(VERIFICATION_STATUS.IDLE);
  const identityVerificationId = ref('');
  const verifiedName = ref('');
  const errorMessage = ref('');
  const errorCode = ref('');
  const form = ref({ name: '', phoneNumber: '' });

  const provider = getIdentityVerificationProvider();

  const isBusy = computed(() => status.value === VERIFICATION_STATUS.SUBMITTING);

  // PASS 팝업이 열려 있는 상태 (통신사/약관 → 정보 입력)
  // - SUBMITTING 은 전체 화면 로딩으로 전환되므로 팝업에서 제외한다
  const isPopupOpen = computed(
    () =>
      status.value === VERIFICATION_STATUS.CARRIER ||
      status.value === VERIFICATION_STATUS.FORM,
  );

  function updateForm(patch) {
    form.value = { ...form.value, ...patch };
  }

  function setStatus(next) {
    status.value = next;
  }

  /** IDLE → CARRIER — 'PASS 인증하기' 클릭 시 팝업 1(통신사/약관) 오픈 */
  function start() {
    errorMessage.value = '';
    errorCode.value = '';
    setStatus(VERIFICATION_STATUS.CARRIER);
  }

  /** CARRIER → FORM — 통신사 선택 + 약관 전체 동의 후 'PASS로 인증하기' 클릭 */
  function confirmCarrier() {
    if (status.value !== VERIFICATION_STATUS.CARRIER) return;
    setStatus(VERIFICATION_STATUS.FORM);
  }

  /**
   * FORM → SUBMITTING → SUCCESS | FAILURE
   * - '확인' 클릭: 이름/휴대폰 번호만 백엔드(POST /auth/pass)로 전송하고,
   *   백엔드가 생성·발급한 identityVerificationId 를 보관한다.
   * - 성공 여부는 백엔드 VERIFIED 응답이 결정한다 (버튼 클릭만으로 성공 처리 금지).
   */
  async function submitVerification(payload) {
    if (status.value !== VERIFICATION_STATUS.FORM || isBusy.value) return;

    updateForm({ name: payload.name, phoneNumber: payload.phoneNumber });
    setStatus(VERIFICATION_STATUS.SUBMITTING);
    errorMessage.value = '';
    errorCode.value = '';

    try {
      // 백엔드가 identityVerificationId 를 생성해 발급한다 (프론트 생성/전송 금지)
      const result = await provider.complete({
        name: payload.name,
        phoneNumber: payload.phoneNumber,
      });
      identityVerificationId.value = result.identityVerificationId;
      verifiedName.value = result.name || payload.name;
      setStatus(VERIFICATION_STATUS.SUCCESS);
    } catch (err) {
      captureError(err, '본인인증에 실패했어요. 다시 시도해 주세요.');
      setStatus(VERIFICATION_STATUS.FAILURE);
    }
  }

  /** FAILURE → FORM — 다시 시도 (입력값 유지) */
  function retry() {
    errorMessage.value = '';
    errorCode.value = '';
    setStatus(VERIFICATION_STATUS.FORM);
  }

  /** CANCELLED — 팝업 닫힘/취소 → 안내 화면(IDLE 과 동일 렌더)으로 복귀 */
  function cancel() {
    clearFlowState();
    setStatus(VERIFICATION_STATUS.CANCELLED);
  }

  /**
   * PASS 인증 후 중복 회원(DUPLICATE_USER) 감지 — 회원가입 진행을 차단하고 안내 화면으로 전환
   * - verify-identity(/auth/signup/verify-identity) 에서 동일 휴대폰(CI) 가입 회원이
   *   발견되면 계정정보 입력으로 진행하지 못하도록 SUCCESS 이후에 호출한다.
   * @param message 서버가 반환한 안내 메시지 (없으면 기본 메시지 사용 — docs 와 동일 문구)
   */
  function setDuplicateUser(message) {
    errorCode.value = 'DUPLICATE_USER';
    errorMessage.value = message || '이미 가입된 회원입니다. 로그인을 진행해주세요.';
    setStatus(VERIFICATION_STATUS.DUPLICATE_USER);
  }

  /** 화면 표시용 이름 갱신 — verify-identity 응답(백엔드 복원 값)으로 확정한다 */
  function setVerifiedName(name) {
    if (name) verifiedName.value = name;
  }

  /** 전 상태 초기화 — IDLE 복귀 (계속하기 실패 등 흐름 재시작용) */
  function reset() {
    status.value = VERIFICATION_STATUS.IDLE;
    identityVerificationId.value = '';
    verifiedName.value = '';
    errorMessage.value = '';
    errorCode.value = '';
  }

  /** 에러 정보 수집 — 인터셉터가 message 를 서버 메시지로 치환하므로 errorCode 는 response 에서 읽는다 */
  function captureError(err, fallback) {
    errorMessage.value = err?.message || fallback;
    errorCode.value = err?.response?.data?.errorCode || '';
  }

  /** 취소/초기화 시 흐름 데이터 정리 (아직 백엔드 세션이 없으므로 별도 취소 API 불필요) */
  function clearFlowState() {
    identityVerificationId.value = '';
    verifiedName.value = '';
    errorMessage.value = '';
    errorCode.value = '';
  }

  return {
    // 상태
    status,
    identityVerificationId,
    verifiedName,
    errorMessage,
    errorCode,
    form,
    isBusy,
    isPopupOpen,
    // 액션
    updateForm,
    start,
    confirmCarrier,
    submitVerification,
    retry,
    cancel,
    setDuplicateUser,
    setVerifiedName,
    reset,
  };
}
