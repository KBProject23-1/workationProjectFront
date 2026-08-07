<script setup>
import { computed, ref } from 'vue';
import { ChevronLeft, ChevronRight, X } from '@lucide/vue';

const props = defineProps({
  mode: { type: String, required: true },
  checkIn: { type: String, default: '' },
  checkOut: { type: String, default: '' },
  startLabel: { type: String, default: '체크인 날짜' },
  endLabel: { type: String, default: '체크아웃 날짜' },
});
const emit = defineEmits(['close', 'select']);
const selectedDate = ref(props.mode === 'checkIn' ? props.checkIn : props.checkOut);
const initialDate = selectedDate.value ? new Date(`${selectedDate.value}T00:00:00`) : new Date();
const viewDate = ref(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
const title = computed(() => `${props.mode === 'checkIn' ? props.startLabel : props.endLabel} 선택`);
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

function moveMonth(amount) {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + amount, 1);
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section class="date-modal" role="dialog" aria-modal="true" :aria-label="title">
      <header><h2>{{ title }}</h2><button type="button" aria-label="닫기" @click="emit('close')"><X /></button></header>
      <div class="month-header">
        <button type="button" aria-label="이전 달" @click="moveMonth(-1)"><ChevronLeft /></button>
        <strong>{{ monthLabel }}</strong>
        <button type="button" aria-label="다음 달" @click="moveMonth(1)"><ChevronRight /></button>
      </div>
      <div class="calendar-grid weekday"><span v-for="day in weekDays" :key="day">{{ day }}</span></div>
      <div class="calendar-grid days">
        <span v-for="(day, index) in days" :key="index">
          <button v-if="day" type="button" :class="{ selected: selectedDate === formatDate(day) }" @click="selectedDate = formatDate(day)">{{ day }}</button>
        </span>
      </div>
      <button type="button" class="done" :disabled="!selectedDate" @click="emit('select', selectedDate)">선택 완료</button>
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop { position:fixed; inset:0; z-index:50; display:flex; align-items:flex-end; justify-content:center; background:rgb(17 24 39 / 45%); }
.date-modal { width:min(430px,100%); padding:24px; border-radius:24px 24px 0 0; background:#fff; }
header,.month-header { display:flex; align-items:center; justify-content:space-between; } h2 { margin:0; font-size:22px; }
header button,.month-header button { display:grid; place-items:center; border:0; background:none; }
.month-header { padding:28px 4px 20px; font-size:16px; }
.calendar-grid { display:grid; grid-template-columns:repeat(7,1fr); text-align:center; }
.weekday { color:#7b8794; font-size:12px; padding-bottom:9px; }
.days span { height:45px; display:grid; place-items:center; } .days button { width:38px; height:38px; border:0; border-radius:50%; background:#fff; }
.days button.selected { color:#fff; background:#3087ed; font-weight:750; }
.done { width:100%; height:56px; margin-top:18px; border:0; border-radius:16px; color:#fff; background:#3087ed; font-size:16px; font-weight:750; }
</style>
