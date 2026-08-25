<template>
  <button
    class="rounded-card bg-surface shadow-card w-full px-4 py-3.5 text-left transition-transform active:scale-[0.99]"
    @click="$emit('click', expense.expenseId)"
  >
    <div class="flex items-start justify-between gap-3">
      <span class="text-body min-w-0 truncate font-semibold text-ink">
        {{ expense.merchantName }}
      </span>
      <span class="text-body shrink-0 font-bold text-ink">
        {{ won(expense.amount) }}
      </span>
    </div>

    <div class="mt-1.5 flex items-center justify-between gap-3">
      <span class="text-body-sm min-w-0 truncate text-ink-mute">
        {{ subText }}
      </span>
      <span
        class="text-caption shrink-0 rounded-full px-2.5 py-1 font-bold"
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
import { useBudgetTypeLabel } from '@/composables/useBudgetTypeLabel';

const props = defineProps({
  expense: { type: Object, required: true },
});

defineEmits(['click']);

const { workLabel } = useBudgetTypeLabel();

const isWallet = computed(
  () => props.expense.paymentSourceType === 'WALLET',
);

// 07.03 · 법인 · 신한카드 1234
const subText = computed(() => {
  const date = (props.expense.spentDate ?? '').slice(5).replace('-', '.');
  const type =
    props.expense.budgetType === 'WORK' ? workLabel.value : '개인';

  let means = props.expense.cardName;
  if (!means) {
    if (isWallet.value) means = '지갑';
    else means = props.expense.budgetType === 'WORK' ? '카드 미지정' : '현금';
  }
  return `${date} · ${type} · ${means}`;
});

// 업무 지출인데 사용 카드가 없으면 정산 전에 보완해야 한다.
// 지갑 결제는 카드가 없는 게 정상이고, 앱 내 결제라 수정도 안 되므로 제외한다
const needsCard = computed(
  () =>
    props.expense.budgetType === 'WORK' &&
    !props.expense.cardId &&
    !isWallet.value,
);

const badgeText = computed(() => {
  if (needsCard.value) return '보완 필요';
  if (props.expense.isAutoCategorized)
    return `${props.expense.categoryName} · 확인 필요`;
  return props.expense.categoryName;
});

// 확인 필요·보완 필요는 정산 전에 반드시 처리해야 해서 빨강으로 둔다
const badgeClass = computed(() => {
  if (needsCard.value || props.expense.isAutoCategorized) {
    return 'bg-danger/10 text-danger';
  }
  return 'bg-brand-weak text-brand';
});
</script>
