<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import splashLogo from '@/assets/images/splash-logo.png';

const router = useRouter();

// 스플래시 노출 시간 (ms)
const SPLASH_DURATION = 2000;

let redirectTimer = null;

// TODO: 로그인 상태 확인은 추후 Auth Store 구현 이슈에서 처리한다.
// 현재는 온보딩 완료 여부(localStorage.onboardingCompleted)만으로 분기한다.
// onboardingCompleted === 'true'  → /login (로그인 화면 Placeholder)
// 그 외(false/없음)              → /onboarding (온보딩 화면 Placeholder)
function redirectToNextPage() {
  const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';
  router.replace(onboardingCompleted ? '/login' : '/onboarding');
}

onMounted(() => {
  redirectTimer = setTimeout(redirectToNextPage, SPLASH_DURATION);
});

onUnmounted(() => {
  if (redirectTimer) clearTimeout(redirectTimer);
});
</script>

<template>
  <div
    class="relative flex flex-col items-center justify-center w-full h-dvh bg-white px-6 overflow-hidden"
  >
    <!-- 앱 로고 -->
    <img
      :src="splashLogo"
      alt="Workit 로고"
      class="w-[150px] h-auto select-none"
      draggable="false"
    />

    <!-- 앱 이름 -->
    <h1
      class="mt-7 text-[32px] font-bold leading-tight tracking-tight text-[#191F28]"
    >
      Workit
    </h1>

    <!-- 태그라인 -->
    <p class="mt-2 text-[15px] font-medium tracking-wide text-[#7186A0]">
      Smart Wallet
    </p>

    <!-- 하단 로딩 바 (Figma 기준 파란 진행 표시 — 왼쪽→오른쪽으로 천천히 차오름) -->
    <div
      class="absolute left-0 right-0 bottom-[max(env(safe-area-inset-bottom),32px)] flex justify-center"
    >
      <div class="w-[120px] h-[3px] rounded-full bg-[#DFE7F0] overflow-hidden">
        <div
          class="splash-progress-fill h-full rounded-full bg-[#2878F0]"
          :style="{ animationDuration: `${SPLASH_DURATION}ms` }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.splash-progress-fill {
  width: 0;
  animation-name: splash-progress-fill;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes splash-progress-fill {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}
</style>
