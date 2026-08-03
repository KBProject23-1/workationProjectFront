<script setup>
import { computed } from 'vue';

const props = defineProps({
  balance: { type: Number, default: 0 },
});

defineEmits(['edit-accounts']);

const formattedBalance = computed(() => props.balance.toLocaleString('ko-KR'));
</script>

<template>
  <div class="w-full bg-slate-800 rounded-2xl px-5 py-6 text-white text-left">
    <div class="flex items-center justify-between mb-4">
      <span class="text-[15px] font-medium">페이머니</span>
      <button
        type="button"
        class="text-[13px] text-gray-300 flex items-center gap-1"
        @click="$emit('edit-accounts')"
      >
        연결계좌 수정
        <span class="text-[16px]">›</span>
      </button>
    </div>
    <p class="text-2xl font-bold">{{ formattedBalance }}원</p>
  </div>
</template>
