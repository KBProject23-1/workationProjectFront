<script setup>
import { computed } from 'vue';
import { getStatusMeta, isInactiveStatus } from '@/utils/transactionStatus';

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

const statusMeta = computed(() => getStatusMeta(props.transaction.status));
// 취소/환불/실패 등 무효·역거래 상태 (금액 취소선 처리)
const isInactive = computed(() => isInactiveStatus(props.transaction.status));
// 완료(PAID) 외의 상태는 목록에서도 배지로 표시
const showStatusBadge = computed(() => props.transaction.status !== 'PAID');

const signedAmount = computed(() => {
  const sign = isDeposit.value ? '+' : '';
  return `${sign}${props.transaction.amount.toLocaleString('ko-KR')}원`;
});

const amountColor = computed(() =>
  isInactive.value
    ? 'text-ink-sub line-through'
    : isDeposit.value
      ? 'text-brand'
      : 'text-ink',
);
</script>

<template>
  <button
    type="button"
    class="flex items-center justify-between w-full py-3.5 text-left transition-colors active:bg-canvas/80 rounded-card px-1 -mx-1 border-b border-line/80"
    @click="$emit('select', transaction.transactionId)"
  >
    <div class="min-w-0 flex-1 pr-3">
      <p class="text-body font-bold text-ink truncate leading-snug">
        {{ transaction.merchantName }}
      </p>
      <div class="flex items-center gap-1.5 mt-0.5">
        <span class="text-body-sm font-medium text-ink-sub">
          {{ categoryLabel }}
        </span>
        <span
          v-if="transaction.transactionTime"
          class="text-caption text-ink-sub"
          >•</span
        >
        <span
          v-if="transaction.transactionTime"
          class="text-caption text-ink-sub"
        >
          {{ transaction.transactionTime }}
        </span>
      </div>
    </div>

    <div class="text-right shrink-0">
      <p class="text-body font-bold tracking-tight" :class="amountColor">
        {{ signedAmount }}
      </p>
      <p
        v-if="showStatusBadge"
        class="text-caption font-semibold mt-0.5"
        :class="statusMeta.textClass"
      >
        {{ statusMeta.label }}
      </p>
    </div>
  </button>
</template>
