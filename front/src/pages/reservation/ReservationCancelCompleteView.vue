<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Check } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import BaseErrorState from '@/components/common/BaseErrorState.vue';
import ReservationCancellationSummary from '@/components/reservation/ReservationCancellationSummary.vue';
import { useReservationStore } from '@/stores/reservationStore';

const route = useRoute();
const router = useRouter();
const reservationStore = useReservationStore();

const CONFETTI_COLORS = ['#2563EB', '#60A5FA', '#F59E0B', '#EF4444', '#10B981'];

const CONFETTI = Array.from({ length: 14 }, (_, index) => {
  const angle = (Math.PI * 2 * index) / 14;
  const distance = 58 + (index % 3) * 14;
  return {
    id: index,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    dx: `${Math.round(Math.cos(angle) * distance)}px`,
    dy: `${Math.round(Math.sin(angle) * distance)}px`,
    delay: `${(index % 4) * 40}ms`,
  };
});

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
  <div class="flex min-h-screen w-full flex-col bg-canvas">
    <div class="px-5 pt-4">
      <BaseHeader
        title="예약 취소 완료"
        back-label="취소 내역으로 이동"
        @back="goToCancellationList"
      />
    </div>

    <main v-if="isLoading" class="flex flex-1 items-center justify-center">
      <div class="h-12 w-12 animate-pulse rounded-full bg-canvas"></div>
    </main>

    <main
      v-else-if="error || !cancellation"
      class="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center"
    >
      <BaseErrorState
        title="예약 취소 결과를 불러오지 못했어요"
        :description="error"
        @retry="fetchResult"
      />
    </main>

    <template v-else>
      <main class="flex flex-1 flex-col items-center px-4 pt-10">
        <div class="relative h-20 w-20">
          <div class="relative z-10 flex h-20 w-20 animate-bounce-once items-center justify-center rounded-full bg-primary">
            <Check :size="48" :stroke-width="2.4" class="text-white" />
          </div>
          <span
            v-for="piece in CONFETTI"
            :key="piece.id"
            class="confetti pointer-events-none absolute top-1/2 left-1/2 block size-2 rounded-[1px]"
            :style="{
              backgroundColor: piece.color,
              '--dx': piece.dx,
              '--dy': piece.dy,
              animationDelay: piece.delay,
            }"
          />
        </div>
        <h2 class="mt-5 text-heading font-bold text-ink">
          취소가 완료되었어요.
        </h2>
        <p class="mt-1 text-body-sm font-semibold text-ink-sub">
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

      <footer class="sticky bottom-0 bg-canvas px-4 pb-6 pt-3">
        <BaseButton
          class="max-w-none"
          @click="goToCancellationList"
        >
          확인
        </BaseButton>
      </footer>
    </template>
  </div>
</template>

<style scoped>
@keyframes confetti-burst {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.4);
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy)))
      scale(1) rotate(220deg);
  }
}

.confetti {
  z-index: 20;
  opacity: 0;
  animation: confetti-burst 900ms ease-out forwards;
}

@media (prefers-reduced-motion: reduce) {
  .confetti {
    display: none;
  }
}
</style>
