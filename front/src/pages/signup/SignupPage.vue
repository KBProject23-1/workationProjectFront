<script setup>
// 회원가입 계정정보 입력 화면 — /signup
// 흐름: 약관동의(/signup/terms) → 본인인증(/signup/verify) → 계정정보 입력(본 화면) → 회원가입 완료 → 로그인 화면
// - AuthStore 에 보관된 identityVerificationId(백엔드 발급)가 없으면 약관동의부터 시작하도록 리다이렉트한다.
// - 이메일(중복 확인) / 비밀번호(정책) / 비밀번호 확인 을 프론트에서 1차 검증한다.
// - API 호출 구조: SignupPage → authStore.signup() → api/auth.js → axiosInstance → Backend
// - 회원가입 성공 시 Backend 가 ACCESS_TOKEN/REFRESH_TOKEN HttpOnly Cookie 를 발급한다 (자동 로그인).
//   프론트는 토큰을 읽거나 저장하지 않으며, 별도 로그인 API 를 호출하지 않는다.
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronLeft, Check, AlertCircle } from '@lucide/vue';
import { useAuthStore } from '@/stores/authStore';
import { useErrorToast } from '@/composables/useErrorToast';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const router = useRouter();
const authStore = useAuthStore();
const { showError } = useErrorToast();

const email = ref('');
const password = ref('');
const passwordConfirm = ref('');

const errors = ref({ email: '', password: '', passwordConfirm: '' });
const emailChecking = ref(false);
const emailAvailable = ref(null); // null = 미확인, true = 사용 가능, false = 중복
const emailCheckedFor = ref('');
const isSubmitting = ref(false);
let emailCheckTimer = null;

// 백엔드와 동일한 검증 기준 (docs/EmailValidator — 이메일 형식, AuthServiceImpl — 비밀번호 정책)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 비밀번호: 영문/숫자/특수문자 각 1개 이상 + 8자 이상 (docs: WEAK_PASSWORD)
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

onMounted(() => {
  // 본인인증을 거치지 않았거나, 약관동의를 완료하지 않은 채 /signup 으로 직접 진입한 경우
  // 약관동의부터 다시 시작한다.
  // - signupAgreedTermIds 가 비어 있으면 가입하기 시점에 백엔드가 MISSING_REQUIRED_TERMS(400)를
  //   반환하므로, 진입 시점에 미리 차단한다 (signupAgreedTermIds: 인메모리 — 새로고침 시 초기화).
  // - signupIdentityVerificationId(백엔드가 POST /auth/pass 에서 발급) 없이는 회원가입이 불가능하다.
  if (
    !authStore.signupIdentityVerificationId ||
    authStore.signupAgreedTermIds.length === 0
  ) {
    router.replace('/signup/terms');
  }
});

function validateEmail(value) {
  if (!value.trim()) return '이메일을 입력해 주세요.';
  if (!EMAIL_REGEX.test(value.trim())) return '올바른 이메일 형식이 아닙니다.';
  return '';
}

function validatePassword(value) {
  if (!value) return '비밀번호를 입력해 주세요.';
  if (!PASSWORD_REGEX.test(value)) {
    return '영문, 숫자, 특수문자를 포함하여 8자 이상 입력해 주세요.';
  }
  return '';
}

function validatePasswordConfirm(value) {
  if (!value) return '비밀번호를 한 번 더 입력해 주세요.';
  if (value !== password.value) return '비밀번호가 일치하지 않습니다.';
  return '';
}

// 이메일 중복 확인 — GET /api/v1/auth/signup/check-email (data.available 로 판단)
async function checkEmailNow() {
  const emailError = validateEmail(email.value);
  if (emailError) {
    errors.value.email = emailError;
    emailAvailable.value = null;
    return false;
  }
  emailChecking.value = true;
  try {
    const available = await authStore.checkEmail(email.value.trim());
    emailCheckedFor.value = email.value.trim();
    emailAvailable.value = available;
    errors.value.email = available ? '' : '이미 사용 중인 이메일입니다.';
    return available;
  } catch {
    // 서버 오류 시 중복 판정을 보류 — 최종 검증은 회원가입 요청 시 서버가 수행한다.
    emailCheckedFor.value = email.value.trim();
    emailAvailable.value = null;
    errors.value.email = '';
    return true;
  } finally {
    emailChecking.value = false;
  }
}

// blur 시 디바운스로 실시간 중복 확인
function onEmailBlur() {
  clearTimeout(emailCheckTimer);
  emailCheckTimer = setTimeout(checkEmailNow, 400);
}

// 이메일 값이 바뀌면 중복 확인 상태를 초기화한다.
function onEmailInput() {
  clearTimeout(emailCheckTimer);
  if (emailCheckedFor.value !== email.value.trim()) {
    emailAvailable.value = null;
    errors.value.email = validateEmail(email.value) || '';
  }
}

function validateAll() {
  errors.value = {
    email: validateEmail(email.value),
    password: validatePassword(password.value),
    passwordConfirm: validatePasswordConfirm(passwordConfirm.value),
  };
  return !Object.values(errors.value).some((error) => error);
}

async function handleSubmit() {
  if (!validateAll()) return;

  // 약관동의를 완료하지 않은 상태(새로고침 등으로 상태 소실)에서는 가입을 진행하지 않고
  // 약관동의부터 다시 시작한다. (백엔드 MISSING_REQUIRED_TERMS 사전 차단)
  if (authStore.signupAgreedTermIds.length === 0) {
    showError(new Error('약관 동의가 필요합니다.'), '약관 동의를 다시 진행해 주세요.');
    router.replace('/signup/terms');
    return;
  }

  // 이메일 중복 확인을 아직(또는 값 변경 후) 하지 않았다면 제출 시점에 확인한다.
  // 진행 중이던 debounce 타이머는 중복 호출 방지를 위해 취소한다.
  if (emailCheckedFor.value !== email.value.trim()) {
    clearTimeout(emailCheckTimer);
    const available = await checkEmailNow();
    if (!available) {
      showError(new Error('이미 사용 중인 이메일입니다.'), '이미 사용 중인 이메일입니다.');
      return;
    }
  }
  if (emailAvailable.value === false) {
    showError(new Error('이미 사용 중인 이메일입니다.'), '이미 사용 중인 이메일입니다.');
    return;
  }

  isSubmitting.value = true;
  try {
    await authStore.signup({
      email: email.value.trim(),
      password: password.value,
    });
    // 자동 로그인 완료 — 회원가입 완료 화면으로 이동 (거기서 '로그인하기' → 로그인 화면 이동)
    router.replace('/signup/complete');
  } catch (err) {
    // 서버 ErrorCode 기반 메시지 (DUPLICATE_EMAIL / INVALID_VERIFICATION_ID 등)
    showError(err, '회원가입에 실패했어요. 다시 시도해 주세요.');
  } finally {
    isSubmitting.value = false;
  }
}

const canSubmit = computed(
  () =>
    email.value.trim() &&
    password.value &&
    passwordConfirm.value &&
    !Object.values(errors.value).some((error) => error),
);

function goBack() {
  // 단독 라우트(/signup)로 직접 접근한 경우(히스토리 없음) 본인인증 화면으로 이동한다.
  if (window.history.length > 1) router.back();
  else router.replace('/signup/verify');
}
</script>

<template>
  <div class="flex flex-col h-dvh bg-white overflow-hidden">
    <!-- 헤더 -->
    <header class="shrink-0 flex items-center gap-1 px-2 pt-2">
      <button
        type="button"
        aria-label="뒤로 가기"
        class="flex h-10 w-10 items-center justify-center rounded-full text-[#0B3155] transition-colors hover:bg-[#F5F8FC] active:scale-95"
        @click="goBack"
      >
        <ChevronLeft :size="24" :stroke-width="2.5" />
      </button>
      <h1 class="text-[17px] font-bold tracking-tight text-[#191F28]">회원가입</h1>
    </header>

    <!-- 본문 -->
    <main class="flex-1 min-h-0 overflow-y-auto px-6 pt-4 pb-6">
      <h2 class="text-[22px] font-extrabold leading-snug tracking-tight text-[#0B3155]">
        {{ authStore.signupName ? `${authStore.signupName}님, 환영합니다!` : '환영합니다!' }}
      </h2>
      <p class="mt-2 text-[13.5px] font-medium leading-relaxed text-[#7186A0]">
        워케이션 여정을 함께 시작할 계정 정보를 입력해 주세요.
      </p>

      <!-- 입력 폼 -->
      <div class="mt-7 flex flex-col gap-5">
        <!-- 이메일 -->
        <div>
          <label for="signup-email" class="mb-2 block text-[13px] font-bold text-[#191F28]">
            이메일
          </label>
          <BaseInput
            id="signup-email"
            v-model="email"
            type="email"
            inputmode="email"
            placeholder="예: workit@example.com"
            :has-error="!!errors.email"
            :error-message="errors.email"
            @update:model-value="onEmailInput"
            @blur="onEmailBlur"
          />
          <!-- 이메일 중복 확인 상태 -->
          <p
            v-if="emailChecking"
            class="mt-1.5 flex items-center gap-1 text-[12.5px] font-medium text-[#7186A0]"
          >
            <AlertCircle :size="13" />
            이메일 중복을 확인하고 있어요...
          </p>
          <p
            v-else-if="emailAvailable === true"
            class="mt-1.5 flex items-center gap-1 text-[12.5px] font-semibold text-[#2878F0]"
          >
            <Check :size="13" :stroke-width="3" />
            사용 가능한 이메일이에요.
          </p>
        </div>

        <!-- 비밀번호 -->
        <div>
          <label for="signup-password" class="mb-2 block text-[13px] font-bold text-[#191F28]">
            비밀번호
          </label>
          <BaseInput
            id="signup-password"
            v-model="password"
            type="password"
            inputmode="text"
            placeholder="영문, 숫자, 특수문자 포함 8자 이상"
            :has-error="!!errors.password"
            :error-message="errors.password"
            @update:model-value="errors.password = ''"
            @blur="errors.password = validatePassword(password)"
          />
        </div>

        <!-- 비밀번호 확인 -->
        <div>
          <label for="signup-password-confirm" class="mb-2 block text-[13px] font-bold text-[#191F28]">
            비밀번호 확인
          </label>
          <BaseInput
            id="signup-password-confirm"
            v-model="passwordConfirm"
            type="password"
            inputmode="text"
            placeholder="비밀번호를 한 번 더 입력해 주세요"
            :has-error="!!errors.passwordConfirm"
            :error-message="errors.passwordConfirm"
            @update:model-value="errors.passwordConfirm = ''"
            @blur="errors.passwordConfirm = validatePasswordConfirm(passwordConfirm)"
            @keyup.enter="handleSubmit"
          />
        </div>
      </div>
    </main>

    <!-- 하단: 가입하기 버튼 (BaseButton 공통 스타일) -->
    <footer
      class="shrink-0 flex flex-col items-center px-6 pt-3 pb-[max(env(safe-area-inset-bottom),28px)]"
    >
      <BaseButton :disabled="isSubmitting || !canSubmit" @click="handleSubmit">
        {{ isSubmitting ? '가입 처리 중...' : '가입하기' }}
      </BaseButton>
    </footer>
  </div>
</template>
