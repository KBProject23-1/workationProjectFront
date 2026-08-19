<template>
  <div class="flex min-h-screen w-full flex-col bg-white">
    <div class="px-5 pt-4">
      <BaseHeader
        title="예약 · 추천"
        @back="goBack"
      />
    </div>

    <main class="px-4 pb-4">
      <!-- 예약 유형. 탭마다 아래 필터가 통째로 바뀐다 -->
      <section>
        <h2 class="mb-1.5 text-[14px] font-extrabold text-slate-900">예약 유형</h2>
        <div class="grid grid-cols-4 gap-1.5">
          <button
            v-for="option in RESERVATION_CATEGORIES"
            :key="option.value"
            type="button"
            class="rounded-lg border py-1.5 text-[12px] font-bold"
            :class="
              category === option.value
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-200 text-slate-600'
            "
            @click="merchantStore.setCategory(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </section>

      <!-- 조건을 정하는 주체가 달라 방식마다 보여줄 입력이 다르다 -->
      <section class="mt-3">
        <h2 class="mb-1.5 text-[14px] font-extrabold text-slate-900">방식</h2>
        <div class="grid grid-cols-2 gap-1.5">
          <button
            v-for="option in SEARCH_MODES"
            :key="option.value"
            type="button"
            class="rounded-lg border py-1.5 text-[12px] font-bold"
            :class="
              mode === option.value
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-200 text-slate-600'
            "
            @click="merchantStore.setMode(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </section>

      <section class="mt-3">
        <div class="flex items-center justify-between">
          <h2 class="text-[14px] font-extrabold text-slate-900">필터</h2>
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500"
            :aria-expanded="isFiltersExpanded"
            :aria-label="isFiltersExpanded ? '필터 접기' : '필터 펼치기'"
            @click="isFiltersExpanded = !isFiltersExpanded"
          >
            <ChevronDown
              :size="18"
              class="transition-transform"
              :class="{ 'rotate-180': isFiltersExpanded }"
            />
          </button>
        </div>
        <div class="mt-2 h-px w-full bg-slate-100" />

        <div
          class="grid transition-all duration-300 ease-out"
          :class="isFiltersExpanded ? 'grid-rows-[1fr] pt-2.5' : 'grid-rows-[0fr]'"
        >
          <div class="overflow-hidden">
          <!-- 숙소·공유오피스만 재고가 있어 날짜와 인원을 받는다 -->
          <template v-if="reservable && !isRecommended">
            <div class="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                class="flex h-[50px] flex-col items-center justify-center rounded-lg border border-slate-200 px-2 text-center"
                @click="dateModalMode = 'checkIn'"
              >
                <span class="text-[11px] text-slate-400">
                  {{ category === 'OFFICE' ? '이용 시작일' : '체크인' }}
                </span>
                <span class="truncate text-[13px] font-bold text-slate-900">
                  {{ displayDate(checkIn) }}
                </span>
              </button>
              <button
                type="button"
                class="flex h-[50px] flex-col items-center justify-center rounded-lg border border-slate-200 px-2 text-center"
                @click="dateModalMode = 'checkOut'"
              >
                <span class="text-[11px] text-slate-400">
                  {{ category === 'OFFICE' ? '이용 종료일' : '체크아웃' }}
                </span>
                <span class="truncate text-[13px] font-bold text-slate-900">
                  {{ displayDate(checkOut) }}
                </span>
              </button>
              <button
                type="button"
                class="flex h-[50px] flex-col items-center justify-center rounded-lg border border-slate-200 px-2 text-center"
                @click="isOccupancyModalOpen = true"
              >
                <span class="text-[11px] text-slate-400">
                  {{ category === 'ACCOMMODATION' ? '객실 · 인원' : '이용 인원' }}
                </span>
                <span class="truncate text-[13px] font-bold text-slate-900">
                  {{ occupancyLabel }}
                </span>
              </button>
            </div>
          </template>

          <!-- 유형별 상세 필터 -->
          <FilterChipGroup
            v-if="category === 'ACCOMMODATION' && !isRecommended"
            v-model="accommodationType"
            label="숙소 유형"
            :options="ACCOMMODATION_TYPES"
          />
          <FilterChipGroup
            v-if="category === 'OFFICE' && !isRecommended"
            v-model="noiseLevel"
            label="공간 분위기"
            :options="OFFICE_NOISE_LEVELS"
          />
          <FilterChipGroup
            v-if="category === 'RESTAURANT' && !isRecommended"
            v-model="foodType"
            label="음식 종류"
            :options="FOOD_TYPES"
          />
          <FilterChipGroup
            v-if="category === 'ACTIVITY' && !isRecommended"
            v-model="activityType"
            label="활동 종류"
            :options="ACTIVITY_TYPES"
          />

          <!-- 금액 입력은 재고와 단가가 있는 숙소·공유오피스에만 둔다 -->
          <fieldset v-if="reservable && !isRecommended" class="mt-3">
            <legend class="mb-1.5 text-[13px] font-extrabold text-slate-900">
              가격 범위
              <span class="font-medium text-slate-400">(1일 기준)</span>
            </legend>
            <div class="flex items-center gap-2">
              <label
                class="flex h-11 flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3"
              >
                <span class="shrink-0 text-[11px] text-slate-400">최소</span>
                <input
                  v-model="minPriceDisplay"
                  inputmode="numeric"
                  placeholder="0"
                  aria-label="최소 금액"
                  class="w-full min-w-0 border-0 p-0 text-left text-[14px] font-bold text-slate-900 outline-none"
                />
                <span class="shrink-0 text-[13px] font-bold text-slate-900">원</span>
              </label>
              <span class="text-slate-300">~</span>
              <label
                class="flex h-11 flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3"
              >
                <span class="shrink-0 text-[11px] text-slate-400">최대</span>
                <input
                  v-model="maxPriceDisplay"
                  inputmode="numeric"
                  aria-label="최대 금액"
                  class="w-full min-w-0 border-0 p-0 text-left text-[14px] font-bold text-slate-900 outline-none"
                />
                <span class="shrink-0 text-[13px] font-bold text-slate-900">원</span>
              </label>
            </div>
          </fieldset>

          <FilterChipGroup
            v-if="!isRecommended"
            v-model="sort"
            label="정렬 기준"
            :options="SORT_OPTIONS"
          />

          <!-- 음식점 추천은 아침·점심·저녁마다 기준 장소와 예산 배분이 달라 시간이 필요하다 -->
          <FilterChipGroup
            v-if="isRecommended && category === 'RESTAURANT'"
            v-model="mealType"
            label="식사 시간"
            :options="MEAL_TYPES"
          />

          <!--
            추천에서 사용자가 고를 수 있는 값은 기준 장소 하나뿐이다.
            후보가 많아 목록을 펼쳐 두면 화면을 다 먹으므로 한 줄로 두고 시트에서 고른다
          -->
          <div v-if="isRecommended" class="mt-3">
            <p class="mb-1.5 text-[14px] font-extrabold text-slate-900">기준 장소</p>
            <button
              type="button"
              class="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-left"
              @click="isReferenceSheetOpen = true"
            >
              <span class="min-w-0 flex-1">
                <span class="block truncate text-[13px] font-bold text-slate-900">
                  {{ referenceName }}
                </span>
                <span class="block text-[11px] text-slate-400">
                  {{ referenceDescription }}
                </span>
              </span>
              <span class="shrink-0 text-[12px] font-bold text-blue-600">변경</span>
            </button>
          </div>

          <p v-if="isRecommended" class="mt-1.5 px-1 text-[11px] text-slate-400">
            설문과 예산을 바탕으로 추천합니다. 둘 중 하나라도 없으면 받을 수 없어요.
          </p>

          <BaseButton
            class="mt-3 max-w-none rounded-lg py-2.5 text-[15px] font-bold"
            :disabled="isLoading"
            @click="applyFilters"
          >
            {{ isLoading ? '조회 중...' : '적용하기' }}
          </BaseButton>
          </div>
        </div>
      </section>
    </main>

    <section v-if="searched" class="border-t-8 border-slate-100 px-4 pt-4 pb-6">
      <h2 class="mb-3 text-[14px] font-bold text-slate-600">
        검색 결과 {{ merchants.length }}개
      </h2>

      <div v-if="isLoading" class="space-y-3">
        <div v-for="n in 3" :key="n" class="h-28 animate-pulse rounded-xl bg-slate-100" />
      </div>

      <div v-else-if="error" class="py-10 text-center">
        <p class="text-[14px] text-slate-500">{{ error }}</p>
        <button
          type="button"
          class="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-[14px] font-semibold text-slate-700"
          @click="merchantStore.fetchMerchants"
        >
          다시 시도
        </button>
      </div>

      <template v-else>
        <div class="flex flex-col gap-3">
          <ReservationMerchantCard
            v-for="item in merchants"
            :key="item.merchantId"
            :merchant="item"
            @select="moveToMerchantDetails"
            @toggle-bookmark="toggleBookmark"
          />
        </div>

        <p v-if="merchants.length === 0" class="py-12 text-center text-[14px] text-slate-400">
          조건에 맞는 검색 결과가 없습니다.
        </p>

        <button
          v-if="hasNext"
          type="button"
          class="mt-3 h-12 w-full rounded-xl border border-blue-600 text-[15px] font-bold text-blue-600 disabled:opacity-60"
          :disabled="isLoadingMore"
          @click="merchantStore.loadNextPage"
        >
          {{ isLoadingMore ? '불러오는 중...' : '더보기' }}
        </button>
      </template>
    </section>

    <ReferencePlaceSheet
      v-if="isReferenceSheetOpen"
      :candidates="referenceCandidates"
      :type="category"
      :selected-id="referenceMerchantId"
      @select="pickReference"
      @close="isReferenceSheetOpen = false"
    />

    <ReservationDateModal
      v-if="dateModalMode"
      :mode="dateModalMode"
      :check-in="checkIn"
      :check-out="checkOut"
      @select="selectDate"
      @close="dateModalMode = ''"
    />

    <!-- 숙소는 객실 수까지, 공유오피스는 인원만 고른다 -->
    <ReservationOccupancyModal
      v-if="isOccupancyModalOpen && category === 'ACCOMMODATION'"
      v-model:room-count="roomCount"
      v-model:guest-count="guestCount"
      @close="isOccupancyModalOpen = false"
    />
    <ReservationGuestModal
      v-if="isOccupancyModalOpen && category === 'OFFICE'"
      v-model:count="guestCount"
      @close="isOccupancyModalOpen = false"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ChevronDown } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import ReservationDateModal from '@/components/reservation/ReservationDateModal.vue';
import ReservationGuestModal from '@/components/reservation/ReservationGuestModal.vue';
import ReservationOccupancyModal from '@/components/reservation/ReservationOccupancyModal.vue';
import ReservationMerchantCard from '@/components/merchant/ReservationMerchantCard.vue';
import FilterChipGroup from '@/components/merchant/FilterChipGroup.vue';
import ReferencePlaceSheet from '@/components/merchant/ReferencePlaceSheet.vue';
import { useReservationMerchantStore } from '@/stores/merchant/reservationMerchantStore';
import { useWorkationStore } from '@/stores/workationStore';
import { useErrorToast } from '@/composables/useErrorToast';
import {
  ACCOMMODATION_TYPES,
  ACTIVITY_TYPES,
  FOOD_TYPES,
  OFFICE_NOISE_LEVELS,
  MEAL_TYPES,
  RESERVATION_CATEGORIES,
  SEARCH_MODES,
  SORT_OPTIONS,
} from '@/config/reservationFilters';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

// 상세 화면 이름이 예약 유형마다 다르다
const DETAIL_ROUTES = {
  ACCOMMODATION: 'AccommodationDetail',
  OFFICE: 'OfficeDetail',
  RESTAURANT: 'RestaurantDetail',
  ACTIVITY: 'ActivityDetail',
};

const router = useRouter();
const merchantStore = useReservationMerchantStore();
const workationStore = useWorkationStore();
const { showError } = useErrorToast();

// 예약·추천 목록에서 워케이션 홈으로 이동
function goBack() {
  router.push({ name: 'WorkationHome' });
}

const {
  merchants,
  checkIn,
  checkOut,
  guestCount,
  roomCount,
  category,
  sort,
  minPrice,
  maxPrice,
  accommodationType,
  noiseLevel,
  foodType,
  activityType,
  mealType,
  mode,
  referenceMerchantId,
  referenceCandidates,
  referencePlace,
  searched,
  hasNext,
  isLoading,
  isLoadingMore,
  error,
  reservable,
} = storeToRefs(merchantStore);

const dateModalMode = ref('');
const isOccupancyModalOpen = ref(false);
const isReferenceSheetOpen = ref(false);
const isFiltersExpanded = ref(true);

// 추천은 서버가 조건을 정하므로 화면 필터를 함께 걸 수 없다
const isRecommended = computed(() => mode.value === 'RECOMMEND');

// 서버가 잡아 준 기본값도 이름으로 보여줘야 왜 그곳이 기준인지 알 수 있다
const referenceName = computed(
  () =>
    referencePlace.value?.merchantName ??
    referencePlace.value?.primaryMerchantName ??
    '이 지역 전체',
);

const referenceDescription = computed(() => {
  if (!referencePlace.value) return '기준 장소 없이 지역 안에서 찾아요';
  return referenceMerchantId.value ? '직접 고른 장소' : '확정 예약을 기준으로 자동 선택';
});

const pickReference = (place) => {
  merchantStore.selectReference(place);
  isReferenceSheetOpen.value = false;
};

const occupancyLabel = computed(() =>
  category.value === 'ACCOMMODATION'
    ? `${roomCount.value}개 · ${guestCount.value}명`
    : `${guestCount.value}명`,
);

const displayDate = (value) => {
  const date = new Date(`${value}T00:00:00`);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}.${day} (${DAY_NAMES[date.getDay()]})`;
};

const selectDate = (value) => {
  merchantStore.setDate(dateModalMode.value, value);
  dateModalMode.value = '';
};

// 입력은 숫자만 남기고, 보여줄 때만 천 단위 쉼표를 붙인다
const priceField = (field, source) =>
  computed({
    get: () => (source.value === '' ? '' : Number(source.value).toLocaleString()),
    set: (value) => merchantStore.setPrice(field, value),
  });

const minPriceDisplay = priceField('min', minPrice);
const maxPriceDisplay = priceField('max', maxPrice);

const moveToMerchantDetails = (merchant) => {
  const routeName = DETAIL_ROUTES[merchant.category];
  if (!routeName) return;

  // 음식점·여가는 예약이 아니라 일정이라 날짜·인원을 넘기지 않는다
  const query =
    merchant.category === 'ACCOMMODATION' || merchant.category === 'OFFICE'
      ? {
          startDate: checkIn.value,
          endDate: checkOut.value,
          guestCount: guestCount.value,
          ...(merchant.category === 'ACCOMMODATION'
            ? { roomCount: roomCount.value }
            : {}),
        }
      : {};

  router.push({
    name: routeName,
    params: { merchantId: merchant.merchantId },
    query,
  });
};

const toggleBookmark = async (merchantId) => {
  try {
    await merchantStore.toggleBookmark(merchantId);
  } catch (bookmarkError) {
    showError(bookmarkError, '북마크 처리 중 오류가 발생했습니다.');
  }
};

// 탭을 옮기면 조건을 새로 고르게 되므로 접혀 있던 필터를 다시 펼친다
watch(category, () => {
  isFiltersExpanded.value = true;
});

// 메인 화면에서 다시 진입해도 항상 첫 번째 선택 상태로 시작한다
onMounted(async () => {
  await workationStore.fetchCurrent();
  merchantStore.resetEntrySelection(workationStore.workation);
});

const applyFilters = async () => {
  await merchantStore.fetchMerchants();
  isFiltersExpanded.value = false;
};

// 적용하기를 누르기 전에는 결과를 보여주지 않는다
</script>
