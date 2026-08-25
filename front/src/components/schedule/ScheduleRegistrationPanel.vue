<script setup>
import { computed, ref } from 'vue';
import { CalendarDays, ChevronRight, Clock } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';
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

const emit = defineEmits([
  'update:selectedDate',
  'update:selectedTime',
  'register',
]);

const dateModalVisible = ref(false);
const timePickerVisible = ref(false);

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const formattedDate = computed(() => {
  if (!props.selectedDate) return '날짜를 선택해 주세요';
  const [year, month, day] = props.selectedDate.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
  return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')} (${weekday})`;
});

const openDateModal = () => {
  if (!props.disabled && props.minDate && props.maxDate) {
    dateModalVisible.value = true;
  }
};

const selectDate = (value) => {
  emit('update:selectedDate', value);
  dateModalVisible.value = false;
};

const selectTime = (value) => {
  emit('update:selectedTime', value);
  timePickerVisible.value = false;
};
</script>

<template>
  <section class="rounded-card bg-surface shadow-card px-[18px] py-4">
    <p class="text-body-sm mb-2 font-semibold text-ink-sub">일정 날짜</p>
    <button
      type="button"
      class="border-line rounded-chip flex h-12 w-full items-center gap-2.5 border px-3.5 text-left disabled:text-ink-mute"
      :disabled="disabled"
      @click="openDateModal"
    >
      <CalendarDays :size="17" class="text-ink-mute shrink-0" />
      <span class="text-body flex-1 truncate" :class="selectedDate ? 'text-ink' : 'text-ink-mute'">
        {{ formattedDate }}
      </span>
      <ChevronRight :size="16" class="text-ink-mute shrink-0" />
    </button>

    <p class="text-body-sm mt-4 mb-2 font-semibold text-ink-sub">시간 선택</p>
    <button
      type="button"
      class="border-line rounded-chip flex h-12 w-full items-center gap-2.5 border px-3.5 text-left disabled:text-ink-mute"
      :disabled="disabled"
      @click="timePickerVisible = true"
    >
      <Clock :size="17" class="text-ink-mute shrink-0" />
      <span class="text-body flex-1 truncate text-ink">{{ selectedTime }}</span>
      <ChevronRight :size="16" class="text-ink-mute shrink-0" />
    </button>

    <p v-if="errorMessage" class="text-body-sm text-danger mt-3 leading-relaxed">
      {{ errorMessage }}
    </p>

    <BaseButton
      class="mt-4"
      :disabled="disabled || loading || !selectedDate || !selectedTime"
      @click="$emit('register')"
    >
      {{ loading ? '등록 중...' : '일정 등록하기' }}
    </BaseButton>

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
