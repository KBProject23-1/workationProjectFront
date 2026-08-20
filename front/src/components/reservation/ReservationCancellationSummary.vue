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
    ? 'border-line bg-brand-weak/70'
    : 'border-line bg-white',
);
</script>

<template>
  <section class="w-full">
    <h2
      v-if="showMerchantName"
      class="mb-4 text-center text-title font-bold text-ink"
    >
      {{ merchantName }}
    </h2>

    <dl class="space-y-4 rounded-card border px-4 py-5" :class="summaryClass">
      <div v-if="canceledAt" class="flex items-start justify-between gap-4">
        <dt class="text-body-sm font-medium text-ink-mute">취소 일시</dt>
        <dd class="text-right text-body-sm font-bold text-ink">
          {{ formatDateTime(canceledAt) }}
        </dd>
      </div>
      <div class="flex items-start justify-between gap-4">
        <dt class="text-body-sm font-medium text-ink-mute">이용 시작일</dt>
        <dd class="text-right text-body-sm font-bold text-ink">
          {{ formatDate(startDate) }}
        </dd>
      </div>
      <div class="flex items-start justify-between gap-4">
        <dt class="text-body-sm font-medium text-ink-mute">이용 종료일</dt>
        <dd class="text-right text-body-sm font-bold text-ink">
          {{ formatDate(endDate) }}
        </dd>
      </div>
      <div class="flex items-start justify-between gap-4">
        <dt class="text-body-sm font-medium text-ink-mute">
          {{ showQuantity ? '결제 정보 / 개수' : '상품 정보' }}
        </dt>
        <dd class="text-right text-body-sm font-bold text-ink">
          {{ productName
          }}<template v-if="showQuantity && quantity !== null">
            / {{ quantity }}개</template
          >
        </dd>
      </div>
      <div class="flex items-start justify-between gap-4">
        <dt class="text-body-sm font-medium text-ink-mute">최초 결제 금액</dt>
        <dd class="text-right text-body-sm font-bold text-ink">
          {{ formatAmount(totalAmount) }}
        </dd>
      </div>
      <div class="flex items-start justify-between gap-4">
        <dt class="text-body-sm font-medium text-ink-mute">수수료</dt>
        <dd class="text-right text-body-sm font-bold text-ink">
          {{ formatAmount(cancelFee) }}
        </dd>
      </div>
      <div class="flex items-start justify-between gap-4">
        <dt class="text-body-sm font-medium text-ink-mute">최종 환불 금액</dt>
        <dd class="text-right text-body-sm font-bold text-ink">
          {{ formatAmount(refundAmount) }}
        </dd>
      </div>
      <div
        v-if="showPaymentMethod"
        class="flex items-start justify-between gap-4"
      >
        <dt class="text-body-sm font-medium text-ink-mute">결제 수단</dt>
        <dd class="text-right text-body-sm font-bold text-ink">
          {{ paymentMethod || '-' }}
        </dd>
      </div>
    </dl>
  </section>
</template>
