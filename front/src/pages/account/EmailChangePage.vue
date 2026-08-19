<script setup>
// 이메일 변경 화면 — /account/me/email
// - 계정 설정에서 새로운 이메일 주소로 인증번호를 발송하고, 인증번호 확인 후 이메일을 변경한다.
// - 흐름: 새 이메일 입력 → POST /users/me/email/verification (인증번호 발송)
//        → 인증번호 입력 → POST /users/me/email/verification/confirm (인증 확인)
//        → PATCH /users/me/email (이메일 변경) → 변경 완료 화면
// - 이메일 변경 API 는 Request Body 를 받지 않는다 — 인증번호 확인으로 인증 완료된 이메일을
//   서버가 조회해 변경한다 (프론트가 이메일을 다시 전송하지 않는다 — docs 보안 조건)
// - 인증번호 검증은 전부 백엔드가 수행한다 (프론트에서 직접 비교하지 않는다) —
//   인증 성공만으로 변경 완료로 판단하지 않으며, 변경 API 성공 응답 후에만 완료 화면을 표시한다
// - 인증번호는 localStorage/sessionStorage/Pinia 에 저장하지 않는다 (Request Body 로만 전달)
// - 인증번호 유효시간 3분(180초) 카운트다운을 인증번호 입력칸 안에 표시한다
//   (페이지 unmount 시 반드시 clearInterval — 타이머 중복 생성 방지)
import { computed, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { CheckCircle2 } from '@lucide/vue';
import { useAuthStore } from '@/stores/authStore';
import { useErrorToast } from '@/composables/useErrorToast';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const router = useRouter();
const authStore = useAuthStore();
const { showError } = useErrorToast();

const email = ref('');
const emailError = ref('');
const verificationCode = ref('');
const codeError = ref('');

// 인증번호 발송 중 (중복 요청 방지)
const isSendingCode = ref(false);
// 인증번호 발송 성공 여부 — 성공 후에만 인증번호 입력 영역을 표시한다
const isCodeSent = ref(false);
// 서버가 정규화해 반환한 발송 이메일 — 확인(confirm) 요청에 동일 값을 전달한다
const sentEmail = ref('');
// 인증번호 확인 중 (중복 요청 방지)
const isVerifying = ref(false);
// 인증번호 확인 성공 여부 — 확인 완료 후 변경 API 실패 시 재시도할 때 확인 API 를 건너뛴다
const isVerified = ref(false);
// 이메일 변경(PATCH /users/me/email) 처리 중 — 로딩 화면 표시
const isChanging = ref(false);
// 변경 완료 여부 — 변경 API 성공 응답 후에만 true (인증 성공만으로 완료 처리하지 않는다)
const isSuccess = ref(false);
// 변경 완료 화면에 표시할 이메일 (변경 API 응답 data.updatedEmail)
const changedEmail = ref('');

// 인증번호 유효시간 카운트다운 (3분 = 180초)
const VERIFICATION_TTL_SECONDS = 180;
const remainingSeconds = ref(0);
let countdownTimer = null;

// 백엔드와 동일한 이메일 형식 검증 기준 (docs/EmailValidator — signup 과 동일)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 카운트다운 표시 "02:59" (인증번호 입력칸 안)
const remainingDisplay = computed(() => {
  const total = Math.max(0, remainingSeconds.value);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

// 프론트 검증은 UX 용이며 최종 검증은 백엔드에서 수행한다 (knowledgeFront.md Form Validation)
function validateEmail(value) {
  if (!value.trim()) return '이메일을 입력해주세요';
  if (!EMAIL_REGEX.test(value.trim())) return '올바른 이메일 형식을 입력해주세요';
  return '';
}

function validateCode(value) {
  if (!value) return '인증번호를 입력해주세요';
  return '';
}

// 인증번호 재발송 시 기존 타이머를 제거하고 새로운 3분 타이머를 시작한다 (중복 생성 방지)
function startCountdown() {
  stopCountdown();
  remainingSeconds.value = VERIFICATION_TTL_SECONDS;
  countdownTimer = setInterval(() => {
    remainingSeconds.value -= 1;
    if (remainingSeconds.value <= 0) {
      remainingSeconds.value = 0;
      stopCountdown();
    }
  }, 1000);
}

function stopCountdown() {
  if (countdownTimer !== null) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

// 페이지 이동/unmount 시 타이머 정리 (setInterval 누수 방지)
onUnmounted(stopCountdown);

// 인증번호 발송 전/후 버튼 라벨
const sendButtonLabel = computed(() => {
  if (isSendingCode.value) return '발송 중...';
  if (isCodeSent.value) {
    return remainingSeconds.value > 0 ? '다시 받기' : '인증번호 다시 받기';
  }
  return '인증번호 받기';
});

// 발송 버튼 — 이메일 형식이 유효하고 카운트다운 중이 아닐 때만 활성화 (중복 요청 방지)
const canSendCode = computed(
  () =>
    !isSendingCode.value &&
    !validateEmail(email.value) &&
    !(isCodeSent.value && remainingSeconds.value > 0),
);

// 확인 버튼 — 인증번호 입력 + 요청 중이 아닐 때만 활성화 (중복 요청 방지)
const canConfirm = computed(
  () => !!verificationCode.value && !isVerifying.value,
);

function goBack() {
  // 단독 라우트(/account/me/email)로 직접 접근한 경우(히스토리 없음) 계정 설정 화면으로 이동한다.
  if (window.history.length > 1) router.back();
  else router.replace('/account/me/settings');
}

// [1] 인증번호 받기 — POST /users/me/email/verification
async function handleSendCode() {
  emailError.value = validateEmail(email.value);
  if (emailError.value || isSendingCode.value) return;

  isSendingCode.value = true;
  try {
    // Page → Store → API Module → axiosInstance → Backend 구조 (페이지에서 axios 직접 호출 금지)
    const data = await authStore.sendEmailVerification(email.value.trim());
    // 서버가 정규화한 발송 이메일로 확인(confirm) 단계를 진행한다
    // (사용자가 입력한 이메일과 인증 세션 이메일의 불일치 방지)
    sentEmail.value = data.email;
    isCodeSent.value = true;
    isVerified.value = false;
    verificationCode.value = '';
    codeError.value = '';
    // 인증번호 재발송 시 기존 타이머를 제거하고 3분 타이머를 새로 시작한다
    startCountdown();
  } catch (err) {
    // EMAIL_SAME_AS_CURRENT / EMAIL_ALREADY_IN_USE 등 서버 메시지는 err.message 로 토스트에 표시된다
    showError(err, '인증번호 발송에 실패했습니다.');
  } finally {
    isSendingCode.value = false;
  }
}

// [2] 인증번호 확인 → [3] 이메일 변경
// - 인증번호 확인 성공만으로 변경 완료로 판단하지 않는다 — 변경 API 성공 후에만 완료 화면 표시
async function handleConfirmCode() {
  codeError.value = validateCode(verificationCode.value);
  if (codeError.value || isVerifying.value) return;

  // 인증번호 확인이 이미 완료된 상태(변경 API 실패 후 재시도)면 확인 API 를 건너뛰고 변경만 다시 시도한다
  if (!isVerified.value) {
    isVerifying.value = true;
    try {
      await authStore.confirmEmailVerification({
        email: sentEmail.value,
        verificationCode: verificationCode.value,
      });
      // 인증 성공 여부는 백엔드 응답(200) 기준으로만 판단한다 — 프론트에서 인증번호를 비교하지 않는다
      isVerified.value = true;
    } catch (err) {
      // 인증번호 불일치/만료 등 서버 메시지(EMAIL_VERIFICATION_CODE_INVALID / _EXPIRED)를 우선 표시한다
      showError(err, '인증번호 확인에 실패했습니다.');
      return;
    } finally {
      isVerifying.value = false;
    }
  }

  await applyEmailChange();
}

// [3] 이메일 변경 — PATCH /users/me/email (Request Body 없음 — 서버가 인증 완료된 이메일을 조회해 변경)
async function applyEmailChange() {
  if (isChanging.value) return;
  isChanging.value = true;
  try {
    const data = await authStore.changeEmail();
    // 변경 API 성공 응답 후에만 완료 화면으로 전환한다
    stopCountdown();
    changedEmail.value = data.updatedEmail;
    isSuccess.value = true;
  } catch (err) {
    showError(err, '이메일 변경에 실패했습니다.');
  } finally {
    isChanging.value = false;
  }
}

// 완료 화면 '확인' → 최신 사용자 정보를 갱신한 뒤 내 정보 화면으로 이동
async function goToMyInfo() {
  try {
    await authStore.fetchMyInfo();
  } catch (err) {
    // 정보 갱신 실패는 이동을 막지 않는다 — 내 정보 화면에서 진입 시 다시 조회한다
    showError(err, '내 정보를 불러오지 못했어요.');
  } finally {
    router.replace('/account/me');
  }
}
</script>

<template>
  <main class="flex min-h-screen flex-col bg-white px-5 pt-4 pb-8">
    <!-- 이메일 변경(PATCH /users/me/email) 호출 중 로딩 -->
    <LoadingScreen
      v-if="isChanging"
      title="이메일을 변경하고 있어요"
      description="잠시만 기다려 주세요"
    />

    <!-- 변경 완료 화면 (변경 API 성공 후에만 표시) -->
    <div
      v-else-if="isSuccess"
      class="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center"
    >
      <div
        class="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50"
      >
        <CheckCircle2 :size="44" :stroke-width="2" class="text-blue-600" />
      </div>

      <h2
        class="mt-6 text-[22px] font-extrabold leading-snug tracking-tight text-slate-900"
      >
        이메일이 변경되었습니다
      </h2>
      <p class="mt-2 text-[13px] font-medium leading-relaxed text-slate-500">
        변경된 이메일
      </p>
      <p class="mt-1 text-[15px] font-bold text-slate-900">
        {{ changedEmail }}
      </p>

      <div class="mt-10 w-full">
        <BaseButton
          class="w-full rounded-2xl py-3.5 text-[15px] font-bold"
          @click="goToMyInfo"
        >
          확인
        </BaseButton>
      </div>
    </div>

    <!-- 이메일 입력 / 인증번호 확인 화면 -->
    <template v-else>
      <!-- 헤더 -->
      <div class="mb-6">
        <BaseHeader
          title="이메일 변경"
          @back="goBack"
        />
      </div>

      <!-- 안내 문구 -->
      <p class="text-[13px] font-medium leading-relaxed text-slate-500">
        새로운 이메일을 인증해주세요
      </p>

      <!-- 새 이메일 입력 -->
      <div class="mt-7">
        <label
          for="email-change-email"
          class="mb-2 block text-[13px] font-bold text-slate-900"
        >
          새 이메일
        </label>
        <BaseInput
          id="email-change-email"
          v-model="email"
          type="email"
          inputmode="email"
          placeholder="새 이메일을 입력해주세요"
          :disabled="isCodeSent"
          :has-error="!!emailError"
          :error-message="emailError"
          class="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-[15px] font-medium text-slate-900 placeholder:text-slate-400"
          @update:model-value="emailError = ''"
          @blur="emailError = validateEmail(email)"
          @keyup.enter="handleSendCode"
        />
      </div>

      <!-- 인증번호 받기 / 다시 받기 -->
      <div class="pt-6 text-center">
        <BaseButton
          :disabled="!canSendCode"
          class="w-full rounded-2xl py-3.5 text-[15px] font-bold"
          @click="handleSendCode"
        >
          {{ sendButtonLabel }}
        </BaseButton>
      </div>

      <!-- 인증번호 입력 영역 (발송 성공 후) -->
      <template v-if="isCodeSent">
        <div class="mt-8">
          <label
            for="email-change-code"
            class="mb-2 block text-[13px] font-bold text-slate-900"
          >
            인증번호
          </label>
          <div class="relative">
            <BaseInput
              id="email-change-code"
              v-model="verificationCode"
              inputmode="numeric"
              maxlength="6"
              placeholder="인증번호를 입력해주세요"
              :has-error="!!codeError"
              :error-message="codeError"
              class="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 pr-16 text-[15px] font-medium text-slate-900 placeholder:text-slate-400"
              @update:model-value="
                verificationCode = String($event).replace(/\D/g, '')
              "
              @blur="codeError = validateCode(verificationCode)"
              @keyup.enter="handleConfirmCode"
            />
            <!-- 카운트다운 — 인증번호 입력칸 안에 표시 -->
            <span
              v-if="remainingSeconds > 0"
              class="pointer-events-none absolute right-4 top-6 -translate-y-1/2 text-[13px] font-bold tabular-nums text-blue-600"
            >
              {{ remainingDisplay }}
            </span>
          </div>
        </div>

        <div class="flex-1" />

        <!-- 확인 버튼 -->
        <div class="pt-8 text-center">
          <BaseButton
            :disabled="!canConfirm"
            class="w-full rounded-2xl py-3.5 text-[15px] font-bold"
            @click="handleConfirmCode"
          >
            {{ isVerifying ? '확인 중...' : '확인' }}
          </BaseButton>
        </div>
      </template>

      <div v-else class="flex-1" />
    </template>
  </main>
</template>
