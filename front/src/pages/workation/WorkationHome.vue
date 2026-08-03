<template>
  <div class="min-h-screen bg-white px-5 pt-4 pb-8">
    <header class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-bold text-slate-900">나의 워케이션</h1>
    </header>

    <p v-if="loading" class="py-20 text-center text-sm text-slate-400">불러오는 중...</p>

    <p v-else-if="errorMessage" class="py-20 text-center text-sm text-red-500">
      {{ errorMessage }}
    </p>

    <template v-else-if="current">
      <WorkationProgressCard :workation="current.workation" />

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
        >
          <!-- 아이콘 자리. 전 화면 아이콘 작업 때 채운다 -->
          <span class="h-5 w-5 rounded bg-slate-200" />
          지출
        </button>
        <button
          class="flex flex-col items-center gap-2 rounded-xl border border-slate-200 py-5 text-xs text-slate-500"
        >
          <!-- 아이콘 자리. 전 화면 아이콘 작업 때 채운다 -->
          <span class="h-5 w-5 rounded bg-slate-200" />
          정산
        </button>
      </div>
    </template>

    <section v-if="records.length > 0" class="mt-6">
      <h3 class="mb-2 text-sm font-bold text-slate-900">워케이션 정산기록 보기</h3>
      <div class="space-y-2">
        <SettlementRecordItem
          v-for="record in records"
          :key="record.id"
          :record="record"
          @click="goRecord"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { getCurrentWorkation, getWorkations } from '@/api/workation';
import WorkationProgressCard from '@/components/workation/WorkationProgressCard.vue';
import BudgetUsageCard from '@/components/workation/BudgetUsageCard.vue';
import UncheckedExpenseAlert from '@/components/workation/UncheckedExpenseAlert.vue';
import SettlementRecordItem from '@/components/workation/SettlementRecordItem.vue';

const current = ref(null);
const records = ref([]);
const loading = ref(true);
const errorMessage = ref('');

// 진행 중 워케이션이 없으면 404 가 오므로 목록 조회와 분리해서 처리한다
const loadCurrent = async () => {
  try {
    const { data } = await getCurrentWorkation();
    current.value = data;
  } catch (error) {
    if (error.response?.status === 404) {
      current.value = null;
      return;
    }
    errorMessage.value = error.message;
  }
};

// 목록 API 는 정산 완료 건만 최신순으로 내려준다
const loadRecords = async () => {
  try {
    const { data } = await getWorkations({ page: 0, size: 10 });
    records.value = data.content ?? [];
  } catch {
    records.value = [];
  }
};

onMounted(async () => {
  await Promise.all([loadCurrent(), loadRecords()]);
  loading.value = false;
});

// 이동할 화면이 아직 없다. 해당 화면을 만들 때 router.push 로 연결한다
const goBudgetDetail = () => {};

const goUncheckedExpenses = () => {};

const goRecord = () => {};
</script>
