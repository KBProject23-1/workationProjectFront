<script setup>
import { computed, ref } from 'vue';
import { CalendarDays, CalendarPlus, ChevronRight } from '@lucide/vue';
import ScheduleDateModal from '@/components/schedule/ScheduleDateModal.vue';

const props = defineProps({
  selectedDate: { type: String, default: '' },
  selectedTime: { type: String, default: '10:00' },
  minDate: { type: String, default: '' },
  maxDate: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
});

const emit = defineEmits(['update:selectedDate', 'update:selectedTime', 'register']);
const dateModalVisible = ref(false);
const times = Array.from({ length: 13 }, (_, index) => `${String(index + 8).padStart(2, '0')}:00`);
const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

const formattedDate = computed(() => {
  if (!props.selectedDate) return '날짜를 선택해 주세요';
  const [year, month, day] = props.selectedDate.split('-').map(Number);
  return `${year}. ${String(month).padStart(2, '0')}. ${String(day).padStart(2, '0')} (${weekdays[new Date(year, month - 1, day).getDay()]})`;
});

function openDateModal() {
  if (!props.disabled && props.minDate && props.maxDate) dateModalVisible.value = true;
}

function selectDate(value) {
  emit('update:selectedDate', value);
  dateModalVisible.value = false;
}
</script>

<template>
  <section class="schedule-panel">
    <h3>일정 날짜</h3>
    <button type="button" class="date-button" :disabled="disabled" @click="openDateModal">
      <CalendarDays :size="19" />
      <span>{{ formattedDate }}</span>
      <ChevronRight :size="19" />
    </button>

    <h3>시간 선택</h3>
    <div class="time-list" aria-label="일정 시간 선택">
      <button
        v-for="time in times"
        :key="time"
        type="button"
        :class="{ selected: selectedTime === time }"
        :disabled="disabled"
        @click="$emit('update:selectedTime', time)"
      >
        {{ time }}
      </button>
    </div>

    <p v-if="errorMessage" class="schedule-error">{{ errorMessage }}</p>
    <button
      type="button"
      class="register-button"
      :disabled="disabled || loading || !selectedDate || !selectedTime"
      @click="$emit('register')"
    >
      <CalendarPlus :size="19" />
      {{ loading ? '등록 중...' : '일정 등록하기' }}
    </button>

    <ScheduleDateModal
      v-if="minDate && maxDate"
      :visible="dateModalVisible"
      :selected-date="selectedDate"
      :min-date="minDate"
      :max-date="maxDate"
      @close="dateModalVisible = false"
      @select="selectDate"
    />
  </section>
</template>

<style scoped>
.schedule-panel { margin-top:16px; padding-top:16px; border-top:1px solid #e3e8ee; }.schedule-panel h3 { margin:0 0 9px; font-size:14px; }.date-button { width:100%; height:44px; display:grid; grid-template-columns:20px 1fr 20px; align-items:center; gap:8px; padding:0 14px; color:#3f4d5f; border:1px solid #dbe3ee; border-radius:13px; background:#f8fafc; text-align:left; }.date-button:disabled { color:#9ca8b6; }
.time-list { display:flex; gap:8px; margin:0 -4px 16px; padding:0 4px 4px; overflow-x:auto; scrollbar-width:none; }.time-list::-webkit-scrollbar { display:none; }.time-list button { flex:0 0 auto; min-width:60px; height:36px; padding:0 11px; color:#64748b; border:1px solid #dbe3ee; border-radius:999px; background:#fff; font-size:12px; font-weight:800; }.time-list button.selected { color:#fff; border-color:#3087ed; background:#3087ed; }.time-list button:disabled { opacity:.55; }
.register-button { width:100%; height:48px; display:flex; align-items:center; justify-content:center; gap:8px; color:#fff; border:0; border-radius:14px; background:#3087ed; font-weight:800; }.register-button:disabled { background:#a9c9ee; }.schedule-error { margin:0 0 10px; color:#e05252; font-size:12px; line-height:1.45; }
</style>
