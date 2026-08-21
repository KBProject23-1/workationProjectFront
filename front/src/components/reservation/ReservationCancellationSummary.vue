<script setup>
import { computed } from 'vue';

const props = defineProps({
  merchantName: { type: String, default: '-' },
  showMerchantName: { type: Boolean, default: true },
  canceledAt: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  productName: { type: String, default: '-' },
  quantity: { type: Number, default: null },
  showQuantity: { type: Boolean, default: true },
  totalAmount: { type: [Number, String], default: null },
  cancelFee: { type: [Number, String], default: null },
  refundAmount: { type: [Number, String], default: null },
  refundAmountLabel: { type: String, default: '최종 환불 금액' },
  paymentMethod: { type: String, default: '-' },
  showPaymentMethod: { type: Boolean, default: true },
  highlighted: { type: Boolean, default: false },
});

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

function formatDate(value) {
  if (!value) return '-';
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return '-';
  return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')} (${dayNames[date.getDay()]})`;
}

function formatAmount(value) {
  if (value === null || value === undefined) return '-';
  return `${Number(value).toLocaleString('ko-KR')}원`;
}

function formatDateTime(value) {
  if (!value) return '-';
  const [datePart, timePart = ''] = value.split('T');
  return `${formatDate(datePart)}${timePart ? ` ${timePart.slice(0, 5)}` : ''}`;
}

const summaryClass = computed(() =>
  props.highlighted
    ? 'border-blue-100 bg-blue-50/70'
    : 'border-slate-200 bg-white',
);
</script>

<template>
  <section class="w-full">
    <h2
      v-if="showMerchantName"
      class="mb-4 text-center text-[17px] font-extrabold text-slate-800"
    >
      {{ merchantName }}
    </h2>

    <dl class="space-y-4 rounded-xl border px-4 py-5" :class="summaryClass">
      <div v-if="canceledAt" class="flex items-start justify-between gap-4">
        <dt class="text-[12px] font-medium text-slate-400">취소 일시</dt>
        <dd class="text-right text-[13px] font-bold text-slate-700">
          {{ formatDateTime(canceledAt) }}
        </dd>
      </div>
      <div class="flex items-start justify-between gap-4">
        <dt class="text-[12px] font-medium text-slate-400">이용 시작일</dt>
        <dd class="text-right text-[13px] font-bold text-slate-700">
          {{ formatDate(startDate) }}
        </dd>
      </div>
      <div class="flex items-start justify-between gap-4">
        <dt class="text-[12px] font-medium text-slate-400">이용 종료일</dt>
        <dd class="text-right text-[13px] font-bold text-slate-700">
          {{ formatDate(endDate) }}
        </dd>
      </div>
      <div class="flex items-start justify-between gap-4">
        <dt class="text-[12px] font-medium text-slate-400">
          {{ showQuantity ? '결제 정보 / 개수' : '상품 정보' }}
        </dt>
        <dd class="text-right text-[13px] font-bold text-slate-700">
          {{ productName
          }}<template v-if="showQuantity && quantity !== null">
            / {{ quantity }}개</template
          >
        </dd>
      </div>
      <div class="flex items-start justify-between gap-4">
        <dt class="text-[12px] font-medium text-slate-400">최초 결제 금액</dt>
        <dd class="text-right text-[13px] font-bold text-slate-700">
          {{ formatAmount(totalAmount) }}
        </dd>
      </div>
      <div class="flex items-start justify-between gap-4">
        <dt class="text-[12px] font-medium text-slate-400">수수료</dt>
        <dd class="text-right text-[13px] font-bold text-slate-700">
          {{ formatAmount(cancelFee) }}
        </dd>
      </div>
      <div class="flex items-start justify-between gap-4">
        <dt class="text-[12px] font-medium text-slate-400">
          {{ refundAmountLabel }}
        </dt>
        <dd class="text-right text-[13px] font-bold text-slate-700">
          {{ formatAmount(refundAmount) }}
        </dd>
      </div>
      <div
        v-if="showPaymentMethod"
        class="flex items-start justify-between gap-4"
      >
        <dt class="text-[12px] font-medium text-slate-400">결제 수단</dt>
        <dd class="text-right text-[13px] font-bold text-slate-700">
          {{ paymentMethod || '-' }}
        </dd>
      </div>
    </dl>
  </section>
</template>
