import { defineStore } from 'pinia';
import {
  getCurrentWorkation,
  getWorkations,
  createWorkation as createWorkationApi,
  updateWorkation as updateWorkationApi,
  deleteWorkation as deleteWorkationApi,
  settleWorkation as settleWorkationApi,
} from '@/api/workation';

export const useWorkationStore = defineStore('workation', {
  state: () => ({
    // 진행 중 워케이션. 없으면 null
    current: null,
    // 정산 완료된 지난 워케이션 목록
    records: [],
    page: 0,
    totalPages: 0,
    totalElements: 0,
    isLoading: false,
    error: null,
  }),

  getters: {
    hasActive: (state) => state.current !== null,
    workationId: (state) => state.current?.workation?.id ?? null,
    workation: (state) => state.current?.workation ?? null,
    budgetSummary: (state) => state.current?.budgetSummary ?? [],
    uncheckedExpenseCount: (state) => state.current?.uncheckedExpenseCount ?? 0,
    recordById: (state) => (workationId) =>
      state.records.find((record) => record.id === Number(workationId)),
  },

  actions: {
    // 진행 중 워케이션이 없어도 200 으로 workation: null 이 내려온다
    async fetchCurrent() {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await getCurrentWorkation();
        this.current = data?.workation ? data : null;
      } catch (err) {
        if (err.response?.status === 404) {
          this.current = null;
          return;
        }
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchRecords(page = 0, size = 10) {
      try {
        const { data } = await getWorkations({ page, size });
        this.records = data.content ?? [];
        this.page = data.page ?? page;
        this.totalPages = data.totalPages ?? 0;
        this.totalElements = data.totalElements ?? 0;
      } catch (err) {
        this.error = err.message;
        this.records = [];
      }
    },

    async createWorkation(payload) {
      try {
        const { data } = await createWorkationApi(payload);
        await this.fetchCurrent();
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    async updateWorkation(workationId, payload) {
      try {
        const { data } = await updateWorkationApi(workationId, payload);
        await this.fetchCurrent();
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    // 정산이 끝나면 진행 중 워케이션이 없어지고 기록 목록에 쌓인다
    async settleWorkation(workationId) {
      try {
        const { data } = await settleWorkationApi(workationId);
        await Promise.all([this.fetchCurrent(), this.fetchRecords()]);
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    async deleteWorkation(workationId) {
      try {
        await deleteWorkationApi(workationId);
        await this.fetchCurrent();
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },
  },
});
