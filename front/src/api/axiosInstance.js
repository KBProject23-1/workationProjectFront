import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  timeout: 10000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    // 공통 응답 포맷 { status, message, data } 에서 실제 payload만 꺼내 기존 소비 코드와 호환되게 함
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    error.message =
      error.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
    if (error.response?.status === 401) {
      // 인증 만료 처리 (추후)
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
