<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { ChevronLeft, MapPin, Phone } from '@lucide/vue';
import ReservationDateModal from '@/components/reservation/ReservationDateModal.vue';
import ReservationOccupancyModal from '@/components/reservation/ReservationOccupancyModal.vue';
import AccommodationProductCard from '@/components/merchant/AccommodationProductCard.vue';
import { useAccommodationStore } from '@/stores/merchant/accommodationStore';

const accommodationStore = useAccommodationStore();
const { accommodation, checkIn, checkOut, roomCount, guestCount, selectedProductName, totalPrice } = storeToRefs(accommodationStore);
const dateModalMode = ref('');
const isOccupancyModalOpen = ref(false);

function displayDate(value) {
  const date = new Date(`${value}T00:00:00`);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} (${days[date.getDay()]})`;
}

function selectDate(value) {
  accommodationStore.setDate(dateModalMode.value, value);
  dateModalMode.value = '';
}
</script>

<template>
  <main class="detail-page">
    <header class="page-header">
      <button type="button" aria-label="뒤로 가기" @click="$router.back()"><ChevronLeft :size="32" /></button>
      <h1>숙소 상세</h1>
      <span></span>
    </header>

    <section class="hero-image" aria-label="객실 대표 이미지">
      <div class="hero-window"><span></span></div>
      <div class="hero-bed"><span></span></div>
    </section>

    <section class="merchant-section">
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
      <div class="times"><span>체크인 {{ accommodation.checkInTime.slice(0, 5) }}</span><i></i><span>체크아웃 {{ accommodation.checkOutTime.slice(0, 5) }}</span></div>
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
          :key="product.productName"
          :product="product"
          :selected="selectedProductName === product.productName"
          @select="accommodationStore.selectProduct"
        />
      </div>
    </section>

    <section class="booking-summary">
      <div><small>총 결제 금액</small><strong>{{ totalPrice.toLocaleString() }}원</strong></div>
      <button type="button">예약하기</button>
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
      @close="isOccupancyModalOpen = false"
    />
  </main>
</template>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/woff2/SUIT-Variable.css');
.detail-page { width:min(402px,100%); min-height:min(871px,100vh); margin:0 auto; padding-bottom:16px; color:#111827; background:#fff; font-family:'SUIT Variable','SUIT',sans-serif; }
button { font:inherit; }
.page-header { height:118px; display:grid; grid-template-columns:40px 1fr 40px; align-items:end; padding:0 16px 14px; }
.page-header button { width:36px; height:36px; display:grid; place-items:center; padding:0; border:0; background:none; }
.page-header h1 { margin:0; text-align:center; font-size:22px; font-weight:800; }
.hero-image { position:relative; height:175px; margin:0 16px; overflow:hidden; border-radius:22px; background:#b4d3fb; }
.hero-window { position:absolute; top:27px; left:26px; right:26px; height:104px; overflow:hidden; border-radius:11px; background:#edf4fd; }
.hero-window::after { content:''; position:absolute; left:-15px; right:-15px; bottom:-14px; height:55px; border-radius:50% 50% 0 0; background:#b6d3f5; }.hero-window span { position:absolute; top:0; bottom:0; left:50%; width:4px; background:#c5dcf8; }.hero-window span::after { content:''; position:absolute; top:12px; left:98px; width:24px; height:24px; border-radius:50%; background:#ffd057; }
.hero-bed { position:absolute; left:72px; bottom:30px; width:113px; height:38px; border-radius:6px; background:#9b8980; }.hero-bed span { position:absolute; top:-11px; left:11px; right:11px; height:16px; border-radius:6px; background:#f2dfcf; }
.merchant-section { padding:10px 17px 8px; }.merchant-section h2 { margin:0 0 8px; font-size:22px; }.merchant-section p { margin:0; }.address { display:flex; align-items:center; gap:4px; color:#8592a2; font-size:12px; }.rating-row { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:8px; }.rating { font-size:16px; font-weight:800; }.rating span { color:#ff8a00; }.rating b { color:#7b8794; }.review-button { flex:none; padding:5px 10px; border:1px solid #3087ed; border-radius:999px; color:#3087ed; background:#fff; font-size:12px; font-weight:800; }
.accommodation-info { margin:4px 16px 0; padding:14px; border:1.5px solid #dbe3ee; border-radius:16px; background:#f8fbff; }.accommodation-info p { margin:0 0 10px; font-size:16px; }.accommodation-info > div { display:flex; align-items:center; gap:6px; color:#687587; font-size:12px; }.accommodation-info .times { margin-top:8px; }.times i { width:4px; height:4px; border-radius:50%; background:#c6d0dc; }
h3 { margin:0 0 10px; font-size:16px; }.room-section { padding:0 16px; }
.stay-condition { display:grid; grid-template-columns:repeat(3,1fr); gap:9px; padding:11px 16px 15px; }.stay-condition button { height:66px; display:flex; flex-direction:column; justify-content:center; padding:9px 13px; text-align:left; border:1.5px solid #dbe3ee; border-radius:16px; color:#111827; background:#fff; cursor:pointer; }.stay-condition button:active { border-color:#3087ed; }.stay-condition small { margin-bottom:8px; color:#8a96a5; font-size:12px; }.stay-condition strong { font-size:16px; white-space:nowrap; }
.room-list { display:flex; flex-direction:column; gap:12px; }
.booking-summary { display:flex; align-items:center; justify-content:space-between; gap:20px; margin-top:12px; padding:10px 16px 0; border-top:2px solid #edf0f4; }.booking-summary div { display:flex; flex-direction:column; }.booking-summary small { margin-bottom:3px; color:#8a96a5; font-size:12px; }.booking-summary strong { font-size:22px; }.booking-summary button { width:158px; height:52px; border:0; border-radius:15px; color:#fff; background:#3087ed; font-size:16px; font-weight:800; }
@media (max-width:360px) { .stay-condition { gap:5px; }.stay-condition > button { padding:8px; }.booking-summary { gap:10px; }.booking-summary button { width:140px; } }
</style>
