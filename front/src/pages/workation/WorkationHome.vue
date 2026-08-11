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

      <!--
        3/3 직후 팝업은 놓치면 다시 볼 수 없어 홈에도 상시로 둔다.
        예약이 하나라도 생기면 자연히 사라지므로 별도 플래그를 두지 않았다.
      -->
      <button
        v-if="showRecommendCard"
        class="mt-5 flex w-full items-center gap-3 rounded-xl bg-blue-600 px-4 py-4 text-left text-white"
        @click="goRecommendation"
      >
        <span class="flex-1">
          <span class="block text-sm font-bold">
            아직 머물 곳을 안 정하셨네요
          </span>
          <span class="mt-0.5 block text-xs text-blue-100">
            답해주신 취향으로 숙소와 공유오피스를 찾아드려요
          </span>
        </span>
        <span class="shrink-0 text-xs font-bold">추천받기 ›</span>
      </button>

      <div v-if="current.uncheckedExpenseCount > 0" class="mt-5">
        <UncheckedExpenseAlert
          :count="current.uncheckedExpenseCount"
          @click="goUncheckedExpenses"
        />
      </div>

      <div class="mt-4 grid grid-cols-3 gap-3">
        <button
          class="flex flex-col items-center gap-2 rounded-xl border border-slate-200 py-5 text-xs text-slate-500"
          @click="goReservations"
        >
          <CalendarCheck class="h-5 w-5" />
          예약
        </button>
        <button
          class="flex flex-col items-center gap-2 rounded-xl border border-slate-200 py-5 text-xs text-slate-500"
          @click="goExpenses"
        >
          <ReceiptText class="h-5 w-5" />
          지출
        </button>
        <button
          class="flex flex-col items-center gap-2 rounded-xl border border-slate-200 py-5 text-xs text-slate-500"
          @click="goSettlement"
        >
          <FileSpreadsheet class="h-5 w-5" />
          정산
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

    <!-- ② 아직 시작하지 않은 예약이 있으면 사용자가 먼저 취소해야 한다 -->
    <BaseConfirmModal
      :visible="upcomingOpen"
      title="예약을 먼저 취소해 주세요"
      :message="upcomingMessage"
      confirm-label="예약 확인하러 가기"
      cancel-label="닫기"
      @confirm="goReservationsToCancel"
      @cancel="upcomingOpen = false"
    />

    <!-- ③ 이미 시작된 예약은 손댈 수 없으므로 그대로 두고 삭제한다 -->
    <BaseConfirmModal
      :visible="ongoingOpen"
      :loading="deleting"
      title="진행 중인 예약이 있어요"
      :message="ongoingMessage"
      confirm-label="그래도 삭제"
      cancel-label="취소"
      @confirm="remove"
      @cancel="ongoingOpen = false"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { toast } from 'vue-sonner';
import {
  Bell,
  CalendarCheck,
  FileSpreadsheet,
  ReceiptText,
  UserRound,
} from '@lucide/vue';
import { useWorkationStore } from '@/stores/workationStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useSurveyStore } from '@/stores/surveyStore';
import { getReservationList } from '@/api/reservations';
import WorkationProgressCard from '@/components/workation/WorkationProgressCard.vue';
import UncheckedExpenseAlert from '@/components/workation/UncheckedExpenseAlert.vue';
import SettlementRecordItem from '@/components/workation/SettlementRecordItem.vue';
import WorkationEmptyState from '@/components/workation/WorkationEmptyState.vue';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';
import { useErrorToast } from '@/composables/useErrorToast';

const router = useRouter();
const workationStore = useWorkationStore();
const budgetStore = useBudgetStore();
const surveyStore = useSurveyStore();
const { showError } = useErrorToast();
const { current, records, error: errorMessage } = storeToRefs(workationStore);

const loading = ref(true);
const confirmOpen = ref(false);
const deleting = ref(false);

// 예약이 있으면 추천 카드를 감춘다. 목록 전체가 필요하지 않아 건수만 본다
const reservationCount = ref(0);

// 삭제는 세 단계다. 확인 → (예약 상태에 따라) 안내 → 실행
const upcomingOpen = ref(false);
const ongoingOpen = ref(false);
const reservationCheck = ref(null);

const loadSetupState = async () => {
  const workationId = workationStore.workationId;
  if (!workationId) return;

  // 하나가 실패해도 홈은 떠야 하므로 개별로 삼킨다
  await Promise.all([
    budgetStore.fetchBudgets(workationId).catch(() => {}),
    surveyStore.fetchMySurvey().catch(() => {}),
    getReservationList({ workationId })
      .then(({ data }) => {
        reservationCount.value = data?.content?.length ?? 0;
      })
      .catch(() => {}),
  ]);
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

// 미완인 단계로 바로 데려간다
const goIncompleteStep = () => {
  const workationId = workationStore.workationId;
  router.push(
    !surveyDone.value
      ? `/workation/${workationId}/survey?step=create`
      : `/workation/${workationId}/budgets?step=create`,
  );
};

// 설정을 다 마쳤는데 예약이 없으면 추천을 권한다
const showRecommendCard = computed(
  () => !setupIncomplete.value && reservationCount.value === 0,
);

//추천 페이지
const goRecommendation = () => {
  router.push('/recommendation');
};

// 시안 기준으로 진행 중 워케이션이 있을 때와 없을 때 목록 제목이 다르다
const recordsTitle = computed(() =>
  current.value ? '워케이션 정산기록 보기' : '지난 워케이션 정산 보기',
);

const goPay = () => {
  router.push('/wallet');
};

// 알림·프로필 화면은 아직 준비 전이라 안내 토스트만 노출
const goNotifications = () => {
  toast('알림 기능은 준비 중이에요');
};

const goProfile = () => {
  toast('프로필 화면은 준비 중이에요');
};

const goCreate = () => {
  router.push('/workation/create');
};

const goEdit = () => {
  router.push(`/workation/${workationStore.workationId}/edit`);
};

// 숙박 0건, 공유오피스 0건 형태로 풀어 쓴다
const describe = (summary) => {
  if (!summary) return '';
  const parts = [];
  if (summary.room > 0) parts.push(`숙박 예약 ${summary.room}건`);
  if (summary.office > 0) parts.push(`공유오피스 예약 ${summary.office}건`);
  return parts.join(', ');
};

const upcomingMessage = computed(
  () =>
    `${describe(reservationCheck.value?.upcoming)}이 남아있어요. 예약을 먼저 취소해 주세요.`,
);

const ongoingMessage = computed(
  () =>
    `${describe(reservationCheck.value?.ongoing)}이 진행 중이에요. 이미 이용이 시작돼 취소할 수 없어요. 예약 내역은 그대로 남아요.`,
);

// 확인을 누르면 바로 지우지 않고 예약 상태를 먼저 본다.
// 서버도 같은 검증을 하지만, 화면에서 무엇이 걸리는지 구체적으로 알려주려면 미리 알아야 한다
const checkBeforeDelete = async () => {
  if (deleting.value) return;

  deleting.value = true;
  try {
    const result = await workationStore.checkReservations(
      workationStore.workationId,
    );
    reservationCheck.value = result;
    confirmOpen.value = false;

    // 취소할 수 있는 예약이 있으면 사용자가 먼저 정리해야 한다
    if (result.upcoming && result.upcoming.room + result.upcoming.office > 0) {
      upcomingOpen.value = true;
      return;
    }

    // 이미 시작된 예약은 손댈 수 없으니 그대로 두고 지운다는 것만 알린다
    if (result.ongoing && result.ongoing.room + result.ongoing.office > 0) {
      ongoingOpen.value = true;
      return;
    }

    await remove();
  } catch (error) {
    confirmOpen.value = false;
    showError(error, '예약 상태를 확인하지 못했습니다.');
  } finally {
    deleting.value = false;
  }
};

const remove = async () => {
  deleting.value = true;
  try {
    await workationStore.deleteWorkation(workationStore.workationId);
    reservationCount.value = 0;
  } catch (error) {
    showError(error, '워케이션을 삭제하지 못했습니다.');
  } finally {
    deleting.value = false;
    confirmOpen.value = false;
    ongoingOpen.value = false;
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

// 예약 목록은 예약 파트 화면이다
const goReservations = () => {
  router.push('/reservations');
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
