<template>
  <div class="min-h-screen bg-white px-5 pt-4 pb-8">
    <header class="relative mb-4 flex items-center justify-center">
      <button class="absolute left-0 text-xl text-slate-900" @click="goBack">‹</button>
      <h1 class="text-base font-bold text-slate-900">지출 내역</h1>
    </header>

    <div class="grid grid-cols-3 rounded-xl bg-blue-50 p-1">
      <button
        v-for="tab in TABS"
        :key="tab.label"
        class="rounded-lg py-2 text-sm font-bold"
        :class="budgetType === tab.value ? 'bg-white text-blue-600' : 'text-slate-400'"
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

    <p v-if="loading" class="py-20 text-center text-sm text-slate-400">불러오는 중...</p>

    <p v-else-if="expenses.length === 0" class="py-20 text-center text-sm text-slate-400">
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

const budgetType = ref(null);
// 메인화면의 "확인이 필요한 지출" 알림으로 들어오면 그 필터가 켜진 채로 시작한다
const uncheckedOnly = ref(route.query.uncheckedOnly === 'true');
const categoryId = ref(null);

const loading = ref(true);
const expenses = ref([]);
const summary = ref({ totalCount: 0, totalAmount: 0, uncheckedCount: 0 });

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
      page: 0,
      size: 50,
    });
    expenses.value = data.expenses?.content ?? [];
    summary.value = data.summary ?? summary.value;
  } catch (error) {
    showError(error, '지출 목록을 불러오지 못했습니다.');
    expenses.value = [];
  } finally {
    loading.value = false;
  }
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
  await loadExpenses();
};

const toggleUnchecked = async () => {
  uncheckedOnly.value = !uncheckedOnly.value;
  await loadExpenses();
};

const toggleCategory = async (value) => {
  categoryId.value = categoryId.value === value ? null : value;
  await loadExpenses();
};

const goDetail = (expenseId) => {
  router.push(`/workation/${workationId}/expenses/${expenseId}`);
};

const goCreate = () => {
  router.push(`/workation/${workationId}/expenses/new`);
};

const goBack = () => {
  router.push('/workation');
};
</script>
