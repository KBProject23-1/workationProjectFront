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

const signedAmount = computed(() => {
  const sign = isDeposit.value ? '+' : '-';
  return `${sign}${props.transaction.amount.toLocaleString('ko-KR')}원`;
});

const amountColor = computed(() =>
  props.transaction.status === 'CANCELED'
    ? 'text-gray-400 line-through'
    : isDeposit.value
      ? 'text-blue-600'
      : 'text-gray-900',
);
</script>

<template>
  <button
    type="button"
    class="flex items-center justify-between w-full py-3 border-b border-gray-100 text-left"
    @click="$emit('select', transaction.transactionId)"
  >
    <div class="min-w-0">
      <p class="text-[15px] font-medium truncate">
        {{ transaction.merchantName }}
      </p>
      <p class="text-[13px] text-gray-500">{{ categoryLabel }}</p>
    </div>
    <div class="text-right shrink-0 ml-3">
      <p class="text-[15px] font-semibold" :class="amountColor">
        {{ signedAmount }}
      </p>
      <p
        v-if="transaction.status === 'CANCELED'"
        class="text-[12px] text-gray-400"
      >
        취소됨
      </p>
    </div>
  </button>
</template>
