<script setup>
// 계정 설정 화면 — /account/me/settings
// - 로그인 사용자의 계정 정보(이름/휴대폰/이메일)를 확인하고 휴대폰·이메일·비밀번호 변경, 회원 탈퇴로 이동한다.
// - 진입 시 현재 비밀번호 재인증(POST /users/me/account/verify)을 통과해야 메인 화면을 표시한다.
//   재인증 성공 여부는 서버가 저장하지 않으므로 authStore.accountVerified(인메모리)로만 유지한다 —
//   휴대폰/이메일/비밀번호 변경 화면에서 뒤로 와도 다시 입력하지 않으며 새로고침/로그아웃 시 초기화.
// - 사용자 정보는 authStore.fetchMyInfo(GET /users/me) 를 재사용한다 (중복 API 금지 — Page → Store → API Module).
// - 휴대폰/이메일/비밀번호 변경·회원 탈퇴 상세 화면은 이번 작업 범위 밖 — 버튼은 해당 route 로 이동만 한다.
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ChevronRight, Eye, EyeOff } from '@lucide/vue';
import { useAuthStore } from '@/stores/authStore';
import { useErrorToast } from '@/composables/useErrorToast';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';

const router = useRouter();
const authStore = useAuthStore();
// accountVerified: 계정 설정 진입 비밀번호 재인증 통과 여부 (authStore 인메모리 —
// 변경 화면(휴대폰/이메일/비밀번호)에서 뒤로 와도 유지, 새로고침/로그아웃 시 초기화)
const { user, accountVerified } = storeToRefs(authStore);
const { showError } = useErrorToast();

// 사용자 정보 최초 로딩
const loading = ref(true);
const password = ref('');
const isPasswordVisible = ref(false);
const isVerifying = ref(false);

// 휴대폰 번호는 010-0000-0000 형식으로 표기한다 (저장값은 하이픈 없는 숫자 — 내 정보 화면과 동일 규칙)
function formatPhone(digits) {
  const d = (digits || '').replace(/\D/g, '');
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
}

function goBack() {
  router.back();
}

// 재인증 확인 — API 성공 여부로만 다음 화면 진입을 판단한다 (실패 시 메인 화면으로 이동시키지 않는다)
async function handleVerify() {
  if (!password.value || isVerifying.value) return;
  isVerifying.value = true;
  try {
    await authStore.verifyAccountPassword(password.value);
    // 성공 시 authStore.accountVerified 가 true 가 된다 (변경 화면에서 돌아와도 유지)
    password.value = ''; // 비밀번호 원문을 메모리에 남기지 않는다
    // 진입 전 사용자 정보 조회가 실패했었다면 메인 화면 표시 전에 한 번 더 시도한다
    if (!user.value) {
      try {
        await authStore.fetchMyInfo();
      } catch (err) {
        showError(err, '내 정보를 불러오지 못했어요.');
      }
    }
  } catch (err) {
    // 서버 메시지(비밀번호 불일치 등)는 err.message 로 토스트에 표시된다 (인터셉터가 치환)
    showError(err, '비밀번호를 확인하지 못했어요. 다시 시도해 주세요.');
  } finally {
    isVerifying.value = false;
  }
}

onMounted(async () => {
  try {
    await authStore.fetchMyInfo();
  } catch (err) {
    showError(err, '내 정보를 불러오지 못했어요.');
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <main class="min-h-screen bg-white px-5 pt-4 pb-8">
    <LoadingScreen
      v-if="loading"
      title="계정 정보를 불러오고 있어요"
      description="잠시만 기다려 주세요"
    />

    <!-- 진입 비밀번호 재인증 — API 성공 시에만 메인 화면으로 전환 -->
    <template v-else-if="!accountVerified">
      <div class="mb-6">
        <BaseHeader
          title="계정 설정"
          @back="goBack"
        />
      </div>

      <p class="text-[13px] font-medium leading-relaxed text-slate-500">
        안전한 계정 관리를 위해<br />현재 비밀번호를 입력해주세요.
      </p>

      <div class="mt-7">
        <label
          for="account-settings-password"
          class="mb-2 block text-[13px] font-bold text-slate-900"
        >
          현재 비밀번호
        </label>
        <div class="relative">
          <BaseInput
            id="account-settings-password"
            v-model="password"
            :type="isPasswordVisible ? 'text' : 'password'"
            inputmode="text"
            placeholder="현재 비밀번호를 입력해 주세요"
            autocomplete="current-password"
            class="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 pr-12 text-[15px] font-medium text-slate-900 placeholder:text-slate-400"
            @keyup.enter="handleVerify"
          />
          <button
            type="button"
            class="absolute right-2 top-6 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
            :aria-label="
              isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'
            "
            :aria-pressed="isPasswordVisible"
            aria-controls="account-settings-password"
            @mousedown.prevent
            @click="isPasswordVisible = !isPasswordVisible"
          >
            <EyeOff v-if="isPasswordVisible" :size="19" />
            <Eye v-else :size="19" />
          </button>
        </div>
      </div>

      <div class="flex-1" />

      <!-- 확인 버튼 — 비밀번호 입력 + 요청 중이 아닐 때만 활성화 (중복 클릭 방지) -->
      <div class="pt-8 text-center">
        <BaseButton
          :disabled="!password || isVerifying"
          class="w-full py-3.5 text-[15px] font-bold rounded-2xl"
          @click="handleVerify"
        >
          {{ isVerifying ? '확인 중...' : '확인' }}
        </BaseButton>
      </div>
    </template>

    <!-- 계정 설정 메인 -->
    <template v-else>
      <!-- 헤더 -->
      <div class="mb-4">
        <BaseHeader
          title="계정 설정"
          @back="goBack"
        />
      </div>

      <!-- ① 계정 정보 — 이름은 수정할 수 없는 표시 전용 -->
      <section>
        <div
          class="overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <p class="px-5 pt-3.5 text-xs font-medium text-slate-400">
            계정 정보
          </p>
          <div class="mt-1 divide-y divide-slate-100">
            <div class="flex w-full items-center justify-between px-5 py-4">
              <span class="text-[15px] font-medium text-slate-900">이름</span>
              <span class="text-[15px] font-medium text-slate-400">
                {{ user?.name }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ② 계정 — 휴대폰 번호 / 이메일 변경 진입 -->
      <section class="mt-3">
        <div
          class="overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <p class="px-5 pt-3.5 text-xs font-medium text-slate-400">계정</p>
          <div class="mt-1 divide-y divide-slate-100">
            <div class="flex w-full items-center justify-between px-5 py-4">
              <div>
                <p class="text-[15px] font-medium text-slate-900">
                  휴대폰 번호
                </p>
                <p class="mt-1 text-[13px] font-medium text-slate-400">
                  {{ formatPhone(user?.phoneNumber) }}
                </p>
              </div>
              <button
                type="button"
                class="flex items-center gap-0.5 text-[14px] font-semibold text-blue-600 transition-opacity active:opacity-70"
                @click="router.push('/account/me/phone')"
              >
                변경하기
                <ChevronRight :size="16" />
              </button>
            </div>
            <div class="flex w-full items-center justify-between px-5 py-4">
              <div>
                <p class="text-[15px] font-medium text-slate-900">이메일</p>
                <p class="mt-1 text-[13px] font-medium text-slate-400">
                  {{ user?.email }}
                </p>
              </div>
              <button
                type="button"
                class="flex items-center gap-0.5 text-[14px] font-semibold text-blue-600 transition-opacity active:opacity-70"
                @click="router.push('/account/me/email')"
              >
                변경하기
                <ChevronRight :size="16" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ③ 보안 — 비밀번호 변경 진입 (마지막 변경일은 GET /users/me 가 제공하지 않아 표시하지 않는다) -->
      <section class="mt-3">
        <div
          class="overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <p class="px-5 pt-3.5 text-xs font-medium text-slate-400">보안</p>
          <div class="mt-1 divide-y divide-slate-100">
            <button
              type="button"
              class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors active:bg-slate-50"
              @click="router.push('/account/me/password')"
            >
              <span class="text-[15px] font-medium text-slate-900"
                >비밀번호</span
              >
              <span
                class="flex items-center gap-0.5 text-[14px] font-semibold text-blue-600"
              >
                비밀번호 변경
                <ChevronRight :size="16" />
              </span>
            </button>
          </div>
        </div>
      </section>

      <!-- ④ 기타 — 회원 탈퇴 진입 -->
      <section class="mt-3">
        <div
          class="overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <p class="px-5 pt-3.5 text-xs font-medium text-slate-400">기타</p>
          <div class="mt-1 divide-y divide-slate-100">
            <button
              type="button"
              class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors active:bg-slate-50"
              @click="router.push('/account/me/withdraw')"
            >
              <span class="text-[15px] font-medium text-slate-900"
                >회원 탈퇴</span
              >
              <ChevronRight :size="16" class="shrink-0 text-slate-400" />
            </button>
          </div>
        </div>
      </section>
    </template>
  </main>
</template>
