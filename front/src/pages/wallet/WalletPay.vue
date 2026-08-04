<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import QRCode from 'qrcode';
import { ChevronLeft } from '@lucide/vue';

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
    color: { dark: '#1e293b', light: '#ffffff' },
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
    class="flex flex-col items-center w-full min-h-screen px-5 py-6 text-center bg-white"
  >
    <div class="w-full flex items-center mb-8">
      <button type="button" @click="router.back()">
        <ChevronLeft :size="24" />
      </button>
      <h1 class="text-xl font-bold ml-2">결제 QR</h1>
    </div>

    <p class="text-[15px] text-gray-600 mb-6">
      가맹점 단말기에 QR코드를 보여주세요.
    </p>

    <div class="border rounded-2xl p-4 mb-4 shadow-sm relative">
      <img
        v-if="qrCodeUrl"
        :src="qrCodeUrl"
        alt="결제 QR 코드"
        class="w-64 h-64"
      />
      <div
        v-else
        class="w-64 h-64 flex items-center justify-center text-gray-400 text-[14px]"
      >
        QR 생성 중...
      </div>
    </div>

    <!-- 남은 시간 표시 및 수동 새로고침 버튼 -->
    <div class="flex items-center gap-2 mb-8 text-[14px]">
      <span class="text-gray-500">남은 시간</span>
      <span class="font-bold text-red-500 min-w-[24px]">{{ timeLeft }}초</span>
      <button
        type="button"
        class="ml-2 text-xs text-gray-500 underline hover:text-gray-800"
        @click="refreshQR"
      >
        새로고침
      </button>
    </div>
  </div>
</template>
