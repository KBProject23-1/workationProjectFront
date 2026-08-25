<template>
  <div class="flex min-h-screen flex-col bg-canvas px-5 pt-4 pb-8">
    <div class="flex flex-1 flex-col items-center justify-center text-center">
      <!-- 일러스트 자리. 아이콘 일괄 작업 때 채운다 -->
      <span class="mb-8 block h-44 w-64 rounded-sheet bg-canvas" />

      <h1 class="text-display font-bold text-ink">나의 워케이션 스타일</h1>

      <p class="mt-3 text-body leading-6 text-ink-sub">
        간단한 질문에 답하고<br />
        나에게 맞는 워케이션을 추천받아보세요.
      </p>

      <ul class="mt-8 space-y-3 text-left">
        <li class="flex items-center gap-2.5">
          <span
            class="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-caption text-white"
          >
            ✓
          </span>
          <span class="text-body font-bold text-ink"
            >약 1분이면 완료돼요</span
          >
        </li>
        <li class="flex items-center gap-2.5">
          <span
            class="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-caption text-white"
          >
            ✓
          </span>
          <span class="text-body font-bold text-ink">
            취향에 맞는 장소를 찾아드려요
          </span>
        </li>
      </ul>
    </div>

    <BaseButton variant="default" class="w-full" @click="goForm">
      시작하기
    </BaseButton>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import BaseButton from '@/components/common/BaseButton.vue';

const router = useRouter();

const goForm = () => {
  // 설문이 워케이션 등록 2/3 로 편입되면서 이 화면은 라우트에서 빠졌다.
  // 다시 쓰게 되면 workationId 를 받아 /workation/:workationId/survey 로 보내야 한다.
  router.push('/workation');
};
</script>
