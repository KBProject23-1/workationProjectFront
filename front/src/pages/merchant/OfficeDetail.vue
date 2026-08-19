<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { Heart, MapPin, Phone } from '@lucide/vue';
import OfficeProductCard from '@/components/merchant/OfficeProductCard.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import ReservationDateModal from '@/components/reservation/ReservationDateModal.vue';
import ReservationGuestModal from '@/components/reservation/ReservationGuestModal.vue';
import ReservationSpaceModal from '@/components/reservation/ReservationSpaceModal.vue';
import { useOfficeStore } from '@/stores/merchant/officeStore';
import { useErrorToast } from '@/composables/useErrorToast';

const officeStore = useOfficeStore();
const route = useRoute();
const router = useRouter();
const { office, startDate, endDate, spaceCount, guestCount, selectedProductId, selectedProduct, totalPrice, isLoading, isBookmarkLoading, error } = storeToRefs(officeStore);
const { showError } = useErrorToast();
const dateModalMode = ref('');
const isSpaceModalOpen = ref(false);
const isGuestModalOpen = ref(false);
const selectedProductTypeLabel = computed(() => ({
  OFFICE_SEAT: '좌석',
  MEETING_ROOM: '회의실',
}[selectedProduct.value?.productDetailType] ?? '-'));

function displayDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

async function fetchOffice() {
  await officeStore.fetchOffice(Number(route.params.merchantId));
}

function applyRouteConditions() {
  if (typeof route.query.startDate === 'string') {
    officeStore.startDate = route.query.startDate;
  }
  if (typeof route.query.endDate === 'string') {
    officeStore.endDate = route.query.endDate;
  }
  const routeGuestCount = Number(route.query.guestCount);
  if (Number.isInteger(routeGuestCount) && routeGuestCount > 0) {
    officeStore.guestCount = routeGuestCount;
  }
}

async function selectDate(value) {
  officeStore.setDate(dateModalMode.value, value);
  dateModalMode.value = '';
  await fetchOffice();
}

async function closeGuestModal() {
  isGuestModalOpen.value = false;
  await fetchOffice();
}

async function toggleBookmark() {
  try {
    await officeStore.toggleBookmark();
  } catch (bookmarkError) {
    showError(bookmarkError, '북마크 처리 중 오류가 발생했습니다.');
  }
}

function goToReservationCreate() {
  if (!selectedProductId.value) return;

  router.push({
    name: 'ReservationCreate',
    query: {
      category: 'OFFICE',
      merchantId: office.value.merchantId,
      productId: selectedProductId.value,
      startDate: startDate.value,
      endDate: endDate.value,
      headcount: guestCount.value,
      quantity: spaceCount.value,
    },
  });
}

onMounted(async () => {
  applyRouteConditions();
  await fetchOffice();
});
</script>

<template>
  <main class="office-page">
    <div class="px-4">
      <BaseHeader
        title="공유오피스 상세"
        variant="centered"
        size="detail"
        title-class="text-[22px] font-extrabold text-gray-900"
        @back="$router.back()"
      />
    </div>

    <p v-if="isLoading" class="status-message">공유오피스 정보를 불러오고 있습니다.</p>
    <div v-else-if="error" class="status-message error">
      <p>{{ error }}</p>
      <button type="button" @click="fetchOffice">다시 시도</button>
    </div>

    <section class="hero-image" aria-label="공유오피스 대표 이미지">
      <div class="office-wall"><i></i><i></i><i></i></div>
      <div class="office-desk"><span></span><span></span></div>
    </section>

    <section class="merchant-section">
      <button
        type="button"
        class="bookmark-button"
        :class="{ bookmarked: office.bookmarked }"
        :aria-label="office.bookmarked ? '북마크 해제' : '북마크 추가'"
        :aria-pressed="office.bookmarked"
        :disabled="isBookmarkLoading"
        @click="toggleBookmark"
      >
        <Heart :size="18" :fill="office.bookmarked ? 'currentColor' : 'none'" />
      </button>
      <h2>{{ office.name }}</h2>
      <p class="address"><MapPin :size="22" /> {{ office.address }}</p>
      <div class="rating-row">
        <p class="rating"><span>★</span> {{ office.rating }} <b>· 리뷰 {{ office.reviewCount }}개</b></p>
        <button type="button" class="review-button" @click="$router.push(`/merchants/${office.merchantId}/reviews`)">리뷰 보기</button>
      </div>
    </section>

    <section class="office-info">
      <strong>공간 안내</strong>
      <p>{{ office.description }}</p>
      <div><Phone :size="16" /> {{ office.phoneNumber }}</div>
    </section>

    <section class="condition-section">
      <h3>예약 조건</h3>
      <div class="conditions">
        <button type="button" @click="dateModalMode = 'checkIn'"><small>이용 시작일</small><strong>{{ displayDate(startDate) }}</strong></button>
        <button type="button" @click="dateModalMode = 'checkOut'"><small>이용 종료일</small><strong>{{ displayDate(endDate) }}</strong></button>
        <button type="button" @click="isSpaceModalOpen = true"><small>공간 수</small><strong>{{ spaceCount }}개</strong></button>
        <button type="button" @click="isGuestModalOpen = true"><small>이용 인원</small><strong>{{ guestCount }}명</strong></button>
      </div>
    </section>

    <section class="usage-section">
      <h3>이용 정보</h3>
      <div class="usage-info"><strong>{{ selectedProductTypeLabel }}</strong><i></i><strong>Wi-Fi</strong><i></i><strong>최대 {{ selectedProduct?.maxHeadcount ?? 0 }}명</strong></div>
    </section>

    <section class="product-section">
      <h3>상품 선택</h3>
      <div class="product-list">
        <OfficeProductCard
          v-for="product in office.products"
          :key="product.productId"
          :product="product"
          :selected="selectedProductId === product.productId"
          @select="officeStore.selectProduct"
        />
      </div>
    </section>

    <section class="booking-summary">
      <div><small>총 결제 금액</small><strong>{{ totalPrice.toLocaleString() }}원</strong></div>
      <button type="button" :disabled="!selectedProductId" @click="goToReservationCreate">예약하기</button>
    </section>

    <ReservationDateModal
      v-if="dateModalMode"
      :mode="dateModalMode"
      :check-in="startDate"
      :check-out="endDate"
      start-label="이용 시작일"
      end-label="이용 종료일"
      @select="selectDate"
      @close="dateModalMode = ''"
    />
    <ReservationSpaceModal
      v-if="isSpaceModalOpen"
      v-model:count="spaceCount"
      :product-detail-type="selectedProduct?.productDetailType"
      @close="isSpaceModalOpen = false"
    />
    <ReservationGuestModal v-if="isGuestModalOpen" v-model:count="guestCount" @close="closeGuestModal" />
  </main>
</template>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/woff2/SUIT-Variable.css');
.office-page { width:min(402px,100%); min-height:min(871px,100vh); margin:0 auto; padding-bottom:16px; color:#111827; background:#fff; font-family:'SUIT Variable','SUIT',sans-serif; } button { font:inherit; }
.status-message { padding:24px 16px; margin:0; text-align:center; color:#8a96a5; font-size:14px; }.status-message.error { color:#e05252; }.status-message.error p { margin:0 0 12px; }.status-message.error button { height:40px; padding:0 20px; color:#3087ed; border:1.5px solid #3087ed; border-radius:12px; background:#fff; font-weight:800; }
.hero-image { position:relative; height:175px; margin:0 16px; overflow:hidden; border-radius:22px; background:#b4d3fb; }.office-wall { position:absolute; top:27px; left:25px; right:25px; height:105px; display:flex; align-items:flex-start; justify-content:space-around; padding-top:12px; border-radius:12px; background:#eef5ff; }.office-wall i { width:78px; height:52px; border-radius:6px; background:#dfedff; }.office-wall i:nth-child(2)::after { content:''; display:block; width:25px; height:25px; margin:9px auto; border-radius:50%; background:#ffd057; }.office-desk { position:absolute; left:58px; right:58px; bottom:43px; height:17px; border-radius:10px; background:#987f72; }.office-desk::before,.office-desk::after { content:''; position:absolute; top:16px; width:14px; height:29px; border-radius:6px; background:#856d62; }.office-desk::before { left:15px; }.office-desk::after { right:15px; }.office-desk span { position:absolute; bottom:14px; width:49px; height:12px; border-radius:7px; background:#e9b964; }.office-desk span:first-child { left:31px; }.office-desk span:last-child { right:31px; }
.merchant-section { position:relative; padding:10px 17px 8px; }.merchant-section h2 { margin:0 42px 8px 0; font-size:22px; }.merchant-section p { margin:0; }.bookmark-button { position:absolute; top:17px; right:18px; padding:0; color:#88a0bf; border:0; background:transparent; cursor:pointer; transition:color .16s ease,transform .16s ease; }.bookmark-button:hover { color:#3087ed; transform:scale(1.1); }.bookmark-button.bookmarked { color:#3087ed; }.bookmark-button:disabled { cursor:wait; opacity:.55; }.address { display:flex; align-items:center; gap:4px; color:#8592a2; font-size:12px; }.rating-row { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:8px; }.rating { font-size:16px; font-weight:800; }.rating span { color:#ff8a00; }.rating b { color:#7b8794; }.review-button { flex:none; padding:5px 10px; border:1px solid #3087ed; border-radius:999px; color:#3087ed; background:#fff; font-size:12px; font-weight:800; }
.office-info { margin:4px 16px 13px; padding:12px 14px; border:1.5px solid #dbe3ee; border-radius:16px; background:#f8fbff; }.office-info strong { font-size:12px; }.office-info p { margin:5px 0 8px; color:#7b8794; font-size:12px; }.office-info div { display:flex; align-items:center; gap:6px; color:#7b8794; font-size:12px; }
h3 { margin:0 0 10px; font-size:16px; }.condition-section,.usage-section,.product-section { padding:0 16px; }.conditions { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; }.conditions button,.conditions > div { height:75px; display:flex; flex-direction:column; justify-content:center; padding:9px 12px; text-align:left; color:#111827; border:1.5px solid #dbe3ee; border-radius:16px; background:#fff; }.conditions small { margin-bottom:9px; color:#8a96a5; font-size:12px; white-space:nowrap; }.conditions strong { font-size:16px; white-space:nowrap; }
.usage-section { margin-top:17px; }.usage-info { height:48px; display:flex; align-items:center; justify-content:space-around; padding:0 18px; border:1.5px solid #dbe3ee; border-radius:15px; background:#f8fbff; font-size:12px; }.usage-info i { width:4px; height:4px; border-radius:50%; background:#c6d0dc; }.product-section { margin-top:3px; }.product-list { display:flex; flex-direction:column; gap:12px; }
.booking-summary { display:flex; align-items:center; justify-content:space-between; gap:20px; margin-top:12px; padding:10px 16px 0; border-top:2px solid #edf0f4; }.booking-summary div { display:flex; flex-direction:column; }.booking-summary small { margin-bottom:3px; color:#8a96a5; font-size:12px; }.booking-summary strong { font-size:22px; }.booking-summary button { width:158px; height:52px; border:0; border-radius:15px; color:#fff; background:#3087ed; font-size:16px; font-weight:800; }
.booking-summary button:disabled { cursor:not-allowed; background:#cbd5e1; }
@media (max-width:360px) { .conditions { gap:4px; }.conditions button,.conditions > div { padding:7px; }.booking-summary { gap:10px; }.booking-summary button { width:140px; } }
</style>
