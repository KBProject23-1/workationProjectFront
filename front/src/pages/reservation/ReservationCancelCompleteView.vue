<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Check, ChevronLeft } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';
import ReservationCancellationSummary from '@/components/reservation/ReservationCancellationSummary.vue';
import { useReservationStore } from '@/stores/reservationStore';

const route = useRoute();
const router = useRouter();
const reservationStore = useReservationStore();

const reservationId = computed(() => Number(route.params.reservationId));
const detail = computed(() => reservationStore.reservationDetail);
const cancellation = computed(() => reservationStore.cancellationDetail);
const cancelResult = computed(() => reservationStore.cancelResult);
const isLoading = computed(
  () => reservationStore.isCancellationDetailLoading,
);
const error = computed(() => reservationStore.cancellationDetailError);

function formatCanceledAt(value) {
  if (!value) return '';
  const [datePart, timePart = ''] = value.split('T');
  return `${datePart.replaceAll('-', '.')} ${timePart.slice(0, 5)}`.trim();
}

const canceledAtLabel = computed(() =>
  formatCanceledAt(cancellation.value?.canceledAt || cancelResult.value?.canceledAt),
);

function goToCancellationList() {
  router.replace({ name: 'ReservationList', query: { tab: 'cancellation' } });
}

async function fetchResult() {
  if (!Number.isSafeInteger(reservationId.value) || reservationId.value <= 0) {
    reservationStore.cancellationDetailError = '예약 정보를 찾을 수 없습니다.';
    return;
  }
  await reservationStore.fetchReservationCancellation(reservationId.value);
}

onMounted(fetchResult);
</script>

<template>
  <div class="flex min-h-screen w-full flex-col bg-white">
    <header class="relative flex h-14 shrink-0 items-center justify-center px-4">
      <button
        type="button"
        class="absolute left-3 rounded-full p-1 text-slate-700 active:bg-slate-100"
        aria-label="취소 내역으로 이동"
        @click="goToCancellationList"
      >
        <ChevronLeft :size="24" :stroke-width="1.8" />
      </button>
      <h1 class="text-[19px] font-extrabold text-slate-900">예약 취소 완료</h1>
    </header>

    <main v-if="isLoading" class="flex flex-1 items-center justify-center">
      <div class="h-12 w-12 animate-pulse rounded-full bg-slate-100"></div>
    </main>

    <main
      v-else-if="error || !cancellation"
      class="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center"
    >
      <p class="text-[15px] font-semibold text-slate-600">
        예약 취소 결과를 불러오지 못했어요
      </p>
      <p class="mt-2 text-[12px] text-slate-400">{{ error }}</p>
      <button
        type="button"
        class="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-[14px] font-semibold text-slate-700"
        @click="fetchResult"
      >
        다시 시도
      </button>
    </main>

    <template v-else>
      <main class="flex flex-1 flex-col items-center px-4 pt-10">
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
          <Check :size="48" :stroke-width="2.4" class="text-white" />
        </div>
        <h2 class="mt-5 text-[20px] font-extrabold text-slate-800">
          취소가 완료되었어요.
        </h2>
        <p class="mt-1 text-[12px] font-semibold text-slate-600">
          {{ canceledAtLabel }}
        </p>

        <div class="mt-8 w-full">
          <ReservationCancellationSummary
            :merchant-name="cancellation.merchantName"
            :start-date="cancellation.startDate"
            :end-date="cancellation.endDate"
            :product-name="cancellation.reservationProduct.productName"
            :quantity="detail?.quantity"
            :total-amount="cancellation.totalAmount"
            :cancel-fee="cancellation.cancelFee"
            :refund-amount="cancellation.refundAmount"
            :payment-method="detail?.paymentMethod"
          />
        </div>
      </main>

      <footer class="sticky bottom-0 bg-white px-4 pb-6 pt-3">
        <BaseButton
          class="max-w-none rounded-lg py-3.5 text-[16px] font-bold"
          @click="goToCancellationList"
        >
          확인
        </BaseButton>
      </footer>
    </template>
  </div>
</template>
