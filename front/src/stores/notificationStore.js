import { defineStore } from 'pinia';
import {
  getNotificationSettings as getSettingsApi,
  updateNotificationSettings as updateSettingsApi,
} from '@/api/notification';

// 알림 설정 스토어 — 알림 카테고리별 수신 여부를 관리한다
//
// state:
//   settings: { budgetNotify, transferNotify, paymentNotify, workationNotify, settlementNotify, scheduleNotify }
//   isLoading: 설정 조회 중 여부
//   error: 에러 메시지
//   pendingField: 변경 요청 중인 필드명 (중복 클릭 방지용)
//
// actions:
//   fetchSettings(): GET /users/me/notifications/settings 로 초기 설정을 조회한다
//   updateSetting(field, value): PATCH 로 단일 필드를 변경하고 서버 응답으로 동기화한다
export const useNotificationStore = defineStore('notification', {
  state: () => ({
    settings: null,
    isLoading: false,
    error: null,
    pendingField: null,
  }),
  getters: {},
  actions: {
    /**
     * 알림 설정 조회 — 페이지 진입 시 1회 호출한다.
     * GET /users/me/notifications/settings (axiosInstance 가 data 를 unwrap 함)
     */
    async fetchSettings() {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await getSettingsApi();
        this.settings = { ...data };
      } catch (err) {
        this.error = err;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 알림 설정 변경 — Toggle 클릭 시 호출한다.
     * - field: 변경할 필드명 (예: 'budgetNotify')
     * - value: 변경할 Boolean 값
     * - 변경 전 상태를 백업해 API 실패 시 Rollback 한다
     * - pendingField 로 중복 요청을 방지한다
     * - 성공 시 서버가 반환한 전체 설정 상태로 동기화한다
     */
    async updateSetting(field, value) {
      // 중복 요청 방지 — 이미 요청 중인 필드면 무시
      if (this.pendingField) return false;

      // 변경 전 상태 백업 (Rollback용)
      const previousValue = this.settings[field];

      // 1) 즉시 UI 상태 변경 (Optimistic Update)
      this.settings = { ...this.settings, [field]: value };
      this.pendingField = field;

      try {
        const { data } = await updateSettingsApi({ [field]: value });
        // 3) 성공 시 서버 응답으로 전체 설정 상태 동기화
        this.settings = { ...data };
        return true;
      } catch (err) {
        // 4) 실패 시 이전 상태로 Rollback
        this.settings = { ...this.settings, [field]: previousValue };
        this.error = err;
        throw err;
      } finally {
        this.pendingField = null;
      }
    },

    /**
     * 전체 알림 설정 변경 — 모든 카테고리를 동시에 켜거나 끈다.
     * - fields: 변경할 필드명 배열
     * - value: 변경할 Boolean 값
     * - 변경 전 상태를 백업해 API 실패 시 Rollback 한다
     */
    async updateAllSettings(fields, value) {
      if (this.pendingField) return false;

      // 변경 전 상태 전체 백업
      const previousSettings = { ...this.settings };

      // 1) 즉시 UI 상태 변경
      const updated = { ...this.settings };
      fields.forEach((field) => {
        updated[field] = value;
      });
      this.settings = updated;
      this.pendingField = 'all';

      try {
        const { data } = await updateSettingsApi(
          Object.fromEntries(fields.map((f) => [f, value])),
        );
        this.settings = { ...data };
        return true;
      } catch (err) {
        this.settings = previousSettings;
        this.error = err;
        throw err;
      } finally {
        this.pendingField = null;
      }
    },
  },
});
