<script setup>
// 비밀번호 변경 화면 — /account/me/password
// - 로그인 사용자가 현재 비밀번호(currentPassword)를 확인한 뒤 새 비밀번호(newPassword)로 변경한다.
// - docs: 로그인 후 비밀번호 변경 (PATCH /users/me/password)
// - 변경 성공 후에도 로그인 세션(인증 Cookie)이 유지되므로 로그아웃/재로그인 없이 내정보 화면으로 복귀한다
//   (authStore.changePassword 는 isAuthenticated/user 를 변경하지 않는다).
// - 프론트 검증은 UX 용이며 최종 검증은 백엔드에서 수행한다 (knowledgeFront.md Form Validation).
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import { ChevronLeft, Eye, EyeOff } from '@lucide/vue';
import { useAuthStore } from '@/stores/authStore';
import { useErrorToast } from '@/composables/useErrorToast';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const router = useRouter();
const authStore = useAuthStore();
const { showError } = useErrorToast();

const currentPassword = ref('');
const newPassword = ref('');
const newPasswordConfirm = ref('');
const errors = ref({
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
});
const isCurrentVisible = ref(false);
const isNewVisible = ref(false);
const isNewConfirmVisible = ref(false);
const isChanging = ref(false);

// 회원가입/비밀번호 재설정과 동일한 비밀번호 정책 (docs: WEAK_PASSWORD)
// - 영문/숫자/특수문자 각 1개 이상 + 8자 이상 (백엔드 PASSWORD_POLICY_PATTERN 과 동일)
const PASSWORD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

function validateCurrentPassword(value) {
  if (!value) return '현재 비밀번호를 입력해 주세요.';
  return '';
}

function validateNewPassword(value) {
  if (!value) return '새 비밀번호를 입력해 주세요.';
  if (!PASSWORD_REGEX.test(value)) {
    return '영문, 숫자, 특수문자를 포함하여 8자 이상 입력해 주세요.';
  }
  // 현재 비밀번호와 동일한 비밀번호는 사용할 수 없다 (docs: AUTH_SAME_PASSWORD — 백엔드에서도 검증)
  if (value === currentPassword.value) {
    return '현재 비밀번호와 다른 비밀번호를 입력해 주세요.';
  }
  return '';
}

function validateNewPasswordConfirm(value) {
  if (!value) return '새 비밀번호를 한 번 더 입력해 주세요.';
  if (value !== newPassword.value) return '비밀번호가 일치하지 않습니다.';
  return '';
}

// 필수 입력 + validation 통과 시에만 '비밀번호 변경' 버튼 활성화 (실시간 검증)
const canChange = computed(
  () =>
    !validateCurrentPassword(currentPassword.value) &&
    !validateNewPassword(newPassword.value) &&
    !validateNewPasswordConfirm(newPasswordConfirm.value) &&
    !isChanging.value,
);

function goBack() {
  router.back();
}

async function handleChangePassword() {
  // 이중 방어 — 버튼이 비활성화되어 있어도 유효하지 않으면 요청하지 않는다
  errors.value = {
    currentPassword: validateCurrentPassword(currentPassword.value),
    newPassword: validateNewPassword(newPassword.value),
    newPasswordConfirm: validateNewPasswordConfirm(newPasswordConfirm.value),
  };
  if (
    errors.value.currentPassword ||
    errors.value.newPassword ||
    errors.value.newPasswordConfirm
  ) {
    return;
  }

  isChanging.value = true;
  try {
    // Page → Store → API Module → axiosInstance → Backend 구조 (페이지에서 axios 직접 호출 금지)
    await authStore.changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    });
    toast.success('비밀번호가 변경되었어요.');
    // 변경 성공 후에도 로그인 세션이 유지되므로 그대로 내정보 화면으로 복귀한다
    router.replace('/account/me');
  } catch (err) {
    // 서버 메시지(현재 비밀번호 불일치 등)는 err.message 로 토스트에 표시된다 (인터셉터가 치환)
    showError(err, '비밀번호 변경에 실패했어요. 다시 시도해 주세요.');
  } finally {
    isChanging.value = false;
  }
}
</script>

<template>
  <main class="flex min-h-screen flex-col bg-white px-5 pt-4 pb-8">
    <!-- 헤더 -->
    <header class="relative mb-6 flex items-center justify-center">
      <button
        type="button"
        class="absolute left-0 -ml-2 flex h-11 w-11 items-center justify-center text-slate-900"
        aria-label="뒤로 가기"
        @click="goBack"
      >
        <ChevronLeft class="h-7 w-7" />
      </button>
      <h1 class="text-base font-bold text-slate-900">비밀번호 변경</h1>
    </header>

    <!-- 안내 문구 -->
    <p class="text-[13px] font-medium leading-relaxed text-slate-500">
      현재 비밀번호를 확인한 뒤 새로운 비밀번호로 변경해 주세요.<br />
      변경 후에도 로그인 상태는 유지됩니다.
    </p>

    <!-- 입력 폼 -->
    <div class="mt-7 space-y-6">
      <!-- 현재 비밀번호 -->
      <div>
        <label
          for="change-current-password"
          class="mb-2 block text-[13px] font-bold text-slate-900"
        >
          현재 비밀번호
        </label>
        <div class="relative">
          <BaseInput
            id="change-current-password"
            v-model="currentPassword"
            :type="isCurrentVisible ? 'text' : 'password'"
            inputmode="text"
            placeholder="현재 비밀번호를 입력해 주세요"
            autocomplete="current-password"
            :has-error="!!errors.currentPassword"
            :error-message="errors.currentPassword"
            class="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 pr-12 text-[15px] font-medium text-slate-900 placeholder:text-slate-400"
            @update:model-value="errors.currentPassword = ''"
            @blur="
              errors.currentPassword = validateCurrentPassword(currentPassword)
            "
          />
          <button
            type="button"
            class="absolute right-2 top-6 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
            :aria-label="isCurrentVisible ? '비밀번호 숨기기' : '비밀번호 보기'"
            :aria-pressed="isCurrentVisible"
            aria-controls="change-current-password"
            @mousedown.prevent
            @click="isCurrentVisible = !isCurrentVisible"
          >
            <EyeOff v-if="isCurrentVisible" :size="19" />
            <Eye v-else :size="19" />
          </button>
        </div>
      </div>

      <!-- 새 비밀번호 -->
      <div>
        <label
          for="change-new-password"
          class="mb-2 block text-[13px] font-bold text-slate-900"
        >
          새 비밀번호
        </label>
        <div class="relative">
          <BaseInput
            id="change-new-password"
            v-model="newPassword"
            :type="isNewVisible ? 'text' : 'password'"
            inputmode="text"
            placeholder="영문, 숫자, 특수문자 포함 8자 이상"
            autocomplete="new-password"
            :has-error="!!errors.newPassword"
            :error-message="errors.newPassword"
            class="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 pr-12 text-[15px] font-medium text-slate-900 placeholder:text-slate-400"
            @update:model-value="errors.newPassword = ''"
            @blur="errors.newPassword = validateNewPassword(newPassword)"
          />
          <button
            type="button"
            class="absolute right-2 top-6 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
            :aria-label="isNewVisible ? '비밀번호 숨기기' : '비밀번호 보기'"
            :aria-pressed="isNewVisible"
            aria-controls="change-new-password"
            @mousedown.prevent
            @click="isNewVisible = !isNewVisible"
          >
            <EyeOff v-if="isNewVisible" :size="19" />
            <Eye v-else :size="19" />
          </button>
        </div>
      </div>

      <!-- 새 비밀번호 확인 -->
      <div>
        <label
          for="change-new-password-confirm"
          class="mb-2 block text-[13px] font-bold text-slate-900"
        >
          새 비밀번호 확인
        </label>
        <div class="relative">
          <BaseInput
            id="change-new-password-confirm"
            v-model="newPasswordConfirm"
            :type="isNewConfirmVisible ? 'text' : 'password'"
            inputmode="text"
            placeholder="새 비밀번호를 한 번 더 입력해 주세요"
            autocomplete="new-password"
            :has-error="!!errors.newPasswordConfirm"
            :error-message="errors.newPasswordConfirm"
            class="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 pr-12 text-[15px] font-medium text-slate-900 placeholder:text-slate-400"
            @update:model-value="errors.newPasswordConfirm = ''"
            @blur="
              errors.newPasswordConfirm =
                validateNewPasswordConfirm(newPasswordConfirm)
            "
            @keyup.enter="handleChangePassword"
          />
          <button
            type="button"
            class="absolute right-2 top-6 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
            :aria-label="
              isNewConfirmVisible ? '비밀번호 숨기기' : '비밀번호 보기'
            "
            :aria-pressed="isNewConfirmVisible"
            aria-controls="change-new-password-confirm"
            @mousedown.prevent
            @click="isNewConfirmVisible = !isNewConfirmVisible"
          >
            <EyeOff v-if="isNewConfirmVisible" :size="19" />
            <Eye v-else :size="19" />
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1" />

    <!-- 변경 버튼 — 모든 입력이 유효할 때만 활성화 -->
    <div class="pt-8 text-center">
      <BaseButton
        :disabled="!canChange"
        class="w-full py-3.5 text-[15px] font-bold rounded-2xl"
        @click="handleChangePassword"
      >
        {{ isChanging ? '변경 중...' : '비밀번호 변경' }}
      </BaseButton>
    </div>
  </main>
</template>
