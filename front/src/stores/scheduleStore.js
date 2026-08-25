import { defineStore } from 'pinia';
import {
  getSchedules,
  getScheduleDetail,
  createSchedule as createScheduleApi,
  updateSchedule as updateScheduleApi,
  deleteSchedule as deleteScheduleApi,
} from '@/api/schedule';

// 스케줄러 기본 조회 일수. 토글하면 7일까지 펼친다
export const DEFAULT_DAYS = 2;
export const EXPANDED_DAYS = 7;

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    // 날짜별 묶음. 일정이 없는 날도 items 빈 배열로 내려온다
    schedules: [],
    workationStartDate: null,
    workationEndDate: null,
    startDate: null,
    days: DEFAULT_DAYS,
    detail: null,
    isLoading: false,
    isCreating: false,
    isCheckingAvailability: false,
    error: null,
    createError: null,
  }),

  getters: {
    expanded: (state) => state.days === EXPANDED_DAYS,
    // 조회한 범위에 일정이 하나도 없는지. 빈 상태 문구를 띄우는 데 쓴다
    isEmpty: (state) =>
      state.schedules.every((day) => (day.items ?? []).length === 0),
  },

  actions: {
    async fetchSchedules(workationId, days = DEFAULT_DAYS) {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await getSchedules(workationId, { days });
        this.schedules = data.schedules ?? [];
        this.workationStartDate = data.workationStartDate ?? null;
        this.workationEndDate = data.workationEndDate ?? null;
        this.startDate = data.startDate ?? null;
        this.days = data.days ?? days;
        return this.schedules;
      } catch (err) {
        this.error = err.message;
        this.schedules = [];
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchDetail(workationId, scheduleId) {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await getScheduleDetail(workationId, scheduleId);
        this.detail = data;
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async createSchedule(workationId, payload) {
      if (this.isCreating) return null;

      this.isCreating = true;
      this.createError = null;
      try {
        const { data } = await createScheduleApi(workationId, payload);
        return data;
      } catch (err) {
        this.createError = err.message;
        throw err;
      } finally {
        this.isCreating = false;
      }
    },

    async getScheduledTimes(workationId, date, excludedScheduleId = null) {
      const { data } = await getSchedules(workationId, {
        startDate: date,
        days: 1,
      });
      const times = (data.schedules ?? []).flatMap((day) =>
        (day.items ?? [])
          .filter(
            (item) =>
              excludedScheduleId === null ||
              String(item.scheduleId ?? '') !== String(excludedScheduleId),
          )
          .map((item) => item.scheduledTime ?? item.scheduledAt?.slice(11))
          .filter(Boolean)
          .map((scheduledTime) => scheduledTime.slice(0, 5)),
      );
      return [...new Set(times)];
    },

    async hasScheduleAt(workationId, date, time, excludedScheduleId = null) {
      this.isCheckingAvailability = true;
      try {
        const scheduledTimes = await this.getScheduledTimes(
          workationId,
          date,
          excludedScheduleId,
        );
        return scheduledTimes.includes(time);
      } finally {
        this.isCheckingAvailability = false;
      }
    },

    // 시각만 바꾼다. 상세 화면이 바로 갱신되도록 응답을 detail 에 넣는다
    async updateSchedule(workationId, scheduleId, scheduledAt) {
      try {
        const { data } = await updateScheduleApi(workationId, scheduleId, {
          scheduledAt,
        });
        this.detail = data;
        return data;
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    async deleteSchedule(workationId, scheduleId) {
      try {
        await deleteScheduleApi(workationId, scheduleId);
        this.detail = null;
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    reset() {
      this.schedules = [];
      this.detail = null;
      this.error = null;
      this.createError = null;
      this.days = DEFAULT_DAYS;
    },
  },
});
