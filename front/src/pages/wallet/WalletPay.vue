<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import QRCode from 'qrcode';
import { ChevronLeft, RotateCw, QrCode as QrIcon } from '@lucide/vue';

const router = useRouter();
const qrCodeUrl = ref('');

const TIMER_SECONDS = 30;
const timeLeft = ref(TIMER_SECONDS);
let timerInterval = null;

async function generateQR() {
  // 실제 결제 API 미구현 - 임의 값으로 QR 생성
  const dummyPayload = JSON.stringify({
    type: 'WORKIT_PAY',
    timestamp: Date.now(),
    token: Math.random().toString(36).slice(2),
  });
  qrCodeUrl.value = await QRCode.toDataURL(dummyPayload, {
    width: 280,
    margin: 1,
    color: { dark: '#0f172a', light: '#ffffff' },
  });
}

// 타이머 시작 함수
function startTimer() {
  clearInterval(timerInterval); // 기존 타이머가 있다면 제거
  timeLeft.value = TIMER_SECONDS;

  timerInterval = setInterval(() => {
    timeLeft.value -= 1;

    // 0초가 되면 QR을 다시 갱신하고 타이머를 리셋
    if (timeLeft.value <= 0) {
      generateQR();
      timeLeft.value = TIMER_SECONDS;
    }
  }, 1000);
}

// 수동으로 '재생성' 버튼 누를 때 사용할 함수
function refreshQR() {
  generateQR();
  startTimer();
}

onMounted(() => {
  generateQR();
  startTimer();
});

// 컴포넌트 해제 시 타이머 메모리 누수 방지
onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<template>
  <div
    class="flex flex-col items-center w-full min-h-screen px-5 py-5 bg-gray-50 text-center"
  >
    <!-- 상단 헤더 -->
    <div class="w-full flex items-center justify-between mb-6">
      <button
        type="button"
        class="p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full active:bg-gray-200/60 transition-colors"
        @click="router.back()"
      >
        <ChevronLeft :size="24" />
      </button>
      <h1 class="text-[18px] font-bold text-gray-900">결제 QR</h1>
      <!-- 좌우 대칭용 더미 영역: 뒤로가기 버튼의 실제 점유 폭(아이콘 24px + padding 8px - 음수 마진 4px = 28px)과 맞춤 -->
      <div class="w-[28px]"></div>
    </div>

    <!-- 안내 텍스트 -->
    <p class="text-[14px] font-medium text-gray-500 mb-6">
      가맹점 단말기나 스캐너에 QR코드를 보여주세요
    </p>

    <!-- 메인 QR 카드 패널 (티켓/페이 전용 패널 느낌) -->
    <div
      class="w-full max-w-xs bg-white rounded-[28px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col items-center relative overflow-hidden"
    >
      <!-- 은은한 탑 포인트 테두리 선 -->
      <div class="absolute top-0 left-0 right-0 h-1.5 bg-primary"></div>

      <!-- QR 이미지 영역 -->
      <div
        class="p-3 bg-white rounded-2xl border border-gray-100 shadow-xs mb-5 relative"
      >
        <img
          v-if="qrCodeUrl"
          :src="qrCodeUrl"
          alt="결제 QR 코드"
          class="w-60 h-60 object-contain rounded-lg"
        />
        <div
          v-else
          class="w-60 h-60 flex flex-col items-center justify-center text-gray-500 gap-2"
        >
          <QrIcon :size="32" class="animate-pulse text-gray-500" />
          <span class="text-[13px] font-medium">QR 코드를 생성하고 있어요</span>
        </div>
      </div>

      <!-- 남은 시간 & 새로고침 알약 버튼 -->
      <div
        class="flex items-center justify-between w-full px-2 pt-2 border-t border-gray-100/80"
      >
        <div class="flex items-center gap-1.5 text-[13px]">
          <span class="font-semibold text-gray-500">유효시간</span>
          <span class="font-extrabold text-red-500 min-w-[28px] text-[14px]">
            {{ timeLeft }}초
          </span>
        </div>

        <button
          type="button"
          class="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200/70 active:scale-95 text-gray-600 font-semibold text-[12px] transition-all"
          @click="refreshQR"
        >
          <RotateCw :size="12" class="text-gray-500" />
          새로고침
        </button>
      </div>
    </div>

    <!-- 하단 안심 결제 안내 -->
    <p class="text-[12px] text-gray-500 mt-8">
      보안을 위해 유효시간이 지나면 QR코드가 자동으로 갱신됩니다
    </p>
  </div>
</template>
