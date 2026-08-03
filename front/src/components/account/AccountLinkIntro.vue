<script setup>
import { useRouter } from 'vue-router';
import { ChevronLeft, Check } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';

const props = defineProps({
  isAdditional: { type: Boolean, default: false },
});

defineEmits(['start']);

const router = useRouter();

function handleBack() {
  if (props.isAdditional) {
    router.push('/wallet');
  } else {
    router.back();
  }
}
</script>

<template>
  <div
    class="flex flex-col items-center w-full min-h-screen px-5 py-6 text-center bg-white"
  >
    <button type="button" class="mb-4 self-start" @click="handleBack">
      <ChevronLeft :size="24" />
    </button>

    <h1 class="text-4xl font-bold mb-2 text-gray-900">계좌 연동</h1>
    <p class="text-[18px] font-medium text-gray-800 leading-relaxed mb-1">
      안전하게 계좌를 연동하고<br />사용 내역을 한눈에 관리하세요.
    </p>
    <p class="text-[16px] text-gray-400 mb-6">
      금융정보원 표준 API를 통해<br />안전하게 연결됩니다.
    </p>

    <div class="flex flex-col items-center justify-center flex-1 w-full">
      <div
        class="relative flex justify-center items-center my-4 w-[40%] max-w-56 min-w-32 aspect-square"
      >
        <div class="absolute inset-0 bg-blue-50 rounded-full opacity-60" />
        <div class="relative w-3/4 h-3/4">
          <svg class="w-full h-full" viewBox="0 0 100 100">
            <path
              d="M10 45 L50 15 L90 45"
              fill="none"
              stroke="#3b82f6"
              stroke-width="8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <rect x="15" y="45" width="70" height="40" rx="4" fill="#1e3a8a" />
            <line
              x1="30"
              y1="55"
              x2="30"
              y2="75"
              stroke="white"
              stroke-width="4"
              stroke-linecap="round"
            />
            <line
              x1="50"
              y1="55"
              x2="50"
              y2="75"
              stroke="white"
              stroke-width="4"
              stroke-linecap="round"
            />
            <line
              x1="70"
              y1="55"
              x2="70"
              y2="75"
              stroke="white"
              stroke-width="4"
              stroke-linecap="round"
            />
          </svg>
          <div
            class="absolute -bottom-2 -right-2 w-[28%] aspect-square min-w-10 max-w-14 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-blue-50"
          >
            <div
              class="w-2/3 h-2/3 bg-blue-600 rounded-full flex items-center justify-center text-white"
            >
              <Check class="w-1/2 h-1/2" :stroke-width="3" />
            </div>
          </div>
        </div>
      </div>

      <ul
        class="text-[32px] font-semibold text-blue-600 space-y-2 inline-block text-left"
      >
        <li class="flex items-center gap-2">
          <Check :size="20" :stroke-width="3" class="text-blue-500 shrink-0" />
          안전한 연동
        </li>
        <li class="flex items-center gap-2">
          <Check :size="20" :stroke-width="3" class="text-blue-500 shrink-0" />
          간편한 관리
        </li>
        <li class="flex items-center gap-2">
          <Check :size="20" :stroke-width="3" class="text-blue-500 shrink-0" />
          데이터 보호
        </li>
      </ul>
    </div>

    <BaseButton class="w-full max-w-md" @click="$emit('start')"
      >계좌 연동 시작</BaseButton
    >
  </div>
</template>
