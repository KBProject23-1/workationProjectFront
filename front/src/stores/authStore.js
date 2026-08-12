import { defineStore } from 'pinia';
import {
  login as loginApi,
  signup as signupApi,
  findId as findIdApi,
  checkEmailAvailability as checkEmailAvailabilityApi,
  setupPin as setupPinApi,
} from '@/api/auth';
import { getMe as getMeApi } from '@/api/user';

// 인증 도메인 스토어 (knowledgeFront.md: Auth Store)
//
// 관리 데이터:
// - isAuthenticated / user: 로그인·회원가입(자동 로그인) 상태
// - signupAgreedTermIds / signupIdentityVerificationId / signupName: 회원가입 플로우 상태 (인메모리 전용)
//
// 보안 규칙:
// - Access Token / Refresh Token 은 절대 저장하지 않는다 (HttpOnly Cookie — Backend 가 관리)
// - localStorage/sessionStorage 에 인증 정보를 저장하지 않는다
// - identityVerificationId(백엔드가 POST /auth/pass 에서 발급) 도 페이지 이동 간 전달을 위해
//   메모리에만 보관한다 (이름/휴대폰/CI/생년월일 은 프론트가 보관하지 않는다)
export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoading: false,
    error: null,
    isAuthenticated: false,
    user: null,
    // 앱 부팅 시 GET /users/me 로 로그인 상태를 1회 복원했는지 여부 (라우터 가드에서 대기)
    sessionChecked: false,
    // 회원가입 플로우 상태 (인메모리 — 새로고침 시 초기화)
    signupAgreedTermIds: [],
    // POST /auth/pass 가 발급한 본인인증 고유 번호 — 회원가입 API 에 전달 (프론트 생성 금지)
    signupIdentityVerificationId: '',
    signupName: '',
    // 회원가입 완료 화면에서 로그인 아이디(이메일) 표시용 — 가입 성공 시 보관
    signupEmail: '',
  }),
  getters: {},
  actions: {
    // ---------- 회원가입 플로우 ----------

    /** 약관동의 화면에서 선택한 약관 ID 목록을 보관한다 (최종 회원가입 요청에 사용) */
    setAgreedTerms(termIds) {
      this.signupAgreedTermIds = [...termIds];
    },

    /**
     * PASS 인증 완료 결과를 보관한다 — 백엔드가 POST /auth/pass 에서 발급한 identityVerificationId
     * 와 화면 표시용 이름만 메모리에 저장한다 (이름/휴대폰/CI 등은 회원가입 API 에 다시 보내지 않는다).
     */
    setIdentityVerification(identityVerificationId, name) {
      this.signupIdentityVerificationId = identityVerificationId;
      this.signupName = name || '';
    },

    /**
     * 아이디 찾기 — PASS 본인인증 완료 후 identityVerificationId 로 가입 이메일 조회
     * - 이메일은 백엔드가 마스킹하여 반환한다 (프론트에서 마스킹하지 않음)
     * - 성공: { email: 'user****@example.com', createdAt: '2026-07-24' }
     * - 실패: INVALID_VERIFICATION_ID(400) / USER_NOT_FOUND(404) — err 를 그대로 throw
     */
    async findId(identityVerificationId) {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await findIdApi(identityVerificationId);
        return data;
      } catch (err) {
        this.error = err;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** 이메일 중복 확인 — data.available (false = 이미 사용 중) */
    async checkEmail(email) {
      const { data } = await checkEmailAvailabilityApi(email);
      return data.available;
    },

    /**
     * 최종 회원가입 완료
     * - 백엔드가 POST /auth/pass 에서 발급한 identityVerificationId 만 전달한다
     *   (name/phoneNumber/ci 는 프론트에서 보내지 않는다 — 백엔드가 Redis 세션에서 복원).
     * - ⚠️ 자동 로그인 아님: 회원가입은 토큰/쿠키를 발급하지 않는다(쿠키 발급은 login 만 담당).
     *   따라서 isAuthenticated 를 세우지 않으며, 완료 화면 이후 사용자는 /login 에서 다시 로그인한다.
     */
    async signup({ email, password }) {
      this.isLoading = true;
      this.error = null;
      try {
        const payload = {
          identityVerificationId: this.signupIdentityVerificationId,
          email,
          password,
          agreedTermsIds: this.signupAgreedTermIds,
        };
        const { data } = await signupApi(payload);
        // 1회성 플로우 데이터 정리 (재가입 시 깨끗한 상태로 시작)
        this.resetSignup();
        // 완료 화면(/signup/complete)에서 로그인 아이디를 표시하기 위해 보관한다
        this.signupEmail = email;
        return data;
      } catch (err) {
        this.error = err;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** 회원가입 플로우 상태 초기화 */
    resetSignup() {
      this.signupAgreedTermIds = [];
      this.signupIdentityVerificationId = '';
      this.signupName = '';
      this.signupEmail = '';
    },

    // ---------- 인증 ----------

    /**
     * 로그인 상태 복원 — 앱 부팅 시 1회 호출한다(쿠키 기반이라 새로고침하면 인메모리 상태가 사라지므로).
     * GET /users/me 200 → 로그인, 401 → 비로그인. 둘 다 "확정"(sessionChecked=true)이라 이후 재호출 안 함.
     * 네트워크/5xx 같은 비확정 실패는 sessionChecked 를 세우지 않아 다음 네비게이션에서 재시도된다
     * (유효 세션 유저가 일시 장애로 로그아웃 취급되는 것 방지).
     */
    async restoreSession() {
      if (this.sessionChecked) return;
      try {
        const { data } = await getMeApi();
        this.isAuthenticated = true;
        this.user = {
          email: data.email,
          name: data.name,
          nickname: data.nickname,
        };
        this.sessionChecked = true;
      } catch (err) {
        if (err?.response?.status === 401) {
          this.isAuthenticated = false;
          this.user = null;
          this.sessionChecked = true;
        }
        // 그 외(무응답/5xx)는 확정하지 않는다 → 재시도 여지 남김
      }
    },

    /**
     * 통합 로그인 (PASSWORD / PIN)
     * - 로그인 화면(/login)에서 호출한다. PASSWORD: loginId(이메일/휴대폰) + password + deviceId
     * - Backend 가 ACCESS_TOKEN/REFRESH_TOKEN HttpOnly Cookie 를 발급한다 (Cookie 기반 인증).
     * - 응답 data.pinSetupRequired: 기기 최초 로그인 여부 → 로그인 화면에서 PIN 등록 유도 분기
     * - Access Token 은 localStorage 에 저장하지 않는다 (axiosInstance 가 Cookie 로만 인증).
     */
    async login(payload) {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await loginApi(payload);
        this.isAuthenticated = true;
        this.sessionChecked = true;
        if (data) {
          this.user = { userId: data.userId, name: data.name };
        }
        return data;
      } catch (err) {
        this.error = err;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** PIN 번호 최초 설정 (POST /api/v1/auth/me/pin — Cookie 기반 인증) */
    async setupPin({ pinNumber, deviceId, deviceName }) {
      this.isLoading = true;
      this.error = null;
      try {
        await setupPinApi({ pinNumber, deviceId, deviceName });
      } catch (err) {
        this.error = err;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 로그아웃 — 인메모리 상태 초기화 (스캐폴딩)
     * - 실제 사용 시 POST /api/v1/auth/logout 호출 + AuthStore 초기화를 함께 처리해야 한다
     *   (knowledgeFront: 로그아웃 API → 프론트 AuthStore 초기화).
     */
    logout() {
      this.isAuthenticated = false;
      this.user = null;
      this.error = null;
    },
  },
});
