<script setup>
import { ref, watch } from 'vue';
import { Delete } from '@lucide/vue';

// 재사용 6자리 PIN 입력 키패드.
// - PIN 설정(setup)·PIN 검증(충전/환불/결제 직전)·예약결제에서 공용으로 쓴다.
// - 입력값은 v-model 로 부모가 소유한다. maxLength 도달 시 complete 이벤트로 알린다.
// - 에러 표시/초기화는 부모 책임(에러 시 modelValue 를 '' 로 리셋). error prop 이 바뀌면 흔들림 연출.
const props = defineProps({
  modelValue: { type: String, default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  maxLength: { type: Number, default: 6 },
});
const emit = defineEmits(['update:modelValue', 'complete']);

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

const shaking = ref(false);
// 에러가 새로 표시되면 흔들림 애니메이션 트리거
watch(
  () => props.error,
  (msg) => {
    if (!msg) return;
    shaking.value = false;
    // 연속 에러도 재생되도록 다음 틱에 다시 켠다
    requestAnimationFrame(() => {
      shaking.value = true;
      setTimeout(() => (shaking.value = false), 400);
    });
  },
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
        class="w-3.5 h-3.5 rounded-full transition-colors"
        :class="
          i <= modelValue.length
            ? 'bg-primary'
            : 'border-2 border-gray-300 bg-transparent'
        "
      ></span>
    </div>

    <!-- 에러 문구 자리(항상 높이 확보해 레이아웃 흔들림 방지) -->
    <p class="h-5 mt-2 text-[13px] font-medium text-red-500">{{ error }}</p>

    <!-- 숫자 키패드 -->
    <div class="grid grid-cols-3 gap-x-10 gap-y-5 mt-6">
      <button
        v-for="(key, idx) in keys"
        :key="idx"
        type="button"
        class="h-16 w-16 mx-auto flex items-center justify-center text-[26px] font-semibold text-gray-800 rounded-full transition-colors active:bg-gray-100 disabled:opacity-40"
        :class="{ 'pointer-events-none': key === '' }"
        :disabled="disabled || key === ''"
        @click="press(key)"
      >
        <Delete v-if="key === 'back'" :size="24" class="text-gray-500" />
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
