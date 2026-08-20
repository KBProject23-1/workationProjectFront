<template>
  <div class="py-4">
    <div class="flex items-baseline justify-between gap-3">
      <span class="text-body min-w-0 truncate font-semibold text-ink">
        {{ item.categoryName }}
      </span>
      <span class="text-body shrink-0 font-bold text-ink">
        {{ won(item.spentAmount) }}
      </span>
    </div>

    <div
      class="text-body-sm mt-1 flex items-baseline justify-between gap-3 text-ink-mute"
    >
      <span>{{ item.expenseCount }}건</span>
      <!-- 법인은 회사에 제출하는 값이라 배정 대비 집행률을 보여준다 -->
      <span v-if="showTarget" :class="overspent ? 'text-danger font-bold' : ''">
        {{ won(item.targetAmount) }} 중 {{ usageRate }}%
      </span>
      <!-- 개인은 배정 개념 없이 전체에서 차지하는 비중만 보여준다 -->
      <span v-else-if="ratio > 0">{{ ratio }}%</span>
    </div>

    <div class="bg-canvas mt-2.5 h-1.5 w-full rounded-full">
      <div
        class="h-1.5 rounded-full"
        :class="showTarget && overspent ? 'bg-danger' : 'bg-brand'"
        :style="{ width: barWidth + '%' }"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { won } from './format';

const props = defineProps({
  item: { type: Object, required: true },
  // 배정 금액 대비로 보여줄지 여부. 법인 내역에서만 true
  showTarget: { type: Boolean, default: true },
  // 개인 내역에서 비중을 계산할 기준
  totalAmount: { type: Number, default: 0 },
});

const target = computed(() => Number(props.item.targetAmount ?? 0));
const spent = computed(() => Number(props.item.spentAmount ?? 0));

// 배정 금액이 0 이면 나눌 수 없다. 쓴 게 있으면 초과로 본다
const usageRate = computed(() => {
  if (target.value === 0) return spent.value > 0 ? 100 : 0;
  return Math.round((spent.value / target.value) * 100);
});

const ratio = computed(() => {
  if (!props.totalAmount) return 0;
  return Math.round((spent.value / props.totalAmount) * 100);
});

const overspent = computed(() => spent.value > target.value);

// 초과해도 막대가 카드를 벗어나지 않도록 100 에서 자른다
const barWidth = computed(() =>
  Math.min(props.showTarget ? usageRate.value : ratio.value, 100),
);
</script>
