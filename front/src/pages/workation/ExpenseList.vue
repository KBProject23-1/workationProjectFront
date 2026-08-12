<template>
  <div class="min-h-screen bg-white px-5 pt-4 pb-8">
    <header class="relative mb-4 flex items-center justify-center">
      <button
        class="absolute left-0 -ml-2 flex h-11 w-11 items-center justify-center text-slate-900"
        aria-label="뒤로 가기"
        @click="goBack"
      >
        <ChevronLeft class="h-7 w-7" />
      </button>
      <h1 class="text-base font-bold text-slate-900">지출 내역</h1>
    </header>

    <div class="grid grid-cols-3 rounded-xl bg-blue-50 p-1">
      <button
        v-for="tab in TABS"
        :key="tab.label"
        class="rounded-lg py-2 text-sm font-bold"
        :class="
          budgetType === tab.value ? 'bg-white text-blue-600' : 'text-slate-400'
        "
        @click="changeBudgetType(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="mt-3 flex flex-wrap gap-2">
      <button
        v-if="summary.uncheckedCount > 0"
        class="rounded-full border px-3 py-1 text-xs"
        :class="
          uncheckedOnly
            ? 'border-red-300 bg-red-100 text-red-600'
            : 'border-red-200 bg-red-50 text-red-500'
        "
        @click="toggleUnchecked"
      >
        확인 필요 {{ summary.uncheckedCount }}
      </button>

      <!-- 카테고리는 예산 유형별로 다르므로 전체 탭에서는 고를 수 없다 -->
      <button
        v-for="category in budgetType === null ? [] : filterCategories"
        :key="category.id"
        class="rounded-full border px-3 py-1 text-xs"
        :class="
          categoryId === category.id
            ? 'border-blue-300 bg-blue-50 text-blue-600'
            : 'border-slate-200 text-slate-500'
        "
        @click="toggleCategory(category.id)"
      >
        {{ category.name }}
      </button>
    </div>

    <div class="my-5 space-y-5">
      <BudgetUsageCard
        v-for="card in budgetCards"
        :key="card.key"
        :budget="card.budget"
        :title="card.title"
      />
    </div>

    <div class="mt-3 flex items-center justify-between">
      <p class="text-xs text-slate-400">
        <!-- 요약 금액은 워케이션 전체 기준이라 필터를 걸면 건수만 보여준다 -->
        <template v-if="filtered"> 총 {{ totalElements }}건 </template>
        <template v-else-if="selectMode">
          확인이 필요한 지출만 모았어요
        </template>
        <template v-else>
          총 {{ summary.totalCount }}건 · {{ won(summary.totalAmount) }}
        </template>
      </p>

      <!--
        확인 필요 필터를 켰을 때만 보여준다.
        전체 목록에서는 무엇을 확정하는지 알 수 없어 눌러도 헷갈린다
      -->
      <button
        v-if="(uncheckedOnly && summary.uncheckedCount > 0) || selectMode"
        class="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-bold"
        :class="
          selectMode
            ? 'border-slate-300 text-slate-500'
            : 'border-blue-600 bg-blue-600 text-white'
        "
        @click="toggleSelectMode"
      >
        {{ selectMode ? '취소' : '일괄 확인' }}
      </button>
    </div>

    <!-- 아래 항목들과 같은 자리·같은 모양으로 둬야 전체 선택인 걸 바로 안다 -->
    <div v-if="selectMode" class="mt-3 flex items-center gap-2">
      <button
        class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border"
        :class="
          allSelected
            ? 'border-blue-600 bg-blue-600 text-white'
            : 'border-slate-300'
        "
        aria-label="확인 필요 전체 선택"
        @click="toggleAll"
      >
        <Check v-if="allSelected" class="h-4 w-4" />
      </button>

      <span class="text-xs font-bold text-slate-700">전체 선택</span>
      <span class="text-xs text-slate-400">
        {{ expenses.length }}건 중 {{ selectedIds.length }}건 선택
      </span>
    </div>

    <p v-if="selectMode && hasMoreThanLimit" class="mt-1 text-xs text-amber-600">
      한 번에 {{ SELECT_MODE_SIZE }}건까지 처리할 수 있어요. 나머지는 확정 후
      다시 눌러 주세요
    </p>

    <p v-if="loading" class="py-20 text-center text-sm text-slate-400">
      불러오는 중...
    </p>

    <p
      v-else-if="expenses.length === 0"
      class="py-20 text-center text-sm text-slate-400"
    >
      조건에 맞는 지출이 없어요
    </p>

    <div v-else class="mt-2 space-y-2">
      <div
        v-for="expense in expenses"
        :key="expense.expenseId"
        class="flex items-center gap-2"
      >
        <!-- 선택 모드에서는 확인 필요 건만 조회하므로 전부 고를 수 있다 -->
        <button
          v-if="selectMode"
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border"
          :class="
            selectedIds.includes(expense.expenseId)
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-slate-300'
          "
          :aria-label="`${expense.merchantName} 선택`"
          @click="toggleOne(expense.expenseId)"
        >
          <Check
            v-if="selectedIds.includes(expense.expenseId)"
            class="h-4 w-4"
          />
        </button>

        <ExpenseListItem
          class="min-w-0 flex-1"
          :expense="expense"
          @click="goDetail"
        />
      </div>
    </div>

    <div v-if="totalPages > 1" class="mt-5 flex items-center justify-center gap-4">
      <button
        class="text-sm"
        :class="hasPrev ? 'text-slate-500' : 'text-slate-300'"
        :disabled="!hasPrev"
        @click="goPage(page - 1)"
      >
        이전
      </button>

      <span class="text-xs text-slate-400"
        >{{ page + 1 }} / {{ totalPages }}</span
      >

      <button
        class="text-sm"
        :class="hasNext ? 'text-slate-500' : 'text-slate-300'"
        :disabled="!hasNext"
        @click="goPage(page + 1)"
      >
        다음
      </button>
    </div>

    <!-- 선택 모드에서는 확정 버튼만 남긴다. 두 버튼이 나란히 있으면 헷갈린다 -->
    <template v-if="selectMode">
      <Button
        class="mt-8 h-12 w-full rounded-xl text-base"
        :disabled="selectedIds.length === 0 || confirming"
        @click="confirmSelected"
      >
        {{ confirming ? '처리 중...' : `${selectedIds.length}건 확인 완료` }}
      </Button>

      <p class="mt-2 text-center text-xs text-slate-400">
        고른 지출을 지금 카테고리 그대로 확정해요
      </p>
    </template>

    <Button
      v-else
      class="mt-8 h-12 w-full rounded-xl text-base"
      @click="goCreate"
    >
      지출 내역 추가하기
    </Button>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Check, ChevronLeft } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import { storeToRefs } from 'pinia';
import { useExpenseStore } from '@/stores/expenseStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { useBudgetTypeLabel } from '@/composables/useBudgetTypeLabel';
import { won } from '@/components/workation/format';
import BudgetUsageCard from '@/components/workation/BudgetUsageCard.vue';
import ExpenseListItem from '@/components/workation/ExpenseListItem.vue';

const TAB_VALUES = [null, 'WORK', 'PERSONAL'];

const route = useRoute();
const router = useRouter();
const expenseStore = useExpenseStore();
const budgetStore = useBudgetStore();
const { showError } = useErrorToast();

const workationId = route.params.workationId;

// 필터와 페이지를 쿼리에 담아 둔다
// 상세 화면에 갔다 돌아와도 보던 탭과 페이지가 유지된다
const budgetType = ref(
  TAB_VALUES.includes(route.query.budgetType) ? route.query.budgetType : null,
);

const { workLabel, ensureCards } = useBudgetTypeLabel();

// 법인카드 보유 여부에 따라 법인 / 업무로 갈린다
const TABS = computed(() => [
  { value: null, label: '전체' },
  { value: 'WORK', label: workLabel.value },
  { value: 'PERSONAL', label: '개인' },
]);
const uncheckedOnly = ref(route.query.uncheckedOnly === 'true');
const categoryId = ref(
  route.query.categoryId ? Number(route.query.categoryId) : null,
);

const PAGE_SIZE = 10;

// 일괄 확인은 페이지를 나누지 않고 확인 필요 건을 한 화면에 모아 보여준다.
// 페이지를 넘나들며 고르게 하면 "20건 중 몇 건"이 페이지마다 달라져 헷갈린다.
// 서버 상한이 100 이라 그보다 많으면 나눠서 처리하게 안내한다
const SELECT_MODE_SIZE = 100;

const loading = ref(true);
const page = ref(Number(route.query.page ?? 0));

// 일괄 확인 모드. 켜면 항목마다 체크박스가 붙는다
const selectMode = ref(false);
const confirming = ref(false);
const selectedIds = ref([]);

const { expenses, summary, totalPages, totalElements } =
  storeToRefs(expenseStore);

const filtered = computed(
  () =>
    budgetType.value !== null ||
    categoryId.value !== null ||
    uncheckedOnly.value,
);
const { budgets } = storeToRefs(budgetStore);

const typeLabel = (value) =>
  value === 'WORK' ? `${workLabel.value} 예산` : '개인 예산';

// 고른 탭·카테고리에 맞춰 차트를 만든다
// 전체 -> 법인·개인 둘 다 / 법인 -> 법인 하나 / 법인 + 숙박비 -> 숙박비 하나
const budgetCards = computed(() => {
  if (budgetType.value === null) {
    return budgets.value.map((budget) => ({
      key: budget.budgetType,
      title: typeLabel(budget.budgetType),
      budget,
    }));
  }

  const budget = budgetStore.budgetOf(budgetType.value);
  if (!budget) return [];

  const label = typeLabel(budgetType.value);

  if (categoryId.value === null) {
    return [{ key: budget.budgetType, title: label, budget }];
  }

  const item = (budget.items ?? []).find(
    (row) => row.expenseCategoryId === categoryId.value,
  );
  if (!item) return [];

  // 카테고리 예산도 유형 예산과 같은 모양으로 그린다
  return [
    {
      key: `category-${item.expenseCategoryId}`,
      title: item.categoryName,
      budget: {
        budgetType: budget.budgetType,
        budgetTotal: item.targetAmount,
        spentTotal: item.spentAmount,
        remainAmount: Number(item.targetAmount) - Number(item.spentAmount),
        usageRate: item.usageRate,
      },
    },
  ];
});

const hasPrev = computed(() => expenseStore.hasPrev);
const hasNext = computed(() => expenseStore.hasNext);

// 예산에 배정한 카테고리만 필터로 보여준다. 배정하지 않은 카테고리에는 지출이 잡히지 않는다
// 예산 유형을 고르지 않았을 때는 법인 기준으로 보여준다
const filterCategories = computed(() =>
  budgetStore.itemsOf(budgetType.value ?? 'WORK').map((item) => ({
    id: item.expenseCategoryId,
    name: item.categoryName,
  })),
);

const loadExpenses = async () => {
  loading.value = true;
  try {
    // 선택 모드에서도 보던 필터는 그대로 두고, 확인 필요 건만 한 번에 받는다
    const params = selectMode.value
      ? {
          budgetType: budgetType.value ?? undefined,
          expenseCategoryId: categoryId.value ?? undefined,
          uncheckedOnly: true,
          page: 0,
          size: SELECT_MODE_SIZE,
        }
      : {
          budgetType: budgetType.value ?? undefined,
          expenseCategoryId: categoryId.value ?? undefined,
          uncheckedOnly: uncheckedOnly.value ? true : undefined,
          page: page.value,
          size: PAGE_SIZE,
        };

    await expenseStore.fetchExpenses(workationId, params);
  } catch (error) {
    showError(error, '지출 목록을 불러오지 못했습니다.');
  } finally {
    loading.value = false;
  }
};

// 현재 필터·페이지를 주소에 반영한다. 뒤로 돌아왔을 때 같은 화면을 보여주기 위함이다
const syncQuery = () => {
  const query = {};
  if (budgetType.value) query.budgetType = budgetType.value;
  if (uncheckedOnly.value) query.uncheckedOnly = 'true';
  if (categoryId.value) query.categoryId = String(categoryId.value);
  if (page.value > 0) query.page = String(page.value);
  router.replace({ query });
};

// 필터가 바뀌면 결과가 달라지므로 첫 페이지부터 다시 본다
const reload = async () => {
  page.value = 0;
  syncQuery();
  await loadExpenses();
};

const goPage = async (value) => {
  page.value = value;
  syncQuery();
  await loadExpenses();
  window.scrollTo({ top: 0 });
};

onMounted(async () => {
  // 예산을 못 받아도 지출 목록은 보여야 한다
  await Promise.all([
    budgetStore.fetchBudgets(workationId).catch(() => {}),
    ensureCards(),
  ]);
  await loadExpenses();
});

// 예산 유형이 바뀌면 카테고리 마스터가 달라지므로 카테고리 필터를 푼다
const changeBudgetType = async (value) => {
  budgetType.value = value;
  categoryId.value = null;
  await reload();
};

// 칩은 한 번에 하나만 켠다. 다른 칩을 누르면 앞의 것이 풀린다.
// 확인 필요와 카테고리를 겹쳐 걸 수 있으면 지금 무엇으로 걸러진 목록인지 읽기 어렵다
const toggleUnchecked = async () => {
  uncheckedOnly.value = !uncheckedOnly.value;
  categoryId.value = null;
  await reload();
};

const toggleCategory = async (value) => {
  categoryId.value = categoryId.value === value ? null : value;
  uncheckedOnly.value = false;
  await reload();
};

// =====================================================================================
// 일괄 확인
// =====================================================================================

// 선택 모드에서는 확인 필요 건만 조회하므로 조회된 전부가 대상이다
const allSelected = computed(
  () =>
    expenses.value.length > 0 &&
    selectedIds.value.length === expenses.value.length,
);

// 대상이 한 번에 받을 수 있는 양을 넘으면 나눠서 처리해야 한다
const hasMoreThanLimit = computed(
  () => selectMode.value && totalElements.value > SELECT_MODE_SIZE,
);

const toggleSelectMode = async () => {
  selectMode.value = !selectMode.value;
  selectedIds.value = [];

  // 목록 자체가 달라지므로 다시 받아야 한다.
  // 나갈 때는 보던 필터·페이지로 돌아간다
  await loadExpenses();
  window.scrollTo({ top: 0 });
};

const toggleOne = (expenseId) => {
  const index = selectedIds.value.indexOf(expenseId);
  if (index === -1) {
    selectedIds.value.push(expenseId);
    return;
  }
  selectedIds.value.splice(index, 1);
};

const toggleAll = () => {
  selectedIds.value = allSelected.value
    ? []
    : expenses.value.map((expense) => expense.expenseId);
};

const confirmSelected = async () => {
  if (confirming.value || selectedIds.value.length === 0) return;

  confirming.value = true;
  try {
    await expenseStore.confirmExpenses(workationId, [...selectedIds.value]);
    selectMode.value = false;
    selectedIds.value = [];

    // 남은 확인 필요 건이 없으면 필터를 풀어야 한다.
    // 그대로 두면 빈 목록만 보이고 왜 비었는지 알 수 없다
    if (uncheckedOnly.value && summary.value.uncheckedCount === 0) {
      uncheckedOnly.value = false;
      syncQuery();
    }

    // 원래 보던 필터·페이지로 돌아간다
    await loadExpenses();
  } catch (error) {
    showError(error, '확인 처리를 하지 못했습니다.');
  } finally {
    confirming.value = false;
  }
};

// 상세에서 뒤로 돌아올 때 지금 보던 목록으로 오도록 필터를 넘긴다
const goDetail = (expenseId) => {
  router.push({
    path: `/workation/${workationId}/expenses/${expenseId}`,
    query: { from: JSON.stringify(route.query) },
  });
};

const goCreate = () => {
  router.push({
    path: `/workation/${workationId}/expenses/new`,
    query: { from: JSON.stringify(route.query) },
  });
};

const goBack = () => {
  // 일괄 확인 중이면 화면을 벗어나는 게 아니라 모드만 빠져나온다
  if (selectMode.value) {
    toggleSelectMode();
    return;
  }
  router.push('/workation');
};
</script>
