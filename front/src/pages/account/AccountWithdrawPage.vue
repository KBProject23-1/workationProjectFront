<script setup>
// 회원 탈퇴 화면 — /account/me/withdraw
// - 이번 작업은 계정 설정 메인 화면 구현이 목표 — 탈퇴 상세 UI 는 별도 작업에서 구현한다.
// - 진입 route 만 열어두고 준비 안내만 표시한다 (DELETE /users/me 재사용 예정).
import { useRouter } from 'vue-router';
import { ChevronLeft } from '@lucide/vue';

const router = useRouter();

function goBack() {
  router.back();
}
</script>

<template>
  <main class="flex min-h-screen flex-col bg-white px-5 pt-4 pb-8">
    <header class="relative mb-6 flex items-center justify-center">
      <button
        type="button"
        class="absolute left-0 -ml-2 flex h-11 w-11 items-center justify-center text-slate-900"
        aria-label="뒤로 가기"
        @click="goBack"
      >
        <ChevronLeft class="h-7 w-7" />
      </button>
      <h1 class="text-base font-bold text-slate-900">회원 탈퇴</h1>
    </header>

    <p class="text-[13px] font-medium leading-relaxed text-slate-500">
      회원 탈퇴 기능은 준비 중이에요.<br />다음 업데이트에서 만나요!
    </p>
  </main>
</template>
