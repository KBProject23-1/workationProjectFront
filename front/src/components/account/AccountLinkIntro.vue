<script setup>
import { useRouter } from 'vue-router';
import { ChevronLeft, Check, ShieldCheck, Zap, Lock } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';

const props = defineProps({
  isAdditional: { type: Boolean, default: false },
});

defineEmits(['start']);

const router = useRouter();

const features = [
  { icon: ShieldCheck, label: '안전한 연동' },
  { icon: Zap, label: '간편한 관리' },
  { icon: Lock, label: '데이터 보호' },
];

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
    class="flex flex-col items-center w-full min-h-screen px-5 py-5 text-center bg-white"
  >
    <button
      type="button"
      class="mb-4 self-start p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full active:bg-gray-100 transition-colors"
      @click="handleBack"
    >
      <ChevronLeft :size="24" />
    </button>

    <h1 class="text-[24px] font-bold mb-2 text-gray-900">계좌 연동</h1>
    <p class="text-[14px] font-medium text-gray-600 leading-relaxed mb-1">
      안전하게 계좌를 연동하고<br />사용 내역을 한눈에 관리하세요.
    </p>
    <p class="text-[13px] text-gray-400 mb-6">
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

      <ul class="w-full max-w-xs space-y-2">
        <li
          v-for="feature in features"
          :key="feature.label"
          class="flex items-center gap-3 rounded-2xl bg-gray-50/70 border border-gray-100 px-4 py-3"
        >
          <div
            class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"
          >
            <component :is="feature.icon" :size="16" />
          </div>
          <span class="text-[14px] font-bold text-gray-800">{{
            feature.label
          }}</span>
        </li>
      </ul>
    </div>

    <BaseButton class="w-full max-w-md" @click="$emit('start')"
      >계좌 연동 시작</BaseButton
    >
  </div>
</template>
