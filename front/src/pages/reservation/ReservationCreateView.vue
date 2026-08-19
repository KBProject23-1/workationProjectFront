<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { ChevronRight, CreditCard, WalletCards } from '@lucide/vue';
import { toast } from 'vue-sonner';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import ReservationPaymentMethodModal from '@/components/reservation/ReservationPaymentMethodModal.vue';
import ReservationPinModal from '@/components/reservation/ReservationPinModal.vue';
import { useAccommodationStore } from '@/stores/merchant/accommodationStore';
import { useOfficeStore } from '@/stores/merchant/officeStore';
import { useCardStore } from '@/stores/cardStore';
import { useReservationStore } from '@/stores/reservationStore';
import { useWalletStore } from '@/stores/walletStore';
import { useWorkationStore } from '@/stores/workationStore';
import { formatCardNumber } from '@/utils/card';
import { getDeviceId } from '@/utils/device';
import { classifyPinError } from '@/utils/pinError';
import { setPinRegistered } from '@/utils/pinRegistry';
import { useIdempotencyKey } from '@/composables/useIdempotencyKey';

const route = useRoute();
const router = useRouter();
const accommodationStore = useAccommodationStore();
const officeStore = useOfficeStore();
const cardStore = useCardStore();
const reservationStore = useReservationStore();
const walletStore = useWalletStore();
const workationStore = useWorkationStore();
const { cards, primaryCard } = storeToRefs(cardStore);
const { keyFor, reset: resetIdempotencyKey } = useIdempotencyKey();

const selectedCardId = ref(null);
const selectedPaymentSourceType = ref('CARD');
const isPaymentMethodModalOpen = ref(false);
const isPinModalOpen = ref(false);
const pinError = ref('');
const isInitializing = ref(true);

const category = computed(() => route.query.category);
const merchantId = computed(() => Number(route.query.merchantId));
const productId = computed(() => Number(route.query.productId));
const headcount = computed(() => Number(route.query.headcount));
const quantity = computed(() => Number(route.query.quantity));
const startDate = computed(() => String(route.query.startDate ?? ''));
const endDate = computed(() => String(route.query.endDate ?? ''));
const isAccommodation = computed(() => category.value === 'ACCOMMODATION');
const merchant = computed(() => (
  isAccommodation.value ? accommodationStore.accommodation : officeStore.office
));
const product = computed(() => merchant.value?.products?.find(
  (item) => item.productId === productId.value,
) ?? null);
const selectedCard = computed(() => cards.value.find(
  (card) => card.cardId === selectedCardId.value,
) ?? null);
const walletAvailable = computed(() => (
  walletStore.walletId !== null && !walletStore.error
));
const totalAmount = computed(() => (
  isAccommodation.value ? accommodationStore.totalPrice : officeStore.totalPrice
));
const sourceError = computed(() => (
  isAccommodation.value ? accommodationStore.error : officeStore.error
));

const validationError = computed(() => {
  if (!['ACCOMMODATION', 'OFFICE'].includes(category.value)) {
    return '예약 상품 유형을 확인할 수 없습니다.';
  }
  if (!Number.isSafeInteger(merchantId.value) || merchantId.value <= 0) {
    return '예약 업체 정보를 확인할 수 없습니다.';
  }
  if (!Number.isSafeInteger(productId.value) || productId.value <= 0) {
    return '예약 상품을 확인할 수 없습니다.';
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate.value)
    || !/^\d{4}-\d{2}-\d{2}$/.test(endDate.value)
    || startDate.value > endDate.value) {
    return '예약 날짜를 확인해 주세요.';
  }
  if (!Number.isSafeInteger(headcount.value) || headcount.value <= 0
    || !Number.isSafeInteger(quantity.value) || quantity.value <= 0) {
    return '예약 인원과 수량을 확인해 주세요.';
  }
  if (!workationStore.workationId) return '진행 중인 워케이션 정보를 찾을 수 없습니다.';
  if (!product.value) return '선택한 예약 상품을 찾을 수 없습니다.';
  if (selectedPaymentSourceType.value === 'WALLET') {
    if (!walletAvailable.value) return '결제할 Wallet 정보를 확인해 주세요.';
    return '';
  }
  if (!selectedCard.value) return '결제할 카드를 선택해 주세요.';
  return '';
});

const canPay = computed(() => (
  !isInitializing.value
  && !reservationStore.isCreating
  && !validationError.value
));

function parseLocalDate(value) {
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
  return `${Number(value ?? 0).toLocaleString('ko-KR')}원`;
}

function cardLabel(card) {
  if (!card) return '카드를 선택해 주세요';
  return `${card.cardName} · ${formatCardNumber(card.maskedNumber)}`;
}

const paymentMethodLabel = computed(() => {
  if (selectedPaymentSourceType.value === 'WALLET') {
    return `워크페이 Wallet · 잔액 ${formatAmount(walletStore.balance)}`;
  }
  return cardLabel(selectedCard.value);
});

async function fetchMerchant() {
  if (!['ACCOMMODATION', 'OFFICE'].includes(category.value)
    || !Number.isSafeInteger(merchantId.value)
    || merchantId.value <= 0
    || !Number.isSafeInteger(productId.value)
    || productId.value <= 0) {
    return;
  }

  if (isAccommodation.value) {
    accommodationStore.checkIn = startDate.value;
    accommodationStore.checkOut = endDate.value;
    accommodationStore.roomCount = quantity.value;
    accommodationStore.guestCount = headcount.value;
    accommodationStore.selectedProductId = productId.value;
    await accommodationStore.fetchAccommodation(merchantId.value);
    return;
  }

  officeStore.startDate = startDate.value;
  officeStore.endDate = endDate.value;
  officeStore.spaceCount = quantity.value;
  officeStore.guestCount = headcount.value;
  officeStore.selectedProductId = productId.value;
  await officeStore.fetchOffice(merchantId.value);
}

async function fetchCards() {
  await cardStore.fetchMyCards();
}

function ensurePaymentMethodSelection() {
  if (selectedPaymentSourceType.value === 'WALLET' && walletAvailable.value) return;
  if (cards.value.some((card) => card.cardId === selectedCardId.value)) return;

  const defaultCardId = primaryCard.value?.cardId ?? cards.value[0]?.cardId ?? null;
  if (defaultCardId) {
    selectedPaymentSourceType.value = 'CARD';
    selectedCardId.value = defaultCardId;
    return;
  }

  if (walletAvailable.value) {
    selectedPaymentSourceType.value = 'WALLET';
    selectedCardId.value = null;
  }
}

async function retryCards() {
  await fetchCards();
  ensurePaymentMethodSelection();
}

async function retryWallet() {
  await walletStore.fetchWallet();
  ensurePaymentMethodSelection();
}

async function initialize() {
  isInitializing.value = true;
  await Promise.all([
    fetchMerchant(),
    fetchCards(),
    walletStore.fetchWallet(),
    workationStore.fetchCurrent(),
  ]);
  ensurePaymentMethodSelection();
  isInitializing.value = false;
}

function selectCard(cardId) {
  selectedPaymentSourceType.value = 'CARD';
  selectedCardId.value = cardId;
  isPaymentMethodModalOpen.value = false;
}

function selectWallet() {
  if (!walletAvailable.value) return;
  selectedPaymentSourceType.value = 'WALLET';
  selectedCardId.value = null;
  isPaymentMethodModalOpen.value = false;
}

function openPinAuthentication() {
  if (!canPay.value) return;
  pinError.value = '';
  isPinModalOpen.value = true;
}

async function submitReservation(pinNumber) {
  if (!canPay.value) return;

  pinError.value = '';
  const baseRequest = {
    productId: productId.value,
    workationId: workationStore.workationId,
    startDate: startDate.value,
    endDate: endDate.value,
    headcount: headcount.value,
    quantity: quantity.value,
    paymentSourceType: selectedPaymentSourceType.value,
    cardId: selectedPaymentSourceType.value === 'CARD'
      ? selectedCardId.value
      : null,
  };
  const signature = JSON.stringify(baseRequest);

  try {
    const result = await reservationStore.createReservation({
      ...baseRequest,
      pinNumber,
      deviceId: getDeviceId(),
      idempotencyKey: keyFor(signature),
    });

    if (!result) return;
    resetIdempotencyKey();
    isPinModalOpen.value = false;
    await router.replace({
      name: 'ReservationCreateComplete',
      params: { reservationId: result.reservationId },
    });
  } catch (error) {
    resetIdempotencyKey();
    const pinErrorType = classifyPinError(error);
    const message = error.response?.data?.message || error.message || '예약 결제에 실패했습니다.';

    if (pinErrorType === 'NOT_REGISTERED') {
      setPinRegistered(false);
      isPinModalOpen.value = false;
      toast.error('이 기기에서 결제 PIN을 다시 등록해 주세요.');
      await router.push({
        name: 'PinSetup',
        query: { redirect: route.fullPath },
      });
      return;
    }

    pinError.value = message;
  }
}

onMounted(initialize);
</script>

<template>
  <div class="flex min-h-screen w-full flex-col bg-white text-slate-900">
    <div class="px-5 pt-4">
      <BaseHeader title="예약 정보 확인" @back="router.back()" />
    </div>

    <main class="flex-1 px-4 pb-5">
      <div v-if="isInitializing" class="space-y-4">
        <div class="h-24 animate-pulse rounded-xl bg-slate-100"></div>
        <div class="h-56 animate-pulse rounded-xl bg-slate-100"></div>
        <div class="h-16 animate-pulse rounded-xl bg-slate-100"></div>
      </div>

      <div v-else-if="sourceError" class="rounded-xl bg-rose-50 px-5 py-8 text-center">
        <p class="text-[14px] font-semibold text-rose-600">예약 상품 정보를 불러오지 못했어요.</p>
        <p class="mt-2 text-[12px] text-rose-400">{{ sourceError }}</p>
        <button type="button" class="mt-4 text-[13px] font-bold text-primary" @click="initialize">다시 시도</button>
      </div>

      <template v-else>
        <section class="flex gap-3 border-b border-slate-100 pb-5">
          <img
            :src="product?.thumbnailUrl || merchant?.thumbnailUrl"
            :alt="product?.productName || '예약 상품'"
            class="size-20 shrink-0 rounded-xl bg-blue-100 object-cover"
          />
          <div class="min-w-0 py-1">
            <p class="truncate text-[16px] font-extrabold">{{ merchant?.name || '-' }}</p>
            <p class="mt-2 line-clamp-2 text-[13px] font-medium text-slate-500">
              {{ product?.productName || '-' }} · {{ quantity }}개
            </p>
          </div>
        </section>

        <section class="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-5">
          <dl class="space-y-4">
            <div class="flex justify-between gap-4"><dt class="text-[12px] text-slate-400">이용 시작일</dt><dd class="text-right text-[13px] font-bold">{{ formatDate(startDate) }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-[12px] text-slate-400">이용 종료일</dt><dd class="text-right text-[13px] font-bold">{{ formatDate(endDate) }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-[12px] text-slate-400">이용 인원</dt><dd class="text-right text-[13px] font-bold">{{ headcount }}명</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-[12px] text-slate-400">요금</dt><dd class="text-right text-[13px] font-bold">{{ formatAmount(totalAmount) }}</dd></div>
          </dl>
        </section>

        <section class="flex items-center justify-between border-b border-slate-100 px-1 py-6">
          <h2 class="text-[18px] font-extrabold">총 결제 금액</h2>
          <strong class="text-[22px] font-extrabold text-primary">{{ formatAmount(totalAmount) }}</strong>
        </section>

        <button
          type="button"
          class="flex w-full items-center gap-3 border-b border-slate-100 px-1 py-5 text-left disabled:cursor-not-allowed disabled:opacity-50"
          @click="isPaymentMethodModalOpen = true"
        >
          <span class="grid size-10 shrink-0 place-items-center rounded-full bg-blue-100 text-primary">
            <WalletCards v-if="selectedPaymentSourceType === 'WALLET'" :size="21" />
            <CreditCard v-else :size="21" />
          </span>
          <span class="min-w-0 flex-1"><span class="block text-[12px] text-slate-400">결제 수단</span><strong class="mt-1 block truncate text-[14px]">{{ paymentMethodLabel }}</strong></span>
          <ChevronRight class="shrink-0 text-slate-400" :size="20" />
        </button>

        <p class="mt-4 text-[11px] font-semibold text-rose-500">예약 하루 전까지 취소할 수 있습니다.</p>
        <p v-if="validationError" class="mt-2 text-[12px] font-medium text-rose-500">{{ validationError }}</p>
      </template>
    </main>

    <footer class="sticky bottom-0 bg-white px-4 pb-6 pt-3">
      <BaseButton
        class="max-w-none rounded-xl py-3.5 text-[16px] font-bold disabled:bg-slate-200 disabled:text-slate-400"
        :disabled="!canPay"
        @click="openPinAuthentication"
      >
        {{ formatAmount(totalAmount) }} 결제하기
      </BaseButton>
    </footer>

    <ReservationPaymentMethodModal
      :open="isPaymentMethodModalOpen"
      :cards="cards"
      :wallet-balance="walletStore.balance"
      :wallet-available="walletAvailable"
      :selected-payment-source-type="selectedPaymentSourceType"
      :selected-card-id="selectedCardId"
      :card-loading="cardStore.isLoading"
      :wallet-loading="walletStore.isLoading"
      :card-error="cardStore.error"
      :wallet-error="walletStore.error"
      @close="isPaymentMethodModalOpen = false"
      @select-card="selectCard"
      @select-wallet="selectWallet"
      @retry-cards="retryCards"
      @retry-wallet="retryWallet"
    />
    <ReservationPinModal
      :open="isPinModalOpen"
      :amount="totalAmount"
      :loading="reservationStore.isCreating"
      :error="pinError"
      @close="isPinModalOpen = false"
      @submit="submitReservation"
    />
  </div>
</template>
