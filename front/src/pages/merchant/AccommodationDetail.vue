<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { Heart, MapPin, Phone, Star } from '@lucide/vue';
import ReservationDateModal from '@/components/reservation/ReservationDateModal.vue';
import ReservationOccupancyModal from '@/components/reservation/ReservationOccupancyModal.vue';
import AccommodationProductCard from '@/components/merchant/AccommodationProductCard.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import BaseErrorState from '@/components/common/BaseErrorState.vue';
import { useAccommodationStore } from '@/stores/merchant/accommodationStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { getMerchantDefaultImage } from '@/config/merchantDefaultImages';

const accommodationStore = useAccommodationStore();
const route = useRoute();
const router = useRouter();
const {
  accommodation,
  checkIn,
  checkOut,
  roomCount,
  guestCount,
  selectedProductId,
  totalPrice,
  isLoading,
  isBookmarkLoading,
  error,
} = storeToRefs(accommodationStore);
const { showError } = useErrorToast();

const dateModalMode = ref('');
const isOccupancyModalOpen = ref(false);
const heroImageLoadFailed = ref(false);
const defaultThumbnail = computed(() => getMerchantDefaultImage({
  category: 'ACCOMMODATION',
  merchantId: accommodation.value.merchantId,
}));

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const displayDate = (value) => {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '-';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}.${day} (${WEEKDAYS[date.getDay()]})`;
};

// 목록에서 날짜와 인원을 이미 고르고 들어왔는지.
//
// 추천으로 들어오면 조건이 없어 여기서 골라야 하지만,
// 필터를 걸고 들어온 사람에게 같은 걸 또 물으면 이미 정한 걸 다시 정하게 된다.
// 그래서 조건이 있으면 요약만 보여주고, 고치고 싶을 때만 펼친다
const enteredWithConditions =
  typeof route.query.startDate === 'string' &&
  typeof route.query.endDate === 'string';

const isConditionOpen = ref(!enteredWithConditions);

const conditionSummary = computed(
  () =>
    `${displayDate(checkIn.value)} ~ ${displayDate(checkOut.value)} · ${roomCount.value}개 · ${guestCount.value}명`,
);

const fetchAccommodation = async () => {
  heroImageLoadFailed.value = false;
  await accommodationStore.fetchAccommodation(Number(route.params.merchantId));
};

const applyRouteConditions = () => {
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
};

const selectDate = async (value) => {
  accommodationStore.setDate(dateModalMode.value, value);
  dateModalMode.value = '';
  await fetchAccommodation();
};

const closeOccupancyModal = async () => {
  isOccupancyModalOpen.value = false;
  await fetchAccommodation();
};

const toggleBookmark = async () => {
  try {
    await accommodationStore.toggleBookmark();
  } catch (bookmarkError) {
    showError(bookmarkError, '북마크 처리 중 오류가 발생했습니다.');
  }
};

const goToReservationCreate = () => {
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
};

const goReviews = () => {
  router.push(`/merchants/${accommodation.value.merchantId}/reviews`);
};

onMounted(async () => {
  applyRouteConditions();
  await fetchAccommodation();
});
</script>

<template>
  <main class="bg-canvas min-h-screen pb-8">
    <div class="px-5 pt-4">
      <BaseHeader title="숙소 상세" @back="$router.back()" />
    </div>

    <LoadingScreen
      v-if="isLoading"
      title="숙소 정보를 불러오고 있어요"
      :fullscreen="false"
    />

    <BaseErrorState v-else-if="error" :title="error" @retry="fetchAccommodation" />

    <template v-else>
      <div class="px-4 pt-4">
        <!-- 대표 이미지와 가맹점 정보를 한 카드로 묶는다 -->
        <section class="rounded-sheet bg-surface shadow-card overflow-hidden">
          <div class="bg-brand-weak relative h-[190px]">
            <img
              class="h-full w-full object-cover"
              :src="accommodation.thumbnailUrl && !heroImageLoadFailed
                ? accommodation.thumbnailUrl
                : defaultThumbnail"
              :alt="`${accommodation.name} 대표 이미지`"
              @error="heroImageLoadFailed = true"
            />

            <button
              type="button"
              class="bg-surface/90 shadow-card absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full transition-transform active:scale-95 disabled:opacity-50"
              :class="accommodation.bookmarked ? 'text-brand' : 'text-ink-mute'"
              :aria-label="accommodation.bookmarked ? '북마크 해제' : '북마크 추가'"
              :aria-pressed="accommodation.bookmarked"
              :disabled="isBookmarkLoading"
              @click="toggleBookmark"
            >
              <Heart
                :size="18"
                :fill="accommodation.bookmarked ? 'currentColor' : 'none'"
              />
            </button>
          </div>

          <div class="px-[18px] py-4">
            <h2 class="text-heading font-bold -tracking-[0.02em] text-ink">
              {{ accommodation.name }}
            </h2>

            <p class="text-body-sm mt-1.5 flex items-center gap-1 text-ink-mute">
              <MapPin :size="14" class="shrink-0" />
              <span class="truncate">{{ accommodation.address }}</span>
            </p>

            <div class="border-line mt-3.5 flex items-center justify-between gap-3 border-t pt-3.5">
              <p class="text-body flex items-center gap-1.5 font-bold text-ink">
                <Star :size="15" class="text-warn" fill="currentColor" />
                {{ accommodation.rating }}
                <span class="text-body-sm font-medium text-ink-mute">
                  리뷰 {{ accommodation.reviewCount }}개
                </span>
              </p>
              <button
                type="button"
                class="text-body-sm rounded-chip bg-brand-weak text-brand shrink-0 px-3 py-1.5 font-bold"
                @click="goReviews"
              >
                리뷰 보기
              </button>
            </div>
          </div>
        </section>

        <!-- 소개와 연락처 -->
        <section class="rounded-card bg-surface shadow-card mt-3 px-[18px] py-4">
          <p v-if="accommodation.description" class="text-body leading-relaxed text-ink-sub">
            {{ accommodation.description }}
          </p>

          <div
            class="border-line text-body-sm flex items-center gap-1.5 text-ink-mute"
            :class="accommodation.description ? 'mt-3.5 border-t pt-3.5' : ''"
          >
            <Phone :size="14" class="shrink-0" />
            <span>{{ accommodation.phoneNumber || '-' }}</span>
          </div>

          <p class="text-body-sm mt-2 text-ink-mute">
            체크인 {{ accommodation.checkInTime?.slice(0, 5) ?? '-' }} · 체크아웃
            {{ accommodation.checkOutTime?.slice(0, 5) ?? '-' }}
          </p>
        </section>

        <!--
          예약 조건.
          목록에서 정하고 들어왔으면 한 줄로 접어 두고, 바꾸고 싶을 때만 펼친다
        -->
        <section class="mt-5">
          <div class="mb-2.5 flex items-center justify-between px-1">
            <h3 class="text-title font-bold -tracking-[0.01em] text-ink">
              예약 조건
            </h3>
            <button
              v-if="enteredWithConditions"
              type="button"
              class="text-body-sm text-brand font-bold"
              @click="isConditionOpen = !isConditionOpen"
            >
              {{ isConditionOpen ? '접기' : '변경' }}
            </button>
          </div>

          <p
            v-if="!isConditionOpen"
            class="rounded-card bg-surface shadow-card text-body px-[18px] py-4 font-semibold text-ink"
          >
            {{ conditionSummary }}
          </p>

          <!-- 목록 화면의 조건 칸과 같은 규격이다 -->
          <div v-else class="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              class="rounded-chip bg-surface shadow-card flex h-[58px] flex-col items-center justify-center px-2 text-center"
              @click="dateModalMode = 'checkIn'"
            >
              <span class="text-caption text-ink-mute">체크인</span>
              <span class="text-body-sm mt-1 truncate font-bold text-ink">
                {{ displayDate(checkIn) }}
              </span>
            </button>
            <button
              type="button"
              class="rounded-chip bg-surface shadow-card flex h-[58px] flex-col items-center justify-center px-2 text-center"
              @click="dateModalMode = 'checkOut'"
            >
              <span class="text-caption text-ink-mute">체크아웃</span>
              <span class="text-body-sm mt-1 truncate font-bold text-ink">
                {{ displayDate(checkOut) }}
              </span>
            </button>
            <button
              type="button"
              class="rounded-chip bg-surface shadow-card flex h-[58px] flex-col items-center justify-center px-2 text-center"
              @click="isOccupancyModalOpen = true"
            >
              <span class="text-caption text-ink-mute">객실 · 인원</span>
              <span class="text-body-sm mt-1 truncate font-bold text-ink">
                {{ roomCount }}개 · {{ guestCount }}명
              </span>
            </button>
          </div>
        </section>

        <section class="mt-5">
          <h3 class="text-title mb-2.5 px-1 font-bold -tracking-[0.01em] text-ink">
            객실 선택
          </h3>
          <div class="flex flex-col gap-2.5">
            <AccommodationProductCard
              v-for="product in accommodation.products"
              :key="product.productId"
              :product="product"
              :selected="selectedProductId === product.productId"
              @select="accommodationStore.selectProduct"
            />
          </div>
        </section>
      </div>

      <!-- 금액과 예약 버튼은 화면 아래에 붙여 둔다 -->
      <div
        class="border-line bg-surface sticky bottom-0 mt-6 flex items-center justify-between gap-4 border-t px-4 py-3"
      >
        <div>
          <p class="text-body-sm text-ink-mute">총 결제 금액</p>
          <p class="text-heading mt-0.5 font-bold -tracking-[0.02em] text-ink">
            {{ totalPrice.toLocaleString() }}원
          </p>
        </div>
        <BaseButton
          class="w-[158px]"
          :disabled="!selectedProductId"
          @click="goToReservationCreate"
        >
          예약하기
        </BaseButton>
      </div>
    </template>

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
.hero-thumbnail { width:100%; height:100%; display:block; object-fit:cover; }
.merchant-section { position:relative; padding:10px 17px 8px; }.merchant-section h2 { margin:0 42px 8px 0; font-size:22px; }.merchant-section p { margin:0; }.bookmark-button { position:absolute; top:17px; right:18px; padding:0; color:#88a0bf; border:0; background:transparent; cursor:pointer; transition:color .16s ease,transform .16s ease; }.bookmark-button:hover { color:#3087ed; transform:scale(1.1); }.bookmark-button.bookmarked { color:#3087ed; }.bookmark-button:disabled { cursor:wait; opacity:.55; }.address { display:flex; align-items:center; gap:4px; color:#8592a2; font-size:12px; }.rating-row { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:8px; }.rating { font-size:16px; font-weight:800; }.rating span { color:#ff8a00; }.rating b { color:#7b8794; }.review-button { flex:none; padding:5px 10px; border:1px solid #3087ed; border-radius:999px; color:#3087ed; background:#fff; font-size:12px; font-weight:800; }
.accommodation-info { margin:4px 16px 0; padding:14px; border:1.5px solid #dbe3ee; border-radius:16px; background:#f8fbff; }.accommodation-info p { margin:0 0 10px; font-size:16px; }.accommodation-info > div { display:flex; align-items:center; gap:6px; color:#687587; font-size:12px; }.accommodation-info .times { margin-top:8px; }.times i { width:4px; height:4px; border-radius:50%; background:#c6d0dc; }
h3 { margin:0 0 10px; font-size:16px; }.room-section { padding:0 16px; }
.stay-condition { display:grid; grid-template-columns:repeat(3,1fr); gap:9px; padding:11px 16px 15px; }.stay-condition button { height:66px; display:flex; flex-direction:column; justify-content:center; padding:9px 13px; text-align:left; border:1.5px solid #dbe3ee; border-radius:16px; color:#111827; background:#fff; cursor:pointer; }.stay-condition button:active { border-color:#3087ed; }.stay-condition small { margin-bottom:8px; color:#8a96a5; font-size:12px; }.stay-condition strong { font-size:16px; white-space:nowrap; }
.room-list { display:flex; flex-direction:column; gap:12px; }
.booking-summary { display:flex; align-items:center; justify-content:space-between; gap:20px; margin-top:12px; padding:10px 16px 0; border-top:2px solid #edf0f4; }.booking-summary div { display:flex; flex-direction:column; }.booking-summary small { margin-bottom:3px; color:#8a96a5; font-size:12px; }.booking-summary strong { font-size:22px; }.booking-summary button { width:158px; height:52px; border:0; border-radius:15px; color:#fff; background:#3087ed; font-size:16px; font-weight:800; }
.booking-summary button:disabled { cursor:not-allowed; background:#cbd5e1; }
@media (max-width:360px) { .stay-condition { gap:5px; }.stay-condition > button { padding:8px; }.booking-summary { gap:10px; }.booking-summary button { width:140px; } }
</style>
