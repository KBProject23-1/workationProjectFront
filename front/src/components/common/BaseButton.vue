<script setup>
import { Button } from '@/components/ui/button';

defineProps({
  disabled: { type: Boolean, default: false },
});
</script>

<template>
  <Button
    type="button"
    :disabled="disabled"
    class="flex mx-auto w-full max-w-[340px] h-auto rounded-[20px] py-4 text-2xl font-medium"
  >
    <slot />
  </Button>
</template>
