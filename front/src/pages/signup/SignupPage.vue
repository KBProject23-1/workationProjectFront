<script setup>
// 회원가입 화면 임시 placeholder — 실제 회원가입 플로우(약관 동의 → 본인인증 → 계정 생성) 구현 시 교체 예정
// 온보딩 '시작하기'를 통해 진입한다.
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

    <h1 class="mt-6 text-[28px] font-bold tracking-tight text-[#191F28]">회원가입</h1>
    <p class="mt-2 text-[14px] font-medium text-[#7186A0]">
      워케이션 여정을 함께 시작해 볼까요?
    </p>

    <!-- 준비 중 안내 카드 -->
    <div
      class="w-full max-w-[340px] mt-10 p-5 rounded-[20px] bg-[#F5F8FC] border border-[#DFE7F0] text-center"
    >
      <p class="text-[13px] font-semibold text-[#2878F0]">준비 중</p>
      <p class="mt-2 text-[13.5px] font-medium text-[#6B7280] leading-relaxed">
        회원가입 화면은 구현 예정이에요.<br />
        지금은 로그인 화면으로 이동해 주세요.
      </p>
    </div>

    <div class="w-full mt-6">
      <BaseButton @click="router.push('/login')">
        로그인 화면으로 이동
      </BaseButton>
    </div>
  </div>
</template>
