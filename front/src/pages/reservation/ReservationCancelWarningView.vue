<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CircleAlert } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import { useReservationStore } from '@/stores/reservationStore';

const route = useRoute();
const router = useRouter();
const reservationStore = useReservationStore();

const reservationId = computed(() => Number(route.params.reservationId));
const detail = computed(() => reservationStore.reservationDetail);
const isValidReservationId = computed(
  () => Number.isSafeInteger(reservationId.value) && reservationId.value > 0,
);
const canCancel = computed(
  () => detail.value?.status === 'CONFIRMED' && detail.value?.cancelable === true,
);
const refundAmountLabel = computed(() => {
  if (detail.value?.totalAmount === null || detail.value?.totalAmount === undefined) {
    return '-';
  }
  return `${Number(detail.value.totalAmount).toLocaleString('ko-KR')}원`;
});

function goToDetail() {
  router.push({
    name: 'ReservationDetail',
    params: { reservationId: reservationId.value },
  });
}

async function confirmCancellation() {
  if (!canCancel.value || reservationStore.isCanceling) return;

  try {
    await reservationStore.cancelReservation(reservationId.value);
    await router.replace({
      name: 'ReservationCancelComplete',
      params: { reservationId: reservationId.value },
    });
  } catch {
    await router.replace({
      name: 'ReservationCancelFailure',
      params: { reservationId: reservationId.value },
    });
  }
}

onMounted(() => {
  if (!isValidReservationId.value) {
    reservationStore.reservationDetail = null;
    reservationStore.detailError = '예약 정보를 찾을 수 없습니다.';
    return;
  }
  reservationStore.fetchReservationDetails(reservationId.value);
});
</script>

<template>
  <div class="flex min-h-screen w-full flex-col bg-canvas">
    <div class="px-5 pt-4">
      <BaseHeader
        title="예약 취소 (경고)"
        back-label="예약 상세로 돌아가기"
        @back="goToDetail"
      />
    </div>

    <main
      v-if="reservationStore.isDetailLoading"
      class="flex flex-1 items-center justify-center"
      aria-label="예약 정보를 불러오는 중"
    >
      <div class="h-12 w-12 animate-pulse rounded-full bg-canvas"></div>
    </main>

    <main
      v-else-if="reservationStore.detailError || !canCancel"
      class="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center"
    >
      <p class="text-title font-bold text-ink">예약을 취소할 수 없어요</p>
      <p class="mt-2 text-body-sm text-ink-mute">
        {{
          reservationStore.detailError ||
          '이용 시작일 당일부터는 예약을 취소할 수 없습니다.'
        }}
      </p>
      <button
        type="button"
        class="mt-5 rounded-chip border border-line px-4 py-2 text-body font-semibold text-ink"
        @click="goToDetail"
      >
        예약 상세로 돌아가기
      </button>
    </main>

    <template v-else>
      <main class="flex flex-1 flex-col px-4 pt-14">
        <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-danger/10">
          <CircleAlert :size="48" :stroke-width="1.8" class="text-danger" />
        </div>
        <h2 class="mt-6 text-center text-heading font-bold text-ink">
          예약을 취소할까요?
        </h2>

        <section class="mt-7 rounded-card border border-danger bg-danger/10/70 px-4 py-4">
          <h3 class="text-body-sm font-bold text-danger">취소 시 유의사항</h3>
          <ul class="mt-3 space-y-2 text-body-sm leading-relaxed text-ink-sub">
            <li>• 이용 시작 하루 전까지 취소 가능합니다.</li>
            <li>• 취소 수수료는 부과되지 않습니다.</li>
            <li>• 결제 금액은 취소 규정에 따라 환불됩니다.</li>
          </ul>
        </section>

        <section class="mt-7">
          <p class="text-body-sm font-semibold text-danger">취소 후 환불 금액</p>
          <p class="mt-1 text-[26px] font-bold text-ink">
            {{ refundAmountLabel }}
          </p>
          <p class="mt-1 text-body-sm font-semibold text-primary">
            100% 환불 (수수료 없음)
          </p>
        </section>
      </main>

      <footer class="grid grid-cols-2 gap-2 bg-canvas px-4 pb-6 pt-3">
        <BaseButton
          :disabled="reservationStore.isCanceling"
          class="max-w-none text-primary"
          @click="goToDetail"
        >
          아니요, 돌아갈래요
        </BaseButton>
        <BaseButton
          :disabled="reservationStore.isCanceling"
          class="max-w-none disabled:bg-rose-300"
          @click="confirmCancellation"
        >
          {{ reservationStore.isCanceling ? '취소 중...' : '네, 취소할게요' }}
        </BaseButton>
      </footer>
    </template>
  </div>
</template>
