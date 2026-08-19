<script setup>
// 충전/환불 공통 PIN 입력 스텝 — 뒤로가기 + PinKeypad.
// 금액/동작 라벨만 다르고 나머지는 동일해 컴포넌트로 추출했다.
import { ChevronLeft } from '@lucide/vue';
import PinKeypad from '@/components/pin/PinKeypad.vue';

defineProps({
  modelValue: { type: String, default: '' },
  amount: { type: Number, default: 0 },
  actionLabel: { type: String, default: '' }, // '충전' | '환불'
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue', 'complete', 'back']);
</script>

<template>
  <div class="flex flex-col min-h-screen px-5 pt-6 pb-8 bg-[#F5F8FC]">
    <button
      type="button"
      class="self-start p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full active:bg-gray-100 transition-colors"
      aria-label="뒤로 가기"
      @click="emit('back')"
    >
      <ChevronLeft :size="24" />
    </button>
    <div class="flex-1 flex flex-col justify-center">
      <PinKeypad
        :model-value="modelValue"
        title="PIN 번호를 입력해주세요"
        :description="`${Number(amount).toLocaleString('ko-KR')}원 ${actionLabel}`"
        :error="error"
        :disabled="disabled"
        @update:model-value="emit('update:modelValue', $event)"
        @complete="emit('complete', $event)"
      />
    </div>
  </div>
</template>
