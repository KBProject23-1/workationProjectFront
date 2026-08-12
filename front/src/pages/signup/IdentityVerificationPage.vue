<script setup>
// 회원가입 본인인증(PASS) 화면 — /signup/verify
// - 약관동의(/signup/terms) 완료 후 진입한다.
// - 'PASS 인증하기' → PASS 팝업 1(통신사 선택 + 약관 전체 동의) → 팝업 2(이름/휴대폰/보안문자)
// - 팝업 2 '확인' → 이름/휴대폰 번호만 백엔드(POST /auth/pass)로 전송
//   → 백엔드가 VERIFIED 세션 생성 + identityVerificationId 발급 → 완료 화면
// - identityVerificationId 는 백엔드가 발급한다 (프론트 생성 금지 — 요구사항)
// - 완료 후 verify-identity(/auth/signup/verify-identity) 로 동일 휴대폰(CI) 가입 회원을
//   검증한다 — 중복 회원이면 DUPLICATE_USER 화면으로 차단하고, 아니면 발급받은
//   identityVerificationId 를 AuthStore 에 보관한 뒤 계정정보 입력(/signup)으로 이동한다.
// - 인증 로직(상태 머신)은 useIdentityVerification 컴포저블에 분리되어 있다.
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronLeft } from '@lucide/vue';
import { useAuthStore } from '@/stores/authStore';
import { useErrorToast } from '@/composables/useErrorToast';
import {
  useIdentityVerification,
  VERIFICATION_STATUS,
} from '@/composables/useIdentityVerification';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import IdentityVerificationIntro from '@/components/identity/IdentityVerificationIntro.vue';
import IdentityVerificationSuccess from '@/components/identity/IdentityVerificationSuccess.vue';
import IdentityVerificationFailure from '@/components/identity/IdentityVerificationFailure.vue';
import IdentityVerificationDuplicate from '@/components/identity/IdentityVerificationDuplicate.vue';
import PassCarrierSelect from '@/components/identity/PassCarrierSelect.vue';
import PassAuthForm from '@/components/identity/PassAuthForm.vue';

const router = useRouter();
const authStore = useAuthStore();
const verification = useIdentityVerification();
const { showError } = useErrorToast();

const { status, isBusy, isPopupOpen, identityVerificationId, verifiedName, errorMessage, form } =
  verification;

// SUCCESS 후 verify-identity(/auth/signup/verify-identity) 호출 중 여부 (중복 클릭 방지 + 로딩 화면)
const isCheckingDuplicate = ref(false);

// 성공/실패/중복 화면은 자체 액션(계속/재시도/로그인)을 가지므로 헤더를 숨긴다
const showHeader = computed(
  () =>
    status.value !== VERIFICATION_STATUS.SUCCESS &&
    status.value !== VERIFICATION_STATUS.FAILURE &&
    status.value !== VERIFICATION_STATUS.DUPLICATE_USER,
);

// PASS 인증 SUCCESS → 자동으로 회원 중복 체크(verify-identity) 호출
// - 동일 휴대폰(CI) 가입 회원이면 409 DUPLICATE_USER → DUPLICATE_USER 화면으로 차단
//   (계정정보 입력(/signup)으로 진행하지 못하게 막는다)
// - 중복이 아니면 SUCCESS 유지 — '계속하기'로 계정정보 입력을 진행한다
watch(
  () => status.value,
  (next) => {
    if (next === VERIFICATION_STATUS.SUCCESS) {
      checkDuplicateUser();
    }
  },
);

// SUCCESS → 백엔드에 identityVerificationId 만 전달해 중복 가입 여부 확인
async function checkDuplicateUser() {
  if (isCheckingDuplicate.value) return;
  isCheckingDuplicate.value = true;
  try {
    const data = await authStore.verifyIdentityForSignup(identityVerificationId.value);
    // 중복 없음 — 화면 표시 이름을 백엔드 복원 값으로 확정하고 SUCCESS 화면 유지
    if (data?.name) verification.setVerifiedName(data.name);
  } catch (err) {
    if (err?.response?.data?.errorCode === 'DUPLICATE_USER') {
      // 동일 휴대폰(CI) 가입 회원 — 회원가입 진행 차단 + 로그인 안내 (서버 메시지 표시)
      verification.setDuplicateUser(err.message);
    } else {
      // 400(INVALID_VERIFICATION_ID) / 네트워크 오류 — 토스트 후 처음부터
      showError(err, '본인인증 결과를 확인하지 못했어요. 다시 시도해 주세요.');
      verification.reset();
    }
  } finally {
    isCheckingDuplicate.value = false;
  }
}

// 중복 회원 화면 '로그인하기' → 로그인 화면
function goToLogin() {
  router.replace('/login');
}

function goBack() {
  // 팝업이 열려 있으면 닫고 안내 화면으로 복귀
  if (isPopupOpen.value) {
    verification.cancel();
    return;
  }
  // 단독 라우트(/signup/verify)로 직접 접근한 경우(히스토리 없음) 약관동의 화면으로 이동한다.
  if (window.history.length > 1) router.back();
  else router.replace('/signup/terms');
}

// 팝업 닫힘(ESC/백드롭/X) → 흐름 취소
// SUBMITTING 중에는 로딩 화면이 팝업을 대체하므로 닫힘 이벤트를 무시한다
function handlePopupClose(open) {
  if (open) return;
  if (verification.isBusy.value) return;
  verification.cancel();
}

// 팝업 2 '확인' → 이름/휴대폰 번호만 백엔드(POST /auth/pass)로 전송 (identityVerificationId 발급)
function handleFormSubmit(payload) {
  verification.submitVerification(payload);
}

// SUCCESS → 백엔드가 발급한 identityVerificationId 를 AuthStore 에 보관 후 계정정보 입력으로 이동
// - verify-identity(중복 회원 체크) 통과 후 도달한 화면이므로 바로 이동한다. 회원가입(/auth/signup)
//   시 백엔드가 identityVerificationId 로 Redis 세션을 검증·복원한다 (이름/휴대폰 재전송 없음).
function continueToSignup() {
  authStore.setIdentityVerification(identityVerificationId.value, verifiedName.value);
  router.replace('/signup');
}
</script>

<template>
  <!-- SUBMITTING — 전체 화면 로딩 (기존 LoadingScreen 재사용) -->
  <LoadingScreen
    v-if="isBusy"
    title="본인인증을 처리하고 있어요"
    description="잠시만 기다려 주세요"
  />

  <!-- verify-identity(중복 회원 체크) 호출 중 로딩 -->
  <LoadingScreen
    v-else-if="isCheckingDuplicate"
    title="가입 가능 여부를 확인하고 있어요"
    description="잠시만 기다려 주세요"
  />

  <div v-else class="flex h-dvh flex-col overflow-hidden bg-white">
    <!-- 헤더 -->
    <header v-if="showHeader" class="flex shrink-0 items-center gap-1 px-2 pt-2">
      <button
        type="button"
        aria-label="뒤로 가기"
        class="flex h-10 w-10 items-center justify-center rounded-full text-[#0B3155] transition-colors hover:bg-[#F5F8FC] active:scale-95"
        @click="goBack"
      >
        <ChevronLeft :size="24" :stroke-width="2.5" />
      </button>
      <h1 class="text-[17px] font-bold tracking-tight text-[#191F28]">본인인증</h1>
    </header>

    <!-- 상태별 화면 -->
    <div class="flex min-h-0 flex-1 flex-col">
      <!-- CANCELLED 도 안내 화면(IDLE)과 동일하게 렌더링한다 (상태는 구분해서 보관) -->
      <IdentityVerificationIntro
        v-if="status === VERIFICATION_STATUS.IDLE || status === VERIFICATION_STATUS.CANCELLED"
        @start="verification.start"
      />
      <IdentityVerificationSuccess
        v-else-if="status === VERIFICATION_STATUS.SUCCESS"
        :name="verifiedName"
        @continue="continueToSignup"
      />
      <IdentityVerificationFailure
        v-else-if="status === VERIFICATION_STATUS.FAILURE"
        :message="errorMessage"
        @retry="verification.retry"
        @cancel="verification.cancel"
      />
      <!-- 중복 회원 — 동일 휴대폰(CI) 가입 감지 → 로그인 안내 (회원가입 진행 차단) -->
      <IdentityVerificationDuplicate
        v-else-if="status === VERIFICATION_STATUS.DUPLICATE_USER"
        :message="errorMessage"
        @go-login="goToLogin"
      />
    </div>
  </div>

  <!-- PASS 팝업 (통신사/약관 → 이름/휴대폰/보안문자) -->
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
