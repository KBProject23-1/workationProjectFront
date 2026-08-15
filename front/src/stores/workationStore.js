import { defineStore } from 'pinia';
import {
  getCurrentWorkation,
  getWorkations,
  createWorkation as createWorkationApi,
  updateWorkation as updateWorkationApi,
  deleteWorkation as deleteWorkationApi,
  settleWorkation as settleWorkationApi,
  getRegions,
  checkReservations as checkReservationsApi,
} from '@/api/workation';

export const useWorkationStore = defineStore('workation', {
  state: () => ({
    // 진행 중 워케이션. 없으면 null
    current: null,
    // 정산 완료된 지난 워케이션 목록
    records: [],
    regions: [],
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
    // 더 받아올 기록이 남아 있는지. 목록 화면의 더보기 버튼이 쓴다
    hasMoreRecords: (state) => state.page + 1 < state.totalPages,
    // 지역은 가나다 순으로 보여준다
    sortedRegions: (state) =>
      [...state.regions].sort((a, b) => a.name.localeCompare(b.name, 'ko')),
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

    // append 를 주면 기존 목록 뒤에 이어 붙인다. 목록 화면의 더보기가 쓴다
    async fetchRecords(page = 0, size = 10, { append = false } = {}) {
      try {
        const { data } = await getWorkations({ page, size });
        const content = data.content ?? [];

        this.records = append ? [...this.records, ...content] : content;
        this.page = data.page ?? page;
        this.totalPages = data.totalPages ?? 0;
        this.totalElements = data.totalElements ?? 0;
        this.error = null;
        return true;
      } catch (err) {
        // 홈 화면이 이 호출과 함께 다른 요청을 Promise.all 로 묶고 있어
        // 여기서 throw 하면 홈 전체가 멈춘다. 성공 여부만 돌려준다
        this.error = err.message;
        if (!append) this.records = [];
        return false;
      }
    },

    async fetchRegions() {
      try {
        const { data } = await getRegions();
        this.regions = data.regions ?? [];
        return this.regions;
      } catch (err) {
        this.error = err.message;
        throw err;
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

    // force = true 면 기간을 벗어나는 지출을 떼어내고 저장한다
    async updateWorkation(workationId, payload, force = false) {
      try {
        const { data } = await updateWorkationApi(workationId, payload, force);
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

    // 기간 변경·삭제 전에 예약 상태를 확인한다. 예약을 고치지는 않는다
    async checkReservations(workationId, params) {
      try {
        const { data } = await checkReservationsApi(workationId, params);
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
