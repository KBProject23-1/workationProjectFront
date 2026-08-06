<script setup>
import { ref } from 'vue';
import { toast } from 'vue-sonner';
import { AlertTriangle, LogIn, Trash2 } from '@lucide/vue';
import axiosInstance from '@/api/axiosInstance';
import BaseButton from '@/components/common/BaseButton.vue';

// 임시 개발용 로그인 페이지 — 실제 로그인 페이지 merge 되면 이 파일과 devRouter.js 함께 삭제할 것
// 목적: 로그인 API를 직접 호출해 accessToken을 localStorage에 저장 → axiosInstance 인터셉터가
// 이후 모든 요청에 Authorization 헤더를 자동으로 붙여주게 한다 (다른 도메인 코드는 손댈 필요 없음)

const email = ref(localStorage.getItem('devLoginEmail') || '');
const password = ref('');
const isLoading = ref(false);
const lastResult = ref(null);

const hasToken = ref(!!localStorage.getItem('accessToken'));

async function handleLogin() {
  if (!email.value.trim() || !password.value.trim()) {
    toast.error('이메일과 비밀번호를 입력해 주세요.');
    return;
  }

  isLoading.value = true;
  try {
    const { data } = await axiosInstance.post('/auth/login', {
      loginType: 'PASSWORD',
      loginId: email.value.trim(),
      password: password.value,
    });

    localStorage.setItem('accessToken', data.token_info.access_token);
    localStorage.setItem('devLoginEmail', email.value.trim());
    hasToken.value = true;
    lastResult.value = {
      userId: data.userId,
      name: data.name,
      expiresIn: data.token_info.access_token_expires_in,
    };

    toast.success(`로그인 완료 (userId: ${data.userId}) — 토큰이 저장됐어요.`);
  } catch (err) {
    toast.error(err?.message || '로그인에 실패했어요.');
  } finally {
    isLoading.value = false;
  }
}

function clearToken() {
  localStorage.removeItem('accessToken');
  hasToken.value = false;
  lastResult.value = null;
  toast.success('저장된 토큰을 삭제했어요.');
}
</script>

<template>
  <div class="w-full min-h-screen px-5 py-8 bg-gray-50">
    <div
      class="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 mb-6"
    >
      <AlertTriangle :size="18" class="text-amber-500 shrink-0 mt-0.5" />
      <p class="text-[12.5px] font-medium text-amber-800 leading-relaxed">
        임시 개발용 페이지예요. 로그인 API를 직접 호출해서 받은 accessToken을
        브라우저 localStorage에 저장하기만 합니다. 실제 로그인 화면이 머지되면
        이 페이지는 삭제될 예정이에요.
      </p>
    </div>

    <h1 class="text-[20px] font-bold text-gray-900 mb-1">Dev Login</h1>
    <p class="text-[13px] font-medium text-gray-400 mb-6">
      테스트 계정으로 로그인해서 accessToken을 저장해요
    </p>

    <div class="flex flex-col gap-3 mb-5">
      <input
        v-model="email"
        type="email"
        placeholder="이메일 (loginId)"
        class="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-[14px] outline-none focus:border-gray-400 transition-colors"
        @keyup.enter="handleLogin"
      />
      <input
        v-model="password"
        type="password"
        placeholder="비밀번호"
        class="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-[14px] outline-none focus:border-gray-400 transition-colors"
        @keyup.enter="handleLogin"
      />
    </div>

    <div class="text-center mb-8">
      <BaseButton :disabled="isLoading" @click="handleLogin">
        <LogIn :size="18" class="mr-1.5" />
        {{ isLoading ? '로그인 중...' : '로그인하고 토큰 저장' }}
      </BaseButton>
    </div>

    <div class="p-4 rounded-2xl bg-white border border-gray-100">
      <div class="flex items-center justify-between mb-3">
        <p class="text-[13px] font-bold text-gray-900">현재 토큰 상태</p>
        <button
          v-if="hasToken"
          type="button"
          class="flex items-center gap-1 text-[12px] font-semibold text-red-500 hover:text-red-600"
          @click="clearToken"
        >
          <Trash2 :size="13" />
          삭제
        </button>
      </div>

      <p v-if="!hasToken" class="text-[13px] text-gray-400">
        저장된 accessToken이 없어요.
      </p>
      <div v-else class="flex flex-col gap-1 text-[13px] text-gray-600">
        <p>accessToken 저장됨</p>
        <p v-if="lastResult">
          userId: {{ lastResult.userId }} · {{ lastResult.name }}
        </p>
        <p v-if="lastResult" class="text-gray-400">
          유효시간 {{ lastResult.expiresIn }}초 (만료되면 다시 로그인)
        </p>
      </div>
    </div>
  </div>
</template>
