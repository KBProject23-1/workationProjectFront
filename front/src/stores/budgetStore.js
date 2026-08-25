import { defineStore } from 'pinia';
import {
  getBudgetStatus,
  setupBudget as setupBudgetApi,
  updateBudget as updateBudgetApi,
} from '@/api/budget';

export const useBudgetStore = defineStore('budget', {
  state: () => ({
    // 예산 유형별 사용현황. 조회한 워케이션 기준이다
    budgets: [],
    workationId: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    budgetOf: (state) => (budgetType) =>
      state.budgets.find((budget) => budget.budgetType === budgetType) ?? null,
    budgetTotalOf: (state) => (budgetType) =>
      Number(
        state.budgets.find((budget) => budget.budgetType === budgetType)
          ?.budgetTotal ?? 0,
      ),
    itemsOf: (state) => (budgetType) =>
      state.budgets.find((budget) => budget.budgetType === budgetType)?.items ??
      [],
    // 배정 이력이 있으면 설정이 아니라 수정으로 저장해야 한다
    isAssigned: (state) => (budgetType) =>
      (
        state.budgets.find((budget) => budget.budgetType === budgetType)
          ?.items ?? []
      ).length > 0,
  },

  actions: {
    async fetchBudgets(workationId, params) {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await getBudgetStatus(workationId, params);
        this.budgets = data.budgets ?? [];
        this.workationId = workationId;
        return this.budgets;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async setupBudget(workationId, payload) {
      try {
        const { data } = await setupBudgetApi(workationId, payload);
        await this.fetchBudgets(workationId);
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    async updateBudget(workationId, payload) {
      try {
        const { data } = await updateBudgetApi(workationId, payload);
        await this.fetchBudgets(workationId);
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    reset() {
      this.budgets = [];
      this.workationId = null;
      this.error = null;
    },
  },
});
