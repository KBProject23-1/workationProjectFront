<template>
  <button
    class="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left"
    @click="$emit('click', record.id)"
  >
    <!-- 아이콘 자리. 전 화면 아이콘 작업 때 채운다 -->
    <span class="h-8 w-8 shrink-0 rounded-lg bg-slate-200" />

    <span class="flex-1">
      <span class="block text-sm font-bold text-slate-900">{{
        record.title
      }}</span>
      <span class="block text-xs text-slate-400">
        {{ dotDate(record.startDate) }} ~ {{ dotDate(record.endDate) }}
      </span>
    </span>

    <span class="text-slate-300">›</span>
  </button>
</template>

<script setup>
import { dotDate } from './format';

defineProps({
  record: { type: Object, required: true },
});

defineEmits(['click']);
</script>
