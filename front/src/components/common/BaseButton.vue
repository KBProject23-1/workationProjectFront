<script setup>
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const props = defineProps({
  disabled: { type: Boolean, default: false },
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
    :class="
      cn(
        'flex mx-auto w-full max-w-[340px] h-auto rounded-[20px] py-4 text-2xl font-medium',
        props.class,
      )
    "
  >
    <slot />
  </Button>
</template>
