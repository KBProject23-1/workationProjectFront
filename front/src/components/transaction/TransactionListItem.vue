<script setup>
import { computed } from 'vue';

const props = defineProps({
  transaction: { type: Object, required: true },
});

defineEmits(['select']);

const categoryLabel = computed(
  () => props.transaction.categoryAssigned || '기타',
);

const isDeposit = computed(
  () => props.transaction.transactionType === 'DEPOSIT',
);

const isCanceled = computed(() => props.transaction.status === 'CANCELED');

const signedAmount = computed(() => {
  const sign = isDeposit.value ? '+' : '';
  return `${sign}${props.transaction.amount.toLocaleString('ko-KR')}원`;
});

const amountColor = computed(() =>
  isCanceled.value
    ? 'text-gray-300 line-through'
    : isDeposit.value
      ? 'text-blue-600'
      : 'text-gray-900',
);
</script>

<template>
  <button
    type="button"
    class="flex items-center justify-between w-full py-3.5 text-left transition-colors active:bg-gray-50/80 rounded-xl px-1 -mx-1 border-b border-gray-100/80"
    @click="$emit('select', transaction.transactionId)"
  >
    <div class="min-w-0 flex-1 pr-3">
      <p class="text-[15px] font-bold text-gray-900 truncate leading-snug">
        {{ transaction.merchantName }}
      </p>
      <div class="flex items-center gap-1.5 mt-0.5">
        <span class="text-[12px] font-medium text-gray-400">
          {{ categoryLabel }}
        </span>
        <span
          v-if="transaction.transactionTime"
          class="text-[10px] text-gray-300"
          >•</span
        >
        <span
          v-if="transaction.transactionTime"
          class="text-[11px] text-gray-400"
        >
          {{ transaction.transactionTime }}
        </span>
      </div>
    </div>

    <div class="text-right shrink-0">
      <p class="text-[15px] font-extrabold tracking-tight" :class="amountColor">
        {{ signedAmount }}
      </p>
      <p
        v-if="isCanceled"
        class="text-[11px] font-semibold text-red-500 mt-0.5"
      >
        승인취소
      </p>
    </div>
  </button>
</template>
