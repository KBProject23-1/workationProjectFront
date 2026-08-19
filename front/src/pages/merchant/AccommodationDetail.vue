<script setup>
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { Heart, MapPin, Phone } from '@lucide/vue';
import ReservationDateModal from '@/components/reservation/ReservationDateModal.vue';
import ReservationOccupancyModal from '@/components/reservation/ReservationOccupancyModal.vue';
import AccommodationProductCard from '@/components/merchant/AccommodationProductCard.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import BaseErrorState from '@/components/common/BaseErrorState.vue';
import { useAccommodationStore } from '@/stores/merchant/accommodationStore';
import { useErrorToast } from '@/composables/useErrorToast';

const accommodationStore = useAccommodationStore();
const route = useRoute();
const router = useRouter();
const { accommodation, checkIn, checkOut, roomCount, guestCount, selectedProductId, totalPrice, isLoading, isBookmarkLoading, error } = storeToRefs(accommodationStore);
const { showError } = useErrorToast();
const dateModalMode = ref('');
const isOccupancyModalOpen = ref(false);

function displayDate(value) {
  const date = new Date(`${value}T00:00:00`);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} (${days[date.getDay()]})`;
}

async function fetchAccommodation() {
  await accommodationStore.fetchAccommodation(Number(route.params.merchantId));
}

function applyRouteConditions() {
  if (typeof route.query.startDate === 'string') {
    accommodationStore.checkIn = route.query.startDate;
  }
  if (typeof route.query.endDate === 'string') {
    accommodationStore.checkOut = route.query.endDate;
  }
  const routeRoomCount = Number(route.query.roomCount);
  if (Number.isInteger(routeRoomCount) && routeRoomCount > 0) {
    accommodationStore.roomCount = routeRoomCount;
  }
  const routeGuestCount = Number(route.query.guestCount);
  if (Number.isInteger(routeGuestCount) && routeGuestCount > 0) {
    accommodationStore.guestCount = routeGuestCount;
  }
}

async function selectDate(value) {
  accommodationStore.setDate(dateModalMode.value, value);
  dateModalMode.value = '';
  await fetchAccommodation();
}

async function closeOccupancyModal() {
  isOccupancyModalOpen.value = false;
  await fetchAccommodation();
}

async function toggleBookmark() {
  try {
    await accommodationStore.toggleBookmark();
  } catch (bookmarkError) {
    showError(bookmarkError, '북마크 처리 중 오류가 발생했습니다.');
  }
}

function goToReservationCreate() {
  if (!selectedProductId.value) return;

  router.push({
    name: 'ReservationCreate',
    query: {
      category: 'ACCOMMODATION',
      merchantId: accommodation.value.merchantId,
      productId: selectedProductId.value,
      startDate: checkIn.value,
      endDate: checkOut.value,
      headcount: guestCount.value,
      quantity: roomCount.value,
    },
  });
}

onMounted(async () => {
  applyRouteConditions();
  await fetchAccommodation();
});
</script>

<template>
  <main class="detail-page">
    <div class="px-5 pt-4 mb-4">
      <BaseHeader
        title="숙소 상세"
        @back="$router.back()"
      />
    </div>

    <LoadingScreen v-if="isLoading" title="숙소 정보를 불러오고 있어요" />
    <BaseErrorState v-else-if="error" :title="error" @retry="fetchAccommodation" />

    <section class="hero-image" aria-label="객실 대표 이미지">
      <div class="hero-window"><span></span></div>
      <div class="hero-bed"><span></span></div>
    </section>

    <section class="merchant-section">
      <button
        type="button"
        class="bookmark-button"
        :class="{ bookmarked: accommodation.bookmarked }"
        :aria-label="accommodation.bookmarked ? '북마크 해제' : '북마크 추가'"
        :aria-pressed="accommodation.bookmarked"
        :disabled="isBookmarkLoading"
        @click="toggleBookmark"
      >
        <Heart :size="18" :fill="accommodation.bookmarked ? 'currentColor' : 'none'" />
      </button>
      <h2>{{ accommodation.name }}</h2>
      <p class="address"><MapPin :size="22" /> {{ accommodation.address }}</p>
      <div class="rating-row">
        <p class="rating"><span>★</span> {{ accommodation.rating }} <b>({{ accommodation.reviewCount }}) · 리뷰 {{ accommodation.reviewCount }}개</b></p>
        <button type="button" class="review-button" @click="$router.push(`/merchants/${accommodation.merchantId}/reviews`)">리뷰 보기</button>
      </div>
    </section>

    <section class="accommodation-info">
      <p>{{ accommodation.description }}</p>
      <div><Phone :size="16" /><span>{{ accommodation.phoneNumber }}</span></div>
      <div class="times"><span>체크인 {{ accommodation.checkInTime?.slice(0, 5) ?? '-' }}</span><i></i><span>체크아웃 {{ accommodation.checkOutTime?.slice(0, 5) ?? '-' }}</span></div>
    </section>

    <section class="stay-condition" aria-label="예약 조건">
      <button type="button" @click="dateModalMode = 'checkIn'"><small>체크인</small><strong>{{ displayDate(checkIn) }}</strong></button>
      <button type="button" @click="dateModalMode = 'checkOut'"><small>체크아웃</small><strong>{{ displayDate(checkOut) }}</strong></button>
      <button type="button" @click="isOccupancyModalOpen = true"><small>객실 · 인원</small><strong>{{ roomCount }}개 · {{ guestCount }}명</strong></button>
    </section>

    <section class="room-section">
      <h3>객실 선택</h3>
      <div class="room-list">
        <AccommodationProductCard
          v-for="product in accommodation.products"
          :key="product.productId"
          :product="product"
          :selected="selectedProductId === product.productId"
          @select="accommodationStore.selectProduct"
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
      :check-in="checkIn"
      :check-out="checkOut"
      @select="selectDate"
      @close="dateModalMode = ''"
    />
    <ReservationOccupancyModal
      v-if="isOccupancyModalOpen"
      v-model:room-count="roomCount"
      v-model:guest-count="guestCount"
      @close="closeOccupancyModal"
    />
  </main>
</template>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/woff2/SUIT-Variable.css');
.detail-page { min-height:min(871px,100vh); padding-bottom:16px; color:#111827; background:#fff; font-family:'SUIT Variable','SUIT',sans-serif; }
button { font:inherit; }
.hero-image { position:relative; height:175px; margin:0 16px; overflow:hidden; border-radius:22px; background:#b4d3fb; }
.hero-window { position:absolute; top:27px; left:26px; right:26px; height:104px; overflow:hidden; border-radius:11px; background:#edf4fd; }
.hero-window::after { content:''; position:absolute; left:-15px; right:-15px; bottom:-14px; height:55px; border-radius:50% 50% 0 0; background:#b6d3f5; }.hero-window span { position:absolute; top:0; bottom:0; left:50%; width:4px; background:#c5dcf8; }.hero-window span::after { content:''; position:absolute; top:12px; left:98px; width:24px; height:24px; border-radius:50%; background:#ffd057; }
.hero-bed { position:absolute; left:72px; bottom:30px; width:113px; height:38px; border-radius:6px; background:#9b8980; }.hero-bed span { position:absolute; top:-11px; left:11px; right:11px; height:16px; border-radius:6px; background:#f2dfcf; }
.merchant-section { position:relative; padding:10px 17px 8px; }.merchant-section h2 { margin:0 42px 8px 0; font-size:22px; }.merchant-section p { margin:0; }.bookmark-button { position:absolute; top:17px; right:18px; padding:0; color:#88a0bf; border:0; background:transparent; cursor:pointer; transition:color .16s ease,transform .16s ease; }.bookmark-button:hover { color:#3087ed; transform:scale(1.1); }.bookmark-button.bookmarked { color:#3087ed; }.bookmark-button:disabled { cursor:wait; opacity:.55; }.address { display:flex; align-items:center; gap:4px; color:#8592a2; font-size:12px; }.rating-row { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:8px; }.rating { font-size:16px; font-weight:800; }.rating span { color:#ff8a00; }.rating b { color:#7b8794; }.review-button { flex:none; padding:5px 10px; border:1px solid #3087ed; border-radius:999px; color:#3087ed; background:#fff; font-size:12px; font-weight:800; }
.accommodation-info { margin:4px 16px 0; padding:14px; border:1.5px solid #dbe3ee; border-radius:16px; background:#f8fbff; }.accommodation-info p { margin:0 0 10px; font-size:16px; }.accommodation-info > div { display:flex; align-items:center; gap:6px; color:#687587; font-size:12px; }.accommodation-info .times { margin-top:8px; }.times i { width:4px; height:4px; border-radius:50%; background:#c6d0dc; }
h3 { margin:0 0 10px; font-size:16px; }.room-section { padding:0 16px; }
.stay-condition { display:grid; grid-template-columns:repeat(3,1fr); gap:9px; padding:11px 16px 15px; }.stay-condition button { height:66px; display:flex; flex-direction:column; justify-content:center; padding:9px 13px; text-align:left; border:1.5px solid #dbe3ee; border-radius:16px; color:#111827; background:#fff; cursor:pointer; }.stay-condition button:active { border-color:#3087ed; }.stay-condition small { margin-bottom:8px; color:#8a96a5; font-size:12px; }.stay-condition strong { font-size:16px; white-space:nowrap; }
.room-list { display:flex; flex-direction:column; gap:12px; }
.booking-summary { display:flex; align-items:center; justify-content:space-between; gap:20px; margin-top:12px; padding:10px 16px 0; border-top:2px solid #edf0f4; }.booking-summary div { display:flex; flex-direction:column; }.booking-summary small { margin-bottom:3px; color:#8a96a5; font-size:12px; }.booking-summary strong { font-size:22px; }.booking-summary button { width:158px; height:52px; border:0; border-radius:15px; color:#fff; background:#3087ed; font-size:16px; font-weight:800; }
.booking-summary button:disabled { cursor:not-allowed; background:#cbd5e1; }
@media (max-width:360px) { .stay-condition { gap:5px; }.stay-condition > button { padding:8px; }.booking-summary { gap:10px; }.booking-summary button { width:140px; } }
</style>
