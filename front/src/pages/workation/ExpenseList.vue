<template>
  <div class="min-h-screen bg-white px-5 pt-4 pb-8">
    <header class="relative mb-4 flex items-center justify-center">
      <button class="absolute left-0 text-xl text-slate-900" @click="goBack">
        ‹
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

      <button
        v-for="category in filterCategories"
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

    <p class="mt-3 text-xs text-slate-400">
      총 {{ summary.totalCount }}건 · {{ won(summary.totalAmount) }}
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
      <ExpenseListItem
        v-for="expense in expenses"
        :key="expense.expenseId"
        :expense="expense"
        @click="goDetail"
      />
    </div>

    <div
      v-if="totalPages > 1"
      class="mt-5 flex items-center justify-center gap-4"
    >
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

    <Button class="mt-8 h-12 w-full rounded-xl text-base" @click="goCreate">
      지출 내역 추가하기
    </Button>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import { getExpenses } from '@/api/expense';
import { useCategoryStore } from '@/stores/categoryStore';
import { useErrorToast } from '@/composables/useErrorToast';
import { won } from '@/components/workation/format';
import ExpenseListItem from '@/components/workation/ExpenseListItem.vue';

const TABS = [
  { value: null, label: '전체' },
  { value: 'WORK', label: '법인' },
  { value: 'PERSONAL', label: '개인' },
];

const route = useRoute();
const router = useRouter();
const categoryStore = useCategoryStore();
const { showError } = useErrorToast();

const workationId = route.params.workationId;

// 필터와 페이지를 쿼리에 담아 둔다
// 상세 화면에 갔다 돌아와도 보던 탭과 페이지가 유지된다
const budgetType = ref(
  TABS.some((tab) => tab.value === route.query.budgetType)
    ? route.query.budgetType
    : null,
);
const uncheckedOnly = ref(route.query.uncheckedOnly === 'true');
const categoryId = ref(
  route.query.categoryId ? Number(route.query.categoryId) : null,
);

const PAGE_SIZE = 10;

const loading = ref(true);
const expenses = ref([]);
const summary = ref({ totalCount: 0, totalAmount: 0, uncheckedCount: 0 });
const page = ref(Number(route.query.page ?? 0));
const totalElements = ref(0);

const totalPages = computed(() => Math.ceil(totalElements.value / PAGE_SIZE));
const hasPrev = computed(() => page.value > 0);
const hasNext = computed(() => page.value + 1 < totalPages.value);

// 예산 유형을 고르지 않았을 때는 필터 칩을 법인 기준으로 보여준다
const filterCategories = computed(() =>
  categoryStore.defaultCategoriesOf(budgetType.value ?? 'WORK'),
);

const loadExpenses = async () => {
  loading.value = true;
  try {
    const { data } = await getExpenses(workationId, {
      budgetType: budgetType.value ?? undefined,
      expenseCategoryId: categoryId.value ?? undefined,
      uncheckedOnly: uncheckedOnly.value ? true : undefined,
      page: page.value,
      size: PAGE_SIZE,
    });
    expenses.value = data.expenses?.content ?? [];
    totalElements.value = data.expenses?.totalElements ?? 0;
    summary.value = data.summary ?? summary.value;
  } catch (error) {
    showError(error, '지출 목록을 불러오지 못했습니다.');
    expenses.value = [];
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
  await Promise.all([
    categoryStore.fetchCategories('WORK'),
    categoryStore.fetchCategories('PERSONAL'),
  ]);
  await loadExpenses();
});

// 예산 유형이 바뀌면 카테고리 마스터가 달라지므로 카테고리 필터를 푼다
const changeBudgetType = async (value) => {
  budgetType.value = value;
  categoryId.value = null;
  await reload();
};

const toggleUnchecked = async () => {
  uncheckedOnly.value = !uncheckedOnly.value;
  await reload();
};

const toggleCategory = async (value) => {
  categoryId.value = categoryId.value === value ? null : value;
  await reload();
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
  router.push('/workation');
};
</script>
