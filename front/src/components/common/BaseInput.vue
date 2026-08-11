<script setup>
import { Input } from '@/components/ui/input';

defineProps({
  modelValue: { type: [String, Number], default: '' },
  // 입력 타입 — 비밀번호(type="password") 등 회원가입 폼에서 필요
  type: { type: String, default: 'text' },
  // 모바일 키보드 종류 — 기본값은 기존 카드번호 입력(numeric) 호환 유지
  inputmode: { type: String, default: 'numeric' },
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
      :type="type"
      :inputmode="inputmode"
      :placeholder="placeholder"
      :aria-invalid="hasError"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <p v-if="hasError && errorMessage" class="text-[13px] text-red-500 mt-1.5">
      {{ errorMessage }}
    </p>
  </div>
</template>
