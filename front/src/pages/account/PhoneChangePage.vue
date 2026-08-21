<script setup>
// 휴대폰 번호 변경 화면 — /account/me/phone
// - 사용자가 변경할 휴대폰 번호를 직접 입력하지 않고, PASS 인증에서 인증된 번호로 계정 정보를 변경한다.
// - 'PASS 인증하기' → 기존 Mock PASS 팝업(통신사/약관 → 이름/휴대폰/보안문자)을 그대로 재사용한다.
// - 팝업 '확인' → 기존 useIdentityVerification 로 POST /auth/pass 호출 — 백엔드가 VERIFIED 세션 생성 +
//   identityVerificationId 발급 (프론트 임의 생성 금지, 버튼 클릭만으로 성공 판단 금지)
// - PASS 인증 SUCCESS → 백엔드가 발급한 identityVerificationId 만 PATCH /users/me/phone 에 전달해
//   인증된 번호로 변경한다 (변경할 번호는 프론트에서 보내지 않는다 — 백엔드가 인증 결과에서 조회)
// - 변경 성공 화면 → '확인' → authStore.fetchMyInfo() 로 사용자 정보를 갱신한 뒤 내 정보 화면(/account/me) 이동
// - 인증 상태 머신은 기존 useIdentityVerification 을 그대로 사용하고, 페이지에서는
//   PATCH /users/me/phone 호출 전용 상태(isChanging/isChanged)만 추가로 관리한다.
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { CheckCircle2, ShieldCheck } from '@lucide/vue';
import { useAuthStore } from '@/stores/authStore';
import { useErrorToast } from '@/composables/useErrorToast';
import BaseHeader from '@/components/common/BaseHeader.vue';
import {
  useIdentityVerification,
  VERIFICATION_STATUS,
} from '@/composables/useIdentityVerification';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
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

// PATCH /users/me/phone 호출 중 여부 (중복 요청 방지 + 로딩 화면)
const isChanging = ref(false);
// 휴대폰 번호 변경 완료 여부 — 성공 화면 표시 기준
// (PASS 인증 SUCCESS 만으로는 성공 처리하지 않는다 — 변경 API 성공까지 확인한다)
const isChanged = ref(false);

// 성공(변경 완료)/실패 화면은 자체 액션(확인/재시도)을 가지므로 헤더를 숨긴다
const showHeader = computed(
  () => status.value !== VERIFICATION_STATUS.FAILURE && !isChanged.value,
);

// PASS 인증 SUCCESS → 자동으로 휴대폰 번호 변경(PATCH /users/me/phone) 호출
// - identityVerificationId 는 백엔드가 POST /auth/pass 에서 발급한 값만 사용한다 (프론트 생성 금지)
watch(
  () => status.value,
  (next) => {
    if (next === VERIFICATION_STATUS.SUCCESS) {
      applyPhoneChange();
    }
  },
);

// SUCCESS → 백엔드가 발급한 identityVerificationId 만 전달해 인증된 번호로 변경
async function applyPhoneChange() {
  if (isChanging.value) return;
  isChanging.value = true;
  try {
    // Page → Store → API Module → axiosInstance → Backend 구조 (페이지에서 axios 직접 호출 금지)
    await authStore.changePhone(identityVerificationId.value);
    isChanged.value = true;
  } catch (err) {
    // 400(INVALID_VERIFICATION_ID / VERIFICATION_FAILED / PHONE_SAME_AS_CURRENT),
    // 409(PHONE_ALREADY_IN_USE) 등 서버 메시지는 err.message 로 토스트에 표시된다 (인터셉터가 치환)
    showError(err, '휴대폰 번호 변경에 실패했습니다.');
    verification.reset();
  } finally {
    isChanging.value = false;
  }
}

function goBack() {
  // 팝업이 열려 있으면 닫고 안내 화면으로 복귀
  if (isPopupOpen.value) {
    verification.cancel();
    return;
  }
  // 단독 라우트(/account/me/phone)로 직접 접근한 경우(히스토리 없음) 계정 설정 화면으로 이동한다.
  if (window.history.length > 1) router.back();
  else router.replace('/account/me/settings');
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

// 변경 완료 '확인' → 최신 사용자 정보를 갱신한 뒤 내 정보 화면으로 이동
// - authStore.fetchMyInfo() 로 변경된 휴대폰 번호가 내 정보 화면에 최신 상태로 표시되도록 한다
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
  <main class="flex min-h-screen flex-col bg-canvas px-5 pt-4 pb-8">
    <!-- PASS 본인인증 처리 중 로딩 -->
    <LoadingScreen
      v-if="isBusy"
      title="본인인증을 처리하고 있어요"
      description="잠시만 기다려 주세요"
    />

    <!-- 휴대폰 번호 변경(PATCH /users/me/phone) 호출 중 로딩 -->
    <LoadingScreen
      v-else-if="isChanging"
      title="휴대폰 번호를 변경하고 있어요"
      description="잠시만 기다려 주세요"
    />

    <template v-else>
      <!-- 헤더 -->
      <div v-if="showHeader" class="mb-6">
        <BaseHeader
          title="휴대폰 번호 변경"
          @back="goBack"
        />
      </div>

      <!-- 변경 완료 화면 -->
      <div
        v-if="isChanged"
        class="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center"
      >
        <div
          class="flex h-20 w-20 items-center justify-center rounded-full bg-brand-weak"
        >
          <CheckCircle2 :size="44" :stroke-width="2" class="text-brand" />
        </div>

        <h2 class="mt-6 text-display font-bold leading-snug tracking-tight text-ink">
          휴대폰 번호 변경 완료
        </h2>
        <p class="mt-2 text-body-sm font-medium leading-relaxed text-ink-sub">
          인증한 휴대폰 번호로 계정 정보가 변경됐어요
        </p>

        <div class="mt-10 w-full">
          <BaseButton
            class="w-full"
            @click="goToMyInfo"
          >
            확인
          </BaseButton>
        </div>
      </div>

      <!-- PASS 인증 실패 — 기존 실패 컴포넌트 재사용 -->
      <IdentityVerificationFailure
        v-else-if="status === VERIFICATION_STATUS.FAILURE"
        :message="errorMessage"
        @retry="verification.retry"
        @cancel="verification.cancel"
      />

      <!-- 안내 화면 (IDLE/CANCELLED — PASS 인증 전) -->
      <template v-else>
        <p class="text-body-sm font-medium leading-relaxed text-ink-sub">
          휴대폰 번호를 변경하려면 PASS 인증이 필요해요.<br />
          본인 명의의 휴대폰으로 PASS 인증을 진행해주세요.
        </p>

        <!-- Mock 인증 안내 카드 -->
        <div
          class="mt-7 flex items-center gap-4 rounded-sheet border border-line bg-canvas p-5"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-sheet bg-brand-weak text-brand"
          >
            <ShieldCheck :size="24" :stroke-width="2" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-body-sm font-semibold leading-relaxed text-ink">
              현재는 테스트용 Mock 인증이에요.
            </p>
            <p class="mt-1 text-[12.5px] font-medium leading-relaxed text-ink-sub">
              PASS 팝업에서 통신사 선택과 약관 동의 후<br />
              이름·휴대폰 번호·보안문자를 입력하면 인증이 완료됩니다.
            </p>
          </div>
        </div>

        <div class="flex-1" />

        <!-- PASS 인증 시작 -->
        <div class="pt-8 text-center">
          <BaseButton
            class="w-full"
            @click="verification.start"
          >
            PASS 인증하기
          </BaseButton>
          <p class="mt-3 text-[11.5px] font-medium text-ink-mute">
            테스트용 Mock 인증 · 입력한 정보는 외부로 전송되지 않아요
          </p>
        </div>
      </template>
    </template>
  </main>

  <!-- PASS 팝업 (통신사/약관 → 이름/휴대폰/보안문자) — 기존 컴포넌트 재사용 -->
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
