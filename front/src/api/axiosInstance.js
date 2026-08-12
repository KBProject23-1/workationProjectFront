import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  timeout: 10000,
  // refreshToken/accessToken 은 HttpOnly 쿠키로만 오간다.
  // 프론트(5173)와 백엔드(8080)는 포트가 달라 cross-origin 이므로
  // 이 옵션이 없으면 브라우저가 Set-Cookie 를 저장하지 않고 폐기한다.
  withCredentials: true,
  // CSRF (더블 서브밋 쿠키): BE 가 XSRF-TOKEN 쿠키(HttpOnly=false)를 발급하면
  // 상태변경 요청에 그 값을 X-XSRF-TOKEN 헤더로 돌려줘야 한다.
  // cross-origin 이라 withXSRFToken 을 켜야 axios 가 헤더를 붙인다.
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  withXSRFToken: true,
});

// 인증은 HttpOnly accessToken 쿠키로만 이뤄진다(withCredentials 로 자동 전송).
// 로그인/재발급이 토큰을 응답 바디로 주지 않으므로 Authorization 헤더는 붙이지 않는다.

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
// 401 이 오면 refreshToken 쿠키로 한 번 재발급받고 원래 요청을 다시 보낸다.
//
// 화면 하나에서 여러 요청이 동시에 401 이 되는 경우가 흔하므로,
// 재발급은 한 번만 보내고 나머지는 큐에서 기다렸다가 새 토큰으로 재시도한다.
let refreshing = false;
let waitingQueue = [];

const resolveQueue = (token) => {
  waitingQueue.forEach((resolve) => resolve(token));
  waitingQueue = [];
};

// 세션 만료 시 이동할 로그인 화면 경로 (실제 로그인 페이지 구현 완료)
const LOGIN_PATH = '/login';

const clearSession = () => {
  localStorage.removeItem('accessToken');
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

    // 이미 다른 요청이 재발급 중이면 끝날 때까지 기다렸다가, 성공하면 그대로 재시도한다
    // (재발급으로 새 accessToken 쿠키가 이미 설정돼 있으므로 헤더를 손댈 필요 없다)
    if (refreshing) {
      const ok = await new Promise((resolve) => waitingQueue.push(resolve));
      if (!ok) return Promise.reject(error);
      return axiosInstance(original);
    }

    refreshing = true;
    try {
      // 순환 참조를 피하려고 여기서 불러온다 (auth.js 가 이 파일을 import 한다)
      const { refresh } = await import('./auth');
      // 재발급 성공 시 BE 가 새 accessToken/refreshToken 을 HttpOnly 쿠키로 설정한다(응답 바디에 토큰 없음).
      await refresh();
      resolveQueue(true);
      // 새 accessToken 쿠키가 자동 첨부되어 원래 요청을 그대로 재시도한다.
      return axiosInstance(original);
    } catch (refreshError) {
      // 리프레시 토큰까지 만료됐으면 다시 로그인해야 한다.
      // 단, 세션 복원 probe(getMe) 처럼 skipAuthRedirect 를 준 요청은 하드 리다이렉트하지 않고
      // 실패를 그대로 반환한다 → 라우터 가드가 온보딩/스플래시 허용 등 분기를 직접 처리한다.
      resolveQueue(null);
      if (!original.skipAuthRedirect) clearSession();
      return Promise.reject(refreshError);
    } finally {
      refreshing = false;
    }
  },
);

export default axiosInstance;
