<template>
  <div class="rounded-2xl bg-blue-50 px-5 py-8 text-center">
    <!-- 아이콘 자리 채워야 함 -->
    <span class="mx-auto mb-4 block h-10 w-10 rounded bg-slate-200" />

    <h2 class="text-lg font-bold text-slate-900">진행중인 워케이션이 없어요</h2>

    <p class="mt-2 text-sm text-slate-500">
      일정을 등록하면 예산과 지출을<br />
      자동으로 관리해 드려요
    </p>

    <BaseButton
      variant="default"
      class="mt-6 h-12 w-full rounded-xl text-base"
      @click="$emit('register')"
    >
      워케이션 등록하기
    </BaseButton>
  </div>
</template>

<script setup>
import BaseButton from '@/components/common/BaseButton.vue';

defineEmits(['register']);
</script>
