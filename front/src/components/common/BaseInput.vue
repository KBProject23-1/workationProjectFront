<script setup>
import { Input } from '@/components/ui/input';

defineProps({
  modelValue: { type: [String, Number], default: '' },
  placeholder: { type: String, default: '' },
  hasError: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
});

defineEmits(['update:modelValue']);
</script>

<template>
  <div class="w-full text-left">
    <Input
      :model-value="modelValue"
      type="text"
      inputmode="numeric"
      :placeholder="placeholder"
      :aria-invalid="hasError"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <p v-if="hasError && errorMessage" class="text-[13px] text-red-500 mt-1.5">
      {{ errorMessage }}
    </p>
  </div>
</template>
