<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { CalendarDays, ChevronDown, ChevronLeft, Users } from '@lucide/vue';
import ReservationDateModal from '@/components/reservation/ReservationDateModal.vue';
import ReservationGuestModal from '@/components/reservation/ReservationGuestModal.vue';
import ReservationMerchantCard from '@/components/merchant/ReservationMerchantCard.vue';
import { useReservationMerchantStore } from '@/stores/merchant/reservationMerchantStore';

const merchantStore = useReservationMerchantStore();
const { checkIn, checkOut, guestCount, category, sort, minPrice, maxPrice, filteredResults, hasNext } = storeToRefs(merchantStore);
const dateModalMode = ref('');
const isGuestModalOpen = ref(false);
const isFiltersExpanded = ref(true);
const categoryOptions = [
  { label: '전체', value: '' },
  { label: '숙소', value: 'ACCOMMODATION' },
  { label: '공유오피스', value: 'OFFICE' },
];
const sortOptions = [
  { label: '평점 높은순', value: 'RATING_DESC' },
  { label: '가격 낮은순', value: 'PRICE_ASC' },
];

function displayDate(value) {
  const date = new Date(`${value}T00:00:00`);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} (${days[date.getDay()]})`;
}

function selectDate(value) {
  merchantStore.setDate(dateModalMode.value, value);
  dateModalMode.value = '';
}

function sanitizePrice(target, field) {
  merchantStore.setPrice(field, target.value);
}
</script>

<template>
  <main class="merchant-page">
    <header class="page-header">
      <button type="button" aria-label="뒤로 가기" @click="$router.back()"><ChevronLeft :size="31" /></button>
      <h1>예약 장소</h1>
      <span></span>
    </header>

    <section class="date-controls" aria-label="예약 조건">
      <button type="button" @click="dateModalMode = 'checkIn'">
        <CalendarDays :size="25" /><span><small>체크인</small><strong>{{ displayDate(checkIn) }}</strong></span>
      </button>
      <button type="button" @click="dateModalMode = 'checkOut'">
        <CalendarDays :size="25" /><span><small>체크아웃</small><strong>{{ displayDate(checkOut) }}</strong></span>
      </button>
      <button type="button" @click="isGuestModalOpen = true">
        <Users :size="25" /><span><small>인원</small><strong>{{ guestCount }}명</strong></span>
      </button>
    </section>

    <section class="filters">
      <div class="filter-header">
        <h2>필터</h2>
        <button
          type="button"
          class="filter-toggle"
          :aria-expanded="isFiltersExpanded"
          aria-controls="filter-content"
          :aria-label="isFiltersExpanded ? '필터 접기' : '필터 펼치기'"
          @click="isFiltersExpanded = !isFiltersExpanded"
        >
          <ChevronDown :size="22" :class="{ expanded: isFiltersExpanded }" />
        </button>
      </div>
      <div class="divider"></div>

      <div v-show="isFiltersExpanded" id="filter-content" class="filter-content">
        <fieldset>
          <legend>숙소 유형</legend>
          <div class="chips">
            <label v-for="option in categoryOptions" :key="option.label" :class="{ active: category === option.value }">
              <input v-model="category" type="radio" name="merchant-category" :value="option.value" />{{ option.label }}
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>가격 범위 <span>(1일 기준)</span></legend>
          <div class="price-range">
            <label><small>최소</small><span><input v-model="minPrice" inputmode="numeric" aria-label="최소 금액" placeholder="0" @input="sanitizePrice($event.currentTarget, 'min')" />원</span></label>
            <b>~</b>
            <label><small>최대</small><span><input v-model="maxPrice" inputmode="numeric" aria-label="최대 금액" @input="sanitizePrice($event.currentTarget, 'max')" />원</span></label>
          </div>
        </fieldset>

        <fieldset>
          <legend>정렬 기준</legend>
          <div class="chips">
            <label v-for="option in sortOptions" :key="option.value" :class="{ active: sort === option.value }">
              <input v-model="sort" type="radio" name="sort-type" :value="option.value" />{{ option.label }}
            </label>
          </div>
        </fieldset>

        <button type="button" class="apply-button" @click="isFiltersExpanded = false">적용하기</button>
      </div>
    </section>

    <section class="results">
      <h2>검색 결과 {{ filteredResults.length }}개</h2>
      <div class="result-list">
        <ReservationMerchantCard v-for="item in filteredResults" :key="item.merchantId" :merchant="item" @toggle-bookmark="merchantStore.toggleBookmark" />
        <p v-if="filteredResults.length === 0" class="empty">조건에 맞는 검색 결과가 없습니다.</p>
        <button v-if="hasNext" type="button" class="load-more-button" @click="merchantStore.loadNextPage">더보기</button>
      </div>
    </section>

    <ReservationDateModal v-if="dateModalMode" :mode="dateModalMode" :check-in="checkIn" :check-out="checkOut" @select="selectDate" @close="dateModalMode = ''" />
    <ReservationGuestModal v-if="isGuestModalOpen" v-model:count="guestCount" @close="isGuestModalOpen = false" />
  </main>
</template>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/woff2/SUIT-Variable.css');
.merchant-page { width:min(402px,100%); min-height:min(871px,100vh); margin:0 auto; color:#111827; background:#fff; font-family:'SUIT Variable','SUIT',sans-serif; }
button,input { font:inherit; }
.page-header { height:88px; display:grid; grid-template-columns:40px 1fr 40px; align-items:end; padding:0 25px 15px; }
.page-header button { width:34px; height:34px; display:grid; place-items:center; padding:0; border:0; background:none; }
.page-header h1 { margin:0; text-align:center; font-size:22px; font-weight:800; }
.date-controls { display:grid; grid-template-columns:1fr 1fr 1fr; gap:9px; padding:14px 34px 16px; }
.date-controls button { min-width:0; height:72px; display:flex; align-items:center; gap:4px; padding:8px; overflow:hidden; text-align:left; color:#526274; border:1.5px solid #dbe3ee; border-radius:17px; background:#fff; }.date-controls button > svg { width:22px; height:22px; flex:none; }
.date-controls span { min-width:0; display:flex; flex:1; flex-direction:column; gap:3px; overflow:hidden; }.date-controls small { color:#8a96a5; font-size:12px; }.date-controls strong { max-width:100%; overflow:hidden; color:#111827; font-size:12px; text-overflow:ellipsis; white-space:nowrap; }
.filters { padding:0 34px 18px; }.filters h2,.results h2 { margin:0; font-size:16px; font-weight:800; }.filter-header { display:flex; align-items:center; justify-content:space-between; }.filter-toggle { width:36px; height:32px; display:grid; place-items:center; padding:0; color:#526274; border:1.5px solid #d7e0eb; border-radius:999px; background:#fff; cursor:pointer; }.filter-toggle svg { transition:transform 0.2s ease; }.filter-toggle svg.expanded { transform:rotate(180deg); }.divider { height:2px; margin:13px 0 15px; background:#e7ebf0; }
fieldset { padding:0; margin:0 0 18px; border:0; } legend { margin-bottom:11px; font-size:16px; font-weight:800; } legend span { color:#8a96a5; }
.chips { display:flex; gap:8px; }.chips label { min-width:75px; height:40px; display:grid; place-items:center; padding:0 20px; border:1.5px solid #d7e0eb; border-radius:999px; color:#4a5565; font-size:12px; font-weight:700; cursor:pointer; }.chips label.active { color:#fff; border-color:#3087ed; background:#3087ed; }.chips input { position:absolute; opacity:0; pointer-events:none; }
.price-range { display:grid; grid-template-columns:1fr 28px 1fr; align-items:center; gap:10px; }.price-range > b { text-align:center; color:#94a0af; }.price-range label { height:57px; display:flex; flex-direction:column; justify-content:center; padding:7px 14px; border:1.5px solid #d7e0eb; border-radius:16px; }.price-range small { color:#8a96a5; font-size:12px; }.price-range label span { display:flex; align-items:center; font-size:16px; font-weight:750; }.price-range input { width:100%; min-width:0; padding:0; border:0; outline:0; font-weight:750; }
.apply-button { width:100%; height:56px; border:0; border-radius:16px; color:#fff; background:#3087ed; font-size:16px; font-weight:800; }
.results { padding:16px 34px 20px; border-top:12px solid #f1f3f5; }.results h2 { margin-bottom:12px; color:#4a5565; font-size:16px; }.result-list { display:flex; flex-direction:column; gap:12px; }.empty { padding:50px 0; text-align:center; color:#8a96a5; font-size:16px; }
.load-more-button { width:100%; height:48px; border:1.5px solid #3087ed; border-radius:14px; color:#3087ed; background:#fff; font-size:16px; font-weight:800; }
@media (max-width:380px) { .date-controls,.filters,.results { padding-left:20px; padding-right:20px; }.date-controls { gap:6px; }.date-controls button { padding:8px 6px; }.date-controls strong { font-size:12px; }.chips label { padding:0 15px; } }
</style>
