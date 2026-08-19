<script setup>
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const props = defineProps({
  disabled: { type: Boolean, default: false },
  // shadcn Button 의 variant 를 그대로 전달한다. 지정하지 않으면(기존 호출부) 아래
  // CTA 고정 클래스가 그대로 적용돼 기존 화면 모양이 바뀌지 않는다.
  variant: { type: String, required: false, default: undefined },
  // 로그인 버튼 gradient 등 개별 스타일 오버라이드용 (twMerge 로 병합)
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    default: undefined,
    skipCheck: true,
  },
});
</script>

<template>
  <Button
    type="button"
    :disabled="disabled"
    :variant="variant"
    :class="
      cn(
        variant === undefined
          ? 'flex mx-auto w-full max-w-[340px] h-auto rounded-[20px] py-4 text-2xl font-medium'
          : 'font-medium',
        props.class,
      )
    "
  >
    <slot />
  </Button>
</template>
