<template>
  <section>
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-bold text-slate-900">
        {{ label }} 예산 사용 현황
      </h3>
      <button
        class="text-xs text-blue-600"
        @click="$emit('detail', budget.budgetType)"
      >
        세부예산 수정 ›
      </button>
    </div>

    <div class="mt-1 flex items-end justify-between">
      <span class="text-2xl font-bold text-slate-900">{{
        won(budget.spentTotal)
      }}</span>
      <span
        class="text-xl font-bold"
        :class="overspent ? 'text-red-500' : 'text-blue-600'"
      >
        {{ budget.usageRate }}%
      </span>
    </div>

    <div class="mt-2 h-1.5 w-full rounded-full bg-slate-200">
      <div
        class="h-1.5 rounded-full"
        :class="overspent ? 'bg-red-500' : 'bg-blue-600'"
        :style="{ width: barWidth + '%' }"
      />
    </div>

    <p class="mt-2 text-xs text-slate-500">
      예산 {{ won(budget.budgetTotal) }} ·
      <span v-if="overspent" class="text-red-500"
        >{{ won(-budget.remainAmount) }} 초과</span
      >
      <span v-else>{{ won(budget.remainAmount) }} 남음</span>
    </p>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { won } from './format';

const props = defineProps({
  budget: { type: Object, required: true },
});

defineEmits(['detail']);

const label = computed(() =>
  props.budget.budgetType === 'WORK' ? '법인' : '개인',
);

// 예산을 초과해도 막대가 카드를 벗어나지 않도록 100 에서 자른다
const barWidth = computed(() => Math.min(props.budget.usageRate, 100));

const overspent = computed(() => props.budget.remainAmount < 0);
</script>
