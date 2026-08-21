<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Check, ChevronRight } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseErrorState from '@/components/common/BaseErrorState.vue';
import { useReservationStore } from '@/stores/reservationStore';

const route = useRoute();
const router = useRouter();
const reservationStore = useReservationStore();

// 흰 카드 위에 뿌려지므로 밝은 색은 보이지 않는다.
// 정산 완료 화면과 같은 색을 쓴다
const CONFETTI_COLORS = ['#3087ED', '#0B3155', '#F2A007', '#8FD0FF', '#164B86'];

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
const createResult = computed(() => (
  reservationStore.reservationCreateResult?.reservationId === reservationId.value
    ? reservationStore.reservationCreateResult
    : null
));
const detail = computed(() => (
  reservationStore.reservationDetail?.reservationId === reservationId.value
    ? reservationStore.reservationDetail
    : null
));
const reservation = computed(() => {
  if (createResult.value) return createResult.value;
  if (!detail.value) return null;

  return {
    reservationId: detail.value.reservationId,
    reservationCode: detail.value.reservationCode,
    merchantName: detail.value.merchant?.name,
    productName: detail.value.reservationProduct?.productName,
    startDate: detail.value.startDate,
    endDate: detail.value.endDate,
    headcount: detail.value.headcount,
    quantity: detail.value.quantity,
    totalAmount: detail.value.totalAmount,
  };
});

function parseLocalDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatDate(value) {
  const date = parseLocalDate(value);
  if (!date) return '-';
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} (${dayNames[date.getDay()]})`;
}

function formatAmount(value) {
  if (value === null || value === undefined) return '-';
  return `${Number(value).toLocaleString('ko-KR')}원`;
}

function fetchReservation() {
  if (!Number.isSafeInteger(reservationId.value) || reservationId.value <= 0) {
    reservationStore.detailError = '예약 정보를 찾을 수 없습니다.';
    return;
  }
  reservationStore.fetchReservationDetails(reservationId.value);
}

// 항목이 늘거나 줄어도 표는 그대로 두고 이 배열만 고치면 된다
const summaryRows = computed(() => {
  const value = reservation.value;
  if (!value) return [];

  return [
    { label: '이용 시작일', value: formatDate(value.startDate) },
    { label: '이용 종료일', value: formatDate(value.endDate) },
    { label: '이용 인원', value: `${value.headcount}명` },
    { label: '결제 금액', value: formatAmount(value.totalAmount), accent: true },
  ];
});

function goToDetail() {
  router.push({
    name: 'ReservationDetail',
    params: { reservationId: reservationId.value },
  });
}

onMounted(() => {
  if (!createResult.value) fetchReservation();
});
</script>

<template>
  <div class="bg-canvas flex min-h-screen w-full flex-col text-ink">
    <header class="flex h-16 shrink-0 items-center justify-center px-4">
      <h1 class="text-title font-bold -tracking-[0.01em]">예약 완료</h1>
    </header>

    <main
      v-if="reservationStore.isDetailLoading && !reservation"
      class="flex-1 space-y-4 px-4 pt-10"
    >
      <div class="bg-line/60 mx-auto size-24 animate-pulse rounded-full"></div>
      <div class="bg-line/60 mx-auto h-7 w-48 animate-pulse rounded"></div>
      <div class="rounded-card bg-line/60 mt-10 h-16 animate-pulse"></div>
      <div class="rounded-card bg-line/60 h-52 animate-pulse"></div>
    </main>

    <main v-else-if="reservationStore.detailError && !reservation" class="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <BaseErrorState
        title="완료된 예약 정보를 불러오지 못했어요."
        :description="reservationStore.detailError"
        @retry="fetchReservation"
      />
    </main>

    <template v-else-if="reservation">
      <main class="flex-1 px-4 pb-6">
        <section class="relative flex flex-col items-center pb-9 pt-8 text-center">
          <div class="relative size-24">
            <span
              class="animate-bounce-once bg-brand shadow-cta relative z-10 grid size-24 place-items-center rounded-full text-white"
            >
              <Check :size="52" :stroke-width="2.8" />
            </span>
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
          <h2 class="text-display mt-6 font-bold -tracking-[0.02em]">
            예약이 완료되었어요
          </h2>
        </section>

        <button
          type="button"
          class="rounded-card bg-surface shadow-card flex w-full items-center justify-between px-[18px] py-4 text-left transition-transform active:scale-[0.99]"
          @click="goToDetail"
        >
          <span>
            <span class="text-body-sm block text-ink-mute">예약 번호</span>
            <strong class="text-body mt-1 block font-semibold">
              {{ reservation.reservationCode }}
            </strong>
          </span>
          <ChevronRight class="text-ink-mute" :size="18" />
        </button>

        <section class="px-1 py-5">
          <h3 class="text-title font-bold -tracking-[0.01em]">
            {{ reservation.merchantName }}
          </h3>
          <p class="text-body-sm mt-1.5 text-ink-sub">
            {{ reservation.productName }} · {{ reservation.quantity }}개
          </p>
        </section>

        <section class="rounded-card bg-surface shadow-card px-[18px] py-2">
          <dl>
            <div
              v-for="row in summaryRows"
              :key="row.label"
              class="border-line flex justify-between gap-4 border-b py-3 last:border-b-0"
            >
              <dt class="text-body-sm shrink-0 text-ink-sub">{{ row.label }}</dt>
              <dd
                class="text-body-sm text-right font-semibold"
                :class="row.accent ? 'text-brand' : 'text-ink'"
              >
                {{ row.value }}
              </dd>
            </div>
          </dl>
        </section>
      </main>

      <footer class="bg-canvas sticky bottom-0 space-y-2.5 px-4 pt-3 pb-6">
        <BaseButton variant="outline" @click="goToDetail">
          예약 상세 보기
        </BaseButton>
        <BaseButton @click="router.push({ name: 'ReservationMerchantList' })">
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
