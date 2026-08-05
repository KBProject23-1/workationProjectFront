<template>
  <button
    class="w-full rounded-xl border px-4 py-3 text-left"
    :class="needsCard ? 'border-red-200 bg-red-50' : 'border-slate-200'"
    @click="$emit('click', expense.expenseId)"
  >
    <div class="flex items-start justify-between gap-3">
      <span class="truncate text-sm font-bold text-slate-900">
        {{ expense.merchantName }}
      </span>
      <span class="shrink-0 text-sm font-bold text-slate-900">
        {{ won(expense.amount) }}
      </span>
    </div>

    <div class="mt-1 flex items-center justify-between gap-3">
      <span class="truncate text-xs text-slate-400">{{ subText }}</span>
      <span
        class="shrink-0 rounded-full px-2 py-0.5 text-[11px]"
        :class="badgeClass"
      >
        {{ badgeText }}
      </span>
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { won } from './format';

const props = defineProps({
  expense: { type: Object, required: true },
});

defineEmits(['click']);

// 07.03 · 법인 · 신한카드 1234
const subText = computed(() => {
  const date = (props.expense.spentDate ?? '').slice(5).replace('-', '.');
  const type = props.expense.budgetType === 'WORK' ? '법인' : '개인';
  const card =
    props.expense.cardName ??
    (props.expense.budgetType === 'WORK' ? '카드 미지정' : '현금');
  return `${date} · ${type} · ${card}`;
});

// 법인 지출인데 사용 카드가 없으면 정산 전에 보완해야 한다
const needsCard = computed(
  () => props.expense.budgetType === 'WORK' && !props.expense.cardId,
);

const badgeText = computed(() => {
  if (needsCard.value) return '보완 필요';
  if (props.expense.isAutoCategorized)
    return `${props.expense.categoryName} · 확인 필요`;
  return props.expense.categoryName;
});

const badgeClass = computed(() => {
  if (needsCard.value) return 'bg-red-100 text-red-500';
  if (props.expense.isAutoCategorized) return 'bg-red-50 text-red-500';
  return 'bg-blue-50 text-blue-600';
});
</script>
