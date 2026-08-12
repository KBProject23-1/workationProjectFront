<script setup>
// 본인인증 완료 화면 (SUCCESS 상태)
// - 백엔드가 VERIFIED 세션을 생성하고 identityVerificationId 를 발급한 뒤에만 도달한다
//   (프론트 임의 성공 처리 금지).
// - '계속하기' → 발급받은 identityVerificationId 를 보관하고 계정정보 입력(/signup)으로 이동한다.
import { CheckCircle2 } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';

defineProps({
  name: { type: String, default: '' },
  loading: { type: Boolean, default: false },
});

defineEmits(['continue']);
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-10 text-center">
    <div class="flex h-20 w-20 items-center justify-center rounded-full bg-[#2878F0]/10">
      <CheckCircle2 :size="44" :stroke-width="2" class="text-[#2878F0]" />
    </div>

    <h2 class="mt-6 text-[22px] font-extrabold leading-snug tracking-tight text-[#191F28]">
      본인인증이 완료되었습니다
    </h2>
    <p v-if="name" class="mt-3 text-[14px] font-semibold text-[#3D4A5C]">{{ name }}님</p>
    <p class="mt-1 text-[13px] font-medium leading-relaxed text-[#7186A0]">
      본인 확인이 끝났어요.<br />
      계정 정보 입력을 이어서 진행할게요.
    </p>

    <div class="mt-10 w-full">
      <BaseButton :disabled="loading" @click="$emit('continue')">
        {{ loading ? '인증 결과 확인 중...' : '계속하기' }}
      </BaseButton>
    </div>
  </div>
</template>
