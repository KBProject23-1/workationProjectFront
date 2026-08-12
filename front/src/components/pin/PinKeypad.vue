<script setup>
import { ref, watch } from 'vue';
import { Delete } from '@lucide/vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  maxLength: { type: Number, default: 6 },
});
const emit = defineEmits(['update:modelValue', 'complete']);

// 보안: 숫자·아이콘 칸을 매 마운트마다 섞는다. back 은 우하단 고정.
function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const keys = [
  ...shuffle(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '']),
  'back',
];

const shaking = ref(false);
watch(
  () => props.error,
  (msg) => {
    if (!msg) return;
    shaking.value = false;
    requestAnimationFrame(() => {
      shaking.value = true;
      setTimeout(() => (shaking.value = false), 400);
    });
  },
  { immediate: true },
);

function press(key) {
  if (props.disabled || key === '') return;
  if (key === 'back') {
    emit('update:modelValue', props.modelValue.slice(0, -1));
    return;
  }
  if (props.modelValue.length >= props.maxLength) return;
  const next = props.modelValue + key;
  emit('update:modelValue', next);
  if (next.length === props.maxLength) emit('complete', next);
}
</script>

<template>
  <div class="flex flex-col items-center w-full">
    <h1
      v-if="title"
      class="text-[20px] font-bold text-gray-900 text-center leading-snug"
    >
      {{ title }}
    </h1>
    <p v-if="description" class="mt-2 text-[14px] text-gray-500 text-center">
      {{ description }}
    </p>

    <!-- PIN 자릿수 인디케이터 -->
    <div
      class="flex items-center justify-center gap-4 mt-10 mb-1"
      :class="{ shake: shaking }"
    >
      <span
        v-for="i in maxLength"
        :key="i"
        class="w-3 h-3 rounded-full transition-all duration-200 ease-out"
        :class="
          i <= modelValue.length
            ? 'bg-primary scale-100'
            : 'bg-gray-200 scale-90'
        "
      ></span>
    </div>

    <!-- 에러 문구 자리(항상 높이 확보해 레이아웃 흔들림 방지) -->
    <p class="h-5 mt-2 text-[13px] font-medium text-red-500">{{ error }}</p>

    <!-- 숫자 키패드: 각 숫자가 독립된 버튼으로 보이도록 옅은 배경 사용 -->
    <div class="grid grid-cols-3 gap-x-4 gap-y-3 mt-8">
      <button
        v-for="(key, idx) in keys"
        :key="idx"
        type="button"
        class="h-[68px] w-[68px] mx-auto flex items-center justify-center text-[24px] font-semibold rounded-2xl transition-all duration-150 disabled:opacity-40"
        :class="
          key === ''
            ? 'pointer-events-none bg-white shadow-sm'
            : key === 'back'
              ? 'bg-white text-gray-400 shadow-sm active:bg-gray-100 active:scale-95'
              : 'bg-white text-gray-900 shadow-sm active:bg-gray-100 active:scale-95'
        "
        :disabled="disabled"
        :aria-label="key === 'back' ? '지우기' : undefined"
        :aria-hidden="key === '' ? 'true' : undefined"
        :tabindex="key === '' ? -1 : undefined"
        @click="press(key)"
      >
        <img
          v-if="key === ''"
          src="/icon.png"
          alt=""
          class="h-9 w-9 object-contain"
        />
        <Delete v-else-if="key === 'back'" :size="22" />
        <span v-else>{{ key }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-6px);
  }
  75% {
    transform: translateX(6px);
  }
}
.shake {
  animation: shake 0.4s;
}
</style>
