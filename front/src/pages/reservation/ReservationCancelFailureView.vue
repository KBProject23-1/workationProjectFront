<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { X } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import ReservationCancellationSummary from '@/components/reservation/ReservationCancellationSummary.vue';
import { useReservationStore } from '@/stores/reservationStore';

const route = useRoute();
const router = useRouter();
const reservationStore = useReservationStore();

const reservationId = computed(() => Number(route.params.reservationId));
const detail = computed(() => reservationStore.reservationDetail);
const failureMessage = computed(
  () => reservationStore.cancelError || '예약 취소 처리 중 오류가 발생했습니다.',
);

function goToCancellationList() {
  router.replace({ name: 'ReservationList', query: { tab: 'cancellation' } });
}

function fetchDetail() {
  if (!Number.isSafeInteger(reservationId.value) || reservationId.value <= 0) {
    reservationStore.reservationDetail = null;
    reservationStore.detailError = '예약 정보를 찾을 수 없습니다.';
    return;
  }
  reservationStore.fetchReservationDetails(reservationId.value);
}

onMounted(fetchDetail);
</script>

<template>
  <div class="flex min-h-screen w-full flex-col bg-white">
    <div class="px-5 pt-4">
      <BaseHeader
        title="예약 취소 실패"
        back-label="취소 내역으로 이동"
        @back="goToCancellationList"
      />
    </div>

    <main
      v-if="reservationStore.isDetailLoading"
      class="flex flex-1 items-center justify-center"
    >
      <div class="h-12 w-12 animate-pulse rounded-full bg-slate-100"></div>
    </main>

    <main
      v-else-if="reservationStore.detailError || !detail"
      class="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center"
    >
      <p class="text-[15px] font-semibold text-slate-600">
        예약 정보를 불러오지 못했어요
      </p>
      <p class="mt-2 text-[12px] text-slate-400">
        {{ reservationStore.detailError }}
      </p>
      <button
        type="button"
        class="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-[14px] font-semibold text-slate-700"
        @click="fetchDetail"
      >
        다시 시도
      </button>
    </main>

    <template v-else>
      <main class="flex flex-1 flex-col items-center px-4 pt-10">
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-rose-500">
          <X :size="48" :stroke-width="2.4" class="text-white" />
        </div>
        <h2 class="mt-5 text-[20px] font-extrabold text-slate-800">
          취소에 실패했어요.
        </h2>
        <p class="mt-1 text-center text-[12px] text-slate-500">
          {{ failureMessage }}
        </p>

        <div class="mt-8 w-full">
          <ReservationCancellationSummary
            :merchant-name="detail.merchant.name"
            :start-date="detail.startDate"
            :end-date="detail.endDate"
            :product-name="detail.reservationProduct.productName"
            :quantity="detail.quantity"
            :total-amount="detail.totalAmount"
            :cancel-fee="0"
            :refund-amount="0"
            :payment-method="detail.paymentMethod"
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
