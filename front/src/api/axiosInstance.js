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
    if (error.response?.status === 401) {
      // 인증 만료 처리 (추후)
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
