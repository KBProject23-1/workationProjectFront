<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft } from '@lucide/vue';
import ReservationCancellationSummary from '@/components/reservation/ReservationCancellationSummary.vue';
import { useReservationStore } from '@/stores/reservationStore';

const route = useRoute();
const router = useRouter();
const reservationStore = useReservationStore();

const reservationId = computed(() => Number(route.params.reservationId));
const cancellation = computed(() => reservationStore.cancellationDetail);

function goToCancellationList() {
  router.push({ name: 'ReservationList', query: { tab: 'cancellation' } });
}

function fetchCancellationDetail() {
  if (!Number.isSafeInteger(reservationId.value) || reservationId.value <= 0) {
    reservationStore.cancellationDetail = null;
    reservationStore.cancellationDetailError =
      '예약 취소 정보를 찾을 수 없습니다.';
    return;
  }

  reservationStore.fetchReservationCancellation(reservationId.value);
}

onMounted(fetchCancellationDetail);
</script>

<template>
  <div class="flex min-h-screen w-full flex-col bg-white">
    <header class="relative flex h-14 shrink-0 items-center justify-center px-4">
      <button
        type="button"
        class="absolute left-3 rounded-full p-1 text-slate-700 active:bg-slate-100"
        aria-label="취소 내역으로 돌아가기"
        @click="goToCancellationList"
      >
        <ChevronLeft :size="24" :stroke-width="1.8" />
      </button>
      <h1 class="text-[19px] font-extrabold text-slate-900">예약 내역 상세</h1>
    </header>

    <main
      v-if="reservationStore.isCancellationDetailLoading"
      class="flex-1 px-4 pb-8"
      aria-label="취소 상세 정보를 불러오는 중"
    >
      <div class="h-[202px] animate-pulse rounded-xl bg-slate-100"></div>
      <div class="mt-4 h-12 animate-pulse rounded-lg bg-slate-100"></div>
      <div class="mt-3 h-[290px] animate-pulse rounded-xl bg-slate-100"></div>
    </main>

    <main
      v-else-if="reservationStore.cancellationDetailError"
      class="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center"
    >
      <p class="text-[15px] font-semibold text-slate-600">
        취소 상세 정보를 불러오지 못했어요
      </p>
      <p class="mt-2 text-[12px] text-slate-400">
        {{ reservationStore.cancellationDetailError }}
      </p>
      <button
        type="button"
        class="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-[14px] font-semibold text-slate-700"
        @click="fetchCancellationDetail"
      >
        다시 시도
      </button>
    </main>

    <main v-else-if="cancellation" class="flex-1 px-4 pb-8">
      <img
        :src="cancellation.reservationProduct.thumbnailUrl"
        :alt="cancellation.reservationProduct.productName"
        class="h-[202px] w-full rounded-xl bg-blue-100 object-cover"
      />

      <div class="flex items-end justify-between gap-3 px-2 py-3">
        <h2 class="min-w-0 flex-1 truncate text-[17px] font-extrabold text-slate-800">
          {{ cancellation.merchantName }}
        </h2>
        <p class="shrink-0 text-[10px] text-slate-400">
          예약 번호 {{ cancellation.reservationCode }}
        </p>
      </div>

      <ReservationCancellationSummary
        :show-merchant-name="false"
        :canceled-at="cancellation.canceledAt"
        :start-date="cancellation.startDate"
        :end-date="cancellation.endDate"
        :product-name="cancellation.reservationProduct.productName"
        :show-quantity="false"
        :total-amount="cancellation.totalAmount"
        :cancel-fee="cancellation.cancelFee"
        :refund-amount="cancellation.refundAmount"
        :show-payment-method="false"
        highlighted
      />
    </main>
  </div>
</template>
