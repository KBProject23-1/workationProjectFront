<template>
  <button
    class="flex w-full items-center gap-3 px-4 py-3 text-left transition-opacity"
    :class="{ 'opacity-40': state === 'past' }"
    @click="$emit('click', item)"
  >
    <span
      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
      :class="iconClass"
    >
      <component :is="icon" class="h-4 w-4" />
    </span>

    <span class="min-w-0 flex-1">
      <span class="block truncate text-sm font-bold text-slate-900">
        {{ item.merchantName }}
      </span>
      <span
        class="block truncate text-xs"
        :class="state === 'now' ? 'font-bold text-blue-600' : 'text-slate-400'"
      >
        {{ subText }}
      </span>
    </span>

    <ChevronRight class="h-4 w-4 shrink-0 text-slate-300" />
  </button>
</template>

<script setup>
import { computed } from 'vue';
import {
  Bed,
  Building2,
  ChevronRight,
  Ticket,
  UtensilsCrossed,
} from '@lucide/vue';
import { hourMinute, shortRange } from './format';

const props = defineProps({
  item: { type: Object, required: true },
  // past: 지난 일정 흐리게, now: 진행 중 강조, future: 기본
  state: { type: String, default: 'future' },
});

defineEmits(['click']);

const ICONS = {
  ACCOMMODATION: Bed,
  OFFICE: Building2,
  RESTAURANT: UtensilsCrossed,
  ACTIVITY: Ticket,
};

const ICON_CLASSES = {
  ACCOMMODATION: 'bg-blue-50 text-blue-600',
  OFFICE: 'bg-indigo-50 text-indigo-600',
  RESTAURANT: 'bg-amber-50 text-amber-600',
  ACTIVITY: 'bg-emerald-50 text-emerald-600',
};

const icon = computed(() => ICONS[props.item.merchantCategory] ?? Ticket);

const iconClass = computed(
  () => ICON_CLASSES[props.item.merchantCategory] ?? 'bg-slate-100 text-slate-500',
);

// 숙소는 그날 하루의 이벤트가 아니라 계속 머무는 상태다.
// 시각을 붙이면 체크인 시간처럼 보여서 기간으로 적는다
const subText = computed(() => {
  const item = props.item;

  if (item.merchantCategory === 'ACCOMMODATION') {
    return `숙박 중 · ${shortRange(item.startDate, item.endDate)}`;
  }
  if (item.scheduledTime) {
    return hourMinute(item.scheduledTime);
  }
  // 공유오피스는 시각이 없고 이용 기간만 있다
  return shortRange(item.startDate, item.endDate);
});
</script>
