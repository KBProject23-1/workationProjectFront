<script setup>
// 비밀번호 재설정 화면 — /password-reset (비로그인 공개 경로)
//
// 흐름: 아이디 확인(LOGIN_ID) → PASS 본인인증(PASS) → 계정 확인(VERIFYING)
//       → 새 비밀번호 입력(NEW_PASSWORD) → 완료(COMPLETE) → /login
//
// - 로그인 화면의 '비밀번호 찾기' 버튼으로 진입하면 첫 화면에서 아이디를 입력한다.
// - 아이디 존재 확인: POST /auth/password/check-id 로 DB 에 있는 ACTIVE 회원인지 확인한 뒤
//   존재하면 PASS 본인인증 단계로 진행한다 (없으면 아이디 입력 화면에 안내).
// - PASS 본인인증은 기존 회원가입/아이디 찾기와 동일한 구조(useIdentityVerification +
//   Mock Provider + PassCarrierSelect/PassAuthForm 팝업)를 그대로 재사용한다.
// - 계정 확인: PASS 인증 완료 후 POST /auth/password/verify (loginId + identityVerificationId)
//   → 5분 TTL passwordResetToken + expiresAt 발급 → PATCH /auth/password/reset
//   (passwordResetToken + newPassword)
// - 비밀번호 변경 화면에는 expiresAt 기준 5분 유효시간 카운트다운(남은 시간) 을 표시한다.
// - 보안 규칙 (knowledgeFront.md):
//   * Access/Refresh Token 을 사용하지 않는다 — JWT 발급/저장/전송 없음, 자동 로그인 없음.
//   * loginId / identityVerificationId / passwordResetToken 은 컴포저블 메모리로만 보관
//     (localStorage/sessionStorage 저장 금지 — 새로고침 시 처음부터 다시 진행).
//   * 비밀번호 원문은 변경 요청 시점에만 일시 사용 후 즉시 정리한다.
//   * 상태 변경 요청은 axiosInstance(CSRF 처리 포함)를 그대로 사용한다.
// - 비밀번호 validation 은 회원가입(SignupPage)과 동일한 정책을 재사용한다.
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import {
  Check,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Mail,
  Phone,
  XCircle,
} from '@lucide/vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import { useErrorToast } from '@/composables/useErrorToast';
import {
  usePasswordReset,
  PASSWORD_RESET_STEP,
  ACCOUNT_CHECK_ERROR,
} from '@/composables/usePasswordReset';
import {
  useIdentityVerification,
  VERIFICATION_STATUS,
} from '@/composables/useIdentityVerification';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import IdentityVerificationIntro from '@/components/identity/IdentityVerificationIntro.vue';
import IdentityVerificationFailure from '@/components/identity/IdentityVerificationFailure.vue';
import PassCarrierSelect from '@/components/identity/PassCarrierSelect.vue';
import PassAuthForm from '@/components/identity/PassAuthForm.vue';

const router = useRouter();
const { showError } = useErrorToast();

// PASS 본인인증 상태 (기존 회원가입/아이디 찾기와 동일한 컴포저블 재사용)
const verification = useIdentityVerification();
const { status, isBusy, isPopupOpen, identityVerificationId, errorMessage, form } = verification;

// 비밀번호 재설정 플로우 상태 (메모리 전용)
const passwordReset = usePasswordReset();
const {
  step,
  loginId,
  expiresAt,
  isCheckingId,
  isVerifyingAccount,
  isChangingPassword,
  accountCheckError,
  accountErrorMessage,
} = passwordReset;

// ---------- 아이디 확인(LOGIN_ID) ----------
const loginIdError = ref('');

// 아이디가 이메일 형식인지 자동 판별 ('@' 포함 여부 — 백엔드 findUserByLoginId 와 동일 규칙)
const isEmail = computed(() => loginId.value.includes('@'));

// 순수 숫자(또는 빈 값)만 입력된 상태 — 휴대폰 번호로 간주
const isPhoneDigits = computed(
  () => /^\d*$/.test(loginId.value) && loginId.value.length <= 11,
);

// 휴대폰 입력은 010-0000-0000 형식으로 표기한다 (저장값은 하이픈 없는 숫자)
function formatPhone(digits) {
  const d = (digits || '').replace(/\D/g, '');
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
}

// 표시용 값 — 이메일은 그대로, 순수 숫자(휴대폰)는 3-4-4 포맷
const loginIdDisplay = computed(() => {
  if (isEmail.value) return loginId.value;
  return isPhoneDigits.value ? formatPhone(loginId.value) : loginId.value;
});

function handleLoginIdInput(value) {
  if (value.includes('@')) {
    loginId.value = value;
  } else if (/^[\d-]*$/.test(value)) {
    // 휴대폰 — 숫자(하이픈 포함)만 허용, 하이픈은 표시용
    loginId.value = value.replace(/\D/g, '');
  } else {
    // 문자 포함 → 이메일 입력 중이므로 원문 유지
    loginId.value = isPhoneDigits.value ? value.replace(/-/g, '') : value;
  }
  if (loginIdError.value) loginIdError.value = '';
}

// 입력 중 캐럿 위치 복원 — 휴대폰 자동 하이픈 포맷팅으로 인한 캐럿 점프 방지 (LoginPage 와 동일)
function restoreCaretAfterFormat(event) {
  const el = event.target;
  if (!/^[\d-]*$/.test(el.value)) return;
  const rawCaret = el.selectionStart;
  if (typeof rawCaret !== 'number') return;

  let digitsBefore = 0;
  for (let i = 0; i < rawCaret && i < el.value.length; i += 1) {
    if (/\d/.test(el.value[i])) digitsBefore += 1;
  }

  setTimeout(() => {
    if (document.activeElement !== el) return;
    if (digitsBefore === 0) {
      el.setSelectionRange(0, 0);
      return;
    }
    let seen = 0;
    let caret = el.value.length;
    for (let i = 0; i < el.value.length; i += 1) {
      if (/\d/.test(el.value[i])) {
        seen += 1;
        if (seen === digitsBefore) {
          caret = i + 1;
          break;
        }
      }
    }
    el.setSelectionRange(caret, caret);
  }, 0);
}

// 로그인 화면과 동일한 아이디 검증 (이메일 또는 휴대폰 11자리)
function validateLoginId(value) {
  if (!value.trim()) return '아이디(이메일 또는 휴대폰 번호)를 입력해 주세요.';
  if (value.includes('@')) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return '올바른 이메일 형식이 아닙니다.';
    }
  } else if (/\D/.test(value)) {
    return '올바른 이메일 형식이 아닙니다.';
  } else if (value.length !== 11) {
    return '휴대폰 번호 11자리를 입력해 주세요.';
  }
  return '';
}

// ---------- 새 비밀번호 입력(NEW_PASSWORD) ----------
// 회원가입(SignupPage)과 동일한 비밀번호 정책 (docs: WEAK_PASSWORD)
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
const newPassword = ref('');
const newPasswordConfirm = ref('');
const passwordErrors = ref({ password: '', passwordConfirm: '' });
const isNewPasswordVisible = ref(false);
const isNewPasswordConfirmVisible = ref(false);
// passwordResetToken 만료(RESET_TIMEOUT_OR_INVALID_TOKEN) 시 처음부터 재시작 안내
const isTokenExpired = ref(false);

function validateNewPassword(value) {
  if (!value) return '새 비밀번호를 입력해 주세요.';
  if (!PASSWORD_REGEX.test(value)) {
    return '영문, 숫자, 특수문자를 포함하여 8자 이상 입력해 주세요.';
  }
  return '';
}

function validateNewPasswordConfirm(value) {
  if (!value) return '새 비밀번호를 한 번 더 입력해 주세요.';
  if (value !== newPassword.value) return '비밀번호가 일치하지 않습니다.';
  return '';
}

// 필수 입력 + validation 통과 시에만 '비밀번호 변경' 버튼 활성화 (실시간 검증)
const canChangePassword = computed(
  () =>
    !validateNewPassword(newPassword.value) &&
    !validateNewPasswordConfirm(newPasswordConfirm.value) &&
    !isChangingPassword.value,
);

// ---------- 5분 유효시간 카운트다운 (비밀번호 변경 화면) ----------
// - POST /auth/password/verify 응답의 expiresAt(epoch millis) 기준으로 남은 시간을 표시한다
// - 0초가 되면 토큰 만료 안내 화면(isTokenExpired)으로 전환한다
const remainingSeconds = ref(0);
let countdownTimer = null;

const remainingDisplay = computed(() => {
  const total = Math.max(0, remainingSeconds.value);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}분 ${String(seconds).padStart(2, '0')}초`;
});

function startCountdown() {
  stopCountdown();
  const expiresAtMs = expiresAt.value || Date.now() + 5 * 60 * 1000;
  const tick = () => {
    const left = Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000));
    remainingSeconds.value = left;
    if (left <= 0) {
      isTokenExpired.value = true;
      stopCountdown();
    }
  };
  tick();
  countdownTimer = setInterval(tick, 1000);
}

function stopCountdown() {
  if (countdownTimer !== null) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

// ---------- 플로우 제어 ----------

// PASS 본인인증이 완료된 상태인지 (계정 확인으로 바로 진행 가능한지)
const isPassDone = computed(
  () => verification.status.value === VERIFICATION_STATUS.SUCCESS,
);

// LOGIN_ID 단계 '다음' 버튼 — 1) DB 존재 확인(POST /auth/password/check-id) → 2) PASS 인증 단계로 진행
// (PASS 인증이 이미 끝났으면 계정 확인을 바로 진행한다)
async function handleLoginIdNext() {
  const error = validateLoginId(loginId.value);
  loginIdError.value = error;
  if (error) return;

  // PASS 인증 완료 상태면 계정 확인(토큰 발급)으로 바로 진행
  if (isPassDone.value) {
    await verifyAccount();
    return;
  }

  // 아이디가 DB 에 있는 ACTIVE 회원인지 확인 — 없으면 아이디 입력 화면에 인라인 안내
  let exists;
  try {
    exists = await passwordReset.checkAccountId();
  } catch (err) {
    showError(err, '아이디를 확인하지 못했어요. 다시 시도해 주세요.');
    return;
  }
  if (!exists) {
    loginIdError.value = '가입된 계정을 찾을 수 없어요. 아이디를 다시 확인해 주세요.';
    return;
  }

  passwordReset.goToStep(PASSWORD_RESET_STEP.PASS);
  verification.start();
}

// PASS 인증 SUCCESS → identityVerificationId 보관 후 계정 확인(토큰 발급) 진행
// (아이디는 PASS 인증 이전에 반드시 확인되므로 항상 입력된 상태다)
async function handlePassSuccess() {
  passwordReset.setVerified(identityVerificationId.value);
  await verifyAccount();
}

// 계정 확인 — POST /auth/password/verify (loginId + identityVerificationId)
// 성공 시 passwordResetToken + expiresAt(5분) 발급 → 새 비밀번호 입력 + 카운트다운 시작
async function verifyAccount() {
  // 계정 확인 단계로 전환 — 실패(CI 불일치 등) 시에도 오류 안내 화면이 렌더링되도록 한다.
  // step 을 VERIFYING 으로 바꾸지 않으면 PASS 인증 성공(SUCCESS) 상태에서 PASS 화면이
  // 빈 채로 남아 하얀 화면이 노출된다 (오류 안내 분기가 PASS 분기보다 뒤에 있음).
  passwordReset.goToStep(PASSWORD_RESET_STEP.VERIFYING);
  try {
    const ok = await passwordReset.checkAccount();
    if (ok) {
      passwordReset.goToStep(PASSWORD_RESET_STEP.NEW_PASSWORD);
      startCountdown();
    }
  } catch (err) {
    // 네트워크/5xx 등 미분류 오류 — 공통 토스트 후 처음부터
    showError(err, '계정을 확인하지 못했어요. 다시 시도해 주세요.');
    restartAll();
  }
}

// PASS 인증 성공 감지 (기존 아이디 찾기/회원가입과 동일 패턴)
watch(
  () => verification.status.value,
  (next) => {
    if (next === VERIFICATION_STATUS.SUCCESS) {
      handlePassSuccess();
    }
  },
);

// 새 비밀번호 변경 — PATCH /auth/password/reset (passwordResetToken + newPassword)
async function handleChangePassword() {
  passwordErrors.value = {
    password: validateNewPassword(newPassword.value),
    passwordConfirm: validateNewPasswordConfirm(newPasswordConfirm.value),
  };
  if (Object.values(passwordErrors.value).some((error) => error)) return;

  try {
    await passwordReset.changePassword(newPassword.value);
    // 비밀번호 원문을 메모리에서 즉시 정리 (장기 보관 금지)
    newPassword.value = '';
    newPasswordConfirm.value = '';
    // PASS 인증 상태(identityVerificationId)도 메모리에서 즉시 정리
    verification.reset();
  } catch (err) {
    const code = err?.response?.data?.errorCode;
    if (code === 'RESET_TIMEOUT_OR_INVALID_TOKEN') {
      // 5분 TTL 만료 또는 토큰 무효 — 처음부터 다시 진행 안내
      isTokenExpired.value = true;
    } else if (code === 'WEAK_PASSWORD') {
      passwordErrors.value.password =
        err?.message || '영문, 숫자, 특수문자를 포함하여 8자 이상 입력해 주세요.';
    } else {
      showError(err, '비밀번호 변경에 실패했어요. 다시 시도해 주세요.');
    }
  }
}

// 완료 화면 — 3초 후 자동으로 로그인 화면 이동
let completeTimer = null;
watch(
  () => passwordReset.step.value,
  (next) => {
    if (next === PASSWORD_RESET_STEP.COMPLETE) {
      completeTimer = setTimeout(() => router.replace('/login'), 3000);
    }
  },
);
onBeforeUnmount(() => {
  clearTimeout(completeTimer);
  stopCountdown();
});

// -------- 오류 화면 액션 --------

// 계정 확인 실패 — 아이디 다시 확인 (입력값 유지)
function handleAccountRetry() {
  passwordReset.restartFrom(PASSWORD_RESET_STEP.LOGIN_ID);
}

// 계정 확인 실패 중 인증 만료 — PASS 인증 다시 진행
function handleVerificationRetry() {
  verification.reset();
  passwordReset.restartFrom(PASSWORD_RESET_STEP.PASS);
}

// 전체 재시작 — 첫 화면(아이디 확인)부터
function restartAll() {
  clearTimeout(completeTimer);
  stopCountdown();
  remainingSeconds.value = 0;
  isTokenExpired.value = false;
  newPassword.value = '';
  newPasswordConfirm.value = '';
  passwordErrors.value = { password: '', passwordConfirm: '' };
  verification.reset();
  passwordReset.resetFlow();
}

// -------- 계정 확인 실패 안내 구성 --------
const accountErrorView = computed(() => {
  switch (accountCheckError.value) {
    case ACCOUNT_CHECK_ERROR.USER_NOT_FOUND:
      return {
        title: '계정을 찾을 수 없어요',
        message: '비밀번호를 재설정할 수 있는 계정을 찾을 수 없습니다.\n아이디를 다시 확인해 주세요.',
        primaryLabel: '아이디 다시 확인',
        onPrimary: handleAccountRetry,
      };
    case ACCOUNT_CHECK_ERROR.VERIFICATION_MISMATCH:
      return {
        title: '본인인증 정보가 일치하지 않아요',
        message:
          accountErrorMessage.value ||
          '입력한 아이디와 본인인증(PASS) 정보가 일치하지 않습니다.',
        primaryLabel: '아이디 다시 확인',
        onPrimary: handleAccountRetry,
      };
    case ACCOUNT_CHECK_ERROR.VERIFICATION_EXPIRED:
      return {
        title: '본인인증이 만료되었어요',
        message: '인증 유효시간이 지났어요. 다시 인증을 진행해 주세요.',
        primaryLabel: '다시 인증하기',
        onPrimary: handleVerificationRetry,
      };
    default:
      return null;
  }
});

// -------- 뒤로 가기 (재설정 Flow 중 뒤로가기 처리) --------
function goBack() {
  // PASS 팝업이 열려 있으면 팝업부터 닫는다
  if (isPopupOpen.value) {
    verification.cancel();
    return;
  }

  switch (step.value) {
    case PASSWORD_RESET_STEP.LOGIN_ID:
      // 첫 화면 — 로그인 화면으로 복귀
      if (window.history.length > 1) router.back();
      else router.replace('/login');
      return;
    case PASSWORD_RESET_STEP.PASS:
      // 인증 진행 중(로딩)이거나 성공 직후 계정 확인 중이면 무시
      if (isBusy.value || isPassDone.value) return;
      // 아이디 확인은 이미 끝났으므로 아이디 확인 화면으로 복귀
      passwordReset.goToStep(PASSWORD_RESET_STEP.LOGIN_ID);
      return;
    case PASSWORD_RESET_STEP.VERIFYING:
      return; // 계정 확인 중 — 뒤로가기 무시
    case PASSWORD_RESET_STEP.NEW_PASSWORD:
      // 새 비밀번호 입력에서 뒤로가면 전체 재시작 (토큰 폐기 — 보안)
      restartAll();
      return;
    case PASSWORD_RESET_STEP.COMPLETE:
      router.replace('/login');
      return;
    default:
      if (window.history.length > 1) router.back();
      else router.replace('/login');
  }
}

// PASS 팝업 닫힘(ESC/백드롭/X) → 흐름 취소
function handlePopupClose(open) {
  if (open) return;
  if (verification.isBusy.value) return;
  verification.cancel();
}

// 팝업 2 '확인' → 이름/휴대폰 번호만 백엔드(POST /auth/pass)로 전송 (identityVerificationId 발급)
function handleFormSubmit(payload) {
  verification.submitVerification(payload);
}

// -------- 단계 표시 (아이디 확인 → PASS 인증 → 비밀번호 설정 → 완료) --------
const STEP_LABELS = ['아이디 확인', 'PASS 인증', '비밀번호 설정', '완료'];
const currentStepIndex = computed(() => {
  switch (step.value) {
    case PASSWORD_RESET_STEP.LOGIN_ID:
      return 0;
    case PASSWORD_RESET_STEP.PASS:
    case PASSWORD_RESET_STEP.VERIFYING:
      return 1;
    case PASSWORD_RESET_STEP.NEW_PASSWORD:
      return 2;
    case PASSWORD_RESET_STEP.COMPLETE:
      return 3;
    default:
      return 0;
  }
});
const showStepper = computed(() => step.value !== PASSWORD_RESET_STEP.COMPLETE);

// 계정 확인 실패 안내 화면에서는 헤더/스텝퍼를 숨긴다 (자체 액션 화면)
const showChrome = computed(() => accountCheckError.value === ACCOUNT_CHECK_ERROR.NONE);
// 완료 화면은 자체 액션(로그인 이동), 계정 확인 실패 화면은 자체 액션(재시도)을 가지므로 헤더를 숨긴다
const showHeader = computed(
  () =>
    step.value !== PASSWORD_RESET_STEP.COMPLETE &&
    accountCheckError.value === ACCOUNT_CHECK_ERROR.NONE,
);
</script>

<template>
  <!-- SUBMITTING — PASS 본인인증 처리 전체 화면 로딩 -->
  <LoadingScreen
    v-if="isBusy"
    title="본인인증을 처리하고 있어요"
    description="잠시만 기다려 주세요"
  />

  <!-- 아이디 존재 확인(POST /auth/password/check-id) 호출 중 로딩 -->
  <LoadingScreen
    v-else-if="isCheckingId"
    title="아이디를 확인하고 있어요"
    description="잠시만 기다려 주세요"
  />

  <!-- 계정 확인(POST /auth/password/verify) 호출 중 로딩 -->
  <LoadingScreen
    v-else-if="isVerifyingAccount"
    title="계정을 확인하고 있어요"
    description="잠시만 기다려 주세요"
  />

  <!-- 비밀번호 변경(PATCH /auth/password/reset) 호출 중 로딩 -->
  <LoadingScreen
    v-else-if="isChangingPassword"
    title="비밀번호를 변경하고 있어요"
    description="잠시만 기다려 주세요"
  />

  <div v-else class="flex h-dvh flex-col overflow-hidden bg-white">
    <!-- 헤더 -->
    <div v-if="showHeader" class="shrink-0 px-5 pt-4">
      <BaseHeader
        title="비밀번호 재설정"
        @back="goBack"
      />
    </div>

    <!-- 진행 단계 표시 -->
    <div v-if="showChrome && showStepper" class="shrink-0 px-6 pt-4">
      <ol class="flex items-center">
        <li
          v-for="(label, index) in STEP_LABELS"
          :key="label"
          class="flex flex-1 items-center"
        >
          <div class="flex items-center gap-1.5">
            <span
              class="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
              :class="
                index < currentStepIndex
                  ? 'bg-[#2878F0] text-white'
                  : index === currentStepIndex
                    ? 'bg-[#2878F0]/15 text-[#2878F0]'
                    : 'bg-[#E8EDF3] text-[#98A8B8]'
              "
            >
              <Check v-if="index < currentStepIndex" :size="12" :stroke-width="3" />
              <template v-else>{{ index + 1 }}</template>
            </span>
            <span
              class="whitespace-nowrap text-[11px] font-semibold"
              :class="
                index <= currentStepIndex ? 'text-[#2878F0]' : 'text-[#98A8B8]'
              "
            >
              {{ label }}
            </span>
          </div>
          <span
            v-if="index < STEP_LABELS.length - 1"
            class="mx-1.5 h-px flex-1"
            :class="index < currentStepIndex ? 'bg-[#2878F0]' : 'bg-[#E8EDF3]'"
          />
        </li>
      </ol>
    </div>

    <!-- 상태별 화면 -->
    <div class="flex min-h-0 flex-1 flex-col">
      <!-- ===== 1. 아이디 확인 (LOGIN_ID) — 첫 화면 ===== -->
      <template v-if="step === PASSWORD_RESET_STEP.LOGIN_ID">
        <main class="flex-1 min-h-0 overflow-y-auto px-6 pt-4 pb-6">
          <h2 class="text-[22px] font-extrabold leading-snug tracking-tight text-[#0B3155]">
            비밀번호를 찾을 아이디를<br />확인해 주세요
          </h2>
          <p class="mt-2 text-[13.5px] font-medium leading-relaxed text-[#7186A0]">
            가입 시 사용한 이메일 또는 휴대폰 번호를 입력해 주세요.
          </p>

          <div class="mt-7">
            <label
              for="reset-login-id"
              class="mb-2 block text-[13px] font-bold text-[#191F28]"
            >
              아이디
            </label>
            <div class="relative">
              <BaseInput
                id="reset-login-id"
                :model-value="loginIdDisplay"
                :inputmode="isEmail || !isPhoneDigits ? 'email' : 'numeric'"
                placeholder="이메일 또는 휴대폰 번호"
                autocomplete="username"
                :has-error="!!loginIdError"
                :error-message="loginIdError"
                class="h-[50px] rounded-[16px] pr-11 text-[15px]"
                @update:model-value="handleLoginIdInput"
                @input="restoreCaretAfterFormat"
                @blur="loginIdError = validateLoginId(loginId)"
                @keyup.enter="handleLoginIdNext"
              />
              <component
                :is="isEmail || !isPhoneDigits ? Mail : Phone"
                :size="18"
                class="pointer-events-none absolute right-4 top-[25px] -translate-y-1/2 text-[#B9C5D2]"
              />
            </div>
          </div>
        </main>

        <footer
          class="shrink-0 flex flex-col items-center px-6 pt-3 pb-[max(env(safe-area-inset-bottom),28px)]"
        >
          <BaseButton
            :disabled="!loginId.trim()"
            class="bg-gradient-to-b from-[#3B9BE8] to-[#2878F0]"
            @click="handleLoginIdNext"
          >
            {{ isPassDone ? '계정 확인' : '다음' }}
          </BaseButton>
        </footer>
      </template>

      <!-- ===== 3. PASS 본인인증 (PASS) ===== -->
      <template v-else-if="step === PASSWORD_RESET_STEP.PASS">
        <div class="flex min-h-0 flex-1 flex-col">
          <!-- IDLE / CANCELLED — 인증 안내 + 시작 -->
          <IdentityVerificationIntro
            v-if="
              status === VERIFICATION_STATUS.IDLE ||
              status === VERIFICATION_STATUS.CANCELLED
            "
            @start="verification.start"
          />
          <!-- FAILURE — 본인인증 실패 (재시도/취소) -->
          <IdentityVerificationFailure
            v-else-if="status === VERIFICATION_STATUS.FAILURE"
            :message="errorMessage"
            @retry="verification.retry"
            @cancel="verification.cancel"
          />
        </div>
      </template>

      <!-- ===== 3-1. 계정 확인 실패 안내 (VERIFYING + 오류) ===== -->
      <template v-else-if="accountErrorView">
        <div
          class="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-10 text-center"
        >
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <XCircle :size="44" :stroke-width="2" class="text-red-500" />
          </div>

          <h2 class="mt-6 text-[22px] font-extrabold leading-snug tracking-tight text-[#191F28]">
            {{ accountErrorView.title }}
          </h2>
          <p
            class="mt-2 whitespace-pre-line text-[13px] font-medium leading-relaxed text-[#7186A0]"
          >
            {{ accountErrorView.message }}
          </p>

          <div class="mt-10 w-full space-y-2">
            <BaseButton
              class="bg-gradient-to-b from-[#3B9BE8] to-[#2878F0]"
              @click="accountErrorView.onPrimary"
            >
              {{ accountErrorView.primaryLabel }}
            </BaseButton>
            <button
              type="button"
              class="mx-auto block rounded-full px-4 py-2 text-[13px] font-semibold text-[#7186A0] transition-colors hover:text-[#3D4A5C] active:scale-95"
              @click="restartAll"
            >
              처음부터 다시 시작
            </button>
          </div>
        </div>
      </template>

      <!-- ===== 4. 새 비밀번호 입력 (NEW_PASSWORD) ===== -->
      <template v-else-if="step === PASSWORD_RESET_STEP.NEW_PASSWORD">
        <!-- 토큰 만료 — 처음부터 다시 진행 안내 -->
        <div
          v-if="isTokenExpired"
          class="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-10 text-center"
        >
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <XCircle :size="44" :stroke-width="2" class="text-red-500" />
          </div>
          <h2 class="mt-6 text-[22px] font-extrabold leading-snug tracking-tight text-[#191F28]">
            인증이 만료되었어요
          </h2>
          <p class="mt-2 text-[13px] font-medium leading-relaxed text-[#7186A0]">
            비밀번호 변경 유효시간(5분)이 지났어요.<br />
            처음부터 다시 진행해 주세요.
          </p>
          <div class="mt-10 w-full">
            <BaseButton
              class="bg-gradient-to-b from-[#3B9BE8] to-[#2878F0]"
              @click="restartAll"
            >
              처음부터 다시 시작
            </BaseButton>
          </div>
        </div>

        <!-- 새 비밀번호 입력 -->
        <template v-else>
          <main class="flex-1 min-h-0 overflow-y-auto px-6 pt-4 pb-6">
            <h2 class="text-[22px] font-extrabold leading-snug tracking-tight text-[#0B3155]">
              새 비밀번호를 설정해 주세요
            </h2>
            <p class="mt-2 text-[13.5px] font-medium leading-relaxed text-[#7186A0]">
              영문, 숫자, 특수문자를 포함하여 8자 이상 입력해 주세요.<br />
              인증 후 5분 안에 비밀번호를 변경해 주세요.
            </p>

            <!-- 5분 유효시간 카운트다운 — 1분 미만이면 강조 색상 -->
            <div class="mt-5 flex justify-center">
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold"
                :class="
                  remainingSeconds <= 60
                    ? 'bg-red-50 text-red-500'
                    : 'bg-[#EAF4FF] text-[#2878F0]'
                "
              >
                <Clock :size="15" :stroke-width="2.5" />
                남은 시간 {{ remainingDisplay }}
              </span>
            </div>

            <div class="mt-7 flex flex-col gap-5">
              <!-- 새 비밀번호 -->
              <div>
                <label
                  for="reset-password"
                  class="mb-2 block text-[13px] font-bold text-[#191F28]"
                >
                  새 비밀번호
                </label>
                <div class="relative">
                  <BaseInput
                    id="reset-password"
                    v-model="newPassword"
                    :type="isNewPasswordVisible ? 'text' : 'password'"
                    inputmode="text"
                    placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                    autocomplete="new-password"
                    :has-error="!!passwordErrors.password"
                    :error-message="passwordErrors.password"
                    class="h-[50px] rounded-[16px] pr-12 text-[15px]"
                    @update:model-value="passwordErrors.password = ''"
                    @blur="passwordErrors.password = validateNewPassword(newPassword)"
                  />
                  <button
                    type="button"
                    class="absolute right-2 top-[25px] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-[#B9C5D2] transition-colors hover:bg-[#F5F8FC] hover:text-[#2878F0] active:scale-95"
                    :aria-label="isNewPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'"
                    :aria-pressed="isNewPasswordVisible"
                    aria-controls="reset-password"
                    @mousedown.prevent
                    @click="isNewPasswordVisible = !isNewPasswordVisible"
                  >
                    <EyeOff v-if="isNewPasswordVisible" :size="19" />
                    <Eye v-else :size="19" />
                  </button>
                </div>
              </div>

              <!-- 새 비밀번호 확인 -->
              <div>
                <label
                  for="reset-password-confirm"
                  class="mb-2 block text-[13px] font-bold text-[#191F28]"
                >
                  새 비밀번호 확인
                </label>
                <div class="relative">
                  <BaseInput
                    id="reset-password-confirm"
                    v-model="newPasswordConfirm"
                    :type="isNewPasswordConfirmVisible ? 'text' : 'password'"
                    inputmode="text"
                    placeholder="새 비밀번호를 한 번 더 입력해 주세요"
                    autocomplete="new-password"
                    :has-error="!!passwordErrors.passwordConfirm"
                    :error-message="passwordErrors.passwordConfirm"
                    class="h-[50px] rounded-[16px] pr-12 text-[15px]"
                    @update:model-value="passwordErrors.passwordConfirm = ''"
                    @blur="
                      passwordErrors.passwordConfirm = validateNewPasswordConfirm(
                        newPasswordConfirm,
                      )
                    "
                    @keyup.enter="handleChangePassword"
                  />
                  <button
                    type="button"
                    class="absolute right-2 top-[25px] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-[#B9C5D2] transition-colors hover:bg-[#F5F8FC] hover:text-[#2878F0] active:scale-95"
                    :aria-label="
                      isNewPasswordConfirmVisible ? '비밀번호 숨기기' : '비밀번호 보기'
                    "
                    :aria-pressed="isNewPasswordConfirmVisible"
                    aria-controls="reset-password-confirm"
                    @mousedown.prevent
                    @click="
                      isNewPasswordConfirmVisible = !isNewPasswordConfirmVisible
                    "
                  >
                    <EyeOff v-if="isNewPasswordConfirmVisible" :size="19" />
                    <Eye v-else :size="19" />
                  </button>
                </div>
              </div>
            </div>
          </main>

          <footer
            class="shrink-0 flex flex-col items-center px-6 pt-3 pb-[max(env(safe-area-inset-bottom),28px)]"
          >
            <BaseButton
              :disabled="!canChangePassword"
              class="bg-gradient-to-b from-[#3B9BE8] to-[#2878F0]"
              @click="handleChangePassword"
            >
              {{ isChangingPassword ? '변경 중...' : '비밀번호 변경' }}
            </BaseButton>
          </footer>
        </template>
      </template>

      <!-- ===== 5. 비밀번호 변경 완료 (COMPLETE) ===== -->
      <template v-else-if="step === PASSWORD_RESET_STEP.COMPLETE">
        <div
          class="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-10 text-center"
        >
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-[#EAF4FF]">
            <CheckCircle2 :size="44" :stroke-width="2" class="text-[#2878F0]" />
          </div>

          <h2 class="mt-6 text-[22px] font-extrabold leading-snug tracking-tight text-[#191F28]">
            비밀번호가 변경되었습니다
          </h2>
          <p class="mt-2 text-[13px] font-medium leading-relaxed text-[#7186A0]">
            새로운 비밀번호로 다시 로그인해 주세요.<br />
            잠시 후 로그인 화면으로 이동합니다.
          </p>

          <div class="mt-10 w-full">
            <BaseButton
              class="bg-gradient-to-b from-[#3B9BE8] to-[#2878F0]"
              @click="router.replace('/login')"
            >
              로그인 화면으로 이동
            </BaseButton>
          </div>
        </div>
      </template>
    </div>
  </div>

  <!-- PASS 팝업 (통신사/약관 → 이름/휴대폰/보안문자) — 기존 회원가입/아이디 찾기와 동일 -->
  <Dialog :open="isPopupOpen" @update:open="handlePopupClose">
    <DialogContent
      :show-close-button="false"
      class="max-w-[430px] gap-0 overflow-hidden rounded-[20px] border-2 border-[#1F2937] p-0 shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
    >
      <DialogTitle class="sr-only">PASS 본인인증</DialogTitle>
      <div class="flex max-h-[86dvh] min-h-0 flex-col">
        <PassCarrierSelect
          v-if="status === VERIFICATION_STATUS.CARRIER"
          @confirm="verification.confirmCarrier"
          @close="verification.cancel"
        />
        <PassAuthForm
          v-else-if="status === VERIFICATION_STATUS.FORM"
          :form="form"
          :error-message="errorMessage"
          @update:form="verification.updateForm"
          @submit="handleFormSubmit"
          @back="verification.cancel"
        />
      </div>
    </DialogContent>
  </Dialog>
</template>
