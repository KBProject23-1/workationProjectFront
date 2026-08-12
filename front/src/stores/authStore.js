import { defineStore } from 'pinia';
import {
  login as loginApi,
  signup as signupApi,
  verifyIdentity as verifyIdentityApi,
  checkEmailAvailability as checkEmailAvailabilityApi,
  setupPin as setupPinApi,
} from '@/api/auth';

// 인증 도메인 스토어 (knowledgeFront.md: Auth Store)
//
// 관리 데이터:
// - isAuthenticated / user: 로그인·회원가입(자동 로그인) 상태
// - signupAgreedTermIds / signupIdentityToken / signupName: 회원가입 플로우 상태 (인메모리 전용)
//
// 보안 규칙:
// - Access Token / Refresh Token 은 절대 저장하지 않는다 (HttpOnly Cookie — Backend 가 관리)
// - localStorage/sessionStorage 에 인증 정보를 저장하지 않는다
// - identityToken(본인인증 임시 JWT) 도 페이지 이동 간 전달을 위해 메모리에만 보관한다
export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoading: false,
    error: null,
    isAuthenticated: false,
    user: null,
    // 회원가입 플로우 상태 (인메모리 — 새로고침 시 초기화)
    signupAgreedTermIds: [],
    signupIdentityToken: '',
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

    /** PASS 본인인증 검증 — 성공 시 identityToken/name 을 메모리에 보관하고 응답을 반환한다 */
    async verifyIdentity(identityVerificationId) {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await verifyIdentityApi(identityVerificationId);
        this.signupIdentityToken = data.identityToken;
        this.signupName = data.name;
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
     * 최종 회원가입 완료 (자동 로그인)
     * - Backend 가 ACCESS_TOKEN / REFRESH_TOKEN HttpOnly Cookie 를 발급한다.
     * - 프론트는 토큰을 읽거나 저장하지 않는다 (Cookie 기반 인증).
     * - 닉네임은 백엔드가 기본값(워케이너{userId})으로 자동 생성한다 (닉네임 입력 기능 제거).
     * - 성공 시 isAuthenticated 를 true 로 설정한다 (인메모리 — 새로고침 시 GET /users/me 로 복구).
     */
    async signup({ email, password }) {
      this.isLoading = true;
      this.error = null;
      try {
        const payload = {
          identityToken: this.signupIdentityToken,
          email,
          password,
          agreedTermsIds: this.signupAgreedTermIds,
        };
        const { data } = await signupApi(payload);
        this.isAuthenticated = true;
        if (data) {
          this.user = { userId: data.userId, name: data.name };
        }
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
      this.signupIdentityToken = '';
      this.signupName = '';
      this.signupEmail = '';
    },

    // ---------- 인증 ----------

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
