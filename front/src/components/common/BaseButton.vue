<script setup>
import { computed } from 'vue';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const props = defineProps({
  disabled: { type: Boolean, default: false },
  // 화면에서 가장 중요한 동작인지, 그 옆에 놓이는 보조 동작인지만 정한다.
  //
  //   지정 안 함 · default   파란 면에 흰 글씨. 화면당 하나만 둔다
  //   outline · secondary    흰 면에 회색 글씨. 취소·되돌리기 같은 보조 동작
  //
  // 예전에는 variant 를 shadcn 에 그대로 넘겨서 높이와 글자 크기가 화면마다 달랐다.
  variant: { type: String, required: false, default: undefined },
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    default: undefined,
    skipCheck: true,
  },
});

const isPrimary = computed(
  () => props.variant === undefined || props.variant === 'default',
);

// 하단 CTA 규격. 워케이션 화면에서 잡은 값을 전 화면이 같이 쓴다.
//
// 글자 크기를 text-body 대신 text-[15px] 로 적는다.
// tailwind-merge 는 우리가 만든 이름을 글자 크기로 알아보지 못해
// shadcn 쪽 text-sm 과 겹칠 때 어느 쪽이 이길지 정하지 못한다.
const PRIMARY =
  'w-full h-[52px] rounded-[14px] bg-brand text-white text-[15px] font-bold shadow-cta hover:bg-brand-strong active:scale-[0.99]';

const SECONDARY =
  'w-full h-[52px] rounded-[14px] bg-surface text-ink-sub text-[15px] font-bold shadow-card hover:bg-canvas active:scale-[0.99]';
</script>

<template>
  <Button
    type="button"
    :disabled="disabled"
    :class="cn(isPrimary ? PRIMARY : SECONDARY, props.class)"
  >
    <slot />
  </Button>
</template>
