<template>
  <div class="relative">
    <button
      type="button"
      class="border-input flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 text-left text-base disabled:bg-slate-50 md:text-sm"
      :class="
        disabled
          ? 'text-slate-400'
          : modelValue
            ? 'text-slate-900'
            : 'text-slate-300'
      "
      :disabled="disabled"
      @click="openPicker"
    >
      <span class="truncate">{{ displayText }}</span>

      <svg
        class="h-4 w-4 shrink-0 text-slate-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
    </button>

    <!-- 값과 달력은 네이티브 input 이 담당하고 화면에는 위 버튼만 보여준다 -->
    <input
      ref="dateInput"
      type="date"
      class="pointer-events-none absolute inset-0 h-full w-full opacity-0"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '날짜 선택' },
  disabled: { type: Boolean, default: false },
});

defineEmits(['update:modelValue']);

const dateInput = ref(null);

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 2026-07-01 -> 2026.07.01 (수)
const displayText = computed(() => {
  if (!props.modelValue) return props.placeholder;
  const date = new Date(props.modelValue);
  if (Number.isNaN(date.getTime())) return props.placeholder;
  return `${props.modelValue.replaceAll('-', '.')} (${WEEKDAYS[date.getDay()]})`;
});

// showPicker 를 지원하지 않는 브라우저에서는 포커스만 준다
const openPicker = () => {
  if (props.disabled) return;

  const input = dateInput.value;
  if (!input) return;
  if (typeof input.showPicker === 'function') {
    input.showPicker();
    return;
  }
  input.focus();
};
</script>
