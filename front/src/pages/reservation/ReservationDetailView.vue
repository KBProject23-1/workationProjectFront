<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import BaseErrorState from '@/components/common/BaseErrorState.vue';
import { useReservationStore } from '@/stores/reservationStore';

const route = useRoute();
const router = useRouter();
const reservationStore = useReservationStore();

const reservationId = computed(() => Number(route.params.reservationId));
const detail = computed(() => reservationStore.reservationDetail);
const isFromWorkation = computed(() => route.query.from === 'workation');

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

// 워케이션 일정과 예약 목록의 상세 진입 출처에 따른 뒤로가기 처리
function goBack() {
  if (isFromWorkation.value) {
    router.push({ name: 'WorkationHome' });
    return;
  }
  router.push({ name: 'ReservationList', query: { tab: 'reservation' } });
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
  <div class="flex min-h-screen w-full flex-col bg-canvas">
    <div class="px-5 pt-4">
      <BaseHeader
        title="예약 내역 상세"
        @back="goBack"
      />
    </div>

    <main v-if="reservationStore.isDetailLoading" class="flex-1 px-4 pb-8">
      <div class="h-[202px] animate-pulse rounded-card bg-canvas"></div>
      <div class="mt-4 h-12 animate-pulse rounded-chip bg-canvas"></div>
      <div class="mt-3 h-[245px] animate-pulse rounded-card bg-canvas"></div>
    </main>

    <main
      v-else-if="reservationStore.detailError"
      class="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center"
    >
      <BaseErrorState
        title="예약 상세 정보를 불러오지 못했어요"
        :description="reservationStore.detailError"
        @retry="fetchDetail"
      />
    </main>

    <template v-else-if="detail">
      <main class="flex-1 px-4 pb-8">
        <button
          type="button"
          class="block h-[202px] w-full overflow-hidden rounded-card bg-brand-weak focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
          <h2 class="min-w-0 flex-1 truncate text-title font-bold text-ink">
            <button
              type="button"
              class="max-w-full truncate text-left hover:text-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              @click="goToMerchantDetail"
            >
              {{ detail.merchant.name }}
            </button>
          </h2>
          <p class="shrink-0 text-caption text-ink-mute">
            예약 번호 {{ detail.reservationCode }}
          </p>
        </div>

        <section class="rounded-card border border-line bg-brand-weak/70 px-4 py-4">
          <dl class="space-y-4">
            <div class="flex items-start justify-between gap-4">
              <dt class="text-body-sm font-medium text-ink-mute">이용 시작일</dt>
              <dd class="text-right text-body-sm font-bold text-ink">
                {{ formatDate(detail.startDate) }}
              </dd>
            </div>
            <div class="flex items-start justify-between gap-4">
              <dt class="text-body-sm font-medium text-ink-mute">이용 종료일</dt>
              <dd class="text-right text-body-sm font-bold text-ink">
                {{ formatDate(detail.endDate) }}
              </dd>
            </div>
            <div class="flex items-start justify-between gap-4">
              <dt class="text-body-sm font-medium text-ink-mute">
                {{ quantityLabel }} 정보 / 개수
              </dt>
              <dd class="text-right text-body-sm font-bold text-ink">
                {{ detail.reservationProduct.productName }} / {{ detail.quantity }}개
              </dd>
            </div>
            <div class="flex items-start justify-between gap-4">
              <dt class="text-body-sm font-medium text-ink-mute">이용 인원</dt>
              <dd class="text-right text-body-sm font-bold text-ink">
                {{ detail.headcount }}인
              </dd>
            </div>
            <div class="flex items-start justify-between gap-4">
              <dt class="text-body-sm font-medium text-ink-mute">총 금액</dt>
              <dd class="text-right text-body-sm font-bold text-ink">
                {{ formatAmount(detail.totalAmount) }}
              </dd>
            </div>
            <div class="flex items-start justify-between gap-4">
              <dt class="text-body-sm font-medium text-ink-mute">결제 수단</dt>
              <dd class="text-right text-body-sm font-bold text-ink">
                {{ detail.paymentMethod || '-' }}
              </dd>
            </div>
          </dl>
        </section>

        <p
          v-if="isConfirmed"
          class="mt-3 px-1 text-caption font-medium"
          :class="detail.cancelable ? 'text-primary' : 'text-danger'"
        >
          {{
            detail.cancelable
              ? '이용 시작일 전날까지 무료 취소 가능합니다.'
              : '이용 당일부터는 취소가 불가능합니다.'
          }}
        </p>
        <BaseButton v-if="detail.reviewDeadline" :disabled="!canWriteOrEditReview" class="mt-5 max-w-none disabled:bg-slate-200 disabled:text-ink-mute" @click="goToReview">
          {{ reviewButtonLabel }}
        </BaseButton>
      </main>

      <footer v-if="isConfirmed" class="sticky bottom-0 bg-canvas px-4 pb-6 pt-3">
        <BaseButton
          :disabled="!detail.cancelable"
          class="max-w-none disabled:bg-slate-200 disabled:text-ink-mute"
          @click="goToCancellation"
        >
          예약 취소
        </BaseButton>
      </footer>
    </template>
  </div>
</template>
