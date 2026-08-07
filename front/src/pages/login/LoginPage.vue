<script setup>
// 로그인 화면 임시 placeholder — 실제 로그인 화면 구현 시 이 파일을 교체한다. (Auth Store 구현 이슈)
// 현재는 임시 로그인 화면인 DevLogin(/dev-login)으로 연결한다.
import { useRouter } from 'vue-router';
import BaseButton from '@/components/common/BaseButton.vue';
import splashLogo from '@/assets/images/splash-logo.png';

const router = useRouter();
</script>

<template>
  <div
    class="relative flex flex-col items-center justify-center w-full min-h-screen bg-white px-6 overflow-hidden"
  >
    <!-- 앱 로고 -->
    <img
      :src="splashLogo"
      alt="Workit 로고"
      class="w-[120px] h-auto select-none"
      draggable="false"
    />

    <h1 class="mt-6 text-[28px] font-bold tracking-tight text-[#191F28]">로그인</h1>
    <p class="mt-2 text-[14px] font-medium text-[#7186A0]">
      Workit 서비스 이용을 위해 로그인해 주세요
    </p>

    <!-- 임시 화면 안내 카드 -->
    <div
      class="w-full max-w-[340px] mt-10 p-5 rounded-[20px] bg-[#F5F8FC] border border-[#DFE7F0] text-center"
    >
      <p class="text-[13px] font-semibold text-[#2878F0]">임시 화면</p>
      <p class="mt-2 text-[13.5px] font-medium text-[#6B7280] leading-relaxed">
        로그인 화면은 구현 예정이에요.<br />
        지금은 임시 로그인(dev-login)을 이용해 주세요.
      </p>
    </div>

    <div class="w-full mt-6">
      <BaseButton @click="router.push('/dev-login')">
        개발용 로그인으로 이동
      </BaseButton>
    </div>

    <button
      type="button"
      class="mt-6 text-[13.5px] font-semibold text-[#2878F0] underline underline-offset-4 hover:text-[#1E68D6] transition-colors"
      @click="router.push('/signup')"
    >
      아직 계정이 없으신가요? 회원가입
    </button>
  </div>
</template>
