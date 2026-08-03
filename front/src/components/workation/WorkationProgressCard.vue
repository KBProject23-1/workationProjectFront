<template>
  <div class="rounded-2xl bg-blue-50 px-4 py-4">
    <div class="mb-2 flex items-start justify-between">
      <span class="rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-blue-600">
        진행 중
      </span>
      <span class="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
        D-{{ remainDays }}
      </span>
    </div>

    <h2 class="text-xl font-bold text-slate-900">{{ workation.title }}</h2>

    <p class="mt-1 text-xs text-slate-500">
      {{ dotDate(workation.startDate) }} ~ {{ dotDate(workation.endDate) }}
    </p>

    <div class="mt-3 h-1.5 w-full rounded-full bg-blue-200">
      <div class="h-1.5 rounded-full bg-blue-600" :style="{ width: workation.progressRate + '%' }" />
    </div>

    <div class="mt-2 flex justify-between text-xs text-slate-500">
      <span>전체 {{ workation.totalDays }}일 · {{ workation.elapsedDays }}일째</span>
      <span>{{ remainDays }}일 남음</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { dotDate } from './format';

const props = defineProps({
  workation: { type: Object, required: true },
});

const remainDays = computed(() => props.workation.totalDays - props.workation.elapsedDays);
</script>
