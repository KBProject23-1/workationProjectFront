<script setup>
// 아이디 찾기 화면 — /find-id (Figma: 아이디찾기)
// - 로그인 화면의 '아이디 찾기' 버튼으로 진입한다.
// - 기존 회원가입 PASS 본인인증 구조(useIdentityVerification + Mock Provider)를 그대로 재사용한다.
// - 'PASS 인증하기' → PASS 팝업 1(통신사 선택 + 약관 전체 동의) → 팝업 2(이름/휴대폰/보안문자)
// - 팝업 2 '확인' → 이름/휴대폰 번호만 백엔드(POST /auth/pass)로 전송
//   → 백엔드가 VERIFIED 세션 생성 + identityVerificationId 발급 → SUCCESS 시 findId(/auth/find-id) 호출
// - identityVerificationId 는 백엔드가 발급한다 (프론트 생성 금지)
// - 이름/휴대폰 번호는 find-id API 에 직접 전달하지 않는다 (identityVerificationId 만 전달)
// - 이메일은 백엔드가 마스킹하여 반환한다 (프론트 마스킹 불필요 — EmailMasker)
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { CheckCircle2, Mail, ShieldCheck } from '@lucide/vue';
import { useAuthStore } from '@/stores/authStore';
import { useErrorToast } from '@/composables/useErrorToast';
import {
  useIdentityVerification,
  VERIFICATION_STATUS,
} from '@/composables/useIdentityVerification';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import IdentityVerificationFailure from '@/components/identity/IdentityVerificationFailure.vue';
import PassCarrierSelect from '@/components/identity/PassCarrierSelect.vue';
import PassAuthForm from '@/components/identity/PassAuthForm.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const router = useRouter();
const authStore = useAuthStore();
const { showError } = useErrorToast();
const verification = useIdentityVerification();

const { status, isBusy, isPopupOpen, identityVerificationId, errorMessage, form } = verification;

// SUCCESS 후 findId(/auth/find-id) 호출 중 여부 (중복 클릭 방지 + 로딩 화면)
const isFinding = ref(false);
// findId 성공 결과 — { email(마스킹), createdAt }
const result = ref(null);

// 성공(결과 표시)/실패 화면은 자체 액션(확인/재시도)을 가지므로 헤더를 숨긴다
const showHeader = computed(() => status.value !== VERIFICATION_STATUS.FAILURE && !result.value);

// 본인인증 SUCCESS → 자동으로 아이디 찾기 API 호출
watch(
  () => status.value,
  (next) => {
    if (next === VERIFICATION_STATUS.SUCCESS) {
      findMyId();
    }
  },
);

// SUCCESS → 백엔드에 identityVerificationId 만 전달해 가입 이메일 조회
async function findMyId() {
  if (isFinding.value) return;
  isFinding.value = true;
  result.value = null;
  try {
    const data = await authStore.findId(identityVerificationId.value);
    result.value = data; // { email: 'user****@example.com', createdAt: '2026-07-24' }
  } catch (err) {
    // 400(INVALID_VERIFICATION_ID) / 404(USER_NOT_FOUND) / 네트워크 오류 — 토스트 후 처음부터
    showError(err, '아이디를 찾지 못했어요. 다시 시도해 주세요.');
    verification.reset();
  } finally {
    isFinding.value = false;
  }
}

function goBack() {
  // 팝업이 열려 있으면 닫고 안내 화면으로 복귀
  if (isPopupOpen.value) {
    verification.cancel();
    return;
  }
  // 단독 라우트(/find-id)로 직접 접근한 경우(히스토리 없음) 로그인 화면으로 이동한다.
  if (window.history.length > 1) router.back();
  else router.replace('/login');
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

// 결과 화면 '확인' → 로그인 화면
function goToLogin() {
  router.replace('/login');
}
</script>

<template>
  <!-- SUBMITTING — 본인인증 처리 전체 화면 로딩 -->
  <LoadingScreen
    v-if="isBusy"
    title="본인인증을 처리하고 있어요"
    description="잠시만 기다려 주세요"
  />

  <!-- findId 호출 중 로딩 -->
  <LoadingScreen
    v-else-if="isFinding"
    title="가입된 아이디를 찾고 있어요"
    description="잠시만 기다려 주세요"
  />

  <div v-else class="flex h-dvh flex-col overflow-hidden bg-white">
    <!-- 헤더 -->
    <div v-if="showHeader" class="shrink-0 px-2 pt-2">
      <BaseHeader
        title="아이디 찾기"
        variant="inline"
        title-class="text-[17px] font-bold tracking-tight text-[#191F28]"
        @back="goBack"
      />
    </div>

    <!-- 상태별 화면 -->
    <div class="flex min-h-0 flex-1 flex-col">
      <!-- IDLE/CANCELLED — 아이디 찾기 안내 + PASS 인증 시작 -->
      <div
        v-if="status === VERIFICATION_STATUS.IDLE || status === VERIFICATION_STATUS.CANCELLED"
        class="flex min-h-0 flex-1 flex-col"
      >
        <main class="flex-1 min-h-0 overflow-y-auto px-6 pt-4 pb-6">
          <h2 class="text-[22px] font-extrabold leading-snug tracking-tight text-[#0B3155]">
            아이디를 찾기 위해<br />본인인증을 진행해 주세요
          </h2>
          <p class="mt-2 text-[13.5px] font-medium leading-relaxed text-[#7186A0]">
            가입 당시 본인인증과 동일한 이름·휴대폰 번호로 인증하면<br />
            가입된 아이디(이메일)를 알려드려요.
          </p>

          <!-- Mock 인증 안내 카드 -->
          <div
            class="mt-7 flex items-center gap-4 rounded-[20px] border border-[#DFE7F0] bg-[#F5F8FC] p-5"
          >
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2878F0]/10 text-[#2878F0]"
            >
              <ShieldCheck :size="24" :stroke-width="2" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[13px] font-semibold leading-relaxed text-[#3D4A5C]">
                현재는 테스트용 Mock 인증이에요.
              </p>
              <p class="mt-1 text-[12.5px] font-medium leading-relaxed text-[#7186A0]">
                PASS 팝업에서 통신사 선택과 약관 동의 후<br />
                이름·휴대폰 번호·보안문자를 입력하면 인증이 완료됩니다.
              </p>
            </div>
          </div>
        </main>

        <footer
          class="shrink-0 flex flex-col items-center px-6 pt-3 pb-[max(env(safe-area-inset-bottom),28px)]"
        >
          <BaseButton
            class="bg-gradient-to-b from-[#3B9BE8] to-[#2878F0]"
            @click="verification.start"
          >
            PASS 인증하기
          </BaseButton>
          <p class="mt-3 text-[11.5px] font-medium text-[#98A8B8]">
            테스트용 Mock 인증 · 입력한 정보는 외부로 전송되지 않아요
          </p>
        </footer>
      </div>

      <!-- FAILURE — 본인인증 실패 -->
      <IdentityVerificationFailure
        v-else-if="status === VERIFICATION_STATUS.FAILURE"
        :message="errorMessage"
        @retry="verification.retry"
        @cancel="verification.cancel"
      />

      <!-- 결과 — 가입된 아이디(마스킹 이메일) + 가입일 -->
      <div
        v-else-if="result"
        class="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-10 text-center"
      >
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-[#2878F0]/10">
          <CheckCircle2 :size="44" :stroke-width="2" class="text-[#2878F0]" />
        </div>

        <h2 class="mt-6 text-[22px] font-extrabold leading-snug tracking-tight text-[#191F28]">
          아이디 찾기가 완료되었습니다
        </h2>
        <p class="mt-2 text-[13px] font-medium leading-relaxed text-[#7186A0]">
          개인정보 보호를 위해 이메일을 마스킹했어요.
        </p>

        <!-- 가입된 아이디 카드 -->
        <div class="mt-8 w-full rounded-[20px] border border-[#DFE7F0] bg-[#F5F8FC] p-6 text-left">
          <div class="flex items-center gap-2">
            <Mail :size="15" :stroke-width="2" class="text-[#98A8B8]" />
            <p class="text-[12.5px] font-semibold text-[#7186A0]">가입된 아이디</p>
          </div>
          <p class="mt-2 break-all text-[22px] font-extrabold tracking-tight text-[#0B3155]">
            {{ result.email }}
          </p>
          <div class="mt-4 flex items-center justify-between border-t border-[#DFE7F0] pt-3">
            <span class="text-[12.5px] font-medium text-[#7186A0]">가입일</span>
            <span class="text-[13px] font-semibold text-[#3D4A5C]">{{ result.createdAt }}</span>
          </div>
        </div>

        <div class="mt-10 w-full">
          <BaseButton
            class="bg-gradient-to-b from-[#3B9BE8] to-[#2878F0]"
            @click="goToLogin"
          >
            확인
          </BaseButton>
        </div>
      </div>
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
