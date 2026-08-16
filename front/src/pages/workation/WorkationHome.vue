<template>
  <div class="min-h-screen bg-white px-5 pt-4 pb-8">
    <header class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-bold text-slate-900">나의 워케이션</h1>

      <div class="flex items-center gap-1.5">
        <!-- 지갑(PAY) 진입: 라운드 사각 버튼 -->
        <button
          type="button"
          class="flex h-9 items-center justify-center rounded-lg bg-[#1E4268] px-5 text-[13px] font-extrabold tracking-wide text-white shadow-sm transition-transform active:scale-95"
          aria-label="지갑으로 이동"
          @click="goPay"
        >
          PAY
        </button>
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors active:bg-slate-100"
          aria-label="알림"
          @click="goNotifications"
        >
          <Bell :size="22" />
        </button>
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors active:bg-slate-100"
          aria-label="프로필"
          @click="goProfile"
        >
          <UserRound :size="22" />
        </button>
      </div>
    </header>

    <p v-if="loading" class="py-20 text-center text-sm text-slate-400">
      불러오는 중...
    </p>

    <p v-else-if="errorMessage" class="py-20 text-center text-sm text-red-500">
      {{ errorMessage }}
    </p>

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
        class="mt-5 flex w-full items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left"
        @click="goIncompleteStep"
      >
        <span
          class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white"
        >
          !
        </span>
        <span class="flex-1">
          <span class="block text-sm font-bold text-slate-900">
            아직 설정이 끝나지 않았어요
          </span>
          <span class="block text-xs text-slate-500">
            {{ incompleteMessage }}
          </span>
        </span>
        <span class="shrink-0 text-xs font-bold text-amber-600">
          이어서 설정하기 ›
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
          class="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600"
          @click="goExpenses"
        >
          <ReceiptText class="h-5 w-5" />
          지출 내역 보기
        </button>
        <button
          class="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600"
          @click="goSettlement"
        >
          <FileSpreadsheet class="h-5 w-5" />
          정산 하러 가기
        </button>
      </div>
    </template>

    <WorkationEmptyState v-else @register="goCreate" />

    <section v-if="records.length > 0" class="mt-6">
      <h3 class="mb-2 text-sm font-bold text-slate-900">{{ recordsTitle }}</h3>
      <div class="space-y-2">
        <SettlementRecordItem
          v-for="record in records"
          :key="record.id"
          :record="record"
          @click="goRecord"
        />
      </div>
    </section>

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
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { toast } from 'vue-sonner';
import { Bell, FileSpreadsheet, ReceiptText, UserRound } from '@lucide/vue';
import { useWorkationStore } from '@/stores/workationStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useSettlementStore } from '@/stores/settlementStore';
import { useSurveyStore } from '@/stores/surveyStore';
import {
  useScheduleStore,
  DEFAULT_DAYS,
  EXPANDED_DAYS,
} from '@/stores/scheduleStore';
import { reservationSummaryText } from '@/components/workation/format';
import WorkationProgressCard from '@/components/workation/WorkationProgressCard.vue';
import WorkationScheduler from '@/components/workation/WorkationScheduler.vue';
import UncheckedExpenseAlert from '@/components/workation/UncheckedExpenseAlert.vue';
import SettlementRecordItem from '@/components/workation/SettlementRecordItem.vue';
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
const { showError } = useErrorToast();
const { current, records, error: errorMessage } = storeToRefs(workationStore);

const loading = ref(true);
const confirmOpen = ref(false);
const deleting = ref(false);

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

onMounted(async () => {
  await Promise.all([
    workationStore.fetchCurrent(),
    workationStore.fetchRecords(),
  ]);
  await loadSetupState();
  loading.value = false;
});

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

// 시안 기준으로 진행 중 워케이션이 있을 때와 없을 때 목록 제목이 다르다
const recordsTitle = computed(() =>
  current.value ? '워케이션 정산기록 보기' : '지난 워케이션 정산 보기',
);

const goPay = () => {
  router.push('/wallet');
};

// 알림 화면은 아직 준비 전이라 안내 토스트만 노출
const goNotifications = () => {
  toast('알림 기능은 준비 중이에요');
};

// 프로필 → 내 정보 조회 화면
const goProfile = () => {
  router.push('/account/me');
};

const goCreate = () => {
  router.push('/workation/create');
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
      showError(error, '이미 삭제된 워케이션입니다.');
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

// 지난 워케이션은 정산 화면이 기록 조회 모드로 열린다
const goRecord = (workationId) => {
  router.push(`/workation/${workationId}/settlement`);
};
</script>
