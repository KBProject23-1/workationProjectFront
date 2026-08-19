<script setup>
// 회원가입 완료 화면 — /signup/complete
// - 계정정보 입력(/signup)에서 회원가입이 성공하면 진입한다 (Figma: 회원가입완료.svg).
// - 로그인 아이디(이메일)를 안내 카드로 보여준다.
// - '로그인하기' → 로그인 화면(/login)으로 이동한다 (PIN 등록 화면 이동은 제거됨).
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Check, Mail } from '@lucide/vue';
import { useAuthStore } from '@/stores/authStore';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';

const router = useRouter();
const authStore = useAuthStore();

// 가입 완료 직후 보관된 로그인 아이디(이메일) — 가입 플로우를 거치지 않은 직접 진입은 차단한다
const email = computed(() => authStore.signupEmail);

onMounted(() => {
  // 회원가입을 완료하지 않고 /signup/complete 로 직접 진입한 경우 계정정보 입력부터 다시 시작한다.
  // (signupEmail 은 인메모리 보관이라 새로고침 시에도 비어 있음 — 다른 signup 플로우 페이지와 동일한 가드 패턴)
  if (!authStore.signupEmail) {
    router.replace('/signup');
  }
});

function goBack() {
  // 완료 화면에서 뒤로가면 계정정보 입력으로 돌아간다 (재시도 목적이 아니라면 시작하기 권장)
  if (window.history.length > 1) router.back();
  else router.replace('/signup');
}

function goNext() {
  // 회원가입 완료 후 로그인 화면으로 이동 (PIN 등록 화면이 아닌 로그인부터 시작)
  router.replace('/login');
}
</script>

<template>
  <div class="flex flex-col h-dvh bg-white overflow-hidden">
    <!-- 헤더 -->
    <div class="shrink-0 px-5 pt-4">
      <BaseHeader
        title="회원가입"
        @back="goBack"
      />
    </div>

    <!-- 본문 -->
    <main class="flex min-h-0 flex-1 flex-col items-center px-6 pt-10 pb-6">
      <!-- 성공 체크 서클 -->
      <div class="flex h-20 w-20 items-center justify-center rounded-full bg-[#EAF4FF]">
        <Check :size="40" :stroke-width="3" class="text-[#2878F0]" />
      </div>

      <h2 class="mt-6 text-[22px] font-extrabold leading-snug tracking-tight text-[#191F28]">
        회원가입이 완료되었습니다
      </h2>
      <p class="mt-3 text-[13.5px] font-medium leading-relaxed text-[#7186A0]">
        환영합니다.<br />
        가입하신 아이디로 로그인하여<br />
        워케이션 여정을 시작해 보세요.
      </p>

      <!-- 로그인 아이디 안내 카드 -->
      <div
        class="mt-8 w-full rounded-[20px] bg-[#F7FAFE] border border-[#DCE5EF] px-5 py-4"
      >
        <div class="flex items-center gap-2.5">
          <Mail :size="16" class="shrink-0 text-[#7186A0]" :stroke-width="2" />
          <span class="text-[12.5px] font-semibold text-[#7186A0]">로그인 아이디</span>
        </div>
        <p class="mt-1.5 text-[15px] font-bold tracking-tight text-[#0B3155]">
          {{ email || '—' }}
        </p>
      </div>
    </main>

    <!-- 하단: 로그인하기 버튼 (BaseButton 공통 스타일) -->
    <footer
      class="shrink-0 flex flex-col items-center px-6 pt-3 pb-[max(env(safe-area-inset-bottom),28px)]"
    >
      <BaseButton @click="goNext">
        로그인하기
      </BaseButton>
    </footer>
  </div>
</template>
