import axios from 'axios';
import { getCsrfToken, refreshCsrfToken } from './csrf';

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  timeout: 10000,
  // accessToken / refreshToken 은 모두 HttpOnly 쿠키로만 오간다.
  // 프론트(5173)와 백엔드(8080)는 포트가 달라 cross-origin 이므로
  // 이 옵션이 없으면 브라우저가 Set-Cookie 를 저장하지 않고 폐기한다.
  withCredentials: true,
  // CSRF 방어 (Cookie 기반 인증) — 백엔드가 발급하는 XSRF-TOKEN Cookie 를 읽어
  // 상태 변경 요청에 X-XSRF-TOKEN Header 로 전송한다.
  // - 같은 오리진(프록시/동일 도메인) 배포에서는 axios 가 Cookie 를 직접 읽어 자동 설정한다.
  // - 크로스 오리진(현재 개발 환경)에서는 아래 request interceptor 가 처리한다.
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// 상태 변경 메서드만 CSRF 검증 대상 (knowledgeFront.md) — GET/HEAD/OPTIONS 는 제외
const isStateChanging = (method) =>
  ['post', 'put', 'patch', 'delete'].includes((method || 'get').toLowerCase());

// 상태 변경 요청(POST/PUT/PATCH/DELETE)에 X-XSRF-TOKEN Header 를 추가한다.
// - 같은 오리진: XSRF-TOKEN Cookie 값을 사용 (csrf.js 가 Cookie 를 읽음)
// - 크로스 오리진: GET /auth/csrf 로 받은 토큰을 메모리 캐시로 사용
axiosInstance.interceptors.request.use(
  async (config) => {
    if (isStateChanging(config.method)) {
      const csrfToken = await getCsrfToken();
      if (csrfToken) {
        config.headers = config.headers || {};
        config.headers['X-XSRF-TOKEN'] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// blob 으로 받은 에러 응답은 Blob 객체라 message 를 바로 읽을 수 없다.
// (정산 Excel/PDF 다운로드가 responseType: 'blob' 을 쓴다)
const readErrorMessage = async (error) => {
  const data = error.response?.data;

  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text())?.message;
    } catch {
      return null;
    }
  }
  return data?.message;
};

// 액세스 토큰은 15분짜리라 만료가 잦다.
// 401 이 오면 refreshToken HttpOnly 쿠키로 한 번 재발급받고 원래 요청을 다시 보낸다.
//
// JWT 는 브라우저 JS 에서 접근할 수 없는 HttpOnly Cookie 로만 관리되므로
// 프론트는 토큰을 읽거나 저장하지 않는다. 재발급 성공 시 브라우저가
// 새 accessToken/refreshToken Cookie 를 자동으로 저장한다.
//
// 화면 하나에서 여러 요청이 동시에 401 이 되는 경우가 흔하므로,
// 재발급은 한 번만 보내고 나머지는 큐에서 기다렸다가 재시도한다.
let refreshing = false;
let waitingQueue = [];

const resolveQueue = () => {
  waitingQueue.forEach((resolve) => resolve());
  waitingQueue = [];
};

// 세션 만료 시 이동할 로그인 화면 경로 (실제 로그인 페이지 구현 완료)
const LOGIN_PATH = '/login';

const clearSession = () => {
  if (window.location.pathname !== LOGIN_PATH) {
    window.location.href = LOGIN_PATH;
  }
};

axiosInstance.interceptors.response.use(
  (response) => {
    // 공통 응답 포맷 { status, message, data } 에서 실제 payload만 꺼내 기존 소비 코드와 호환되게 함
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    error.message =
      (await readErrorMessage(error)) || '알 수 없는 오류가 발생했습니다.';

    const original = error.config;
    const status = error.response?.status;

    // CSRF 토큰이 갱신되면서(예: 새 탭에서 XSRF-TOKEN Cookie 가 재발급된 경우) 헤더가
    // 어긋나 403 이 나면, 토큰을 다시 받아 1회만 재시도한다.
    // (재시도 후에도 403 이면 진짜 권한/정책 오류이므로 그대로 실패 처리)
    if (
      status === 403 &&
      original &&
      isStateChanging(original.method) &&
      !original._csrfRetried
    ) {
      original._csrfRetried = true;
      try {
        await refreshCsrfToken();
        return axiosInstance(original);
      } catch (csrfError) {
        return Promise.reject(csrfError);
      }
    }

    // 재발급 대상이 아닌 경우는 그대로 흘려보낸다
    // - 401 이 아님
    // - 이미 한 번 재시도한 요청 (재발급 후에도 401 이면 세션이 끝난 것)
    // - 로그인·재발급·로그아웃 자체의 401
    if (
      status !== 401 ||
      !original ||
      original._retried ||
      original.url?.startsWith('/auth/')
    ) {
      return Promise.reject(error);
    }

    original._retried = true;

    // 이미 다른 요청이 재발급 중이면 끝날 때까지 기다린다
    if (refreshing) {
      await new Promise((resolve) => waitingQueue.push(resolve));
      return axiosInstance(original);
    }

    refreshing = true;
    try {
      // 순환 참조를 피하려고 여기서 불러온다 (auth.js 가 이 파일을 import 한다)
      const { refresh } = await import('./auth');
      // refreshToken HttpOnly 쿠키가 자동 전송되고,
      // 새 accessToken/refreshToken Cookie 는 브라우저가 자동 저장한다.
      await refresh();

      resolveQueue();
      return axiosInstance(original);
    } catch (refreshError) {
      // 리프레시 토큰까지 만료됐으면 다시 로그인해야 한다.
      // 단, 세션 복원 probe(getMe) 처럼 skipAuthRedirect 를 준 요청은 하드 리다이렉트하지 않고
      // 실패를 그대로 반환한다 → 라우터 가드가 온보딩/스플래시 허용 등 분기를 직접 처리한다.
      resolveQueue();
      if (!original.skipAuthRedirect) clearSession();
      return Promise.reject(refreshError);
    } finally {
      refreshing = false;
    }
  },
);

export default axiosInstance;
