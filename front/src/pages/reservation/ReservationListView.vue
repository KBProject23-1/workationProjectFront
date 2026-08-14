<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft } from '@lucide/vue';
import { useReservationStore } from '@/stores/reservationStore';
import ReservationListItem from '@/components/reservation/ReservationListItem.vue';

const router = useRouter();
const route = useRoute();
const reservationStore = useReservationStore();
const sentinel = ref(null);
let observer = null;

const reservationTabs = [
  {
    key: 'reservation',
    label: '예약/이용 완료',
    statuses: ['CONFIRMED', 'COMPLETED'],
    emptyMessage: '예약 내역이 없어요',
    errorMessage: '예약 내역을 불러오지 못했어요',
  },
  {
    key: 'cancellation',
    label: '취소',
    statuses: ['CANCELED'],
    emptyMessage: '취소된 예약이 더 이상 없습니다.',
    errorMessage: '취소 내역을 불러오지 못했어요',
  },
];

const initialTabKey = reservationTabs.some((tab) => tab.key === route.query.tab)
  ? route.query.tab
  : reservationTabs[0].key;
const activeTabKey = ref(initialTabKey);
const activeTab = computed(
  () =>
    reservationTabs.find((tab) => tab.key === activeTabKey.value) ??
    reservationTabs[0],
);

// 예약 목록의 두 탭에서 워케이션 홈으로 이동
function goBack() {
  router.push({ name: 'WorkationHome' });
}

function goToDetail(reservationId) {
  const routeName =
    activeTabKey.value === 'cancellation'
      ? 'ReservationCancellationDetail'
      : 'ReservationDetail';

  router.push({ name: routeName, params: { reservationId } });
}

// 탭 변경 시 해당 예약 상태의 첫 페이지를 조회하는 처리
async function changeTab(tab) {
  if (activeTabKey.value === tab.key) return;

  activeTabKey.value = tab.key;
  await router.replace({ query: { ...route.query, tab: tab.key } });
  await reservationStore.fetchReservations(tab.statuses);
}

// 현재 탭의 조회 조건을 유지하는 오류 재시도 처리
function retryFetch() {
  reservationStore.fetchReservations(activeTab.value.statuses);
}

// 첫 목록을 렌더링한 뒤 하단 감지 요소가 보일 때 다음 페이지를 조회
onMounted(async () => {
  await reservationStore.fetchReservations(activeTab.value.statuses);
  await nextTick();

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      reservationStore.fetchMoreReservations();
    }
  });

  if (sentinel.value) observer.observe(sentinel.value);
});

// 페이지를 벗어날 때 관찰을 종료해 중복 조회와 메모리 누수를 방지
onUnmounted(() => {
  observer?.disconnect();
});
</script>

<template>
  <div class="flex min-h-screen w-full flex-col bg-white pb-8">
    <header class="sticky top-0 z-10 bg-white">
      <div class="relative flex h-14 items-center justify-center px-4">
        <button
          type="button"
          class="absolute left-3 rounded-full p-1 text-slate-700 active:bg-slate-100"
          aria-label="뒤로 가기"
          @click="goBack"
        >
          <ChevronLeft :size="24" :stroke-width="1.8" />
        </button>
        <h1 class="text-[20px] font-extrabold text-slate-900">예약 내역</h1>
      </div>

      <div class="grid h-[50px] grid-cols-2 border-b border-slate-200 px-4">
        <button
          v-for="tab in reservationTabs"
          :key="tab.key"
          type="button"
          class="border-b-2 text-[16px] transition-colors"
          :class="
            activeTabKey === tab.key
              ? 'border-primary font-bold text-primary'
              : 'border-transparent font-medium text-slate-400'
          "
          :aria-current="activeTabKey === tab.key ? 'page' : undefined"
          @click="changeTab(tab)"
        >
          {{ tab.label }}
        </button>
      </div>
    </header>

    <main class="flex flex-1 flex-col gap-3 px-4 pt-4">
      <div
        v-if="reservationStore.isLoading"
        class="space-y-3"
        aria-label="예약 내역을 불러오는 중"
      >
        <div
          v-for="index in 3"
          :key="index"
          class="h-[202px] animate-pulse rounded-xl border border-slate-100 bg-slate-100"
        ></div>
      </div>

      <div
        v-else-if="reservationStore.error"
        class="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center"
      >
        <p class="text-[14px] font-medium text-slate-500">
          {{ activeTab.errorMessage }}
        </p>
        <button
          type="button"
          class="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-[14px] font-semibold text-slate-700"
          @click="retryFetch"
        >
          다시 시도
        </button>
      </div>

      <div
        v-else-if="reservationStore.reservations.length === 0"
        class="flex flex-1 items-center justify-center pb-24 text-[14px] text-slate-400"
      >
        {{ activeTab.emptyMessage }}
      </div>

      <template v-else>
        <ReservationListItem
          v-for="reservation in reservationStore.reservations"
          :key="reservation.reservationId"
          :reservation="reservation"
          @select="goToDetail"
        />
        <p
          v-if="reservationStore.isLoadingMore"
          class="py-3 text-center text-[12px] text-slate-400"
        >
          불러오는 중...
        </p>
      </template>
      <div ref="sentinel" class="h-1"></div>
    </main>
  </div>
</template>
