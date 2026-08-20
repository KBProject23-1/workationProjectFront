<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ReservationCancellationSummary from '@/components/reservation/ReservationCancellationSummary.vue';
import { useReservationStore } from '@/stores/reservationStore';
import BaseHeader from '@/components/common/BaseHeader.vue';
import BaseErrorState from '@/components/common/BaseErrorState.vue';

const route = useRoute();
const router = useRouter();
const reservationStore = useReservationStore();

const reservationId = computed(() => Number(route.params.reservationId));
const cancellation = computed(() => reservationStore.cancellationDetail);

const merchantDetailRoutes = {
  ACCOMMODATION: 'AccommodationDetail',
  OFFICE: 'OfficeDetail',
};

const merchantCategoryByProductType = {
  ROOM: 'ACCOMMODATION',
  OFFICE_SEAT: 'OFFICE',
  MEETING_ROOM: 'OFFICE',
};

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

// 취소 상세 응답의 가맹점 식별자로 숙소·공유오피스 상세 이동
function goToMerchantDetail() {
  const merchantId = Number(cancellation.value?.merchantId);
  const category = cancellation.value?.merchantCategory
    ?? merchantCategoryByProductType[
      cancellation.value?.reservationProduct?.productDetailType
    ];
  const routeName = merchantDetailRoutes[category];

  if (!Number.isSafeInteger(merchantId) || merchantId <= 0 || !routeName) return;

  router.push({
    name: routeName,
    params: { merchantId },
  });
}

onMounted(fetchCancellationDetail);
</script>

<template>
  <div class="flex min-h-screen w-full flex-col bg-canvas">
    <div class="px-5 pt-4">
      <BaseHeader
        title="예약 내역 상세"
        back-label="취소 내역으로 돌아가기"
        @back="goToCancellationList"
      />
    </div>

    <main
      v-if="reservationStore.isCancellationDetailLoading"
      class="flex-1 px-4 pb-8"
      aria-label="취소 상세 정보를 불러오는 중"
    >
      <div class="h-[202px] animate-pulse rounded-card bg-canvas"></div>
      <div class="mt-4 h-12 animate-pulse rounded-chip bg-canvas"></div>
      <div class="mt-3 h-[290px] animate-pulse rounded-card bg-canvas"></div>
    </main>

    <main
      v-else-if="reservationStore.cancellationDetailError"
      class="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center"
    >
      <BaseErrorState
        title="취소 상세 정보를 불러오지 못했어요"
        :description="reservationStore.cancellationDetailError"
        @retry="fetchCancellationDetail"
      />
    </main>

    <main v-else-if="cancellation" class="flex-1 px-4 pb-8">
      <button
        type="button"
        class="block h-[202px] w-full overflow-hidden rounded-card bg-brand-weak focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        :aria-label="`${cancellation.merchantName} 상세 보기`"
        @click="goToMerchantDetail"
      >
        <img
          :src="cancellation.reservationProduct.thumbnailUrl"
          :alt="cancellation.reservationProduct.productName"
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
            {{ cancellation.merchantName }}
          </button>
        </h2>
        <p class="shrink-0 text-caption text-ink-mute">
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
