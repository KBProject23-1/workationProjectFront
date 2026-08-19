<script setup>
import { ChevronLeft } from '@lucide/vue';

// 페이지 상단 "뒤로가기 버튼 + 제목" 헤더 공용 컴포넌트.
// 모든 화면에서 높이/정렬/폰트를 동일하게 통일한다 — variant(inline/centered)와
// size(default/detail) 구분은 화면마다 제각각이던 걸 오히려 정당화하는 결과를 낳아서 제거했다.
defineProps({
  title: { type: String, required: true },
  backLabel: { type: String, default: '뒤로 가기' },
  titleClass: { type: [String, Array, Object], default: 'text-[18px] font-bold text-gray-900' },
});

defineEmits(['back']);
</script>

<template>
  <header class="relative flex h-14 shrink-0 items-center justify-center">
    <button
      type="button"
      class="absolute left-0 top-1/2 -translate-y-1/2 p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full active:bg-gray-100 transition-colors"
      :aria-label="backLabel"
      @click="$emit('back')"
    >
      <ChevronLeft :size="24" />
    </button>
    <h1 :class="titleClass">{{ title }}</h1>
    <div class="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
      <slot name="right" />
    </div>
  </header>
</template>
