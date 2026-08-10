import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  timeout: 10000,
  // refreshToken 은 HttpOnly 쿠키로만 오간다.
  // 프론트(5173)와 백엔드(8080)는 포트가 달라 cross-origin 이므로
  // 이 옵션이 없으면 브라우저가 Set-Cookie 를 저장하지 않고 폐기한다.
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

// 로그인 화면 경로는 로그인 파트가 정한다. 실제 로그인 페이지가 붙으면 이 값을 바꾼다
const LOGIN_PATH = '/dev-login';

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

    // 이미 다른 요청이 재발급 중이면 끝날 때까지 기다린다
    if (refreshing) {
      const token = await new Promise((resolve) => waitingQueue.push(resolve));
      if (!token) return Promise.reject(error);
      original.headers.Authorization = `Bearer ${token}`;
      return axiosInstance(original);
    }

    refreshing = true;
    try {
      // 순환 참조를 피하려고 여기서 불러온다 (auth.js 가 이 파일을 import 한다)
      const { refresh } = await import('./auth');
      const { data } = await refresh();

      // 이 요청은 인터셉터를 타지 않아 공통 응답 봉투가 그대로 남아 있다.
      // 인증 응답의 token_info 만 JSON 이 snake_case 다 (LoginResponseDTO 의 @JsonProperty)
      const accessToken = data?.data?.token_info?.access_token;
      if (!accessToken) throw new Error('재발급 응답에 토큰이 없습니다.');

      localStorage.setItem('accessToken', accessToken);
      resolveQueue(accessToken);

      original.headers.Authorization = `Bearer ${accessToken}`;
      return axiosInstance(original);
    } catch (refreshError) {
      // 리프레시 토큰까지 만료됐으면 다시 로그인해야 한다
      resolveQueue(null);
      clearSession();
      return Promise.reject(refreshError);
    } finally {
      refreshing = false;
    }
  },
);

export default axiosInstance;
