<template>
  <div class="min-h-screen bg-white px-5 pt-4 pb-8">
    <div class="mb-4">
      <BaseHeader
        :title="settled ? '지난 워케이션 상세' : '정산 내역 보기'"
        @back="goBack"
      >
        <template v-if="settled" #right>
          <button
            class="text-slate-400"
            aria-label="기록 삭제"
            @click="removeOpen = true"
          >
            <Trash2 class="h-5 w-5" />
          </button>
        </template>
      </BaseHeader>
    </div>

    <LoadingScreen v-if="loading" title="정산 정보를 불러오고 있어요" />

    <template v-else-if="workation">
      <!-- 정산이 끝난 워케이션은 기록 카드 형태로 보여준다 -->
      <section
        v-if="settled"
        class="rounded-2xl bg-slate-800 px-4 py-4 text-white"
      >
        <div class="flex items-start justify-between">
          <span
            class="rounded-md bg-blue-600 px-2 py-1 text-[11px] font-semibold"
          >
            정산완료
          </span>
          <span class="text-xs text-slate-300">{{ settledAtText }} 정산</span>
        </div>

        <h2 class="mt-2 text-xl font-bold">{{ workation.title }}</h2>
        <p class="mt-1 text-xs text-slate-300">
          {{ workation.region?.name }} · {{ dotDate(workation.startDate) }} ~
          {{ dotDate(workation.endDate) }} ({{ workation.totalDays }}일)
        </p>
      </section>

      <template v-else>
        <h2 class="text-sm font-bold text-slate-900">{{ workation.title }}</h2>
        <p class="text-xs text-slate-400">
          {{ dotDate(workation.startDate) }} ~
          {{ dotDate(workation.endDate) }} ({{ workation.totalDays }}일)
        </p>
      </template>

      <div class="mt-4 grid grid-cols-2 rounded-xl bg-blue-50 p-1">
        <button
          v-for="tab in TABS"
          :key="tab.value"
          class="rounded-lg py-2 text-sm font-bold"
          :class="
            budgetType === tab.value
              ? 'bg-white text-blue-600'
              : 'text-slate-400'
          "
          @click="budgetType = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <section class="mt-4 rounded-xl bg-blue-50 px-4 py-4">
        <p class="text-xs text-slate-500">{{ currentTab.summaryLabel }}</p>
        <p class="mt-1 text-2xl font-bold text-slate-900">
          {{ won(current.totalAmount) }}
        </p>
        <div
          class="mt-1 flex items-baseline justify-between text-xs text-slate-400"
        >
          <span>총 {{ current.totalCount }}건</span>
          <span>예산 {{ won(budgetTotal) }} · {{ usageRate }}%</span>
        </div>
      </section>

      <section class="mt-5">
        <div class="flex items-baseline justify-between">
          <h3 class="text-sm font-bold text-slate-900">
            {{ isWork ? '계정과목별 내역' : '항목별 사용 내역' }}
          </h3>
          <span v-if="isWork" class="text-xs text-slate-400">배정 / 집행</span>
        </div>

        <div class="divide-y divide-slate-100">
          <SettlementCategoryItem
            v-for="item in current.categories"
            :key="item.expenseCategoryId"
            :item="item"
            :show-target="isWork"
            :total-amount="Number(current.totalAmount)"
          />
        </div>
      </section>

      <!-- 회사 제출용이라 법인 내역에서만, 아직 정산 전일 때만 안내한다 -->
      <button
        v-if="isWork && !settled && validation.uncheckedCount > 0"
        class="mt-4 flex w-full items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left"
        @click="goUncheckedExpenses"
      >
        <span
          class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white"
        >
          !
        </span>

        <span class="flex-1">
          <span class="block text-sm font-bold text-slate-900">
            계정과목을 확인하지 않은 지출 {{ validation.uncheckedCount }}건
          </span>
          <span class="block text-xs text-slate-500">
            회사에 제출하기 전에 분류를 확인해 주세요
          </span>
        </span>

        <span class="shrink-0 text-xs font-bold text-red-500"
          >처리하러 가기 ›</span
        >
      </button>

      <!--
        회사에 제출하기 전이 유일하게 정리가 의미 있는 순간이다.
        빠뜨리면 받을 돈을 못 받으므로 이때 한 번만 권한다.
      -->
      <SettlementClaimPrompt
        v-if="isWork && !settled"
        :workation-id="workationId"
        @claimed="loadSettlement"
      />

      <div v-if="!isWork" class="mt-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-xl bg-slate-50 px-4 py-3">
            <p class="text-xs text-slate-400">하루 평균</p>
            <p class="mt-0.5 text-sm font-bold text-slate-900">
              {{ won(dailyAverage) }}
            </p>
          </div>
          <div class="rounded-xl bg-slate-50 px-4 py-3">
            <p class="text-xs text-slate-400">안 쓴 날</p>
            <p class="mt-0.5 text-sm font-bold text-slate-900">
              {{ current.noSpendDayCount }}일
            </p>
          </div>
        </div>
      </div>

      <!-- 회사 제출용 문서라 법인 내역에서만 내려받는다 -->
      <div v-if="isWork" class="mt-5 grid grid-cols-2 gap-2">
        <BaseButton
          variant="outline"
          class="h-11 rounded-xl text-sm"
          :disabled="downloading"
          @click="downloadExcel"
        >
          세부내역 Excel 저장
        </BaseButton>
        <BaseButton
          variant="outline"
          class="h-11 rounded-xl text-sm"
          :disabled="downloading"
          @click="downloadPdf"
        >
          증빙자료 PDF 저장
        </BaseButton>
      </div>

      <BaseButton
        v-if="!settled"
        variant="default"
        class="mt-4 h-12 w-full rounded-xl text-base"
        @click="confirmOpen = true"
      >
        워케이션 완료 처리
      </BaseButton>
    </template>

    <BaseConfirmModal
      :visible="confirmOpen"
      title="워케이션을 완료할까요?"
      :message="confirmMessage"
      :loading="settling"
      @confirm="settle"
      @cancel="confirmOpen = false"
    />

    <BaseConfirmModal
      :visible="removeOpen"
      title="워케이션 기록을 삭제할까요?"
      message="지출 내역과 정산 자료가 모두 사라집니다. 되돌릴 수 없어요."
      :loading="removing"
      @confirm="checkBeforeRemove"
      @cancel="removeOpen = false"
    />

    <BaseConfirmModal
      :visible="upcomingOpen"
      title="예약을 먼저 취소해 주세요"
      :message="upcomingMessage"
      confirm-label="예약 확인하러 가기"
      cancel-label="닫기"
      @confirm="goReservationsToCancel"
      @cancel="upcomingOpen = false"
    />

    <BaseConfirmModal
      :visible="ongoingOpen"
      :loading="removing"
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
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { Trash2 } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { useBudgetStore } from '@/stores/budgetStore';
import BaseHeader from '@/components/common/BaseHeader.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import { useExpenseStore } from '@/stores/expenseStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useSettlementStore } from '@/stores/settlementStore';
import { useWorkationStore } from '@/stores/workationStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { useFileDownload } from '@/composables/useFileDownload';
import { useBudgetTypeLabel } from '@/composables/useBudgetTypeLabel';
import {
  dotDate,
  reservationSummaryText,
  won,
} from '@/components/workation/format';
import SettlementCategoryItem from '@/components/workation/SettlementCategoryItem.vue';
import SettlementClaimPrompt from '@/components/workation/SettlementClaimPrompt.vue';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';

const TAB_VALUES = ['WORK', 'PERSONAL'];

const route = useRoute();
const router = useRouter();
const settlementStore = useSettlementStore();
const workationStore = useWorkationStore();
const budgetStore = useBudgetStore();
const expenseStore = useExpenseStore();
const scheduleStore = useScheduleStore();
const { showError } = useErrorToast();
const { download } = useFileDownload();

const workationId = route.params.workationId;

const { workLabel, ensureCards } = useBudgetTypeLabel();

// 법인카드 보유 여부에 따라 법인 / 업무로 갈린다
const TABS = computed(() => [
  {
    value: 'WORK',
    label: `${workLabel.value} 내역`,
    summaryLabel: `${workLabel.value} 사용 합계`,
  },
  { value: 'PERSONAL', label: '개인 내역', summaryLabel: '개인 사용 합계' },
]);

const budgetType = ref(
  TAB_VALUES.includes(route.query.budgetType) ? route.query.budgetType : 'WORK',
);

const loading = ref(true);
const downloading = ref(false);
const settling = ref(false);
const removing = ref(false);
const confirmOpen = ref(false);
const removeOpen = ref(false);

// 삭제는 세 단계다. 확인 → (예약 상태에 따라) 안내 → 실행
const upcomingOpen = ref(false);
const ongoingOpen = ref(false);
const reservationCheck = ref(null);

const { workation, validation } = storeToRefs(settlementStore);

const isWork = computed(() => budgetType.value === 'WORK');

// 정산이 끝난 워케이션은 기록 조회 화면으로 동작한다
const settled = computed(() => settlementStore.settled);

// 2026-05-08T14:20:00 -> 2026.05.08
const settledAtText = computed(() =>
  (workation.value?.settledAt ?? '').split('T')[0].replaceAll('-', '.'),
);

const currentTab = computed(
  () =>
    TABS.value.find((tab) => tab.value === budgetType.value) ?? TABS.value[0],
);

const current = computed(() => settlementStore.summaryOf(budgetType.value));

const budgetTotal = computed(() =>
  settlementStore.budgetTotalOf(budgetType.value),
);

const usageRate = computed(() => {
  if (budgetTotal.value === 0) return 0;
  return Math.round(
    (Number(current.value.totalAmount) / budgetTotal.value) * 100,
  );
});

const dailyAverage = computed(() => {
  const days = workation.value?.totalDays ?? 0;
  if (days === 0) return 0;
  return Math.round(Number(current.value.totalAmount) / days);
});

const confirmMessage = computed(() =>
  validation.value.uncheckedCount > 0
    ? `계정과목을 확인하지 않은 지출이 ${validation.value.uncheckedCount}건 있습니다. 완료하면 더 이상 수정할 수 없어요.`
    : '완료하면 지출을 더 이상 등록하거나 수정할 수 없어요.',
);

// 미분류 건만 걸러 보여준다
const goUncheckedExpenses = () => {
  router.push(
    `/workation/${workationId}/expenses?budgetType=WORK&uncheckedOnly=true`,
  );
};

const loadSettlement = async () => {
  loading.value = true;

  // 직전에 보던 워케이션이 남아 있으면 로딩이 끝나기 전에 그 값이 잠깐 보인다
  settlementStore.reset();

  try {
    await settlementStore.fetchSettlement(workationId);
  } catch (error) {
    // 기록이 사라진 워케이션으로 들어온 경우. 목록으로 돌려보낸다
    if (error.response?.data?.errorCode === 'WORKATION_NOT_FOUND') {
      showError(error, '삭제된 워케이션입니다.');
      router.replace('/workation');
      return;
    }
    showError(error, '정산 내역을 불러오지 못했습니다.');
  } finally {
    loading.value = false;
  }
};

loadSettlement();
ensureCards();

const downloadFile = async (request, fallbackName) => {
  if (downloading.value) return;
  downloading.value = true;
  try {
    const response = await request(workationId, {
      budgetType: budgetType.value,
    });
    download(response, fallbackName);
  } catch (error) {
    showError(error, '파일을 내려받지 못했습니다.');
  } finally {
    downloading.value = false;
  }
};

const downloadExcel = () =>
  downloadFile(settlementStore.downloadExcel, '정산내역.xlsx');
const downloadPdf = () =>
  downloadFile(settlementStore.downloadPdf, '증빙자료.pdf');

const settle = async () => {
  if (settling.value) return;
  settling.value = true;
  try {
    await workationStore.settleWorkation(workationId);

    // 정산이 끝나면 진행 중 워케이션이 사라진다. 딸린 store 도 비운다
    budgetStore.reset();
    expenseStore.reset();
    scheduleStore.reset();

    router.push(`/workation/${workationId}/settlement/complete`);
  } catch (error) {
    const errorCode = error.response?.data?.errorCode;

    // 다른 탭에서 이미 정산을 끝낸 경우. 화면을 기록 조회 모드로 바꿔 준다
    if (errorCode === 'ALREADY_SETTLED') {
      confirmOpen.value = false;
      await loadSettlement();
      showError(error, '이미 정산이 완료된 워케이션입니다.');
      return;
    }

    if (errorCode === 'WORKATION_NOT_FOUND') {
      showError(error, '삭제된 워케이션입니다.');
      router.replace('/workation');
      return;
    }

    showError(error, '워케이션을 완료하지 못했습니다.');
  } finally {
    settling.value = false;
    confirmOpen.value = false;
  }
};

const upcomingMessage = computed(
  () =>
    `${reservationSummaryText(reservationCheck.value?.upcoming)}이 남아있어요. 예약을 먼저 취소해 주세요.`,
);

const ongoingMessage = computed(
  () =>
    `${reservationSummaryText(reservationCheck.value?.ongoing)}이 진행 중이에요. 이미 이용이 시작돼 취소할 수 없어요. 예약 내역은 그대로 남아요.`,
);

// 지우기 전에 예약 상태부터 본다
const checkBeforeRemove = async () => {
  if (removing.value) return;

  removing.value = true;
  try {
    const result = await workationStore.checkReservations(workationId);
    reservationCheck.value = result;
    removeOpen.value = false;

    if (result.upcoming && result.upcoming.room + result.upcoming.office > 0) {
      upcomingOpen.value = true;
      return;
    }

    if (result.ongoing && result.ongoing.room + result.ongoing.office > 0) {
      ongoingOpen.value = true;
      return;
    }

    await remove();
  } catch (error) {
    removeOpen.value = false;
    showError(error, '예약 상태를 확인하지 못했습니다.');
  } finally {
    removing.value = false;
  }
};

const remove = async () => {
  removing.value = true;
  try {
    await workationStore.deleteWorkation(workationId);
    await workationStore.fetchRecords();
    router.push('/workation');
  } catch (error) {
    showError(error, '워케이션 기록을 삭제하지 못했습니다.');
  } finally {
    removing.value = false;
    removeOpen.value = false;
    ongoingOpen.value = false;
  }
};

const goReservationsToCancel = () => {
  upcomingOpen.value = false;
  router.push('/reservations');
};

// 홈에서도 오고 정산기록 목록에서도 오므로 왔던 곳으로 되돌린다.
// 새로고침 등으로 이력이 없으면 홈으로 보낸다
const goBack = () => {
  if (window.history.state?.back) {
    router.back();
    return;
  }
  router.push('/workation');
};
</script>
