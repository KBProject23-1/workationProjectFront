<script setup>
// 본인인증 안내 화면 (IDLE 상태)
// - 'PASS 인증하기' 버튼을 누르면 Mock 본인인증 흐름(INPUT)이 시작된다.
// - 인증 시작 시 백엔드(POST /api/v1/auth/pass)가 인증 건을 생성한다 — 프론트 임의 생성 금지.
import { ShieldCheck } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';

defineEmits(['start']);
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <main class="flex-1 min-h-0 overflow-y-auto px-6 pt-4 pb-6">
      <h2 class="text-[22px] font-extrabold leading-snug tracking-tight text-[#0B3155]">
        본인인증을 진행해 주세요
      </h2>
      <p class="mt-2 text-[13.5px] font-medium leading-relaxed text-[#7186A0]">
        신원 확인을 위해 PASS 본인인증을 진행해요.<br />
        인증 완료 시 가입된 회원이 아닌지 확인 후 회원가입을 계속할 수 있어요.
      </p>

      <!-- Mock 인증 안내 카드 -->
      <div
        class="mt-7 flex items-center gap-4 rounded-[20px] border border-[#DFE7F0] bg-[#F5F8FC] p-5"
      >
        <div
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2878F0]/10 text-[#2878F0]"
        >
          <ShieldCheck :size="24" :stroke-width="2" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[13px] font-semibold leading-relaxed text-[#3D4A5C]">
            현재는 테스트용 Mock 인증이에요.
          </p>
          <p class="mt-1 text-[12.5px] font-medium leading-relaxed text-[#7186A0]">
            PASS 팝업에서 통신사 선택과 약관 동의 후<br />
            이름·휴대폰 번호·보안문자를 입력하면 인증이 완료됩니다.
          </p>
        </div>
      </div>
    </main>

    <footer
      class="shrink-0 flex flex-col items-center px-6 pt-3 pb-[max(env(safe-area-inset-bottom),28px)]"
    >
      <BaseButton @click="$emit('start')">
        PASS 인증하기
      </BaseButton>
      <p class="mt-3 text-[11.5px] font-medium text-[#98A8B8]">
        테스트용 Mock 인증 · 입력한 정보는 외부로 전송되지 않아요
      </p>
    </footer>
  </div>
</template>
