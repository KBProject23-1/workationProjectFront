import { defineStore } from 'pinia';
import {
  getExpenses,
  getExpenseDetail,
  createExpense as createExpenseApi,
  updateExpense as updateExpenseApi,
  deleteExpense as deleteExpenseApi,
  updateExpenseCategory as updateExpenseCategoryApi,
  updateExpenseBudgetType as updateExpenseBudgetTypeApi,
} from '@/api/expense';
import { useBudgetStore } from '@/stores/budgetStore';
import { useWorkationStore } from '@/stores/workationStore';

export const useExpenseStore = defineStore('expense', {
  state: () => ({
    expenses: [],
    // 요약은 필터와 무관하게 워케이션 전체 기준이다
    summary: { totalCount: 0, totalAmount: 0, uncheckedCount: 0 },
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    detail: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    hasPrev: (state) => state.page > 0,
    hasNext: (state) => state.page + 1 < state.totalPages,
    availableCategories: (state) => state.detail?.availableCategories ?? [],
  },

  actions: {
    async fetchExpenses(workationId, params = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await getExpenses(workationId, params);
        this.expenses = data.expenses?.content ?? [];
        this.page = data.expenses?.page ?? 0;
        this.size = data.expenses?.size ?? this.size;
        this.totalElements = data.expenses?.totalElements ?? 0;
        this.totalPages = data.expenses?.totalPages ?? 0;
        this.summary = data.summary ?? this.summary;
        return this.expenses;
      } catch (err) {
        this.error = err.message;
        this.expenses = [];
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchDetail(expenseId) {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await getExpenseDetail(expenseId);
        this.detail = data;
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    // 지출이 바뀌면 예산 사용현황과 메인화면 요약도 함께 갱신한다
    async refreshRelated(workationId) {
      const budgetStore = useBudgetStore();
      const workationStore = useWorkationStore();
      await Promise.all([
        budgetStore.fetchBudgets(workationId).catch(() => {}),
        workationStore.fetchCurrent(),
      ]);
    },

    async createExpense(workationId, payload) {
      try {
        const { data } = await createExpenseApi(workationId, payload);
        await this.refreshRelated(workationId);
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    async updateExpense(workationId, expenseId, payload) {
      try {
        const { data } = await updateExpenseApi(expenseId, payload);
        this.detail = data;
        await this.refreshRelated(workationId);
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    async deleteExpense(workationId, expenseId) {
      try {
        await deleteExpenseApi(expenseId);
        this.expenses = this.expenses.filter(
          (expense) => expense.expenseId !== Number(expenseId),
        );
        this.detail = null;
        await this.refreshRelated(workationId);
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    async changeCategory(
      workationId,
      expenseId,
      expenseCategoryId,
      applyToMerchant = true,
    ) {
      try {
        const { data } = await updateExpenseCategoryApi(
          expenseId,
          expenseCategoryId,
          applyToMerchant,
        );
        await Promise.all([
          this.fetchDetail(expenseId),
          this.refreshRelated(workationId),
        ]);
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    async changeBudgetType(
      workationId,
      expenseId,
      budgetType,
      expenseCategoryId,
    ) {
      try {
        const { data } = await updateExpenseBudgetTypeApi(
          expenseId,
          budgetType,
          expenseCategoryId,
        );
        await Promise.all([
          this.fetchDetail(expenseId),
          this.refreshRelated(workationId),
        ]);
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    reset() {
      this.expenses = [];
      this.detail = null;
      this.error = null;
    },
  },
});
