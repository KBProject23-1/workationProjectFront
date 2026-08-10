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
        @edit="goEdit"
        @delete="confirmOpen = true"
      />

      <div class="mt-5 space-y-5">
        <BudgetUsageCard
          v-for="budget in current.budgetSummary"
          :key="budget.budgetType"
          :budget="budget"
          @detail="goBudgetDetail"
        />
      </div>

      <div v-if="current.uncheckedExpenseCount > 0" class="mt-5">
        <UncheckedExpenseAlert
          :count="current.uncheckedExpenseCount"
          @click="goUncheckedExpenses"
        />
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <button
          class="flex flex-col items-center gap-2 rounded-xl border border-slate-200 py-5 text-xs text-slate-500"
          @click="goExpenses"
        >
          <!-- 아이콘 자리 채워야 함 -->
          <span class="h-5 w-5 rounded bg-slate-200" />
          지출
        </button>
        <button
          class="flex flex-col items-center gap-2 rounded-xl border border-slate-200 py-5 text-xs text-slate-500"
          @click="goSettlement"
        >
          <!-- 아이콘 자리 채워야 함 -->
          <span class="h-5 w-5 rounded bg-slate-200" />
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

    <BaseConfirmModal
      :visible="confirmOpen"
      :loading="deleting"
      title="워케이션 삭제"
      message="일정과 예산, 등록한 지출이 모두 삭제됩니다. 삭제하시겠어요?"
      @confirm="remove"
      @cancel="confirmOpen = false"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { toast } from 'vue-sonner';
import { Bell, UserRound } from '@lucide/vue';
import { useWorkationStore } from '@/stores/workationStore';
import WorkationProgressCard from '@/components/workation/WorkationProgressCard.vue';
import BudgetUsageCard from '@/components/workation/BudgetUsageCard.vue';
import UncheckedExpenseAlert from '@/components/workation/UncheckedExpenseAlert.vue';
import SettlementRecordItem from '@/components/workation/SettlementRecordItem.vue';
import WorkationEmptyState from '@/components/workation/WorkationEmptyState.vue';
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue';
import { useErrorToast } from '@/composables/useErrorToast';

const router = useRouter();
const workationStore = useWorkationStore();
const { showError } = useErrorToast();
const { current, records, error: errorMessage } = storeToRefs(workationStore);

const loading = ref(true);
const confirmOpen = ref(false);
const deleting = ref(false);

onMounted(async () => {
  await Promise.all([
    workationStore.fetchCurrent(),
    workationStore.fetchRecords(),
  ]);
  loading.value = false;
});

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

const remove = async () => {
  if (deleting.value) return;

  deleting.value = true;
  try {
    await workationStore.deleteWorkation(workationStore.workationId);
    confirmOpen.value = false;
  } catch (error) {
    showError(error, '워케이션을 삭제하지 못했습니다.');
  } finally {
    deleting.value = false;
  }
};

// 누른 카드의 예산 유형 탭이 열리도록 쿼리로 넘긴다
const goBudgetDetail = (budgetType) => {
  router.push(
    `/workation/${workationStore.workationId}/budgets?budgetType=${budgetType}`,
  );
};

// 확인이 필요한 건만 걸러 보여준다
const goUncheckedExpenses = () => {
  router.push(
    `/workation/${workationStore.workationId}/expenses?uncheckedOnly=true`,
  );
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
