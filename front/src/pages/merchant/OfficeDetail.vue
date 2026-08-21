<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { Building2, Heart, MapPin, Phone, Star } from '@lucide/vue';
import OfficeProductCard from '@/components/merchant/OfficeProductCard.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import BaseErrorState from '@/components/common/BaseErrorState.vue';
import ReservationDateModal from '@/components/reservation/ReservationDateModal.vue';
import ReservationOccupancyModal from '@/components/reservation/ReservationOccupancyModal.vue';
import { useOfficeStore } from '@/stores/merchant/officeStore';
import { useErrorToast } from '@/composables/useErrorToast';

const officeStore = useOfficeStore();
const route = useRoute();
const router = useRouter();
const {
  office,
  startDate,
  endDate,
  spaceCount,
  guestCount,
  selectedProductId,
  selectedProduct,
  totalPrice,
  isLoading,
  isBookmarkLoading,
  error,
} = storeToRefs(officeStore);
const { showError } = useErrorToast();

const dateModalMode = ref('');
const isOccupancyModalOpen = ref(false);
const isDescriptionOpen = ref(false);
const heroImageLoadFailed = ref(false);

const PRODUCT_TYPE_LABELS = {
  OFFICE_SEAT: '좌석',
  MEETING_ROOM: '회의실',
};

const selectedProductTypeLabel = computed(
  () => PRODUCT_TYPE_LABELS[selectedProduct.value?.productDetailType] ?? '-',
);

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const displayDate = (value) => {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '-';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}.${day} (${WEEKDAYS[date.getDay()]})`;
};

// 목록에서 조건을 정하고 들어왔으면 여기서 다시 묻지 않는다
const enteredWithConditions =
  typeof route.query.startDate === 'string' &&
  typeof route.query.endDate === 'string';

const isConditionOpen = ref(!enteredWithConditions);

const conditionSummary = computed(
  () =>
    `${displayDate(startDate.value)} ~ ${displayDate(endDate.value)} · ${spaceCount.value}개 · ${guestCount.value}명`,
);

const formattedDescription = computed(() =>
  String(office.value.description ?? '')
    .replace(/\s*(?=\[[^\]]+\])/g, '\n')
    .trim(),
);

const fetchOffice = async () => {
  heroImageLoadFailed.value = false;
  await officeStore.fetchOffice(Number(route.params.merchantId));
};

const applyRouteConditions = () => {
  if (typeof route.query.startDate === 'string') {
    officeStore.startDate = route.query.startDate;
  }
  if (typeof route.query.endDate === 'string') {
    officeStore.endDate = route.query.endDate;
  }
  const routeSpaceCount = Number(route.query.spaceCount);
  if (Number.isInteger(routeSpaceCount) && routeSpaceCount > 0) {
    officeStore.spaceCount = routeSpaceCount;
  }
  const routeGuestCount = Number(route.query.guestCount);
  if (Number.isInteger(routeGuestCount) && routeGuestCount > 0) {
    officeStore.guestCount = routeGuestCount;
  }
};

const selectDate = async (value) => {
  officeStore.setDate(dateModalMode.value, value);
  dateModalMode.value = '';
  await fetchOffice();
};

const closeOccupancyModal = async () => {
  isOccupancyModalOpen.value = false;
  await fetchOffice();
};

const toggleBookmark = async () => {
  try {
    await officeStore.toggleBookmark();
  } catch (bookmarkError) {
    showError(bookmarkError, '북마크 처리 중 오류가 발생했습니다.');
  }
};

const goToReservationCreate = () => {
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
};

const goReviews = () => {
  router.push(`/merchants/${office.value.merchantId}/reviews`);
};

onMounted(async () => {
  applyRouteConditions();
  await fetchOffice();
});
</script>

<template>
  <main class="bg-canvas min-h-screen pb-8">
    <div class="px-5 pt-4">
      <BaseHeader title="공유오피스 상세" @back="$router.back()" />
    </div>

    <LoadingScreen
      v-if="isLoading"
      title="공유오피스 정보를 불러오고 있어요"
      :fullscreen="false"
    />

    <BaseErrorState v-else-if="error" :title="error" @retry="fetchOffice" />

    <template v-else>
      <div class="px-4 pt-4">
        <section class="rounded-sheet bg-surface shadow-card overflow-hidden">
          <div class="bg-brand-weak relative h-[190px]">
            <img
              v-if="office.thumbnailUrl && !heroImageLoadFailed"
              class="h-full w-full object-cover"
              :src="office.thumbnailUrl"
              :alt="`${office.name} 대표 이미지`"
              @error="heroImageLoadFailed = true"
            />

            <!-- 사진이 없거나 링크가 끊긴 경우 -->
            <div
              v-else
              class="text-brand/40 flex h-full w-full items-center justify-center"
              role="img"
              aria-label="공유오피스 기본 이미지"
            >
              <Building2 :size="48" />
            </div>

            <button
              type="button"
              class="bg-surface/90 shadow-card absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full transition-transform active:scale-95 disabled:opacity-50"
              :class="office.bookmarked ? 'text-brand' : 'text-ink-mute'"
              :aria-label="office.bookmarked ? '북마크 해제' : '북마크 추가'"
              :aria-pressed="office.bookmarked"
              :disabled="isBookmarkLoading"
              @click="toggleBookmark"
            >
              <Heart
                :size="18"
                :fill="office.bookmarked ? 'currentColor' : 'none'"
              />
            </button>
          </div>

          <div class="px-[18px] py-4">
            <h2 class="text-heading font-bold -tracking-[0.02em] text-ink">
              {{ office.name }}
            </h2>

            <p class="text-body-sm mt-1.5 flex items-center gap-1 text-ink-mute">
              <MapPin :size="14" class="shrink-0" />
              <span class="truncate">{{ office.address }}</span>
            </p>

            <div
              class="border-line mt-3.5 flex items-center justify-between gap-3 border-t pt-3.5"
            >
              <p class="text-body flex items-center gap-1.5 font-bold text-ink">
                <Star :size="15" class="text-warn" fill="currentColor" />
                {{ office.rating }}
                <span class="text-body-sm font-medium text-ink-mute">
                  리뷰 {{ office.reviewCount }}개
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

        <section class="rounded-card bg-surface shadow-card mt-3 px-[18px] py-4">
          <div v-if="office.description">
            <p
              class="text-body whitespace-pre-line leading-relaxed text-ink-sub"
              :class="{ 'description-clamp': !isDescriptionOpen }"
            >
              {{ formattedDescription }}
            </p>
            <button
              type="button"
              class="text-body-sm text-brand mt-2 font-bold"
              :aria-expanded="isDescriptionOpen"
              @click="isDescriptionOpen = !isDescriptionOpen"
            >
              {{ isDescriptionOpen ? '상세정보 접기' : '상세정보 더보기' }}
            </button>
          </div>

          <div
            class="border-line text-body-sm flex items-center gap-1.5 text-ink-mute"
            :class="office.description ? 'mt-3.5 border-t pt-3.5' : ''"
          >
            <Phone :size="14" class="shrink-0" />
            <span>{{ office.phoneNumber || '-' }}</span>
          </div>

          <!-- 고른 상품에 딸린 정보라 소개와 같은 카드에 둔다 -->
          <div
            v-if="selectedProduct"
            class="border-line text-body-sm mt-3.5 flex items-center gap-3 border-t pt-3.5 text-ink-sub"
          >
            <span>{{ selectedProductTypeLabel }}</span>
            <span class="bg-line h-1 w-1 rounded-full" />
            <span>Wi-Fi</span>
            <span class="bg-line h-1 w-1 rounded-full" />
            <span>최대 {{ selectedProduct?.maxHeadcount ?? 0 }}명</span>
          </div>
        </section>

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

          <!-- 목록 화면과 같은 세 칸이다. 공간 수와 인원은 한 칸에서 함께 고른다 -->
          <div v-else class="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              class="rounded-chip bg-surface shadow-card flex h-[58px] flex-col items-center justify-center px-2 text-center"
              @click="dateModalMode = 'checkIn'"
            >
              <span class="text-caption text-ink-mute">이용 시작일</span>
              <span class="text-body-sm mt-1 truncate font-bold text-ink">
                {{ displayDate(startDate) }}
              </span>
            </button>
            <button
              type="button"
              class="rounded-chip bg-surface shadow-card flex h-[58px] flex-col items-center justify-center px-2 text-center"
              @click="dateModalMode = 'checkOut'"
            >
              <span class="text-caption text-ink-mute">이용 종료일</span>
              <span class="text-body-sm mt-1 truncate font-bold text-ink">
                {{ displayDate(endDate) }}
              </span>
            </button>
            <button
              type="button"
              class="rounded-chip bg-surface shadow-card flex h-[58px] flex-col items-center justify-center px-2 text-center"
              @click="isOccupancyModalOpen = true"
            >
              <span class="text-caption text-ink-mute">공간 · 인원</span>
              <span class="text-body-sm mt-1 truncate font-bold text-ink">
                {{ spaceCount }}개 · {{ guestCount }}명
              </span>
            </button>
          </div>
        </section>

        <section class="mt-5">
          <h3 class="text-title mb-2.5 px-1 font-bold -tracking-[0.01em] text-ink">
            상품 선택
          </h3>
          <div class="flex flex-col gap-2.5">
            <OfficeProductCard
              v-for="product in office.products"
              :key="product.productId"
              :product="product"
              :selected="selectedProductId === product.productId"
              @select="officeStore.selectProduct"
            />
          </div>
        </section>
      </div>

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
      :check-in="startDate"
      :check-out="endDate"
      start-label="이용 시작일"
      end-label="이용 종료일"
      @select="selectDate"
      @close="dateModalMode = ''"
    />
    <ReservationOccupancyModal
      v-if="isOccupancyModalOpen"
      v-model:room-count="spaceCount"
      v-model:guest-count="guestCount"
      unit-label="공간"
      @close="closeOccupancyModal"
    />
  </main>
</template>

<style scoped>
.description-clamp {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  white-space: normal;
}
</style>
