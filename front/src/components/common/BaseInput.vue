<script setup>
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  // 입력 타입 — 비밀번호(type="password") 등 회원가입 폼에서 필요
  type: { type: String, default: 'text' },
  // 모바일 키보드 종류 — 기본값은 기존 카드번호 입력(numeric) 호환 유지
  inputmode: { type: String, default: 'numeric' },
  placeholder: { type: String, default: '' },
  hasError: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
  // 입력 제한 — 휴대폰(010-0000-0000) 등에서 필요
  maxlength: { type: [Number, String], default: undefined },
  // 브라우저 자동완성 힌트 (username/current-password 등)
  autocomplete: { type: String, default: undefined },
  // 내부 <input> 에 직접 전달할 스타일 오버라이드 (높이/둥근 모서리 등)
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    default: undefined,
    skipCheck: true,
  },
});

// id 등 나머지 속성(attrs)이 래퍼 div 가 아닌 실제 <input> 에 붙도록 한다
// (label for="..." 포커스 연결이 input 에 적용되게 하기 위함)
defineOptions({ inheritAttrs: false });

defineEmits(['update:modelValue']);
</script>

<template>
  <div class="w-full text-left">
    <Input
      v-bind="$attrs"
      :model-value="modelValue"
      :type="type"
      :inputmode="inputmode"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :autocomplete="autocomplete"
      :aria-invalid="hasError"
      :class="cn(props.class)"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <p v-if="hasError && errorMessage" class="text-body-sm text-danger mt-1.5">
      {{ errorMessage }}
    </p>
  </div>
</template>
