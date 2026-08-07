<script setup>
import { computed } from 'vue';
import { ChevronRight } from '@lucide/vue';

const props = defineProps({
  reservation: { type: Object, required: true },
});

defineEmits(['select']);

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

// 백엔드의 LocalDate와 LocalDateTime을 화면 표시용 날짜 정보로 분리
function parseDateTime(value) {
  if (!value) return null;

  const [datePart, timePart = ''] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return {
    year,
    month,
    day,
    dayName: dayNames[date.getDay()],
    time: timePart.slice(0, 5),
  };
}

function formatKoreanDate(date) {
  if (!date) return '';
  return `${date.year}년 ${date.month}월 ${date.day}일`;
}

function formatAmount(amount) {
  if (amount === null || amount === undefined) return '';
  return `${Number(amount).toLocaleString('ko-KR')}원`;
}

const startDate = computed(() => parseDateTime(props.reservation.startDate));
const endDate = computed(() => parseDateTime(props.reservation.endDate));
const canceledAt = computed(() => parseDateTime(props.reservation.canceledAt));
const isCanceled = computed(() => props.reservation.status === 'CANCELED');
const showFreeCancellation = computed(
  () => props.reservation.status === 'CONFIRMED',
);

const dateRangeLabel = computed(() => {
  const startLabel = formatKoreanDate(startDate.value);
  const endLabel = formatKoreanDate(endDate.value);

  if (!startLabel) return endLabel;
  if (!endLabel || startLabel === endLabel) return startLabel;
  return `${startLabel} ~ ${endLabel}`;
});

const canceledAtLabel = computed(() => {
  if (!canceledAt.value) return '';

  const dateLabel = formatKoreanDate(canceledAt.value);
  const timeLabel = canceledAt.value.time ? ` ${canceledAt.value.time}` : '';
  return `${dateLabel} (${canceledAt.value.dayName})${timeLabel}`;
});

const categoryLabel = computed(() =>
  props.reservation.productDetailType === 'ROOM' ? '숙소' : '공유오피스',
);

// 상품 세부 유형과 API 수량·인원 필드를 조합한 예약 구성 표시
const reservationCompositionLabel = computed(() => {
  const quantityLabel = {
    ROOM: '객실',
    OFFICE_SEAT: '좌석',
    MEETING_ROOM: '회의실',
  }[props.reservation.productDetailType];

  const parts = [];
  if (quantityLabel && props.reservation.quantity) {
    parts.push(`${quantityLabel} ${props.reservation.quantity}개`);
  }
  if (props.reservation.headcount) {
    parts.push(`성인 ${props.reservation.headcount}명`);
  }
  return parts.join(' · ');
});

const amountLabel = computed(() => formatAmount(props.reservation.totalAmount));
const refundAmountLabel = computed(() =>
  formatAmount(props.reservation.refundAmount),
);

// 백엔드 예약 상태를 화면 명세의 상태명과 배지 색상으로 변환
const statusLabel = computed(() => {
  if (isCanceled.value) return '취소 완료';
  return props.reservation.status === 'COMPLETED' ? '이용 완료' : '예약 완료';
});

const statusClass = computed(() => {
  if (isCanceled.value) return 'border-rose-300 text-rose-500';
  return props.reservation.status === 'COMPLETED'
    ? 'border-emerald-400 text-emerald-600'
    : 'border-blue-400 text-primary';
});
</script>

<template>
  <button
    type="button"
    class="w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-colors active:bg-slate-50"
    @click="$emit('select', reservation.reservationId)"
  >
    <div class="flex gap-3">
      <img
        :src="reservation.thumbnailUrl"
        :alt="reservation.productName"
        class="h-[94px] w-[94px] shrink-0 rounded-lg bg-blue-100 object-cover"
      />

      <div class="min-w-0 flex-1 pt-0.5">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[12px] font-medium text-slate-400">
            {{ categoryLabel }}
          </span>
          <span
            class="shrink-0 rounded-full border px-3 py-0.5 text-[11px] font-bold"
            :class="statusClass"
          >
            {{ statusLabel }}
          </span>
        </div>

        <div class="mt-1 flex items-center gap-1">
          <p class="min-w-0 flex-1 truncate text-[15px] font-extrabold text-slate-900">
            {{ reservation.merchantName }}
          </p>
          <ChevronRight :size="20" class="shrink-0 text-slate-400" />
        </div>

        <p class="mt-1 text-[11px] leading-snug text-slate-500">
          {{ dateRangeLabel }}
        </p>
      </div>
    </div>

    <div class="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
      <p class="truncate text-[13px] font-bold text-slate-800">
        {{ reservation.productName }}
      </p>
      <p class="mt-0.5 text-[11px] text-slate-400">
        {{ reservationCompositionLabel }}
      </p>
    </div>

    <div v-if="isCanceled" class="mt-3 flex items-end justify-between gap-3">
      <div class="min-w-0">
        <p class="text-[11px] text-slate-400">취소 일시</p>
        <p class="mt-0.5 truncate text-[11px] font-medium text-slate-600">
          {{ canceledAtLabel }}
        </p>
      </div>
      <div class="shrink-0 text-right">
        <p class="text-[11px] text-slate-400">환불액</p>
        <p class="mt-0.5 text-[17px] font-extrabold leading-none text-rose-500">
          {{ refundAmountLabel }}
        </p>
      </div>
    </div>

    <div v-else class="mt-3 flex items-end justify-between gap-3">
      <p
        v-if="showFreeCancellation"
        class="text-[11px] font-semibold text-primary"
      >
        예약 하루 전까지 무료 취소
      </p>
      <div class="ml-auto shrink-0 text-right">
        <p class="text-[11px] text-slate-400">결제 금액</p>
        <p class="mt-0.5 text-[18px] font-extrabold leading-none text-slate-900">
          {{ amountLabel }}
        </p>
      </div>
    </div>
  </button>
</template>
