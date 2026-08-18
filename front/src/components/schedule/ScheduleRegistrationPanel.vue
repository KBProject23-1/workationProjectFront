<script setup>
import { computed, ref } from 'vue';
import { CalendarDays, CalendarPlus, ChevronRight, Clock } from '@lucide/vue';
import ScheduleDateModal from '@/components/schedule/ScheduleDateModal.vue';
import ScheduleTimePicker from '@/components/workation/ScheduleTimePicker.vue';

const props = defineProps({
  selectedDate: { type: String, default: '' },
  selectedTime: { type: String, default: '10:00' },
  minDate: { type: String, default: '' },
  maxDate: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
  disabledTimes: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:selectedDate', 'update:selectedTime', 'register']);
const dateModalVisible = ref(false);
const timePickerVisible = ref(false);
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

function selectTime(value) {
  emit('update:selectedTime', value);
  timePickerVisible.value = false;
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
    <button
      type="button"
      class="time-button"
      :disabled="disabled"
      @click="timePickerVisible = true"
    >
      <Clock :size="19" />
      <span>{{ selectedTime }}</span>
      <ChevronRight :size="19" />
    </button>

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

    <ScheduleTimePicker
      :visible="timePickerVisible"
      :date="selectedDate"
      :current="selectedTime"
      :loading="loading"
      :disabled-times="disabledTimes"
      title="몇 시로 등록할까요?"
      confirm-label="등록"
      @confirm="selectTime"
      @cancel="timePickerVisible = false"
    />
  </section>
</template>

<style scoped>
.schedule-panel { margin-top:16px; padding-top:16px; border-top:1px solid #e3e8ee; }.schedule-panel h3 { margin:0 0 9px; font-size:14px; }.date-button { width:100%; height:44px; display:grid; grid-template-columns:20px 1fr 20px; align-items:center; gap:8px; padding:0 14px; color:#3f4d5f; border:1px solid #dbe3ee; border-radius:13px; background:#f8fafc; text-align:left; }.date-button:disabled { color:#9ca8b6; }
.time-button { width:100%; height:44px; display:grid; grid-template-columns:20px 1fr 20px; align-items:center; gap:8px; margin-bottom:16px; padding:0 14px; color:#3f4d5f; border:1px solid #dbe3ee; border-radius:13px; background:#f8fafc; text-align:left; }.time-button:disabled { color:#9ca8b6; }
.register-button { width:100%; height:48px; display:flex; align-items:center; justify-content:center; gap:8px; color:#fff; border:0; border-radius:14px; background:#3087ed; font-weight:800; }.register-button:disabled { background:#a9c9ee; }.schedule-error { margin:0 0 10px; color:#e05252; font-size:12px; line-height:1.45; }
</style>
