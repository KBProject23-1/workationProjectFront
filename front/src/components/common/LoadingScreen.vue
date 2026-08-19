<script setup>
import { LoaderCircle } from '@lucide/vue';

// 계좌/카드 목록 불러오기·연동 처리 등에서 "처리되는 느낌"을 주는 단일 로딩 화면.
// 순수 표현용 컴포넌트로, 노출 시간(최소 대기)은 호출하는 쪽에서 delay 로 보장한다.
defineProps({
  title: { type: String, default: '불러오고 있어요' },
  description: { type: String, default: '잠시만 기다려 주세요' },
  // 페이지 단독 로딩 화면일 때만 min-h-screen 을 쓴다. 이미 헤더가 떠 있는 페이지에
  // 얹으면 화면 두 개 높이가 되어 버려서, 그런 곳은 fullscreen=false 로 남은 공간만 채운다.
  fullscreen: { type: Boolean, default: true },
});
</script>

<template>
  <div
    class="flex flex-col items-center justify-center w-full px-5 py-5 bg-white text-center"
    :class="fullscreen ? 'min-h-screen' : 'flex-1'"
  >
    <div
      class="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 shadow-xs text-blue-600"
    >
      <LoaderCircle :size="30" :stroke-width="2.5" class="animate-spin" />
    </div>

    <h1 class="text-[20px] font-bold text-gray-900 mb-2">{{ title }}</h1>
    <p class="text-[14px] font-medium text-gray-400">{{ description }}</p>
  </div>
</template>
