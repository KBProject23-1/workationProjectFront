<template>
  <div class="bg-canvas flex min-h-screen flex-col px-4 pt-4 pb-8">
    <div class="mb-4 px-1">
      <BaseHeader title="지출 내역" @back="goBack" />
    </div>

    <div class="rounded-card bg-surface shadow-card grid grid-cols-3 p-1">
      <button
        v-for="tab in TABS"
        :key="tab.label"
        class="text-body-sm rounded-chip py-2 font-bold transition-colors"
        :class="
          budgetType === tab.value
            ? 'bg-brand text-white'
            : 'text-ink-mute'
        "
        @click="changeBudgetType(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="mt-3 flex flex-wrap gap-2">
      <button
        v-if="summary.uncheckedCount > 0"
        class="text-body-sm rounded-full px-3 py-1.5 font-bold transition-colors"
        :class="
          uncheckedOnly ? 'bg-danger text-white' : 'bg-danger/10 text-danger'
        "
        @click="toggleUnchecked"
      >
        확인 필요 {{ summary.uncheckedCount }}
      </button>

      <!-- 카테고리는 예산 유형별로 다르므로 전체 탭에서는 고를 수 없다 -->
      <button
        v-for="category in budgetType === null ? [] : filterCategories"
        :key="category.id"
        class="text-body-sm rounded-full px-3 py-1.5 font-bold transition-colors"
        :class="
          categoryId === category.id
            ? 'bg-brand text-white'
            : 'bg-surface shadow-card text-ink-sub'
        "
        @click="toggleCategory(category.id)"
      >
        {{ category.name }}
      </button>
    </div>

    <div class="mt-4 space-y-3">
      <BudgetUsageCard
        v-for="card in budgetCards"
        :key="card.key"
        :budget="card.budget"
        :title="card.title"
      />
    </div>

    <div class="mt-5 flex items-center justify-between gap-3 px-1">
      <p class="text-body-sm min-w-0 text-ink-sub">
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
        class="text-body-sm rounded-chip shrink-0 px-3.5 py-2 font-bold"
        :class="
          selectMode
            ? 'bg-surface shadow-card text-ink-sub'
            : 'bg-brand shadow-cta text-white'
        "
        @click="toggleSelectMode"
      >
        {{ selectMode ? '취소' : '일괄 확인' }}
      </button>
    </div>

    <!-- 아래 항목들과 같은 자리·같은 모양으로 둬야 전체 선택인 걸 바로 안다 -->
    <div v-if="selectMode" class="mt-3 flex items-center gap-2 px-1">
      <button
        class="border-line flex h-6 w-6 shrink-0 items-center justify-center rounded-full border"
        :class="allSelected ? 'border-brand bg-brand text-white' : 'bg-surface'"
        aria-label="확인 필요 전체 선택"
        @click="toggleAll"
      >
        <Check v-if="allSelected" :size="15" />
      </button>

      <span class="text-body-sm font-bold text-ink">전체 선택</span>
      <span class="text-body-sm text-ink-mute">
        {{ expenses.length }}건 중 {{ selectedIds.length }}건 선택
      </span>
    </div>

    <p
      v-if="selectMode && hasMoreThanLimit"
      class="text-body-sm text-warn mt-2 px-1"
    >
      한 번에 {{ SELECT_MODE_SIZE }}건까지 처리할 수 있어요. 나머지는 확정 후
      다시 눌러 주세요
    </p>

    <LoadingScreen v-if="loading" title="사용내역을 불러오고 있어요" :fullscreen="false" />

    <BaseEmptyState v-else-if="expenses.length === 0" title="조건에 맞는 지출이 없어요" />

    <div v-else class="mt-3 space-y-2.5">
      <div
        v-for="expense in expenses"
        :key="expense.expenseId"
        class="flex items-center gap-2"
      >
        <!-- 선택 모드에서는 확인 필요 건만 조회하므로 전부 고를 수 있다 -->
        <button
          v-if="selectMode"
          class="border-line flex h-6 w-6 shrink-0 items-center justify-center rounded-full border"
          :class="
            selectedIds.includes(expense.expenseId)
              ? 'border-brand bg-brand text-white'
              : 'bg-surface'
          "
          :aria-label="`${expense.merchantName} 선택`"
          @click="toggleOne(expense.expenseId)"
        >
          <Check v-if="selectedIds.includes(expense.expenseId)" :size="15" />
        </button>

        <ExpenseListItem
          class="min-w-0 flex-1"
          :expense="expense"
          @click="goDetail"
        />
      </div>
    </div>

    <div
      v-if="totalPages > 1"
      class="mt-6 flex items-center justify-center gap-5"
    >
      <button
        class="text-body-sm font-bold"
        :class="hasPrev ? 'text-ink-sub' : 'text-ink-mute/50'"
        :disabled="!hasPrev"
        @click="goPage(page - 1)"
      >
        이전
      </button>

      <span class="text-body-sm text-ink-mute">
        {{ page + 1 }} / {{ totalPages }}
      </span>

      <button
        class="text-body-sm font-bold"
        :class="hasNext ? 'text-ink-sub' : 'text-ink-mute/50'"
        :disabled="!hasNext"
        @click="goPage(page + 1)"
      >
        다음
      </button>
    </div>

    <!-- 선택 모드에서는 확정 버튼만 남긴다. 두 버튼이 나란히 있으면 헷갈린다 -->
    <template v-if="selectMode">
      <BaseButton
        variant="default"
        class="mt-8 w-full"
        :disabled="selectedIds.length === 0 || confirming"
        @click="confirmSelected"
      >
        {{ confirming ? '처리 중...' : `${selectedIds.length}건 확인 완료` }}
      </BaseButton>

      <p class="text-body-sm mt-2.5 text-center text-ink-mute">
        고른 지출을 지금 카테고리 그대로 확정해요
      </p>
    </template>

    <BaseButton
      v-else
      variant="default"
      class="mt-8 w-full"
      @click="goCreate"
    >
      지출 내역 추가하기
    </BaseButton>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Check } from '@lucide/vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { storeToRefs } from 'pinia';
import { useExpenseStore } from '@/stores/expenseStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { useBudgetTypeLabel } from '@/composables/useBudgetTypeLabel';
import { won } from '@/components/workation/format';
import BudgetUsageCard from '@/components/workation/BudgetUsageCard.vue';
import ExpenseListItem from '@/components/workation/ExpenseListItem.vue';
import BaseHeader from '@/components/common/BaseHeader.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import BaseEmptyState from '@/components/common/BaseEmptyState.vue';

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
    // 워케이션이 사라졌으면 이 목록이 성립하지 않는다
    if (error.response?.data?.errorCode === 'WORKATION_NOT_FOUND') {
      showError(error, '삭제된 워케이션입니다.');
      router.replace('/workation');
      return;
    }
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
    // 정산이 끝난 뒤에는 확인 처리를 할 수 없다. 선택 모드를 풀고 목록을 새로 받는다
    if (error.response?.data?.errorCode === 'ALREADY_SETTLED') {
      selectMode.value = false;
      selectedIds.value = [];
      await loadExpenses();
      showError(error, '이미 정산이 완료된 워케이션입니다.');
      return;
    }
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
