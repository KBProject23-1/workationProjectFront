import { defineStore } from 'pinia';
import {
  getSettlement,
  downloadSettlementExcel,
  downloadSettlementPdf,
} from '@/api/settlement';

const EMPTY_SUMMARY = {
  totalAmount: 0,
  totalCount: 0,
  spentDayCount: 0,
  noSpendDayCount: 0,
  categories: [],
};

export const useSettlementStore = defineStore('settlement', {
  state: () => ({
    workation: null,
    settlements: [],
    validation: { uncheckedCount: 0, canProceed: true, message: '' },
    isLoading: false,
    error: null,
  }),

  getters: {
    settled: (state) => state.workation?.status === 'SETTLED',
    summaryOf: (state) => (budgetType) =>
      state.settlements.find((item) => item.budgetType === budgetType) ??
      EMPTY_SUMMARY,
    // 총예산은 워케이션에 저장된 값을 그대로 쓴다.
    // 계정과목 배정액 합계로 역산하면, 총예산만 변경하고 예산 재배분을 마치지 않은 상태에서
    // 실제 총예산과 다른 금액이 표시된다.
    budgetTotalOf: (state) => (budgetType) =>
      Number(
        (budgetType === 'WORK'
          ? state.workation?.businessBudgetTotal
          : state.workation?.personalBudgetTotal) ?? 0,
      ),
  },

  actions: {
    async fetchSettlement(workationId, params) {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await getSettlement(workationId, params);
        this.workation = data.workation;
        this.settlements = data.settlements ?? [];
        this.validation = data.validation ?? this.validation;
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    // 파일 응답은 헤더에서 파일명을 읽어야 하므로 response 를 그대로 넘긴다
    async downloadExcel(workationId, params) {
      try {
        return await downloadSettlementExcel(workationId, params);
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    async downloadPdf(workationId, params) {
      try {
        return await downloadSettlementPdf(workationId, params);
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    reset() {
      this.workation = null;
      this.settlements = [];
      this.validation = { uncheckedCount: 0, canProceed: true, message: '' };
      this.error = null;
    },
  },
});
