<script setup>
import { computed, ref, watch } from 'vue';
import { ChevronLeft, ChevronRight, X } from '@lucide/vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  selectedDate: { type: String, default: '' },
  minDate: { type: String, required: true },
  maxDate: { type: String, required: true },
});

const emit = defineEmits(['close', 'select']);
const displayedMonth = ref(new Date());
const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

function parseDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return;
    displayedMonth.value = parseDate(props.selectedDate || props.minDate);
  },
  { immediate: true },
);

const monthLabel = computed(
  () => `${displayedMonth.value.getFullYear()}년 ${displayedMonth.value.getMonth() + 1}월`,
);

const calendarDays = computed(() => {
  const year = displayedMonth.value.getFullYear();
  const month = displayedMonth.value.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({ length: firstWeekday }, () => null);
  return [...blanks, ...Array.from({ length: lastDay }, (_, index) => index + 1)];
});

const canMovePrevious = computed(() => {
  const previous = new Date(displayedMonth.value.getFullYear(), displayedMonth.value.getMonth() - 1, 1);
  const minimum = parseDate(props.minDate);
  return previous.getFullYear() > minimum.getFullYear()
    || (previous.getFullYear() === minimum.getFullYear() && previous.getMonth() >= minimum.getMonth());
});

const canMoveNext = computed(() => {
  const next = new Date(displayedMonth.value.getFullYear(), displayedMonth.value.getMonth() + 1, 1);
  const maximum = parseDate(props.maxDate);
  return next.getFullYear() < maximum.getFullYear()
    || (next.getFullYear() === maximum.getFullYear() && next.getMonth() <= maximum.getMonth());
});

function dateValue(day) {
  return formatDate(new Date(displayedMonth.value.getFullYear(), displayedMonth.value.getMonth(), day));
}

function isDisabled(day) {
  const value = dateValue(day);
  return value < props.minDate || value > props.maxDate;
}

function moveMonth(offset) {
  displayedMonth.value = new Date(
    displayedMonth.value.getFullYear(),
    displayedMonth.value.getMonth() + offset,
    1,
  );
}

function selectDate(day) {
  if (isDisabled(day)) return;
  emit('select', dateValue(day));
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-backdrop" @click.self="$emit('close')">
      <section class="date-modal" role="dialog" aria-modal="true" aria-label="일정 날짜 선택">
        <header>
          <h2>일정 날짜 선택</h2>
          <button type="button" aria-label="닫기" @click="$emit('close')"><X :size="22" /></button>
        </header>

        <div class="month-navigation">
          <button type="button" aria-label="이전 달" :disabled="!canMovePrevious" @click="moveMonth(-1)">
            <ChevronLeft :size="21" />
          </button>
          <strong>{{ monthLabel }}</strong>
          <button type="button" aria-label="다음 달" :disabled="!canMoveNext" @click="moveMonth(1)">
            <ChevronRight :size="21" />
          </button>
        </div>

        <div class="calendar-grid weekdays">
          <span v-for="weekday in weekdays" :key="weekday">{{ weekday }}</span>
        </div>
        <div class="calendar-grid days">
          <span v-for="(_, index) in calendarDays" :key="`blank-${index}`">
            <button
              v-if="calendarDays[index]"
              type="button"
              :class="{ selected: dateValue(calendarDays[index]) === selectedDate }"
              :disabled="isDisabled(calendarDays[index])"
              @click="selectDate(calendarDays[index])"
            >
              {{ calendarDays[index] }}
            </button>
          </span>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop { position:fixed; inset:0; z-index:100; display:flex; align-items:flex-end; justify-content:center; padding:16px; background:rgb(15 23 42 / 45%); }
.date-modal { width:min(370px,100%); padding:22px 20px 24px; border-radius:24px; background:#fff; box-shadow:0 16px 40px rgb(15 23 42 / 22%); }
header { display:flex; align-items:center; justify-content:space-between; } h2 { margin:0; font-size:19px; } header button,.month-navigation button { display:grid; width:36px; height:36px; place-items:center; padding:0; border:0; border-radius:50%; background:transparent; }
.month-navigation { display:grid; grid-template-columns:36px 1fr 36px; align-items:center; margin:18px 0 12px; text-align:center; }.month-navigation button:disabled { color:#cbd5e1; }
.calendar-grid { display:grid; grid-template-columns:repeat(7,1fr); text-align:center; }.weekdays { margin-bottom:6px; color:#8a96a5; font-size:12px; font-weight:700; }.days span { display:grid; height:42px; place-items:center; }.days button { width:36px; height:36px; padding:0; border:0; border-radius:50%; background:transparent; font-weight:700; }.days button.selected { color:#fff; background:#3087ed; }.days button:disabled { color:#cbd5e1; }
</style>
