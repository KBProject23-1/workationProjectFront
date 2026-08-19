<script setup>
// 로그인 화면 — /login (Figma: 로그인)
// - 아이디(이메일 또는 휴대폰 번호) + 비밀번호 입력 후 로그인 (loginType: PASSWORD)
// - 아이디 입력 자동 판별: '@' 포함 또는 문자 입력 중 → 이메일, 순수 숫자만 입력 → 휴대폰(010-0000-0000 형식 표기, 하이픈 제거 전송)
// - 11자리를 넘는 숫자를 추가 입력하면 휴대폰 입력으로 보지 않고 메일 아이콘으로 전환한다.
// - 아이디 input 은 type 을 동적으로 바꾸지 않고 항상 type="text" 를 유지한다 (inputmode 만 전환).
//   type 을 tel/email 로 바꾸면 브라우저가 입력 컨트롤을 재생성해 캐럿이 첫 번째 자리로 이동한다.
// - deviceId(기기 UUID)는 브라우저 localStorage 에 보관해 로그인 요청마다 함께 전송한다.
//   백엔드가 user_device 등록 여부를 확인해 pinSetupRequired 로 알려준다.
// - 로그인 성공 분기 (온보딩 게이트, 우선순위):
//   1) 연동 계좌 없음 → 계좌 연결(/account/link?flow=onboarding) → 카드 연결 → PIN 설정으로 이어짐
//   2) 계좌 있음 + pinSetupRequired=true (기기 최초 로그인) → PIN 설정(/pin/setup)
//   3) 계좌 있음 + pinSetupRequired=false (기존 기기)        → 원래 목적지(redirect, 기본 /workation)
// - 아이디 찾기 → /find-id 화면 이동 (PASS 본인인증 기반) / 비밀번호 찾기 → 아직 미구현 안내 토스트
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Mail, Phone, Eye, EyeOff } from '@lucide/vue';
import { useAuthStore } from '@/stores/authStore';
import { useAccountStore } from '@/stores/accountStore';
import { useErrorToast } from '@/composables/useErrorToast';
import BaseHeader from '@/components/common/BaseHeader.vue';
import { getDeviceId } from '@/utils/device';
import { setPinRegistered } from '@/utils/pinRegistry';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const accountStore = useAccountStore();
const { showError } = useErrorToast();

const loginId = ref('');
const password = ref('');
const errors = ref({ loginId: '', password: '' });
const isSubmitting = ref(false);

// 비밀번호 눈 모양 토글 — 보이기/숨기기
const isPasswordVisible = ref(false);

// 아이디가 이메일 형식인지 자동 판별 ('@' 포함 여부 — 백엔드 findUserByLoginId 와 동일 규칙)
const isEmail = computed(() => loginId.value.includes('@'));

// 순수 숫자(또는 빈 값)만 입력된 상태 — 휴대폰 번호로 간주
// (문자가 섞이거나 11자리를 넘으면 휴대폰 아이콘/포맷/제한을 적용하지 않는다)
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

// 표시용 값 — 이메일은 그대로, 순수 숫자(휴대폰)는 3-4-4 포맷, 문자 포함 시 원문 유지
const loginIdDisplay = computed(() => {
  if (isEmail.value) return loginId.value;
  return isPhoneDigits.value ? formatPhone(loginId.value) : loginId.value;
});

function handleLoginIdInput(value) {
  if (value.includes('@')) {
    loginId.value = value;
  } else if (/^[\d-]*$/.test(value)) {
    // 휴대폰 — 숫자(하이픈 포함)만 허용, 하이픈은 표시용
    // (11자리를 넘어가는 숫자는 휴대폰이 아닌 입력으로 보고 그대로 유지해
    //  isPhoneDigits 가 false 가 되면서 아이콘이 메일로 전환되게 한다)
    loginId.value = value.replace(/\D/g, '');
  } else {
    // 문자 포함 → 이메일 입력 중이므로 원문 유지
    // (기존에는 숫자를 입력하면 문자가 지워지는 문제가 있었음)
    // 단, 직전 값이 휴대폰 포맷(하이픈)으로 표시 중이던 숫자였다면
    // 표시용 하이픈이 남지 않도록 제거한 뒤 이메일 입력을 이어간다.
    loginId.value = isPhoneDigits.value ? value.replace(/-/g, '') : value;
  }
  if (errors.value.loginId) errors.value.loginId = '';
}

// 입력 중 캐럿 위치 복원 — 휴대폰 자동 하이픈 포맷팅(비동기 value 패치)으로 인한
// 캐럿 점프(첫 번째 자리로 이동 등)를 방지한다.
// - Input 컴포넌트 체인(useVModel passive)이 nextTick 단위로 값을 패치하므로,
//   모든 마이크로태스크가 끝난 시점(setTimeout 0)에 하이픈이 반영된 최종 값을 기준으로 캐럿을 되돌린다.
function restoreCaretAfterFormat(event) {
  const el = event.target;
  // 하이픈 포맷팅이 적용되는 휴대폰 입력에서만 캐럿을 복원한다.
  // (이메일 등 포맷이 없는 입력은 브라우저의 원본 캐럿을 그대로 유지한다)
  if (!/^[\d-]*$/.test(el.value)) return;
  const rawCaret = el.selectionStart;
  if (typeof rawCaret !== 'number') return;

  // 하이픈 없는 원본 값 기준 — 캐럿 앞쪽의 숫자 개수를 센다
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
    // 포맷팅된 최종 값에서 digitsBefore 번째 숫자 뒤로 캐럿을 이동한다
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

function validateLoginId(value) {
  if (!value.trim()) return '아이디(이메일 또는 휴대폰 번호)를 입력해 주세요.';
  if (value.includes('@')) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return '올바른 이메일 형식이 아닙니다.';
    }
  } else if (/\D/.test(value)) {
    // 문자 포함 → 아직 '@' 없는 이메일 입력 중 (휴대폰 길이 검증 제외)
    return '올바른 이메일 형식이 아닙니다.';
  } else if (value.length !== 11) {
    // placeholder(010-0000-0000)와 동일한 11자리 기준 (010 + 8자리)
    return '휴대폰 번호 11자리를 입력해 주세요.';
  }
  return '';
}

function validatePassword(value) {
  if (!value) return '비밀번호를 입력해 주세요.';
  return '';
}

const canSubmit = computed(
  () => loginId.value.trim() && password.value && !isSubmitting.value,
);

async function handleLogin() {
  errors.value = {
    loginId: validateLoginId(loginId.value),
    password: validatePassword(password.value),
  };
  if (Object.values(errors.value).some((error) => error)) return;

  isSubmitting.value = true;
  try {
    // authStore.login 은 언랩된 응답 data({ userId, name, pinSetupRequired })를 그대로 반환한다.
    // (여기서 다시 { data } 로 구조분해하면 undefined 가 되어 PIN 분기가 통째로 깨진다)
    const data = await authStore.login({
      loginType: 'PASSWORD',
      // 휴대폰은 하이픈 제거(숫자만) 전송 — 백엔드 findUserByLoginId 와 동일 정규화
      loginId: isEmail.value
        ? loginId.value.trim()
        : loginId.value.replace(/\D/g, ''),
      password: password.value,
      deviceId: getDeviceId(),
    });

    // 서버 진실(pinSetupRequired)로 이 기기 PIN 등록 캐시를 seed → 라우터 가드가 정확히 분기
    setPinRegistered(!data?.pinSetupRequired);

    // 가드에 의해 튕겨왔다면 원래 가려던 곳으로 복귀 (없으면 워케이션 홈)
    const redirect =
      typeof route.query.redirect === 'string' ? route.query.redirect : '/workation';

    // 로그인 직후 온보딩 게이트 (우선순위)
    //  1) 연동 계좌가 없으면 → 계좌 연결부터 (AccountLink→CardLink→PIN 순으로 이어짐)
    //  2) 계좌는 있으나 이 기기 PIN 미등록(pinSetupRequired) → PIN 설정
    //  3) 둘 다 완료 → 원래 목적지(redirect)
    // fetchMyAccounts 는 throw 하지 않고 store.error 에 담으므로, 조회 실패 시엔
    // 정상 사용자를 온보딩으로 잘못 보내지 않도록 계좌 게이트를 건너뛴다.
    await accountStore.fetchMyAccounts();
    const needsAccountLink =
      !accountStore.error && accountStore.accounts.length === 0;

    if (needsAccountLink) {
      router.replace({
        path: '/account/link',
        query: { flow: 'onboarding', redirect },
      });
    } else if (data?.pinSetupRequired) {
      router.replace({ path: '/pin/setup', query: { redirect } });
    } else {
      router.replace(redirect);
    }
  } catch (err) {
    // 서버 ErrorCode 기반 메시지 (INVALID_CREDENTIALS 등)
    showError(
      err,
      '로그인에 실패했어요. 아이디와 비밀번호를 다시 확인해 주세요.',
    );
  } finally {
    isSubmitting.value = false;
  }
}

function goBack() {
  if (window.history.length > 1) router.back();
  else router.replace('/');
}
</script>

<template>
  <div class="flex flex-col h-dvh bg-white overflow-hidden">
    <!-- 헤더 -->
    <div class="shrink-0 px-5 pt-4">
      <BaseHeader
        title="로그인"
        @back="goBack"
      />
    </div>

    <!-- 본문 -->
    <main class="flex-1 min-h-0 overflow-y-auto px-6 pt-5 pb-6">
      <h2
        class="text-[22px] font-extrabold leading-snug tracking-tight text-[#0B3155]"
      >
        다시 만나서 반가워요!
      </h2>
      <p class="mt-2 text-[13.5px] font-medium leading-relaxed text-[#7186A0]">
        워케이션 여정을 이어가려면<br />아이디와 비밀번호를 입력해 주세요.
      </p>

      <!-- 입력 폼 -->
      <div class="mt-7 flex flex-col gap-5">
        <!-- 아이디 (이메일 또는 휴대폰 번호) -->
        <div>
          <label
            for="login-id"
            class="mb-2 block text-[13px] font-bold text-[#191F28]"
          >
            아이디
          </label>
          <div class="relative">
            <BaseInput
              id="login-id"
              :model-value="loginIdDisplay"
              :inputmode="isEmail || !isPhoneDigits ? 'email' : 'numeric'"
              placeholder="이메일 또는 휴대폰 번호"
              autocomplete="username"
              :has-error="!!errors.loginId"
              :error-message="errors.loginId"
              class="h-[50px] rounded-[16px] pr-11 text-[15px]"
              @update:model-value="handleLoginIdInput"
              @input="restoreCaretAfterFormat"
              @blur="errors.loginId = validateLoginId(loginId)"
              @keyup.enter="handleLogin"
            />
            <component
              :is="isEmail || !isPhoneDigits ? Mail : Phone"
              :size="18"
              class="pointer-events-none absolute right-4 top-[25px] -translate-y-1/2 text-[#B9C5D2]"
            />
          </div>
        </div>

        <!-- 비밀번호 -->
        <div>
          <label
            for="login-password"
            class="mb-2 block text-[13px] font-bold text-[#191F28]"
          >
            비밀번호
          </label>
          <div class="relative">
            <BaseInput
              id="login-password"
              v-model="password"
              :type="isPasswordVisible ? 'text' : 'password'"
              inputmode="text"
              placeholder="비밀번호"
              autocomplete="current-password"
              :has-error="!!errors.password"
              :error-message="errors.password"
              class="h-[50px] rounded-[16px] pr-12 text-[15px]"
              @update:model-value="errors.password = ''"
              @blur="errors.password = validatePassword(password)"
              @keyup.enter="handleLogin"
            />
            <button
              type="button"
              class="absolute right-2 top-[25px] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-[#B9C5D2] transition-colors hover:bg-[#F5F8FC] hover:text-[#2878F0] active:scale-95"
              :aria-label="
                isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'
              "
              :aria-pressed="isPasswordVisible"
              aria-controls="login-password"
              @mousedown.prevent
              @click="isPasswordVisible = !isPasswordVisible"
            >
              <EyeOff v-if="isPasswordVisible" :size="19" />
              <Eye v-else :size="19" />
            </button>
          </div>
        </div>
      </div>

      <!-- 아이디 찾기 · 비밀번호 찾기 -->
      <div class="mt-6 flex items-center justify-center gap-1">
        <button
          type="button"
          class="px-2 py-1 text-[13px] font-semibold text-[#2878F0] transition-colors hover:text-[#1E68D6] active:scale-95"
          @click="router.push('/find-id')"
        >
          아이디 찾기
        </button>
        <span class="text-[#CCD8E6]">|</span>
        <button
          type="button"
          class="px-2 py-1 text-[13px] font-semibold text-[#2878F0] transition-colors hover:text-[#1E68D6] active:scale-95"
          @click="router.push('/password-reset')"
        >
          비밀번호 찾기
        </button>
      </div>
    </main>

    <!-- 하단: 로그인 / 회원가입 -->
    <footer
      class="shrink-0 flex flex-col items-center px-6 pt-3 pb-[max(env(safe-area-inset-bottom),28px)]"
    >
      <BaseButton
        :disabled="isSubmitting || !canSubmit"
        class="bg-gradient-to-b from-[#3B9BE8] to-[#2878F0]"
        @click="handleLogin"
      >
        {{ isSubmitting ? '로그인 중...' : '로그인' }}
      </BaseButton>

      <button
        type="button"
        class="mt-5 text-[13.5px] font-semibold text-[#2878F0] transition-colors hover:text-[#1E68D6] active:scale-95"
        @click="router.push('/signup/terms')"
      >
        아직 계정이 없으신가요?
        <span class="underline underline-offset-4">회원가입</span>
      </button>
    </footer>
  </div>
</template>
