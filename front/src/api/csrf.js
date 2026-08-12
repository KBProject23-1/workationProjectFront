import axios from 'axios';

// CSRF Token 유틸 (Cookie 기반 인증 — XSRF-TOKEN / X-XSRF-TOKEN)
//
// 백엔드(Spring Security CookieCsrfTokenRepository)는 응답마다 XSRF-TOKEN Cookie
// (HttpOnly=false) 를 자동 발급한다. 프론트는 그 값을 읽어 상태 변경 요청
// (POST/PUT/PATCH/DELETE)에 X-XSRF-TOKEN Header 로 다시 보낸다.
//
// 토큰 획득 전략 (순서):
//   1. XSRF-TOKEN Cookie 를 document.cookie 에서 직접 읽는다.
//      - 같은 오리진(프록시/동일 도메인 배포)이면 항상 최신 Cookie 값을 사용한다.
//   2. 읽을 수 없으면(프론트 5173 ↔ 백엔드 8080 크로스 오리진 CORS 환경)
//      GET /api/v1/auth/csrf 로 토큰을 받아 메모리에 캐시한다.
//      - 크로스 오리진에서는 브라우저가 백엔드 Origin 의 Cookie 를 저장하지만
//        JS(document.cookie)로는 읽을 수 없으므로, Cookie 와 동일한 값을 본문으로 받는다.
//
// 보안 규칙 (knowledgeFront.md):
//   - Access/Refresh Token 은 절대 읽거나 저장하지 않는다 — CSRF Token 만 취급한다.
//   - CSRF Token 은 인증 정보가 아니며 유출되어도 Access/Refresh Token 을 대신할 수 없다.

const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_ENDPOINT = `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/csrf`;

// 크로스 오리진 환경에서 백엔드가 발급한 토큰을 메모리에 보관한다 (같은 오리진이면 미사용)
let cachedToken = '';
// 동시 요청 시 /auth/csrf 를 한 번만 호출하기 위한 진행 중 promise
let pendingRequest = null;

/** XSRF-TOKEN Cookie 읽기 — 같은 오리진(프록시/동일 도메인)에서 동작 */
export const readXsrfCookie = () => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${CSRF_COOKIE_NAME}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : '';
};

/**
 * CSRF Token 조회
 * - 같은 오리진: Cookie 값을 그대로 사용 (매 요청 최신값 반영)
 * - 크로스 오리진: /auth/csrf 응답 본문 값을 메모리 캐시로 사용
 * - force=true: 캐시를 무효화하고 서버에서 다시 받아온다 (CSRF 403 재시도 시 사용)
 */
export const getCsrfToken = async (force = false) => {
  const cookieToken = readXsrfCookie();
  if (cookieToken) return cookieToken;

  if (cachedToken && !force) return cachedToken;

  if (!pendingRequest) {
    pendingRequest = axios
      .get(CSRF_ENDPOINT, { withCredentials: true })
      .then((res) => res?.data?.data?.csrfToken || '')
      .finally(() => {
        pendingRequest = null;
      });
  }
  const token = await pendingRequest;
  if (token) cachedToken = token;
  return token;
};

/** CSRF Token 캐시를 무효화하고 새로 받아온다 — 403(토큰 갱신) 재시도 시 호출 */
export const refreshCsrfToken = () => {
  cachedToken = '';
  return getCsrfToken(true);
};
