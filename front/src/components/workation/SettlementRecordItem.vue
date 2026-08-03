<template>
  <button
    class="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left"
    @click="$emit('click', record.id)"
  >
    <span
      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"
    >
      📄
    </span>

    <span class="flex-1">
      <span class="block text-sm font-bold text-slate-900">{{ record.title }}</span>
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
