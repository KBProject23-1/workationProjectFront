<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import { useReservationStore } from '@/stores/reservationStore';

const route = useRoute();
const router = useRouter();
const reservationStore = useReservationStore();

const reservationId = computed(() => Number(route.params.reservationId));
const detail = computed(() => reservationStore.reservationDetail);

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

function parseLocalDate(value) {
  if (!value) return null;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (
    !year ||
    !month ||
    !day ||
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return { year, month, day, dayName: dayNames[date.getDay()] };
}

function formatDate(value) {
  const date = parseLocalDate(value);
  if (!date) return '-';
  return `${date.year}.${String(date.month).padStart(2, '0')}.${String(date.day).padStart(2, '0')} (${date.dayName})`;
}

function formatAmount(value) {
  if (value === null || value === undefined) return '-';
  return `${Number(value).toLocaleString('ko-KR')}원`;
}

const quantityLabel = computed(() => {
  const labels = {
    ROOM: '객실',
    OFFICE_SEAT: '좌석',
    MEETING_ROOM: '회의실',
  };
  return labels[detail.value?.reservationProduct.productDetailType] ?? '상품';
});

const isConfirmed = computed(() => detail.value?.status === 'CONFIRMED');
const isReviewPeriodExpired = computed(() => detail.value?.reviewDeadline
  ? Date.now() > new Date(detail.value.reviewDeadline).getTime() : false);
const canWriteOrEditReview = computed(() => ['WRITE', 'EDIT'].includes(detail.value?.reviewAction));
const reviewButtonLabel = computed(() => {
  if (isReviewPeriodExpired.value) return detail.value?.reviewId ? '리뷰 수정 기간 만료' : '리뷰 작성 기간 만료';
  return detail.value?.reviewAction === 'EDIT' ? '리뷰 수정하기' : '리뷰 작성하기';
});

const merchantDetailRoutes = {
  ACCOMMODATION: 'AccommodationDetail',
  OFFICE: 'OfficeDetail',
};

const merchantCategoryByProductType = {
  ROOM: 'ACCOMMODATION',
  OFFICE_SEAT: 'OFFICE',
  MEETING_ROOM: 'OFFICE',
};

// 직접 URL 진입 시에도 예약 목록으로 돌아갈 수 있는 뒤로 가기 처리
function goBack() {
  if (window.history.length > 1) {
    router.back();
    return;
  }
  router.push('/reservations');
}

function fetchDetail() {
  if (!Number.isSafeInteger(reservationId.value) || reservationId.value <= 0) {
    reservationStore.reservationDetail = null;
    reservationStore.detailError = '예약 정보를 찾을 수 없습니다.';
    return;
  }
  reservationStore.fetchReservationDetails(reservationId.value);
}

// 예약 상세 응답의 가맹점 식별자로 숙소·공유오피스 상세 이동
function goToMerchantDetail() {
  const merchantId = Number(detail.value?.merchant?.merchantId);
  const category = detail.value?.merchant?.category
    ?? merchantCategoryByProductType[
      detail.value?.reservationProduct?.productDetailType
    ];
  const routeName = merchantDetailRoutes[category];

  if (!Number.isSafeInteger(merchantId) || merchantId <= 0 || !routeName) return;

  router.push({
    name: routeName,
    params: { merchantId },
  });
}

function goToCancellation() {
  if (!detail.value?.cancelable) return;
  router.push({
    name: 'ReservationCancelWarning',
    params: { reservationId: reservationId.value },
  });
}
function goToReview() {
  if (!canWriteOrEditReview.value) return;
  router.push(detail.value.reviewAction === 'EDIT'
    ? `/reviews/${detail.value.reviewId}/edit`
    : `/reservations/${reservationId.value}/reviews/new`);
}

onMounted(fetchDetail);
</script>

<template>
  <div class="flex min-h-screen w-full flex-col bg-white">
    <div class="px-5 pt-4">
      <BaseHeader
        title="예약 내역 상세"
        @back="goBack"
      />
    </div>

    <main v-if="reservationStore.isDetailLoading" class="flex-1 px-4 pb-8">
      <div class="h-[202px] animate-pulse rounded-xl bg-slate-100"></div>
      <div class="mt-4 h-12 animate-pulse rounded-lg bg-slate-100"></div>
      <div class="mt-3 h-[245px] animate-pulse rounded-xl bg-slate-100"></div>
    </main>

    <main
      v-else-if="reservationStore.detailError"
      class="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center"
    >
      <p class="text-[15px] font-semibold text-slate-600">
        예약 상세 정보를 불러오지 못했어요
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

    <template v-else-if="detail">
      <main class="flex-1 px-4 pb-8">
        <button
          type="button"
          class="block h-[202px] w-full overflow-hidden rounded-xl bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          :aria-label="`${detail.merchant.name} 상세 보기`"
          @click="goToMerchantDetail"
        >
          <img
            :src="detail.reservationProduct.thumbnailUrl"
            :alt="detail.reservationProduct.productName"
            class="h-full w-full object-cover active:opacity-90"
          />
        </button>

        <div class="flex items-end justify-between gap-3 px-2 py-3">
          <h2 class="min-w-0 flex-1 truncate text-[17px] font-extrabold text-slate-800">
            <button
              type="button"
              class="max-w-full truncate text-left hover:text-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              @click="goToMerchantDetail"
            >
              {{ detail.merchant.name }}
            </button>
          </h2>
          <p class="shrink-0 text-[10px] text-slate-400">
            예약 번호 {{ detail.reservationCode }}
          </p>
        </div>

        <section class="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-4">
          <dl class="space-y-4">
            <div class="flex items-start justify-between gap-4">
              <dt class="text-[12px] font-medium text-slate-400">이용 시작일</dt>
              <dd class="text-right text-[13px] font-bold text-slate-700">
                {{ formatDate(detail.startDate) }}
              </dd>
            </div>
            <div class="flex items-start justify-between gap-4">
              <dt class="text-[12px] font-medium text-slate-400">이용 종료일</dt>
              <dd class="text-right text-[13px] font-bold text-slate-700">
                {{ formatDate(detail.endDate) }}
              </dd>
            </div>
            <div class="flex items-start justify-between gap-4">
              <dt class="text-[12px] font-medium text-slate-400">
                {{ quantityLabel }} 정보 / 개수
              </dt>
              <dd class="text-right text-[13px] font-bold text-slate-700">
                {{ detail.reservationProduct.productName }} / {{ detail.quantity }}개
              </dd>
            </div>
            <div class="flex items-start justify-between gap-4">
              <dt class="text-[12px] font-medium text-slate-400">이용 인원</dt>
              <dd class="text-right text-[13px] font-bold text-slate-700">
                {{ detail.headcount }}인
              </dd>
            </div>
            <div class="flex items-start justify-between gap-4">
              <dt class="text-[12px] font-medium text-slate-400">총 금액</dt>
              <dd class="text-right text-[13px] font-bold text-slate-700">
                {{ formatAmount(detail.totalAmount) }}
              </dd>
            </div>
            <div class="flex items-start justify-between gap-4">
              <dt class="text-[12px] font-medium text-slate-400">결제 수단</dt>
              <dd class="text-right text-[13px] font-bold text-slate-700">
                {{ detail.paymentMethod || '-' }}
              </dd>
            </div>
          </dl>
        </section>

        <p
          v-if="isConfirmed"
          class="mt-3 px-1 text-[11px] font-medium"
          :class="detail.cancelable ? 'text-primary' : 'text-rose-500'"
        >
          {{
            detail.cancelable
              ? '이용 시작일 전날까지 무료 취소 가능합니다.'
              : '이용 당일부터는 취소가 불가능합니다.'
          }}
        </p>
        <BaseButton v-if="detail.reviewDeadline" :disabled="!canWriteOrEditReview" class="mt-5 max-w-none rounded-lg py-3.5 text-[16px] font-bold disabled:bg-slate-200 disabled:text-slate-400" @click="goToReview">
          {{ reviewButtonLabel }}
        </BaseButton>
      </main>

      <footer v-if="isConfirmed" class="sticky bottom-0 bg-white px-4 pb-6 pt-3">
        <BaseButton
          :disabled="!detail.cancelable"
          class="max-w-none rounded-lg bg-rose-500 py-3.5 text-[16px] font-bold hover:bg-rose-500 disabled:bg-slate-200 disabled:text-slate-400"
          @click="goToCancellation"
        >
          예약 취소
        </BaseButton>
      </footer>
    </template>
  </div>
</template>
