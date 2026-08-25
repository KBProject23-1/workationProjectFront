<script setup>
// 중복 가입 차단 화면 (DUPLICATE_USER 상태)
// - PASS 인증 후 verify-identity(/auth/signup/verify-identity) 에서 동일 휴대폰(CI) 으로
//   이미 가입한 회원이 감지되면 회원가입을 진행할 수 없음을 안내하고 로그인으로 안내한다.
// - '로그인하기' → 로그인 화면(/login)으로 이동 (회원가입 계정정보 입력 진입 차단)
import { AlertCircle } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';

defineProps({
  message: { type: String, default: '이미 가입된 회원입니다. 로그인을 진행해주세요.' },
});

defineEmits(['go-login']);
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-10 text-center">
    <div class="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
      <AlertCircle :size="44" :stroke-width="2" class="text-amber-500" />
    </div>

    <h2 class="mt-6 text-[22px] font-extrabold leading-snug tracking-tight text-[#191F28]">
      이미 가입된 회원이에요
    </h2>
    <p class="mt-2 text-[13px] font-medium leading-relaxed text-[#7186A0]">
      {{ message }}
    </p>

    <div class="mt-10 w-full">
      <BaseButton
        class="from-[#3B9BE8] to-[#2878F0]"
        @click="$emit('go-login')"
      >
        로그인하기
      </BaseButton>
    </div>
  </div>
</template>
