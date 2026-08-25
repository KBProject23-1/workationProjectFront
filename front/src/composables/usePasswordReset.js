import { ref } from 'vue';
import {
  checkPasswordResetId,
  verifyPasswordReset,
  resetPassword,
} from '@/api/auth';

// 비밀번호 재설정 플로우 상태 머신 컴포저블
//
// 흐름: 아이디 확인(LOGIN_ID) → PASS 본인인증(PASS) → 계정 확인(VERIFYING)
//       → 새 비밀번호 입력(NEW_PASSWORD) → 완료(COMPLETE) → /login
//
// - 비밀번호 찾기를 누르면 첫 화면(LOGIN_ID)에서 아이디를 입력하고,
//   POST /auth/password/check-id 로 DB 존재 여부를 확인한다.
//   존재하는 ACTIVE 회원만 PASS 본인인증 단계로 진행한다.
//
// 상태:
//   LOGIN_ID      아이디 확인(첫 화면) — 이메일 또는 휴대폰 번호 입력 + DB 존재 확인
//   PASS          PASS 본인인증 — 기존 useIdentityVerification 컴포저블을 그대로 재사용한다
//   VERIFYING     계정 확인 — POST /auth/password/verify 호출 (loginId + identityVerificationId)
//   NEW_PASSWORD  새 비밀번호 입력 — PATCH /auth/password/reset 호출 (5분 유효시간 카운트다운 표시)
//   COMPLETE      완료 — 토큰 미발급, /login 으로 이동해 새 비밀번호로 로그인
//
// 보안 규칙 (knowledgeFront.md):
// - Access/Refresh Token 을 사용하지 않는다 — 비밀번호 재설정 과정에서 JWT 를 발급/저장하지 않는다.
// - loginId / identityVerificationId / passwordResetToken 은 메모리 상태로만 보관한다
//   (localStorage/sessionStorage 저장 금지 — 새로고침 시 처음부터 다시 진행).
// - 비밀번호 원문은 절대 보관하지 않는다 (변경 요청 시점에만 일시 사용 후 즉시 폐기).
// - 상태 변경 요청은 axiosInstance(CSRF 처리 포함)를 그대로 사용한다.
//
// 계정 확인 단계 오류 분류 (에러 코드 → 화면 안내):
//   USER_NOT_FOUND(404)          → '비밀번호를 재설정할 수 있는 계정을 찾을 수 없습니다.'
//   VERIFICATION_FAILED(400)     → 입력한 계정과 본인인증(PASS) 정보 불일치 (서버 메시지 표시)
//   INVALID_VERIFICATION_ID(400) → PASS 인증 세션 만료/무효 → 인증 다시 진행 안내
//   그 외(네트워크/5xx)          → 공통 에러 토스트 + 처음부터 재시작

export const PASSWORD_RESET_STEP = Object.freeze({
  LOGIN_ID: 'LOGIN_ID',
  PASS: 'PASS',
  VERIFYING: 'VERIFYING',
  NEW_PASSWORD: 'NEW_PASSWORD',
  COMPLETE: 'COMPLETE',
});

// 계정 확인(POST /auth/password/verify) 실패 종류 — 페이지가 안내 화면을 구분하기 위해 사용
export const ACCOUNT_CHECK_ERROR = Object.freeze({
  NONE: 'NONE',
  USER_NOT_FOUND: 'USER_NOT_FOUND',             // 404 — 재설정 가능한 계정 없음
  VERIFICATION_MISMATCH: 'VERIFICATION_MISMATCH', // 400 — 계정 정보와 본인인증 정보 불일치
  VERIFICATION_EXPIRED: 'VERIFICATION_EXPIRED',   // 400 — PASS 인증 세션 만료/무효
});

export function usePasswordReset() {
  // ---------- 플로우 상태 (전부 메모리 전용 — 새로고침 시 초기화) ----------
  // 첫 화면 = 아이디 확인 (시작 화면 없음 — 비밀번호 찾기 클릭 시 바로 아이디 입력)
  const step = ref(PASSWORD_RESET_STEP.LOGIN_ID);
  // 사용자가 입력한 로그인 ID (이메일 또는 휴대폰 번호)
  const loginId = ref('');
  // PASS 본인인증(POST /auth/pass) 성공 시 백엔드가 발급한 인증 고유 번호
  const identityVerificationId = ref('');
  // 계정 확인(POST /auth/password/verify) 성공 시 발급된 5분 TTL 1회성 토큰
  const passwordResetToken = ref('');
  // passwordResetToken 만료 시각 (epoch millis — 백엔드 응답, 카운트다운 표시 기준)
  const expiresAt = ref(0);

  // ---------- 로딩 / 오류 상태 ----------
  // 아이디 존재 확인(POST /auth/password/check-id) 호출 중
  const isCheckingId = ref(false);
  const isVerifyingAccount = ref(false);
  const isChangingPassword = ref(false);
  // 계정 확인 단계의 실패 종류 (NONE 이면 정상 진행 중)
  const accountCheckError = ref(ACCOUNT_CHECK_ERROR.NONE);
  // 계정 확인 실패 시 서버가 내려준 안내 메시지 (분류된 오류에서만 보관)
  const accountErrorMessage = ref('');

  function goToStep(next) {
    step.value = next;
  }

  /** PASS 인증 성공 결과(identityVerificationId)를 메모리에 보관한다 — 프론트 생성 금지 */
  function setVerified(identityVerificationIdFromPass) {
    identityVerificationId.value = identityVerificationIdFromPass;
  }

  /**
   * 아이디 존재 확인 — 첫 화면(LOGIN_ID)에서 입력한 아이디가 DB 에 있는 ACTIVE 회원인지 확인한다.
   * 성공: true 반환 (PASS 본인인증 단계로 진행)
   * USER_NOT_FOUND: false 반환 (페이지가 입력 화면에 '계정 없음' 인라인 오류 표시)
   * 그 외(네트워크/5xx): err 를 그대로 던진다 — 페이지가 공통 토스트로 처리
   */
  async function checkAccountId() {
    isCheckingId.value = true;
    try {
      await checkPasswordResetId(loginId.value);
      return true;
    } catch (err) {
      if (err?.response?.data?.errorCode === 'USER_NOT_FOUND') {
        return false;
      }
      throw err;
    } finally {
      isCheckingId.value = false;
    }
  }

  /**
   * 계정 확인 — PASS 인증 완료 후 loginId + identityVerificationId 로 호출한다.
   * 성공: passwordResetToken 과 expiresAt(만료 시각) 을 메모리에 보관하고 true 반환
   *       (새 비밀번호 입력 단계로 이동 — 5분 카운트다운은 expiresAt 기준)
   * 실패: accountCheckError 에 분류 결과를 기록하고 false 반환 (페이지가 안내 화면을 렌더링)
   */
  async function checkAccount() {
    isVerifyingAccount.value = true;
    accountCheckError.value = ACCOUNT_CHECK_ERROR.NONE;
    try {
      const { data } = await verifyPasswordReset(
        loginId.value,
        identityVerificationId.value,
      );
      passwordResetToken.value = data.passwordResetToken;
      // expiresAt 미포함(구버전 백엔드) 대비 — 기본 5분으로 보정
      expiresAt.value = data.expiresAt || Date.now() + 5 * 60 * 1000;
      return true;
    } catch (err) {
      const code = err?.response?.data?.errorCode;
      if (code === 'USER_NOT_FOUND') {
        accountCheckError.value = ACCOUNT_CHECK_ERROR.USER_NOT_FOUND;
      } else if (code === 'VERIFICATION_FAILED') {
        accountCheckError.value = ACCOUNT_CHECK_ERROR.VERIFICATION_MISMATCH;
      } else if (code === 'INVALID_VERIFICATION_ID') {
        accountCheckError.value = ACCOUNT_CHECK_ERROR.VERIFICATION_EXPIRED;
      } else {
        // 그 외(네트워크/5xx 등)는 공통 토스트 처리를 위해 err 를 그대로 다시 던진다
        throw err;
      }
      accountErrorMessage.value = err?.message || '';
      return false;
    } finally {
      isVerifyingAccount.value = false;
    }
  }

  /**
   * 새 비밀번호 변경 — passwordResetToken + newPassword 로 PATCH /auth/password/reset 호출
   * 성공: COMPLETE 단계로 이동 (토큰/비밀번호 메모리 정리 — 자동 로그인 없음)
   * 실패: err 를 그대로 던진다 — 페이지가 에러 코드별로 처리한다
   *       (RESET_TIMEOUT_OR_INVALID_TOKEN → 처음부터, WEAK_PASSWORD → 필드 오류, 그 외 → 토스트)
   */
  async function changePassword(newPassword) {
    isChangingPassword.value = true;
    try {
      await resetPassword(passwordResetToken.value, newPassword);
      // 1회성 토큰은 사용 완료 — 메모리에서 즉시 정리 (비밀번호 원문은 어디에도 보관하지 않는다)
      passwordResetToken.value = '';
      goToStep(PASSWORD_RESET_STEP.COMPLETE);
    } finally {
      isChangingPassword.value = false;
    }
  }

  /** 플로우 전체 초기화 — 첫 화면(LOGIN_ID)부터 다시 진행 */
  function resetFlow() {
    step.value = PASSWORD_RESET_STEP.LOGIN_ID;
    loginId.value = '';
    identityVerificationId.value = '';
    passwordResetToken.value = '';
    expiresAt.value = 0;
    isCheckingId.value = false;
    accountCheckError.value = ACCOUNT_CHECK_ERROR.NONE;
    accountErrorMessage.value = '';
  }

  /** 계정 확인 실패 후 특정 단계로 재시작 (민감 상태는 유지하지 않는다) */
  function restartFrom(stepName) {
    passwordResetToken.value = '';
    accountCheckError.value = ACCOUNT_CHECK_ERROR.NONE;
    accountErrorMessage.value = '';
    step.value = stepName;
  }

  return {
    // 상태
    step,
    loginId,
    identityVerificationId,
    passwordResetToken,
    expiresAt,
    isCheckingId,
    isVerifyingAccount,
    isChangingPassword,
    accountCheckError,
    accountErrorMessage,
    // 액션
    goToStep,
    setVerified,
    checkAccountId,
    checkAccount,
    changePassword,
    resetFlow,
    restartFrom,
  };
}
