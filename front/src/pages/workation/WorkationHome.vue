<template>
  <div class="min-h-screen bg-canvas pb-8">
    <!--
      브랜드 면. 아래 카드가 이 위로 올라오면서 깊이가 생긴다.
      진행 중 워케이션이 없으면 큰 문구를, 있으면 워케이션 요약을 넣는다.

      요약을 흰 카드로 따로 두면 남색 헤더 바로 아래에 연한 파랑 카드가 붙어
      두 파랑이 겹치고 헤더는 인사말만 남은 빈 띠가 된다.
      요약을 헤더 안으로 올리면 그 자리가 채워지고, 아래는 흰 카드만 남아 경계가 뚜렷해진다
    -->
    <!--
      마지막 색을 130% 지점에 두어 화면 안에서는 끝까지 도달하지 않게 한다.
      to-brand 로 끝내면 아래쪽이 통째로 밝은 파랑이 되어 남색이 남지 않는다
    -->
    <header
      class="bg-[linear-gradient(150deg,#0B3155_0%,#164B86_55%,#3087ED_130%)] px-5 pt-5 pb-[74px]"
    >
      <div class="flex items-start justify-between">
        <div>
          <p class="text-body-sm text-white/70">안녕하세요</p>
          <p class="text-title mt-0.5 font-bold text-white">{{ greetingName }}</p>
        </div>

        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="flex h-[34px] items-center gap-1.5 rounded-xl bg-white pr-3.5 pl-2.5 text-[12px] font-extrabold tracking-wide text-navy shadow-md transition-transform active:scale-95"
            aria-label="지갑으로 이동"
            @click="goPay"
          >
            <Wallet :size="15" />
            PAY
          </button>
          <button
            type="button"
            class="relative flex h-[34px] w-[34px] items-center justify-center rounded-xl bg-white/15 text-white transition-colors active:bg-white/25"
            aria-label="알림"
            @click="goNotifications"
          >
            <Bell :size="18" />
            <span
              v-if="notificationStore.unreadCount > 0"
              class="text-caption bg-danger absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 font-bold text-white"
            >
              {{
                notificationStore.unreadCount > 99
                  ? '99+'
                  : notificationStore.unreadCount
              }}
            </span>
          </button>
          <button
            type="button"
            class="flex h-[34px] w-[34px] items-center justify-center rounded-xl bg-white/15 text-white transition-colors active:bg-white/25"
            aria-label="프로필"
            @click="goProfile"
          >
            <UserRound :size="18" />
          </button>
        </div>
      </div>

      <!--
        문구는 워케이션 상태에 따라 바뀐다.
        없을 때만 문구를 두면 등록한 순간 이 자리가 비어 헤더가 인사말만 남은 띠가 된다
      -->
      <div v-if="!loading && !pageError" class="mt-6">
        <p class="text-caption font-bold tracking-[0.08em] text-white/60">
          WORKATION
        </p>
        <p
          class="text-display mt-2 leading-[1.28] font-bold -tracking-[0.02em] text-white"
        >
          {{ tagline.lead }}<br />
          <span class="text-[#8FD0FF]">{{ tagline.accent }}</span>
        </p>
      </div>
    </header>

    <div class="-mt-14 px-4">
    <LoadingScreen v-if="loading" title="워케이션 정보를 불러오고 있어요" :fullscreen="false" />

    <BaseErrorState v-else-if="pageError" :title="pageError" @retry="loadHome" />

    <template v-else-if="current">
      <WorkationProgressCard
        :workation="current.workation"
        @budget="goBudgetDetail"
        @edit="goEdit"
        @delete="confirmOpen = true"
      />

      <!--
        1/3 에서 워케이션이 먼저 만들어지므로 설문이나 예산을 마치지 않고 나갈 수 있다.
        이탈 자체는 막을 수 없으니 돌아올 길을 열어 준다.
      -->
      <button
        v-if="setupIncomplete"
        class="rounded-card bg-warn-weak mt-4 flex w-full items-center gap-3 px-4 py-3.5 text-left"
        @click="goIncompleteStep"
      >
        <span
          class="text-caption bg-warn flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-bold text-white"
        >
          !
        </span>
        <span class="min-w-0 flex-1">
          <span class="text-body-sm block font-bold text-ink">
            아직 설정이 끝나지 않았어요
          </span>
          <span class="text-caption mt-0.5 block text-ink-sub">
            {{ incompleteMessage }}
          </span>
        </span>
        <span class="text-caption text-warn shrink-0 font-bold">
          이어서 ›
        </span>
      </button>

      <WorkationScheduler
        :schedules="schedules"
        :expanded="scheduleStore.expanded"
        :is-loading="scheduleLoading"
        @select="goScheduleItem"
        @toggle="toggleScheduleRange"
        @reserve="goReservations"
        @history="goReservationHistory"
      />

      <!-- 지출로 가는 버튼 바로 위에 둬야 무엇을 눌러야 하는지 이어진다 -->
      <div v-if="current.uncheckedExpenseCount > 0" class="mt-5">
        <UncheckedExpenseAlert
          :count="current.uncheckedExpenseCount"
          @click="goUncheckedExpenses"
        />
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <button
          class="rounded-card bg-surface shadow-card text-body-sm flex flex-col items-center gap-2 py-4 font-bold text-ink transition-transform active:scale-[0.98]"
          @click="goExpenses"
        >
          <span
            class="bg-brand-weak text-brand flex h-9 w-9 items-center justify-center rounded-[11px]"
          >
            <ReceiptText :size="18" />
          </span>
          지출 내역 보기
        </button>
        <button
          class="rounded-card bg-surface shadow-card text-body-sm flex flex-col items-center gap-2 py-4 font-bold text-ink transition-transform active:scale-[0.98]"
          @click="goSettlement"
        >
          <span
            class="bg-brand-weak text-brand flex h-9 w-9 items-center justify-center rounded-[11px]"
          >
            <FileSpreadsheet :size="18" />
          </span>
          정산 하러 가기
        </button>
      </div>
    </template>

    <WorkationEmptyState
      v-else
      :regions="sortedRegions"
      :merchants="popularMerchants"
      :bookmarks="bookmarks"
      :last-record="lastRecord"
      @register="goCreate"
      @region="goRegionDetail"
      @records="goRecords"
      @record-detail="goRecordDetail"
      @merchant="goMerchantDetail"
    />

    <!-- ① 삭제 확인 -->
    <BaseConfirmModal
      :visible="confirmOpen"
      :loading="deleting"
      title="워케이션을 삭제할까요?"
      message="일정과 예산, 등록한 지출이 모두 사라져요."
      @confirm="checkBeforeDelete"
      @cancel="confirmOpen = false"
    />

    <!-- ② 삭제는 끝났고, 남은 예약을 어떻게 할지는 사용자가 정한다 -->
    <BaseConfirmModal
      :visible="upcomingOpen"
      title="아직 예약이 남아 있어요"
      :message="upcomingMessage"
      confirm-label="예약 확인하러 가기"
      cancel-label="닫기"
      @confirm="goReservationsToCancel"
      @cancel="upcomingOpen = false"
    />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import {
  Bell,
  FileSpreadsheet,
  ReceiptText,
  UserRound,
  Wallet,
} from '@lucide/vue';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useWorkationStore } from '@/stores/workationStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useSettlementStore } from '@/stores/settlementStore';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import BaseErrorState from '@/components/common/BaseErrorState.vue';
import { useSurveyStore } from '@/stores/surveyStore';
import {
  useScheduleStore,
  DEFAULT_DAYS,
  EXPANDED_DAYS,
} from '@/stores/scheduleStore';
import { getBookmarks } from '@/api/bookmark';
import { fetchPopularPlaces } from '@/components/workation/popularPlaces';
import { reservationSummaryText } from '@/components/workation/format';
import { programOf } from '@/components/workation/regionPrograms';
import { useBudgetTypeLabel } from '@/composables/useBudgetTypeLabel';
import WorkationProgressCard from '@/components/workation/WorkationProgressCard.vue';
import WorkationScheduler from '@/components/workation/WorkationScheduler.vue';
import UncheckedExpenseAlert from '@/components/workation/UncheckedExpenseAlert.vue';
import WorkationEmptyState from '@/components/workation/WorkationEmptyState.vue';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';
import { useErrorToast } from '@/composables/useErrorToast';

const router = useRouter();
const workationStore = useWorkationStore();
const budgetStore = useBudgetStore();
const expenseStore = useExpenseStore();
const settlementStore = useSettlementStore();
const surveyStore = useSurveyStore();
const scheduleStore = useScheduleStore();
const notificationStore = useNotificationStore();
const { showError } = useErrorToast();
const authStore = useAuthStore();

// 세션 복원 전에는 잠깐 이름이 비어 있다. 그때는 화면 제목을 대신 쓴다
const greetingName = computed(() => {
  const name = authStore.user?.name;
  return name ? `${name}님` : '나의 워케이션';
});
// 지난 워케이션 지출을 법인 / 업무 중 무엇으로 부를지 정한다
const { ensureCards } = useBudgetTypeLabel();
const { current } = storeToRefs(workationStore);
// workationStore.error 는 지역목록/최근기록 조회처럼 홈에서 "실패해도 나머지는 보여줄" 부가
// 호출들과 공유된다. 페이지 전체를 에러 화면으로 덮을지는 fetchCurrent 직후 값만 보고 정한다
const pageError = ref(null);

const loading = ref(true);
const confirmOpen = ref(false);
const deleting = ref(false);

// 헤더 문구. 워케이션이 없을 때와 있을 때, 그리고 시기별로 달라진다.
//
// 없을 때는 "어디로 떠날까" 라고 묻고, 진행 중에는 그 답이 이어지도록 썼다.
// 서버가 내려주는 phase 는 BEFORE / ONGOING / PENDING_SETTLEMENT 세 가지다
const EMPTY_TAGLINE = { lead: '일하러 가는 여행,', accent: '어디로 떠나볼까요' };

const SETTLEMENT_TAGLINE = {
  lead: '일정이 끝났어요,',
  accent: '이제 정산할 차례예요',
};

const tagline = computed(() => {
  const workation = current.value?.workation;
  if (!workation) return EMPTY_TAGLINE;

  const phase = workation.phase ?? 'ONGOING';

  if (phase === 'PENDING_SETTLEMENT') return SETTLEMENT_TAGLINE;

  // 시작 전에는 지역과 기간을 넣어 무엇이 곧 시작되는지 그대로 읽어 준다
  if (phase === 'BEFORE') {
    return {
      lead: `${regionLabel.value}에서 보낼 ${workation.totalDays}일,`,
      accent: '곧 시작돼요',
    };
  }

  // 진행 중에는 지금 며칠째인지와 남은 날을 붙인다.
  // 마지막 날에는 남은 날이 0 이라 "남은 0일" 이 되어 버려 문장을 따로 쓴다
  return {
    lead: `${regionLabel.value}에서 ${workation.elapsedDays}일째,`,
    accent:
      remainDays.value > 0
        ? `남은 ${remainDays.value}일도 알차게`
        : '오늘이 마지막 날이에요',
  };
});

const remainDays = computed(() => {
  const workation = current.value?.workation;
  if (!workation) return 0;
  return Math.max(workation.totalDays - workation.elapsedDays, 0);
});

// region.name 은 '제주' 지만 문장에서는 '제주도' 로 쓴다
const regionLabel = computed(() => {
  const name = current.value?.workation?.region?.name ?? '';
  return programOf(name)?.displayName ?? name;
});

// 삭제는 세 단계다. 확인 → (예약 상태에 따라) 안내 → 실행
const upcomingOpen = ref(false);
const reservationCheck = ref(null);

const loadSetupState = async () => {
  const workationId = workationStore.workationId;
  if (!workationId) return;

  // 하나가 실패해도 홈은 떠야 하므로 개별로 삼킨다
  await Promise.all([
    budgetStore.fetchBudgets(workationId).catch(() => {}),
    surveyStore.fetchMySurvey().catch(() => {}),
    scheduleStore.fetchSchedules(workationId, DEFAULT_DAYS).catch(() => {}),
  ]);
};

const { schedules, isLoading: scheduleLoading } = storeToRefs(scheduleStore);

// 2일치와 7일치를 번갈아 본다
const toggleScheduleRange = async () => {
  const days = scheduleStore.expanded ? DEFAULT_DAYS : EXPANDED_DAYS;
  try {
    await scheduleStore.fetchSchedules(workationStore.workationId, days);
  } catch (error) {
    showError(error, '일정을 불러오지 못했습니다.');
  }
};

// 예약과 일정은 상세 화면이 다르다.
// 삭제는 스케줄러가 아니라 각 상세에서 한다
const goScheduleItem = (item) => {
  if (item.itemType === 'RESERVATION') {
    router.push(`/reservations/${item.reservationId}`);
    return;
  }
  router.push(
    `/workation/${workationStore.workationId}/schedules/${item.scheduleId}`,
  );
};

// 진행 중 워케이션이 없을 때만 쓰는 자료.
// 있을 때는 화면에 나오지 않으므로 아예 받지 않는다
const popularMerchants = ref([]);
const bookmarks = ref([]);

const sortedRegions = computed(() => workationStore.sortedRegions);

// 가장 최근에 정산을 마친 워케이션 하나. 이 값의 유무로 처음인지 재방문인지 가른다
const lastRecord = computed(() => workationStore.records[0] ?? null);

const loadEmptyHome = async () => {
  // 하나가 실패해도 나머지는 보여준다
  await Promise.all([
    workationStore.fetchRegions().catch(() => {}),
    workationStore.fetchRecords(0, 1),
    ensureCards().catch(() => {}),
    fetchPopularPlaces({ size: 10 }).then((places) => {
      popularMerchants.value = places;
    }),
    getBookmarks({ size: '10' })
      .then(({ data }) => {
        bookmarks.value = data?.content ?? [];
      })
      .catch(() => {}),
  ]);
};

const loadHome = async () => {
  loading.value = true;

  // 안 읽은 알림 개수는 배지에만 쓰인다. 기다리지 않고 뒤에서 받는다
  notificationStore.fetchUnreadCount();

  await workationStore.fetchCurrent();
  pageError.value = workationStore.error;

  // fetchCurrent 자체가 실패했으면 나머지 화면을 채울 근거가 없다.
  // 여기서 멈춰야 재시도 때마다 예산·설문·지역목록 등을 헛되이 다시 받지 않는다
  if (!pageError.value) {
    if (workationStore.hasActive) {
      await loadSetupState();
    } else {
      await loadEmptyHome();
    }
  }

  loading.value = false;
};

onMounted(loadHome);

// 설문과 예산 배분 중 하나라도 안 끝났으면 미완으로 본다
const surveyDone = computed(() => surveyStore.hasAnswered);

const budgetDone = computed(
  () =>
    budgetStore.itemsOf('WORK').length > 0 &&
    budgetStore.itemsOf('PERSONAL').length > 0,
);

const setupIncomplete = computed(
  () => Boolean(current.value) && (!surveyDone.value || !budgetDone.value),
);

const incompleteMessage = computed(() => {
  if (!surveyDone.value) return '취향 설문을 마쳐야 숙소를 추천받을 수 있어요';
  return '예산을 카테고리별로 나눠야 지출을 기록할 수 있어요';
});

// 미완인 단계로 바로 데려간다.
//
// step=create 를 붙이지 않는다. 그 값이 있으면 각 화면이 등록 도중으로 보고
// 뒤로가기에 "등록을 취소할까요?" 를 띄우며 워케이션을 삭제한다.
// 여기서 들어오는 것은 이미 만들어진 워케이션을 채우러 오는 보완이라
// 취소를 제안할 자리가 아니고, 저장하면 홈으로 돌아와야 한다
const goIncompleteStep = () => {
  const workationId = workationStore.workationId;
  router.push(
    !surveyDone.value
      ? `/workation/${workationId}/survey`
      : `/workation/${workationId}/budgets`,
  );
};

// 지난 예약까지 모두 보는 화면
const goReservationHistory = () => {
  router.push('/reservations');
};

const goPay = () => {
  router.push('/wallet');
};

const goNotifications = () => {
  router.push('/notifications');
};

// 프로필 → 내 정보 조회 화면
const goProfile = () => {
  router.push('/account/me');
};

const goCreate = () => {
  router.push('/workation/create');
};

// 지자체 지원 제도 안내. 여기서 등록 화면으로 이어진다
const goRegionDetail = (regionId) => {
  router.push(`/workation/regions/${regionId}`);
};

const goRecords = () => {
  router.push('/workation/records');
};

// 정산을 마친 워케이션의 상세는 정산 화면이다. 목록에서 들어가는 곳과 같다
const goRecordDetail = (workationId) => {
  router.push(`/workation/${workationId}/settlement`);
};

// 업종마다 상세 화면이 다르다.
// 숙소·공유오피스는 예약 화면이라 워케이션이 없으면 그쪽에서 막는다
const MERCHANT_DETAIL_PATH = {
  ACCOMMODATION: (id) => `/reservation/accommodations/${id}`,
  OFFICE: (id) => `/reservation/offices/${id}`,
  RESTAURANT: (id) => `/merchants/restaurants/${id}`,
  ACTIVITY: (id) => `/merchants/activities/${id}`,
};

const goMerchantDetail = (merchant) => {
  const toPath = MERCHANT_DETAIL_PATH[merchant?.category];
  if (!toPath || !merchant?.merchantId) return;
  router.push(toPath(merchant.merchantId));
};

const goEdit = () => {
  router.push(`/workation/${workationStore.workationId}/edit`);
};

// 워케이션에 딸린 store 를 한 번에 비운다
const clearWorkationStores = () => {
  budgetStore.reset();
  expenseStore.reset();
  scheduleStore.reset();
  settlementStore.reset();
};

const upcomingMessage = computed(
  () =>
    `${reservationSummaryText(reservationCheck.value?.upcoming)}이 남아 있어요. 필요하면 예약 내역에서 직접 취소해 주세요.`,
);


// 삭제를 먼저 하고, 남은 예약이 있으면 그 뒤에 알려준다.
//
// 예약 취소는 예약 파트의 정책이라 워케이션이 막을 일이 아니다.
// 날짜만 보고 막으면 취소가 안 되는 예약에 걸린 사용자가 삭제도 못 하게 갇힌다.
const checkBeforeDelete = async () => {
  if (deleting.value) return;

  deleting.value = true;
  try {
    // 삭제하면 예약 연결이 끊겨 조회할 수 없으므로 먼저 확인해 둔다
    reservationCheck.value = await workationStore
      .checkReservations(workationStore.workationId)
      .catch(() => null);

    await workationStore.deleteWorkation(workationStore.workationId);

    // 워케이션이 사라졌으므로 딸린 store 도 비운다.
    // 남겨 두면 다음 워케이션을 등록했을 때 이전 예산·지출이 잠깐 보인다
    clearWorkationStores();

    confirmOpen.value = false;

    // 삭제 전엔 진행 중 워케이션이 있어 loadSetupState 만 돌았을 뿐, 빈 홈 화면 자료
    // (찜한 장소·인기 장소·지역·최근 기록)는 아직 한 번도 받은 적이 없다.
    // current 가 반응형으로 null 이 되며 화면은 바로 빈 홈으로 바뀌므로 여기서 채워 둔다
    if (!workationStore.hasActive) {
      loading.value = true;
      await loadEmptyHome();
      loading.value = false;
    }

    // 아직 이용하지 않은 예약이 남아 있으면 예약 내역으로 안내한다
    const upcoming = reservationCheck.value?.upcoming;
    if (upcoming && upcoming.room + upcoming.office > 0) {
      upcomingOpen.value = true;
    }
  } catch (error) {
    confirmOpen.value = false;

    // 다른 기기에서 이미 지웠거나 정산이 끝난 경우. 화면을 새로 맞춰 준다
    const errorCode = error.response?.data?.errorCode;
    if (errorCode === 'WORKATION_NOT_FOUND') {
      clearWorkationStores();
      await workationStore.fetchCurrent();
      pageError.value = workationStore.error;
      showError(error, '이미 삭제된 워케이션입니다.');

      if (!pageError.value && !workationStore.hasActive) {
        loading.value = true;
        await loadEmptyHome();
        loading.value = false;
      }
      return;
    }

    showError(error, '워케이션을 삭제하지 못했습니다.');
  } finally {
    deleting.value = false;
  }
};

const goReservationsToCancel = () => {
  upcomingOpen.value = false;
  router.push('/reservations');
};

// 예산 화면은 법인 탭으로 열린다. 예산 유형은 그 화면에서 바꾼다
const goBudgetDetail = () => {
  router.push(`/workation/${workationStore.workationId}/budgets`);
};

// 확인이 필요한 건만 걸러 보여준다
const goUncheckedExpenses = () => {
  router.push(
    `/workation/${workationStore.workationId}/expenses?uncheckedOnly=true`,
  );
};

// 예약과 추천을 한 화면에서 고른다
const goReservations = () => {
  router.push('/reservation/merchants');
};

const goExpenses = () => {
  router.push(`/workation/${workationStore.workationId}/expenses`);
};

const goSettlement = () => {
  router.push(`/workation/${workationStore.workationId}/settlement`);
};
</script>
