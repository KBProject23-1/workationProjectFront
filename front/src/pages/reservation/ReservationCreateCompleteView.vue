<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Check, ChevronRight } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { useReservationStore } from '@/stores/reservationStore';

const route = useRoute();
const router = useRouter();
const reservationStore = useReservationStore();

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
  <div class="mx-auto flex min-h-screen w-full max-w-[402px] flex-col bg-white text-slate-900">
    <header class="flex h-16 shrink-0 items-center justify-center px-4">
      <h1 class="text-[19px] font-extrabold">예약 완료</h1>
    </header>

    <main v-if="reservationStore.isDetailLoading && !reservation" class="flex-1 space-y-4 px-4 pt-10">
      <div class="mx-auto size-24 animate-pulse rounded-full bg-slate-100"></div>
      <div class="mx-auto h-7 w-48 animate-pulse rounded bg-slate-100"></div>
      <div class="mt-10 h-16 animate-pulse rounded-xl bg-slate-100"></div>
      <div class="h-52 animate-pulse rounded-xl bg-slate-100"></div>
    </main>

    <main v-else-if="reservationStore.detailError && !reservation" class="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <p class="text-[15px] font-bold text-slate-700">완료된 예약 정보를 불러오지 못했어요.</p>
      <p class="mt-2 text-[12px] text-slate-400">{{ reservationStore.detailError }}</p>
      <button type="button" class="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-[14px] font-bold text-slate-700" @click="fetchReservation">
        다시 시도
      </button>
    </main>

    <template v-else-if="reservation">
      <main class="flex-1 px-4 pb-6">
        <section class="relative flex flex-col items-center pb-9 pt-8 text-center">
          <span class="absolute left-[25%] top-12 size-2 rotate-12 rounded-sm bg-amber-300"></span>
          <span class="absolute right-[24%] top-16 size-2 rounded-full bg-rose-300"></span>
          <span class="absolute left-[31%] top-28 size-1.5 rounded-full bg-violet-300"></span>
          <span class="absolute right-[30%] top-28 size-2 rotate-45 bg-emerald-300"></span>
          <span class="grid size-24 place-items-center rounded-full bg-primary text-white shadow-[0_12px_35px_rgba(48,135,237,0.25)]">
            <Check :size="52" :stroke-width="2.8" />
          </span>
          <h2 class="mt-6 text-[24px] font-extrabold">예약이 완료되었어요!</h2>
        </section>

        <button type="button" class="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-4 text-left" @click="goToDetail">
          <span><span class="block text-[11px] text-slate-400">예약 번호</span><strong class="mt-1 block text-[15px]">{{ reservation.reservationCode }}</strong></span>
          <ChevronRight class="text-slate-400" :size="20" />
        </button>

        <section class="px-1 py-5">
          <h3 class="text-[17px] font-extrabold">{{ reservation.merchantName }}</h3>
          <p class="mt-2 text-[13px] font-medium text-slate-500">{{ reservation.productName }} · {{ reservation.quantity }}개</p>
        </section>

        <section class="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-5">
          <dl class="space-y-4">
            <div class="flex justify-between gap-4"><dt class="text-[12px] text-slate-400">이용 시작일</dt><dd class="text-right text-[13px] font-bold">{{ formatDate(reservation.startDate) }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-[12px] text-slate-400">이용 종료일</dt><dd class="text-right text-[13px] font-bold">{{ formatDate(reservation.endDate) }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-[12px] text-slate-400">이용 인원</dt><dd class="text-right text-[13px] font-bold">{{ reservation.headcount }}명</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-[12px] text-slate-400">결제 금액</dt><dd class="text-right text-[13px] font-bold text-primary">{{ formatAmount(reservation.totalAmount) }}</dd></div>
          </dl>
        </section>
      </main>

      <footer class="sticky bottom-0 space-y-2 bg-white px-4 pb-6 pt-3">
        <BaseButton class="max-w-none rounded-xl border-primary bg-white py-3.5 text-[16px] font-bold text-primary hover:bg-blue-50" @click="goToDetail">
          예약 상세 보기
        </BaseButton>
        <BaseButton class="max-w-none rounded-xl py-3.5 text-[16px] font-bold" @click="router.push({ name: 'ReservationMerchantList' })">
          확인
        </BaseButton>
      </footer>
    </template>
  </div>
</template>
