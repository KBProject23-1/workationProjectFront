<script setup>
import { computed, ref } from 'vue';
import { ChevronLeft, ChevronRight, X } from '@lucide/vue';

const props = defineProps({
  mode: { type: String, required: true },
  checkIn: { type: String, default: '' },
  checkOut: { type: String, default: '' },
  range: { type: Boolean, default: false },
  startLabel: { type: String, default: '체크인 날짜' },
  endLabel: { type: String, default: '체크아웃 날짜' },
});
const emit = defineEmits(['close', 'select', 'select-range']);
const selectedDate = ref(props.mode === 'checkIn' ? props.checkIn : props.checkOut);
const rangeStart = ref(props.checkIn);
const rangeEnd = ref(props.checkOut);
const initialDate = (rangeStart.value || selectedDate.value)
  ? new Date(`${rangeStart.value || selectedDate.value}T00:00:00`)
  : new Date();
const viewDate = ref(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
const title = computed(() =>
  props.range ? '기간 선택' : `${props.mode === 'checkIn' ? props.startLabel : props.endLabel} 선택`,
);
const rangeGuide = computed(() => {
  if (!rangeStart.value || rangeEnd.value) return '시작일과 종료일을 차례로 선택해 주세요';
  return '종료일을 선택해 기간을 완성해 주세요';
});
const monthLabel = computed(() => `${viewDate.value.getFullYear()}년 ${viewDate.value.getMonth() + 1}월`);
const days = computed(() => {
  const year = viewDate.value.getFullYear();
  const month = viewDate.value.getMonth();
  const first = new Date(year, month, 1).getDay();
  const last = new Date(year, month + 1, 0).getDate();
  return [...Array(first).fill(null), ...Array.from({ length: last }, (_, index) => index + 1)];
});

function formatDate(day) {
  const year = viewDate.value.getFullYear();
  const month = String(viewDate.value.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-${String(day).padStart(2, '0')}`;
}

function isDateDisabled(day) {
  if (props.range) return false;
  return props.mode === 'checkOut' && Boolean(props.checkIn) && formatDate(day) < props.checkIn;
}

function isInRange(day) {
  const value = formatDate(day);
  return Boolean(rangeStart.value && rangeEnd.value && value > rangeStart.value && value < rangeEnd.value);
}

function selectDay(day) {
  const value = formatDate(day);
  if (!props.range) {
    selectedDate.value = value;
    return;
  }

  if (!rangeStart.value || rangeEnd.value || value < rangeStart.value) {
    rangeStart.value = value;
    rangeEnd.value = '';
    return;
  }
  rangeEnd.value = value;
}

function confirmSelection() {
  if (props.range) {
    emit('select-range', { startDate: rangeStart.value, endDate: rangeEnd.value });
    return;
  }
  emit('select', selectedDate.value);
}

function moveMonth(amount) {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + amount, 1);
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section class="date-modal" role="dialog" aria-modal="true" :aria-label="title">
      <header><h2>{{ title }}</h2><button type="button" aria-label="닫기" @click="emit('close')"><X /></button></header>
      <template v-if="range">
        <p class="range-guide">{{ rangeGuide }}</p>
        <div class="range-summary" aria-live="polite">
          <span :class="{ active: rangeStart }">{{ rangeStart || '시작일' }}</span>
          <span class="range-divider">→</span>
          <span :class="{ active: rangeEnd }">{{ rangeEnd || '종료일' }}</span>
        </div>
      </template>
      <div class="month-header">
        <button type="button" aria-label="이전 달" @click="moveMonth(-1)"><ChevronLeft /></button>
        <strong>{{ monthLabel }}</strong>
        <button type="button" aria-label="다음 달" @click="moveMonth(1)"><ChevronRight /></button>
      </div>
      <div class="calendar-grid weekday"><span v-for="day in weekDays" :key="day">{{ day }}</span></div>
      <div class="calendar-grid days">
        <span v-for="(day, index) in days" :key="index" :class="{ 'in-range': day && isInRange(day), 'range-start': day && range && rangeStart === formatDate(day), 'range-end': day && range && rangeEnd === formatDate(day) }">
          <button
            v-if="day"
            type="button"
            :class="{ selected: range ? rangeStart === formatDate(day) || rangeEnd === formatDate(day) : selectedDate === formatDate(day) }"
            :disabled="isDateDisabled(day)"
            @click="selectDay(day)"
          >
            {{ day }}
          </button>
        </span>
      </div>
      <button type="button" class="done" :disabled="range ? !rangeEnd : !selectedDate" @click="confirmSelection">선택 완료</button>
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop { position:fixed; inset:0; z-index:50; display:flex; align-items:flex-end; justify-content:center; background:rgb(17 24 39 / 45%); }
.date-modal { width:min(430px,100%); max-height:100dvh; overflow-y:auto; padding:24px; border-radius:24px 24px 0 0; background:#fff; }
header,.month-header { display:flex; align-items:center; justify-content:space-between; } h2 { margin:0; font-size:22px; }
header button,.month-header button { display:grid; place-items:center; border:0; background:none; }
.range-guide { margin:8px 0 0; color:#667085; font-size:13px; }
.range-summary { display:flex; align-items:center; justify-content:center; gap:10px; margin:18px 0 -4px; padding:11px 14px; border-radius:14px; background:#f5f4ff; color:#98a2b3; font-size:13px; font-weight:700; }
.range-summary span.active { color:#5b5bd6; }.range-divider { color:#b5b5dd; }
.month-header { padding:28px 4px 20px; font-size:16px; }
.calendar-grid { display:grid; grid-template-columns:repeat(7,1fr); text-align:center; }
.weekday { color:#7b8794; font-size:12px; padding-bottom:9px; }
.days span { height:45px; display:grid; place-items:center; } .days span.in-range { background:#eeedff; }.days span.range-start { border-radius:999px 0 0 999px; background:#eeedff; }.days span.range-end { border-radius:0 999px 999px 0; background:#eeedff; }.days span.range-start.range-end { border-radius:999px; }.days button { width:38px; height:38px; border:0; border-radius:50%; background:#fff; transition:transform .16s ease, background-color .16s ease; }
.days button.selected { color:#fff; background:#625fd1; font-weight:750; box-shadow:0 4px 10px rgb(98 95 209 / 28%); }.days button:not(:disabled):active { transform:scale(.92); }
.days button:disabled { color:#c8d0da; background:#f5f7f9; cursor:not-allowed; opacity:.65; }
.done { width:100%; height:56px; margin-top:18px; border:0; border-radius:16px; color:#fff; background:#3087ed; font-size:16px; font-weight:750; }
</style>
