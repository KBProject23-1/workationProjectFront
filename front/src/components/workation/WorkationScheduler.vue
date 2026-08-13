<template>
  <section class="mt-5">
    <p v-if="isLoading" class="py-8 text-center text-sm text-slate-400">
      일정을 불러오는 중...
    </p>

    <template v-else>
      <div v-for="day in schedules" :key="day.date" class="mb-4">
        <!--
          날짜는 카드 밖 제목으로 둔다.
          카드 안에 넣으면 7일치에서 카드마다 목록이 또 들어가 이중 구조가 된다.
        -->
        <div class="mb-2 flex items-center justify-between">
          <p class="text-sm font-bold text-slate-900">
            {{ dayLabel(day.date) }}
            <span v-if="day.isToday" class="ml-1 text-xs text-blue-600">
              오늘
            </span>
          </p>

          <!-- 그날에 무엇을 추가한다는 뜻이라 첫 날에만 둔다 -->
          <div v-if="day === schedules[0]" class="flex items-center gap-1.5">
            <button
              class="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600"
              @click="$emit('reserve')"
            >
              예약
            </button>
            <button
              class="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600"
              @click="$emit('recommend')"
            >
              추천
            </button>
          </div>
        </div>

        <div v-if="day.items.length > 0" class="flex gap-2">
          <!-- 왼쪽 시간 막대. 오늘만 파랗게 두어 지금 어디쯤인지 보이게 한다 -->
          <span
            class="w-1 shrink-0 rounded-full"
            :class="day.isToday ? 'bg-blue-100' : 'bg-slate-100'"
          />

          <div
            class="min-w-0 flex-1 divide-y divide-slate-100 rounded-xl border border-slate-200"
          >
            <div
              v-for="row in rowsOf(day)"
              :key="row.key"
              class="relative"
              :class="{ 'h-0': row.type === 'GAP' }"
            >
              <!--
                현재 시각 표시. 목록에 줄을 그리지 않고 왼쪽 세로 바 위에만 표시한다.
                음수 left 로 바 위에 겹치고, GAP 행은 h-0 이라 같은 좌표식이 경계에 맞는다
              -->
              <template v-if="row.now">
                <!-- 바에서 지금 위치만 빛나게 -->
                <span
                  class="pointer-events-none absolute -left-[11px] top-1/2 h-10 w-1 -translate-y-1/2 rounded-full bg-blue-500 shadow-[0_0_8px_2px_rgba(37,99,235,0.5)]"
                />
                <!-- 바에서 목록 쪽을 가리키는 작은 화살표 -->
                <span
                  class="pointer-events-none absolute -left-1.5 top-1/2 -translate-y-1/2 border-y-[4px] border-l-[6px] border-y-transparent border-l-blue-500"
                  :aria-label="`현재 시각 ${nowLabel}`"
                />
              </template>

              <ScheduleItem
                v-if="row.type === 'ITEM'"
                :item="row.item"
                :state="row.state"
                @click="$emit('select', row.item)"
              />
            </div>
          </div>
        </div>

        <!-- 빈 날을 비워두면 불러오기 실패처럼 보인다 -->
        <button
          v-else
          class="w-full rounded-xl border border-dashed border-slate-200 py-5 text-center"
          @click="$emit('reserve')"
        >
          <span class="block text-xs text-slate-400">
            아직 정해진 일정이 없어요
          </span>
          <span class="mt-0.5 block text-xs font-bold text-blue-600">
            일정 추가하기 ›
          </span>
        </button>
      </div>

      <button
        class="flex w-full items-center justify-center gap-1 py-2 text-xs font-bold text-slate-500"
        @click="$emit('toggle')"
      >
        {{ expanded ? '접기' : '7일치 보기' }}
        <component
          :is="expanded ? ChevronUp : ChevronDown"
          class="h-3.5 w-3.5"
        />
      </button>
    </template>
  </section>
</template>

<script setup>
import { onUnmounted, ref } from 'vue';
import { ChevronDown, ChevronUp } from '@lucide/vue';
import ScheduleItem from './ScheduleItem.vue';
import { dayLabel } from './format';

defineProps({
  schedules: { type: Array, default: () => [] },
  expanded: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
});

defineEmits(['select', 'toggle', 'reserve', 'recommend']);

// 예약은 여러 날에 걸쳐 같은 id 로 반복되므로 날짜를 섞어 키를 만든다
const itemKey = (item) =>
  `${item.itemType}-${item.reservationId ?? item.scheduleId}-${item.merchantId}`;

// 지난 일정 판정 기준. 약속 시각 30분이 지나면 흐리게 만든다
const PASSED_AFTER_MINUTES = 30;

const now = new Date();
const nowMinutes = ref(now.getHours() * 60 + now.getMinutes());
const nowLabel = ref(
  `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
);

const timer = setInterval(() => {
  const current = new Date();
  nowMinutes.value = current.getHours() * 60 + current.getMinutes();
  nowLabel.value = `${String(current.getHours()).padStart(2, '0')}:${String(current.getMinutes()).padStart(2, '0')}`;
}, 60000);

onUnmounted(() => clearInterval(timer));

// 12:30:00 -> 750
const toMinutes = (time) => {
  const [hour, minute] = time.split(':');
  return Number(hour) * 60 + Number(minute);
};

const stateOf = (item, isToday) => {
  if (!isToday || !item.scheduledTime) return 'future';

  const start = toMinutes(item.scheduledTime);
  if (nowMinutes.value >= start + PASSED_AFTER_MINUTES) return 'past';
  if (nowMinutes.value >= start - FOCUS_WINDOW_MINUTES) return 'now';
  return 'future';
};

// 일정을 30분 단위로 잡으므로, 약속 시각 ±30분 동안은 화살표가 그 일정을 가리킨다
const FOCUS_WINDOW_MINUTES = 30;

// 오늘 화살표가 붙을 자리를 정한다.
// - 진행 중인 일정이 있으면 그 일정을 가리킨다
// - 없으면 다음 일정 바로 위 경계에 둔다 (다음 일정도 없으면 목록 맨 아래)
const nowAnchor = (items) => {
  const timed = items.filter((item) => item.scheduledTime);
  if (timed.length === 0) return { type: 'GAP', index: items.length };

  const focused = timed.find(
    (item) =>
      Math.abs(nowMinutes.value - toMinutes(item.scheduledTime)) <
      FOCUS_WINDOW_MINUTES,
  );
  if (focused) return { type: 'ITEM', item: focused };

  const next = items.findIndex(
    (item) =>
      item.scheduledTime && toMinutes(item.scheduledTime) > nowMinutes.value,
  );
  return { type: 'GAP', index: next === -1 ? items.length : next };
};

const rowsOf = (day) => {
  const anchor = day.isToday ? nowAnchor(day.items) : null;
  const rows = [];

  day.items.forEach((item, index) => {
    if (anchor?.type === 'GAP' && anchor.index === index) {
      rows.push({ type: 'GAP', key: 'now', now: true });
    }
    rows.push({
      type: 'ITEM',
      key: itemKey(item),
      item,
      state: stateOf(item, day.isToday),
      now: anchor?.type === 'ITEM' && anchor.item === item,
    });
  });

  if (anchor?.type === 'GAP' && anchor.index >= day.items.length) {
    rows.push({ type: 'GAP', key: 'now', now: true });
  }

  return rows;
};
</script>
