<template>
  <section class="rounded-card bg-surface shadow-card px-[18px] py-4">
    <div class="flex items-center justify-between">
      <h3 class="text-body-sm font-semibold text-ink-sub">
        {{ title }} 사용 현황
      </h3>
      <span
        class="text-body-sm font-bold"
        :class="overspent ? 'text-danger' : 'text-ink-mute'"
      >
        {{ rate }}%
      </span>
    </div>

    <p class="text-heading mt-1.5 font-bold -tracking-[0.02em] text-ink">
      {{ won(budget.spentTotal) }}
    </p>

    <div class="bg-canvas mt-3 h-1.5 w-full rounded-full">
      <div
        class="h-1.5 rounded-full"
        :class="overspent ? 'bg-danger' : 'bg-brand'"
        :style="{ width: barWidth + '%' }"
      />
    </div>

    <p class="text-body-sm mt-2 text-ink-mute">
      예산 {{ won(budget.budgetTotal) }} ·
      <span v-if="overspent" class="text-danger font-bold">
        {{ won(-budget.remainAmount) }} 초과
      </span>
      <span v-else>{{ won(budget.remainAmount) }} 남음</span>
    </p>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { won } from './format';

const props = defineProps({
  budget: { type: Object, required: true },
  // 법인 예산 / 숙박비 처럼 무엇의 사용 현황인지 부르는 이름
  title: { type: String, required: true },
});

const rate = computed(() => Math.round(Number(props.budget.usageRate ?? 0)));

// 예산을 초과해도 막대가 카드를 벗어나지 않도록 100 에서 자른다
const barWidth = computed(() => Math.min(rate.value, 100));

const overspent = computed(() => props.budget.remainAmount < 0);
</script>
