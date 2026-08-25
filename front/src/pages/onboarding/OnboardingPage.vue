<script setup>
// 앱 소개(Onboarding) 화면 — 최초 실행 사용자에게 서비스 주요 기능을 소개하는 3-슬라이드 캐러셀
// 흐름: Splash → Onboarding → 시작하기 → 회원가입(/signup)
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import illust1 from '@/assets/images/onboarding/onboarding-1.svg';
import illust2 from '@/assets/images/onboarding/onboarding-2.svg';
import illust3 from '@/assets/images/onboarding/onboarding-3.svg';

const router = useRouter();

// Figma 디자인 기준 슬라이드 데이터
const slides = [
  {
    image: illust1,
    title: '워케이션을 더 스마트하게',
    description: '지금부터 혜택까지 한 번에 관리해 보세요.',
  },
  {
    image: illust2,
    title: '비즈니스에 딱 맞는 혜택',
    description: '임직원과 기업 모두를 위한 맞춤형 플랜을 추천해 드려요.',
  },
  {
    image: illust3,
    title: '간편한 예약과 정산',
    description: '복잡한 절차 없이 몇 번의 터치로 예약부터 정산까지 완료하세요.',
  },
];

const currentIndex = ref(0);
const isLast = computed(() => currentIndex.value === slides.length - 1);

const trackStyle = computed(() => ({
  transform: `translateX(-${currentIndex.value * 100}%)`,
}));

// 시작하기: 온보딩 완료 상태 저장 후 회원가입 화면으로 이동
// replace 사용 — 완료된 온보딩으로 브라우저 뒤로가기로 돌아오는 것을 방지
function finishOnboarding() {
  localStorage.setItem('onboardingCompleted', 'true');
  router.replace('/signup');
}

function goNext() {
  if (isLast.value) {
    finishOnboarding();
    return;
  }
  currentIndex.value += 1;
}

// 스와이프 지원 (모바일 터치)
let touchStartX = 0;
function onTouchStart(event) {
  touchStartX = event.changedTouches[0].clientX;
}
function onTouchEnd(event) {
  const delta = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) < 40) return;
  if (delta < 0) goNext();
  else if (delta > 0 && currentIndex.value > 0) currentIndex.value -= 1;
}
</script>

<template>
  <div class="flex flex-col h-dvh bg-white overflow-hidden">
    <!-- 슬라이드 영역 -->
    <div
      class="flex-1 min-h-0 overflow-hidden touch-pan-y"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
      <div
        class="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        :style="trackStyle"
      >
        <section
          v-for="(slide, index) in slides"
          :key="index"
          class="w-full shrink-0 flex flex-col px-7 pt-12"
          :aria-hidden="index !== currentIndex"
        >
          <!-- 제목 / 설명 (Figma 기준: 제목 26px extrabold / 설명 16px semibold) -->
          <h2 class="text-[26px] font-extrabold leading-snug tracking-tight text-[#0B3155]">
            {{ slide.title }}
          </h2>
          <p class="mt-3 text-[16px] font-semibold leading-relaxed text-[#7186A0]">
            {{ slide.description }}
          </p>

          <!-- 일러스트: 아트워크 기준으로 크롭된 (정사각형에 가까운) viewBox 비율을 유지한 채 컨테이너 안에 꽉 차게(fit) 배치
               max-h-full/max-w-full + aspect-square 로 화면 크기와 무관하게 왜곡·오버플로 없이 렌더링 -->
          <div class="flex-1 min-h-0 mt-2 flex items-center justify-center overflow-hidden">
            <img
              :src="slide.image"
              :alt="`온보딩 ${index + 1}번째 일러스트`"
              class="aspect-square max-h-full max-w-full select-none object-contain"
              draggable="false"
            />
          </div>
        </section>
      </div>
    </div>

    <!-- 하단: 페이지 도트 + CTA 버튼 (shrink-0 으로 화면 높이에 따라 눌리거나 밀리지 않도록 고정) -->
    <div class="shrink-0 flex flex-col items-center px-6 pt-4 pb-[max(env(safe-area-inset-bottom),28px)]">
      <div class="flex items-center gap-1.5 mb-6" aria-label="온보딩 페이지 표시">
        <button
          v-for="(_, index) in slides"
          :key="index"
          type="button"
          :aria-label="`${index + 1}번째 슬라이드로 이동`"
          :aria-current="index === currentIndex ? 'true' : undefined"
          class="h-2 rounded-full transition-all duration-300 ease-out"
          :class="
            index === currentIndex
              ? 'w-6 bg-[#2878F0]'
              : 'w-2 bg-[#C5D2E1] hover:bg-[#B7C8DA]'
          "
          @click="currentIndex = index"
        />
      </div>

      <button
        type="button"
        class="w-full max-w-[340px] h-[54px] rounded-full bg-gradient-to-b from-[#3B9BE8] to-[#2878F0] text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(40,120,240,0.32)] transition-all duration-200 hover:brightness-105 active:scale-[0.98] active:brightness-95"
        @click="goNext"
      >
        {{ isLast ? '시작하기' : '다음' }}
      </button>
    </div>
  </div>
</template>
