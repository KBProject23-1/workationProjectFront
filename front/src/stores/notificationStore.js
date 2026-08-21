import { defineStore } from 'pinia';
import {
  getNotificationList as getListApi,
  markNotificationAsRead as markReadApi,
  markAllNotificationsAsRead as markAllReadApi,
  getUnreadCount as unreadCountApi,
  getNotificationSettings as getSettingsApi,
  updateNotificationSettings as updateSettingsApi,
} from '@/api/notification';

// 알림 스토어 — 알림 목록 + 알림 수신 설정을 관리한다
//
// state (목록):
//   notifications: 알림 목록 배열
//   selectedCategory: 현재 선택된 카테고리 필터 (null 이면 전체)
//   nextCursor: 다음 조회 커서
//   hasNext: 다음 페이지 존재 여부
//   isLoading: 목록 조회 중 여부
//   isAppending: 추가 조회(무한 스크롤) 중 여부
//   error: 에러 메시지
//   unreadCount: 읽지 않은 알림 개수
//
// state (설정):
//   settings: 알림 수신 설정 객체
//   pendingField: 변경 요청 중인 필드명 (중복 클릭 방지용)
//
// actions:
//   fetchNotifications(category?): 알림 목록을 초기 조회한다
//   appendNotifications(): 다음 페이지를 추가 조회한다
//   markAsRead(notificationId): 단건 읽음 처리
//   markAllAsRead(): 전체 읽음 처리
//   fetchUnreadCount(): 읽지 않은 알림 개수를 조회한다
//   fetchSettings(): 알림 수신 설정을 조회한다
//   updateSetting(field, value): 알림 수신 설정을 변경한다
//   updateAllSettings(fields, value): 전체 알림 수신 설정을 변경한다
export const useNotificationStore = defineStore('notification', {
  state: () => ({
    // ── 목록 ──
    notifications: [],
    selectedCategory: null,
    nextCursor: null,
    hasNext: true,
    isLoading: false,
    isAppending: false,
    error: null,
    unreadCount: 0,
    // ── 설정 ──
    settings: null,
    pendingField: null,
  }),
  getters: {},
  actions: {
    // ─────────────────────────────────────────────
    // 알림 목록
    // ─────────────────────────────────────────────

    /**
     * 알림 목록 초기 조회 — 카테고리 변경 시에도 호출한다.
     * GET /users/me/notifications?category=...&size=20
     * axiosInstance 가 { status, message, data } 를 unwrap 해 data.children.notifications 에 접근
     */
    async fetchNotifications(category = null) {
      this.isLoading = true;
      this.error = null;
      this.selectedCategory = category;
      this.notifications = [];
      this.nextCursor = null;
      this.hasNext = true;

      try {
        const params = { size: 20 };
        if (category) params.category = category;
        const { data } = await getListApi(params);
        this.notifications = data.notifications;
        this.nextCursor = data.nextCursor;
        this.hasNext = data.hasNext;
      } catch (err) {
        this.error = err;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 다음 페이지 추가 조회 — 무한 스크롤 / "더 보기" 에서 호출한다.
     * GET /users/me/notifications?cursor=...&size=20&category=...
     */
    async appendNotifications() {
      if (!this.hasNext || this.isAppending) return;
      this.isAppending = true;

      try {
        const params = { size: 20, cursor: this.nextCursor };
        if (this.selectedCategory) params.category = this.selectedCategory;
        const { data } = await getListApi(params);
        this.notifications = [...this.notifications, ...data.notifications];
        this.nextCursor = data.nextCursor;
        this.hasNext = data.hasNext;
      } catch (err) {
        this.error = err;
        throw err;
      } finally {
        this.isAppending = false;
      }
    },

    /**
     * 단건 읽음 처리 — 알림 클릭 시 호출한다.
     * PATCH /users/me/notifications/{id}/read
     * 성공 시 프론트 상태만 업데이트 (목록 재조회 없음)
     */
    async markAsRead(notificationId) {
      const target = this.notifications.find(
        (n) => n.notificationId === notificationId,
      );
      if (!target || target.isRead) return;

      // Optimistic Update
      target.isRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);

      try {
        await markReadApi(notificationId);
      } catch (err) {
        // Rollback
        target.isRead = false;
        this.unreadCount += 1;
        throw err;
      }
    },

    /**
     * 전체 읽음 처리 — "전체 읽음" 버튼에서 호출한다.
     * PATCH /users/me/notifications/read-all
     * 성공 시 현재 목록의 isRead 를 모두 true 로 변경 (목록 재조회 없음)
     */
    async markAllAsRead() {
      await markAllReadApi();
      // 현재 화면에 표시된 알림들의 isRead 를 true 로 변경
      this.notifications.forEach((n) => {
        n.isRead = true;
      });
      this.unreadCount = 0;
    },

    /**
     * 읽지 않은 알림 개수 조회 — 홈 화면 종 아이콘 badge 에 표시한다.
     * GET /users/me/notifications/unread-count
     */
    async fetchUnreadCount() {
      try {
        const { data } = await unreadCountApi();
        this.unreadCount = data.unreadCount;
      } catch {
        // 읽지 않은 개수 조회 실패는 치명적이지 않으므로 무시
      }
    },

    // ─────────────────────────────────────────────
    // 알림 수신 설정
    // ─────────────────────────────────────────────

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
