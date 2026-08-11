<script setup>
// 본인인증 실패 화면 (FAILURE 상태)
// - 백엔드가 거부한 사유(INVALID_OTP / OTP_ATTEMPTS_EXCEEDED 등)를 안내하고 재시도를 돕는다.
// - '다시 시도' → 세션 상태에 따라 OTP(오답) 또는 입력(재시작 필요) 화면으로 이동.
// - '취소' → 안내 화면(IDLE) 복귀 + 백엔드 세션 정리.
import { XCircle } from '@lucide/vue';

defineProps({
  message: { type: String, default: '' },
});

defineEmits(['retry', 'cancel']);
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-10 text-center">
    <div class="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
      <XCircle :size="44" :stroke-width="2" class="text-red-500" />
    </div>

    <h2 class="mt-6 text-[22px] font-extrabold leading-snug tracking-tight text-[#191F28]">
      본인인증에 실패했어요
    </h2>
    <p class="mt-2 text-[13px] font-medium leading-relaxed text-[#7186A0]">
      {{ message || '입력한 정보를 다시 확인해 주세요.' }}
    </p>

    <div class="mt-10 w-full space-y-2">
      <button
        type="button"
        class="w-full max-w-[340px] h-[54px] rounded-full bg-gradient-to-b from-[#3B9BE8] to-[#2878F0] text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(40,120,240,0.32)] transition-all duration-200 hover:brightness-105 active:scale-[0.98] active:brightness-95"
        @click="$emit('retry')"
      >
        다시 시도
      </button>
      <button
        type="button"
        class="mx-auto block rounded-full px-4 py-2 text-[13px] font-semibold text-[#7186A0] transition-colors hover:text-[#3D4A5C] active:scale-95"
        @click="$emit('cancel')"
      >
        취소하고 돌아가기
      </button>
    </div>
  </div>
</template>
