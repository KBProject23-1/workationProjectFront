<script setup>
import { ChevronLeft } from '@lucide/vue';

// 페이지 상단 "뒤로가기 버튼 + 제목" 헤더 공용 컴포넌트.
// 뒤로가기 버튼(크기/색/hover)은 variant/size와 무관하게 항상 동일하게 렌더링한다 — 여러 화면에
// 미묘하게 다른 CSS로 중복 구현돼 있던 걸 하나로 합치는 게 목적이다.
// 반면 헤더 레이아웃(제목 좌측정렬 vs 중앙정렬, 목록형 vs 상세형 높이)은 페이지 성격에 따라
// 이미 의도적으로 다르므로 variant/size 로만 흡수하고 강제로 하나로 만들지 않는다.
defineProps({
  title: { type: String, required: true },
  // inline: 버튼+제목이 좌측 정렬로 자연스럽게 흐르는 헤더 (목록/입력 화면 등)
  // centered: 버튼은 absolute 로 빠지고 제목이 중앙 정렬되는 헤더 (상세/폼 화면 등)
  variant: { type: String, default: 'centered' },
  // detail: centered 변형 중 118px 높이의 상세 페이지용(구 page-header 그리드) 크기
  size: { type: String, default: 'default' },
  backLabel: { type: String, default: '뒤로 가기' },
  titleClass: { type: [String, Array, Object], default: 'text-[18px] font-bold text-gray-900' },
});

defineEmits(['back']);
</script>

<template>
  <header
    v-if="variant === 'inline'"
    class="flex items-center gap-2"
  >
    <button
      type="button"
      class="p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full active:bg-gray-100 transition-colors"
      :aria-label="backLabel"
      @click="$emit('back')"
    >
      <ChevronLeft :size="24" />
    </button>
    <h1 :class="titleClass">{{ title }}</h1>
    <div class="ml-auto flex items-center gap-1">
      <slot name="right" />
    </div>
  </header>

  <header
    v-else
    class="relative flex items-center justify-center"
    :class="size === 'detail' ? 'h-[118px] items-end pb-3.5' : 'h-14 shrink-0'"
  >
    <button
      type="button"
      class="absolute left-0 p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full active:bg-gray-100 transition-colors"
      :aria-label="backLabel"
      @click="$emit('back')"
    >
      <ChevronLeft :size="24" />
    </button>
    <h1 :class="titleClass">{{ title }}</h1>
    <div class="absolute right-0 flex items-center gap-1">
      <slot name="right" />
    </div>
  </header>
</template>
